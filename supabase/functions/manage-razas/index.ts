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
      const especieId = requestUrl.searchParams.get("especieId");

      let query = adminClient
        .from("razas")
        .select(`
          id, 
          nombre, 
          especie_id, 
          activa, 
          created_at,
          especies (nombre)
        `)
        .order("nombre", { ascending: true });

      if (!includeInactive) {
        query = query.eq("activa", true);
      }

      if (especieId) {
        query = query.eq("especie_id", especieId);
      }

      const { data, error } = await query;

      if (error) {
        return jsonResponse(500, { error: error.message ?? "No se pudieron listar las razas." });
      }

      return jsonResponse(200, { data: data ?? [] });
    }

    if (req.method === "POST") {
      const body = (await req.json().catch(() => null)) as { nombre?: string, especie_id?: number } | null;
      const nombre = body?.nombre?.trim();
      const especie_id = Number(body?.especie_id ?? 0);

      if (!nombre) {
        return jsonResponse(400, { error: "El nombre de la raza es obligatorio." });
      }

      if (!Number.isFinite(especie_id) || especie_id <= 0) {
        return jsonResponse(400, { error: "ID de especie inválido." });
      }

      const { data, error } = await adminClient
        .from("razas")
        .insert({
          nombre,
          especie_id,
          activa: true
        })
        .select(`
          id, 
          nombre, 
          especie_id, 
          activa, 
          created_at,
          especies (nombre)
        `)
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo crear la raza." });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "PATCH") {
      const body = (await req.json().catch(() => null)) as { id?: number; nombre?: string; especie_id?: number; activa?: boolean } | null;
      const id = Number(body?.id ?? 0);

      if (!Number.isFinite(id) || id <= 0) {
        return jsonResponse(400, { error: "ID de raza inválido." });
      }

      const updates: Record<string, unknown> = {};

      if (typeof body?.nombre === "string") {
        const nombre = body.nombre.trim();
        if (!nombre) {
          return jsonResponse(400, { error: "El nombre no puede estar vacío." });
        }
        updates.nombre = nombre;
      }

      if (typeof body?.especie_id === "number") {
        updates.especie_id = body.especie_id;
      }

      if (typeof body?.activa === "boolean") {
        updates.activa = body.activa;
      }

      if (Object.keys(updates).length === 0) {
        return jsonResponse(400, { error: "No hay campos para actualizar." });
      }

      const { data, error } = await adminClient
        .from("razas")
        .update(updates)
        .eq("id", id)
        .select(`
          id, 
          nombre, 
          especie_id, 
          activa, 
          created_at,
          especies (nombre)
        `)
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo actualizar la raza." });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "DELETE") {
      const requestUrl = new URL(req.url);
      const id = Number(requestUrl.searchParams.get("id") ?? 0);

      if (!Number.isFinite(id) || id <= 0) {
        return jsonResponse(400, { error: "ID de raza inválido." });
      }

      // Borrado lógico
      const { data, error } = await adminClient
        .from("razas")
        .update({ activa: false })
        .eq("id", id)
        .select(`
          id, 
          nombre, 
          especie_id, 
          activa, 
          created_at,
          especies (nombre)
        `)
        .single();

      if (error || !data) {
        return jsonResponse(500, { error: error?.message ?? "No se pudo desactivar la raza." });
      }

      return jsonResponse(200, { data });
    }

    return jsonResponse(405, { error: "Método no permitido." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return jsonResponse(500, { error: message });
  }
});
