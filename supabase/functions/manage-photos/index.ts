import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const GALLERY_BUCKET = "fotos-peludos";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, PATCH, DELETE, OPTIONS",
};

function jsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugifyText(value: string) {
  const sanitized = normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || "item";
}

function buildGalleryStoragePath(fileName: string, now = new Date()) {
  const stamp = now.toISOString().replaceAll(":", "-");
  return `galeria/${stamp}-${slugifyText(fileName) || "imagen"}`;
}

function getDefaultImageName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return normalizeText(baseName) || "Imagen";
}

function getEnvironment() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!url || !serviceRoleKey || !anonKey) {
    throw new Error("Faltan variables SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY.");
  }

  return { url, serviceRoleKey, anonKey };
}

function extractBearerToken(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

async function ensureAuthenticated(req: Request, url: string, anonKey: string) {
  const token = extractBearerToken(req);
  if (!token) {
    throw new Error("Falta token de autorización.");
  }

  const authClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("No autorizado.");
  }

  return data.user;
}

type PhotoRow = {
  id: number;
  nombre: string;
  fecha: string;
  url: string;
  created_at: string;
  categoria_id: number;
  categoria: {
    id: number;
    nombre: string;
    slug: string;
    activa: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  } | null;
};

const photoSelect = `
  id,
  nombre,
  fecha,
  url,
  created_at,
  categoria_id,
  categoria:galeria_categorias (
    id,
    nombre,
    slug,
    activa,
    created_at,
    updated_at,
    deleted_at
  )
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, serviceRoleKey, anonKey } = getEnvironment();
    await ensureAuthenticated(req, url, anonKey);

    const adminClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (req.method === "POST") {
      const form = await req.formData();
      const categoriaId = Number(form.get("categoriaId") ?? 0);
      const fecha = String(form.get("fecha") ?? "").trim();
      const nombreInput = String(form.get("nombre") ?? "").trim();
      const files = form.getAll("files").filter((entry) => entry instanceof File) as File[];

      if (!Number.isFinite(categoriaId) || categoriaId <= 0) {
        return jsonResponse(400, { error: "Categoría inválida." });
      }

      if (!fecha) {
        return jsonResponse(400, { error: "La fecha es obligatoria." });
      }

      if (files.length === 0) {
        return jsonResponse(400, { error: "Debe enviar al menos una imagen." });
      }

      const createdRows: PhotoRow[] = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const storagePath = buildGalleryStoragePath(file.name, new Date(Date.now() + index));

        const { error: uploadError } = await adminClient.storage
          .from(GALLERY_BUCKET)
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "image/jpeg",
          });

        if (uploadError) {
          return jsonResponse(500, { error: uploadError.message || "No se pudo subir una imagen." });
        }

        const {
          data: { publicUrl },
        } = adminClient.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath);

        const nombre = nombreInput || getDefaultImageName(file.name);

        const { data: row, error: insertError } = await adminClient
          .from("imagenes")
          .insert({
            nombre,
            fecha,
            url: publicUrl,
            categoria_id: categoriaId,
          })
          .select(photoSelect)
          .single();

        if (insertError || !row) {
          return jsonResponse(500, { error: insertError?.message ?? "No se pudo registrar la imagen en base de datos." });
        }

        createdRows.push(row as PhotoRow);
      }

      return jsonResponse(200, { data: createdRows });
    }

    if (req.method === "PATCH") {
      const body = (await req.json().catch(() => null)) as {
        id?: number;
        categoriaId?: number;
        fecha?: string;
        nombre?: string;
      } | null;

      const id = Number(body?.id ?? 0);
      const categoriaId = Number(body?.categoriaId ?? 0);
      const fecha = String(body?.fecha ?? "").trim();
      const nombre = String(body?.nombre ?? "").trim();

      if (!Number.isFinite(id) || id <= 0) {
        return jsonResponse(400, { error: "ID de imagen inválido." });
      }

      if (!Number.isFinite(categoriaId) || categoriaId <= 0) {
        return jsonResponse(400, { error: "Categoría inválida." });
      }

      if (!fecha) {
        return jsonResponse(400, { error: "La fecha es obligatoria." });
      }

      const updatePayload = {
        categoria_id: categoriaId,
        fecha,
        nombre: nombre || null,
      };

      const { data, error } = await adminClient
        .from("imagenes")
        .update(updatePayload)
        .eq("id", id)
        .select(photoSelect)
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo actualizar la imagen." });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "DELETE") {
      const requestUrl = new URL(req.url);
      const id = Number(requestUrl.searchParams.get("id") ?? 0);

      if (!Number.isFinite(id) || id <= 0) {
        return jsonResponse(400, { error: "ID de imagen inválido." });
      }

      const { error } = await adminClient.from("imagenes").delete().eq("id", id);
      if (error) {
        return jsonResponse(500, { error: error.message ?? "No se pudo eliminar la imagen." });
      }

      return jsonResponse(200, { data: { id } });
    }

    return jsonResponse(405, { error: "Método no permitido." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    const status = message === "No autorizado." || message === "Falta token de autorización." ? 401 : 500;
    return jsonResponse(status, { error: message });
  }
});
