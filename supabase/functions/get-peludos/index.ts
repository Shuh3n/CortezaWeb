import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function jsonResponse(status: number, payload: unknown) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "GET") {
        return jsonResponse(405, { error: "Método no permitido." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !anonKey) {
        return jsonResponse(500, { error: "Faltan variables de entorno." });
    }

    // Cliente público (sin autenticación)
    const supabase = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    try {
        const reqUrl = new URL(req.url);
        const especieName = reqUrl.searchParams.get("especie"); // nombre de la especie
        const search = reqUrl.searchParams.get("search");
        const id = reqUrl.searchParams.get("id");

        const selectQuery = `
            id, nombre, sexo, edad, caracteristicas,
            esterilizado, vacunado, desparasitado, especie, peso,
            especie_id, raza_id,
            especies (id, nombre),
            razas (id, nombre),
            imagenes (id, url)
        `;

        if (id) {
            const { data: peludo, error } = await supabase
                .from("peludos")
                .select(selectQuery)
                .eq("id", id)
                .single();

            if (error || !peludo) return jsonResponse(404, { error: "Peludo no encontrado." });
            return jsonResponse(200, { data: peludo });
        }

        let query = supabase.from("peludos").select(selectQuery).order("id", { ascending: false });

        if (especieName) {
            // Nota: Podríamos filtrar por especie_id si tuviéramos el ID, 
            // pero para mantener compatibilidad con la URL actual usamos el JOIN
            // Esto asume que el nombre de la especie es único
            const { data: esp } = await supabase.from("especies").select("id").ilike("nombre", especieName).single();
            if (esp) {
                query = query.eq("especie_id", esp.id);
            }
        }

        if (search) {
            query = query.or(`nombre.ilike.%${search}%,caracteristicas.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) return jsonResponse(500, { error: error.message });

        return jsonResponse(200, { data: data ?? [] });
    } catch (err) {
        return jsonResponse(500, { error: err instanceof Error ? err.message : "Error inesperado." });
    }
});