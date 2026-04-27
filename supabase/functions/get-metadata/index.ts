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
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, anonKey);

        const [especies, razas, categorias] = await Promise.all([
            supabase.from("especies").select("id, nombre").order("nombre"),
            supabase.from("razas").select("id, nombre, especie_id").order("nombre"),
            supabase.from("galeria_categorias").select("id, nombre, slug").eq("activa", true).is("deleted_at", null).order("nombre")
        ]);

        return jsonResponse(200, {
            data: {
                especies: especies.data ?? [],
                razas: razas.data ?? [],
                categorias: categorias.data ?? []
            }
        });
    } catch (err) {
        return jsonResponse(500, { error: err.message });
    }
});