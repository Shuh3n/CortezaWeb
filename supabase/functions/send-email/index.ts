import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactPayload {
  nombre: string;
  correo: string;
  telefono: string;
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
const PHONE_REGEX = /^3\d{9}$/;

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

function validatePayload(payload: Partial<ContactPayload>): ValidationResult {
  const { nombre, correo, telefono, asunto, mensaje } = payload;

  if (!nombre || !correo || !telefono || !asunto || !mensaje) {
    return { valid: false, error: "Todos los campos son obligatorios." };
  }

  if (!EMAIL_REGEX.test(correo)) {
    return { valid: false, error: "El correo electrónico no es válido." };
  }

  if (!PHONE_REGEX.test(telefono)) {
    return { valid: false, error: "El número de teléfono no es válido para Colombia." };
  }

  for (
    const [key, val] of Object.entries({ nombre, correo, telefono, asunto, mensaje })
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

function buildEmailHtml(data: ContactPayload): string {
  const { nombre, correo, telefono, asunto, mensaje } = data;
  const whatsappUrl = `https://wa.me/57${telefono}`;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <div style="background:#1B4332; padding:32px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:24px; letter-spacing:1px;">🌿 Fundación Corteza Terrestre</h1>
          <p style="color:#95D5B2; margin:8px 0 0; font-size:14px; font-weight:bold; text-transform:uppercase;">Nuevo Mensaje de Contacto</p>
        </div>
        
        <div style="padding:20px 32px; background:#D8F3DC; border-bottom:1px solid #B7E4C7;">
          <p style="margin:0; color:#1B4332; font-size:14px; font-weight:bold; text-align:center;">
            📬 ¡Has recibido un nuevo mensaje desde la web!
          </p>
        </div>

        <div style="padding:32px;">
          <table style="width:100%; border-collapse:collapse; margin-bottom:32px;">
            <tr>
              <td style="padding:12px 0; font-weight:bold; color:#555; width:150px; border-bottom:1px solid #eee;">Nombre:</td>
              <td style="padding:12px 0; color:#1B4332; font-weight:bold; border-bottom:1px solid #eee;">${nombre}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-weight:bold; color:#555; border-bottom:1px solid #eee;">Teléfono:</td>
              <td style="padding:12px 0; color:#222; border-bottom:1px solid #eee;">${telefono}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-weight:bold; color:#555; border-bottom:1px solid #eee;">Correo:</td>
              <td style="padding:12px 0; color:#222; border-bottom:1px solid #eee;">${correo}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-weight:bold; color:#555; border-bottom:1px solid #eee;">Asunto:</td>
              <td style="padding:12px 0; color:#1B4332; font-weight:bold; border-bottom:1px solid #eee;">${asunto}</td>
            </tr>
            <tr>
              <td style="padding:12px 0; font-weight:bold; color:#555; vertical-align:top; border-bottom:1px solid #eee;">Mensaje:</td>
              <td style="padding:12px 0; color:#444; white-space:pre-wrap; font-style:italic; border-bottom:1px solid #eee;">"${mensaje}"</td>
            </tr>
          </table>

          <div style="text-align:center; padding-top:10px;">
            <p style="color:#777; font-size:13px; margin-bottom:20px; font-weight:bold;">ACCIONES RÁPIDAS DE CONTACTO:</p>
            
            <div style="margin-bottom:15px;">
              <a href="mailto:${correo}" style="display:block; background:#2D6A4F; color:#ffffff; padding:14px 20px; text-decoration:none; border-radius:8px; font-weight:bold; margin-bottom:10px;">📧 RESPONDER POR CORREO</a>
            </div>
            
            <div style="margin-bottom:15px;">
              <a href="tel:${telefono}" style="display:block; background:#40916C; color:#ffffff; padding:14px 20px; text-decoration:none; border-radius:8px; font-weight:bold; margin-bottom:10px;">📞 LLAMAR POR TELÉFONO</a>
            </div>
            
            <div>
              <a href="${whatsappUrl}" style="display:block; background:#25D366; color:#ffffff; padding:14px 20px; text-decoration:none; border-radius:8px; font-weight:bold;">💬 ENVIAR WHATSAPP</a>
            </div>
          </div>
        </div>

        <div style="background:#f8f9fa; padding:24px; font-size:12px; color:#999; text-align:center; border-top:1px solid #eee;">
          Este es un mensaje automático del formulario de contacto de <strong>Fundación Corteza Terrestre</strong>.<br>
          © 2026 Armenia, Quindío.
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
  const CORTEZA_EMAIL = Deno.env.get("CORTEZA_EMAIL") || "corteza.terrestreuq@gmail.com";

  if (!RESEND_API_KEY) {
    console.error("[contact-email] Missing RESEND_API_KEY.");
    return jsonResponse({ error: "Error de configuración del servidor." }, 500);
  }

  try {
    // Parse and validate body
    let rawBody: Partial<ContactPayload>;
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
    const payload: ContactPayload = {
      nombre: sanitize(rawBody.nombre!),
      correo: sanitize(rawBody.correo!),
      telefono: sanitize(rawBody.telefono!),
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
        from: "Corteza Contacto <no-reply@cortezaterrestre.org>",
        to: [CORTEZA_EMAIL],
        reply_to: payload.correo,
        subject: `[Contacto] ${payload.asunto} — ${payload.nombre}`,
        html: buildEmailHtml(payload),
      }),
    });

    if (!resendResponse.ok) {
      console.error("[contact-email] Resend API error:", resendResponse.status);
      return jsonResponse({
        error: "No se pudo enviar el correo. Intenta más tarde.",
      }, 502);
    }

    return jsonResponse({
      success: true,
      message: "Mensaje enviado correctamente.",
    }, 200);
  } catch (err) {
    console.error(
      "[contact-email] Unexpected error:",
      err instanceof Error ? err.message : "unknown",
    );
    return jsonResponse({ error: "Error interno del servidor." }, 500);
  }
});