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
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "categoria";
}

async function createUniqueSlug(client: any, baseName: string, categoryId?: number) {
  const baseSlug = slugifyText(baseName);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    let query = client.from("galeria_categorias").select("id").eq("slug", candidate).limit(1);

    if (categoryId) {
      query = query.neq("id", categoryId);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Error validando slug: ${error.message}`);
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
      throw new Error("Faltan variables de entorno esenciales (URL o Keys).");
    }

    // El runtime de Supabase ya verifica el JWT si verify_jwt=true en config.toml
    // Pero extraemos el token por si necesitamos validar permisos específicos o usar getUser
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { error: "Falta token de autorización." });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Cliente administrativo (Service Role) para operaciones de base de datos
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Validar que el usuario sea válido
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return jsonResponse(401, { error: "No autorizado o token inválido." });
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const includeInactive = url.searchParams.get("includeInactive") !== "false";
      const includeDeleted = url.searchParams.get("includeDeleted") !== "false";

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
        console.error("Database error (GET):", error);
        return jsonResponse(500, { error: `No se pudieron listar las categorías: ${error.message}` });
      }

      return jsonResponse(200, { data: data ?? [] });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
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
        .select()
        .single();

      if (error || !data) {
        console.error("Database error (POST):", error);
        return jsonResponse(500, { error: `No se pudo crear la categoría: ${error.message}` });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "PATCH") {
      const body = await req.json().catch(() => null);
      const id = Number(body?.id ?? 0);

      if (!id || id <= 0) {
        return jsonResponse(400, { error: "ID de categoría inválido." });
      }

      const updates: Record<string, any> = {};

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

      updates.updated_at = new Date().toISOString();

      const { data, error } = await adminClient
        .from("galeria_categorias")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        console.error("Database error (PATCH):", error);
        return jsonResponse(500, { error: `No se pudo actualizar la categoría: ${error.message}` });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = Number(url.searchParams.get("id") ?? 0);

      if (!id || id <= 0) {
        return jsonResponse(400, { error: "ID de categoría inválido." });
      }

      const { data, error } = await adminClient
        .from("galeria_categorias")
        .update({ 
          activa: false, 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        console.error("Database error (DELETE):", error);
        return jsonResponse(500, { error: `No se pudo desactivar la categoría: ${error.message}` });
      }

      return jsonResponse(200, { data });
    }

    return jsonResponse(405, { error: "Método no permitido." });
  } catch (error: any) {
    console.error("Unexpected error in function:", error);
    return jsonResponse(500, { error: error.message || "Error inesperado en el servidor." });
  }
});

