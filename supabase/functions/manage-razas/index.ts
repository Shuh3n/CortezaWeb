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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Faltan variables de entorno esenciales (URL o Service Role Key).");
    }
    
    // Omitimos validación JWT por requerimiento del usuario (Gestion de razas es interna)
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (req.method === "GET") {
      const url = new URL(req.url);
      const includeInactive = url.searchParams.get("includeInactive") === "true";
      const especieId = url.searchParams.get("especieId");

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
        console.error("Database error (GET):", error);
        return jsonResponse(500, { error: `No se pudieron listar las razas: ${error.message}` });
      }

      return jsonResponse(200, { data: data ?? [] });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      const nombre = body?.nombre?.trim();
      const especieId = Number(body?.especie_id ?? 0);

      if (!nombre) {
        return jsonResponse(400, { error: "El nombre de la raza es obligatorio." });
      }

      if (!especieId || especieId <= 0) {
        return jsonResponse(400, { error: "ID de especie inválido." });
      }

      const { data, error } = await adminClient
        .from("razas")
        .insert({
          nombre,
          especie_id: especieId,
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
        console.error("Database error (POST):", error);
        return jsonResponse(500, { error: `No se pudo crear la raza: ${error.message}` });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "PATCH") {
      const body = await req.json().catch(() => null);
      const id = Number(body?.id ?? 0);

      if (!id || id <= 0) {
        return jsonResponse(400, { error: "ID de raza inválido." });
      }

      const updates: Record<string, any> = {};

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
        console.error("Database error (PATCH):", error);
        return jsonResponse(500, { error: `No se pudo actualizar la raza: ${error.message}` });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = Number(url.searchParams.get("id") ?? 0);

      if (!id || id <= 0) {
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
        console.error("Database error (DELETE):", error);
        return jsonResponse(500, { error: `No se pudo desactivar la raza: ${error.message}` });
      }

      return jsonResponse(200, { data });
    }

    return jsonResponse(405, { error: "Método no permitido." });
  } catch (error: any) {
    console.error("Unexpected error in function:", error);
    return jsonResponse(500, { error: error.message || "Error inesperado en el servidor." });
  }
});
