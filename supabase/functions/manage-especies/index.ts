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

function getEnvironment() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error("Faltan variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  }

  return { url, serviceRoleKey };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, serviceRoleKey } = getEnvironment();
    
    // Omitimos validación JWT por requerimiento del usuario
    const adminClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (req.method === "GET") {
      const requestUrl = new URL(req.url);
      const includeInactive = requestUrl.searchParams.get("includeInactive") === "true";

      let query = adminClient
        .from("especies")
        .select("id, nombre, activa, created_at")
        .order("nombre", { ascending: true });

      if (!includeInactive) {
        query = query.eq("activa", true);
      }

      const { data, error } = await query;

      if (error) {
        return jsonResponse(500, { error: error.message ?? "No se pudieron listar las especies." });
      }

      return jsonResponse(200, { data: data ?? [] });
    }

    if (req.method === "POST") {
      const body = (await req.json().catch(() => null)) as { nombre?: string } | null;
      const nombre = body?.nombre?.trim();

      if (!nombre) {
        return jsonResponse(400, { error: "El nombre de la especie es obligatorio." });
      }

      const { data, error } = await adminClient
        .from("especies")
        .insert({
          nombre,
          activa: true
        })
        .select("id, nombre, activa, created_at")
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo crear la especie." });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "PATCH") {
      const body = (await req.json().catch(() => null)) as { id?: number; nombre?: string; activa?: boolean } | null;
      const id = Number(body?.id ?? 0);

      if (!Number.isFinite(id) || id <= 0) {
        return jsonResponse(400, { error: "ID de especie inválido." });
      }

      const updates: Record<string, unknown> = {};

      if (typeof body?.nombre === "string") {
        const nombre = body.nombre.trim();
        if (!nombre) {
          return jsonResponse(400, { error: "El nombre no puede estar vacío." });
        }
        updates.nombre = nombre;
      }

      if (typeof body?.activa === "boolean") {
        updates.activa = body.activa;
      }

      if (Object.keys(updates).length === 0) {
        return jsonResponse(400, { error: "No hay campos para actualizar." });
      }

      const { data, error } = await adminClient
        .from("especies")
        .update(updates)
        .eq("id", id)
        .select("id, nombre, activa, created_at")
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo actualizar la especie." });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "DELETE") {
      const requestUrl = new URL(req.url);
      const id = Number(requestUrl.searchParams.get("id") ?? 0);

      if (!Number.isFinite(id) || id <= 0) {
        return jsonResponse(400, { error: "ID de especie inválido." });
      }

      // Borrado lógico
      const { data, error } = await adminClient
        .from("especies")
        .update({ activa: false })
        .eq("id", id)
        .select("id, nombre, activa, created_at")
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo desactivar la especie." });
      }

      return jsonResponse(200, { data });
    }

    return jsonResponse(405, { error: "Método no permitido." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return jsonResponse(500, { error: message });
  }
});
