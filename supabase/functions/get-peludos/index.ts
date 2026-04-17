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

    // Cliente público (sin autenticación) — lectura pública de peludos disponibles
    const supabase = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    try {
        const reqUrl = new URL(req.url);
        const especie = reqUrl.searchParams.get("especie"); // "perro" | "gato" | null
        const search = reqUrl.searchParams.get("search");   // búsqueda por nombre/raza
        const id = reqUrl.searchParams.get("id");           // peludo individual

        // ── Peludo individual ────────────────────────────────────────────────────
        if (id) {
            const peludoId = Number(id);
            if (!Number.isFinite(peludoId) || peludoId <= 0) {
                return jsonResponse(400, { error: "ID de peludo inválido." });
            }

            const { data: peludo, error } = await supabase
                .from("peludos")
                .select(`
          id, nombre, sexo, edad, caracteristicas,
          esterilizado, vacunado, desparasitado, especie, peso,
          imagenes (id, url)
        `)
                .eq("id", peludoId)
                .single();

            if (error || !peludo) {
                return jsonResponse(404, { error: "Peludo no encontrado." });
            }

            return jsonResponse(200, { data: peludo });
        }

        // ── Listado con filtros opcionales ───────────────────────────────────────
        let query = supabase
            .from("peludos")
            .select(`
        id, nombre, sexo, edad, caracteristicas,
        esterilizado, vacunado, desparasitado, especie, peso,
        imagenes (id, url)
      `)
            .order("id", { ascending: false });

        if (especie) {
            query = query.ilike("especie", `%${especie}%`);
        }

        if (search) {
            // Búsqueda en nombre o características
            query = query.or(
                `nombre.ilike.%${search}%,caracteristicas.ilike.%${search}%`
            );
        }

        const { data, error } = await query;

        if (error) {
            return jsonResponse(500, { error: error.message });
        }

        return jsonResponse(200, { data: data ?? [] });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Error inesperado.";
        return jsonResponse(500, { error: message });
    }
});