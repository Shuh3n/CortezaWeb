import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
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

function slugifyText(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "categoria";
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

async function createUniqueSlug(client: ReturnType<typeof createClient>, baseName: string, categoryId?: number) {
  const baseSlug = slugifyText(baseName);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    let query = client.from("galeria_categorias").select("id").eq("slug", candidate).limit(1);

    if (categoryId) {
      query = query.neq("id", categoryId);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message || "No se pudo validar el slug.");
    }

    if (!data || data.length === 0) {
      return candidate;
    }
  }

  throw new Error("No se pudo generar un slug único para la categoría.");
}

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

    if (req.method === "GET") {
      const requestUrl = new URL(req.url);
      const includeInactive = requestUrl.searchParams.get("includeInactive") !== "false";
      const includeDeleted = requestUrl.searchParams.get("includeDeleted") !== "false";

      let query = adminClient
        .from("galeria_categorias")
        .select("id, nombre, slug, activa, created_at, updated_at, deleted_at")
        .order("nombre", { ascending: true });

      if (!includeDeleted) {
        query = query.is("deleted_at", null);
      }

      if (!includeInactive) {
        query = query.eq("activa", true);
      }

      const { data, error } = await query;

      if (error) {
        return jsonResponse(500, { error: error.message ?? "No se pudieron listar las categorías." });
      }

      return jsonResponse(200, { data: data ?? [] });
    }

    if (req.method === "POST") {
      const body = (await req.json().catch(() => null)) as { nombre?: string } | null;
      const nombre = body?.nombre?.trim();

      if (!nombre) {
        return jsonResponse(400, { error: "El nombre de la categoría es obligatorio." });
      }

      const slug = await createUniqueSlug(adminClient, nombre);
      const { data, error } = await adminClient
        .from("galeria_categorias")
        .insert({
          nombre,
          slug,
          activa: true,
          deleted_at: null,
        })
        .select("id, nombre, slug, activa, created_at, updated_at, deleted_at")
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo crear la categoría." });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "PATCH") {
      const body = (await req.json().catch(() => null)) as { id?: number; nombre?: string; activa?: boolean } | null;
      const id = Number(body?.id ?? 0);

      if (!Number.isFinite(id) || id <= 0) {
        return jsonResponse(400, { error: "ID de categoría inválido." });
      }

      const updates: Record<string, unknown> = {};

      if (typeof body?.nombre === "string") {
        const nombre = body.nombre.trim();
        if (!nombre) {
          return jsonResponse(400, { error: "El nombre no puede estar vacío." });
        }

        updates.nombre = nombre;
        updates.slug = await createUniqueSlug(adminClient, nombre, id);
      }

      if (typeof body?.activa === "boolean") {
        updates.activa = body.activa;
        updates.deleted_at = body.activa ? null : new Date().toISOString();
      }

      if (Object.keys(updates).length === 0) {
        return jsonResponse(400, { error: "No hay campos para actualizar." });
      }

      const { data, error } = await adminClient
        .from("galeria_categorias")
        .update(updates)
        .eq("id", id)
        .select("id, nombre, slug, activa, created_at, updated_at, deleted_at")
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo actualizar la categoría." });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "DELETE") {
      const requestUrl = new URL(req.url);
      const id = Number(requestUrl.searchParams.get("id") ?? 0);

      if (!Number.isFinite(id) || id <= 0) {
        return jsonResponse(400, { error: "ID de categoría inválido." });
      }

      const { data, error } = await adminClient
        .from("galeria_categorias")
        .update({ activa: false, deleted_at: new Date().toISOString() })
        .eq("id", id)
        .select("id, nombre, slug, activa, created_at, updated_at, deleted_at")
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo desactivar la categoría." });
      }

      return jsonResponse(200, { data });
    }

    return jsonResponse(405, { error: "Método no permitido." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    const status = message === "No autorizado." || message === "Falta token de autorización." ? 401 : 500;
    return jsonResponse(status, { error: message });
  }
});
