import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VolunteerPayload {
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_BODY_SIZE = 10_000; // 10 KB
const MAX_FIELD_LENGTH = 2000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // In production: replace * with your domain
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitize(value: string): string {
  return value
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function validatePayload(payload: Partial<VolunteerPayload>): ValidationResult {
  const { nombre, correo, asunto, mensaje } = payload;

  if (!nombre || !correo || !asunto || !mensaje) {
    return { valid: false, error: "Todos los campos son obligatorios." };
  }

  if (!EMAIL_REGEX.test(correo)) {
    return { valid: false, error: "El correo electrónico no es válido." };
  }

  for (
    const [key, val] of Object.entries({ nombre, correo, asunto, mensaje })
  ) {
    if (typeof val !== "string") {
      return { valid: false, error: `El campo '${key}' debe ser texto.` };
    }
    if (val.trim().length === 0) {
      return { valid: false, error: `El campo '${key}' no puede estar vacío.` };
    }
    if (val.length > MAX_FIELD_LENGTH) {
      return {
        valid: false,
        error: `El campo '${key}' excede la longitud permitida.`,
      };
    }
  }

  return { valid: true };
}

function buildEmailHtml(data: VolunteerPayload): string {
  const { nombre, correo, asunto, mensaje } = data;
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <div style="background:#1B4332; padding:24px 32px;">
          <h1 style="color:#fff; margin:0; font-size:20px;">🌿 Nueva solicitud de voluntariado</h1>
          <p style="color:#95D5B2; margin:4px 0 0; font-size:13px;">Formulario de Voluntarios — Corteza</p>
        </div>
        <div style="padding:16px 32px; background:#D8F3DC;">
          <p style="margin:0; color:#1B4332; font-size:13px; font-weight:bold;">
            ✅ Un nuevo candidato quiere unirse al equipo de Corteza
          </p>
        </div>
        <div style="padding:32px;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0; font-weight:bold; color:#555; width:120px; vertical-align:top;">Nombre:</td>
              <td style="padding:10px 0; color:#222;">${nombre}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:10px 0; font-weight:bold; color:#555; vertical-align:top;">Correo:</td>
              <td style="padding:10px 0; color:#222;"><a href="mailto:${correo}" style="color:#1B4332;">${correo}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 0; font-weight:bold; color:#555; vertical-align:top;">Área de interés:</td>
              <td style="padding:10px 0; color:#222;">${asunto}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:10px 0; font-weight:bold; color:#555; vertical-align:top;">Motivación:</td>
              <td style="padding:10px 0; color:#222; white-space:pre-wrap;">${mensaje}</td>
            </tr>
          </table>
        </div>
        <div style="background:#f0f0f0; padding:16px 32px; font-size:12px; color:#888; text-align:center;">
          Este mensaje fue enviado automáticamente desde el formulario de voluntarios de Corteza.
        </div>
      </div>
    </body>
    </html>
  `;
}

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse({ error: "Método no permitido." }, 405);
  }

  // Limit body size
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return jsonResponse(
      { error: "Cuerpo de solicitud demasiado grande." },
      413,
    );
  }

  // Read environment variables
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const CORTEZA_EMAIL = Deno.env.get("CORTEZA_EMAIL");

  if (!RESEND_API_KEY || !CORTEZA_EMAIL) {
    console.error("[volunteer-email] Missing environment variables.");
    return jsonResponse({ error: "Error de configuración del servidor." }, 500);
  }

  try {
    // Parse and validate body
    let rawBody: Partial<VolunteerPayload>;
    try {
      rawBody = await req.json();
    } catch {
      return jsonResponse({
        error: "El cuerpo de la solicitud no es JSON válido.",
      }, 400);
    }

    const validation = validatePayload(rawBody);
    if (!validation.valid) {
      return jsonResponse({ error: validation.error }, 400);
    }

    // Sanitize inputs
    const payload: VolunteerPayload = {
      nombre: sanitize(rawBody.nombre!),
      correo: sanitize(rawBody.correo!),
      asunto: sanitize(rawBody.asunto!),
      mensaje: sanitize(rawBody.mensaje!),
    };

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Corteza Voluntarios <no-reply@tudominio.com>", // Replace with your verified Resend sender
        to: [CORTEZA_EMAIL],
        reply_to: payload.correo,
        subject: `[Voluntario] ${payload.asunto} — ${payload.nombre}`,
        html: buildEmailHtml(payload),
      }),
    });

    if (!resendResponse.ok) {
      console.error(
        "[volunteer-email] Resend API error:",
        resendResponse.status,
      );
      return jsonResponse({
        error: "No se pudo enviar el correo. Intenta más tarde.",
      }, 502);
    }

    return jsonResponse({
      success: true,
      message: "Solicitud enviada correctamente.",
    }, 200);
  } catch (err) {
    console.error(
      "[volunteer-email] Unexpected error:",
      err instanceof Error ? err.message : "unknown",
    );
    return jsonResponse({ error: "Error interno del servidor." }, 500);
  }
});
