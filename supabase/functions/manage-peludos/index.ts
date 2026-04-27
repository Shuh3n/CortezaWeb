import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, PATCH, DELETE, OPTIONS",
};

function jsonResponse(status: number, payload: unknown) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

const peludoSelect = "id, nombre, sexo, edad, caracteristicas, esterilizado, vacunado, desparasitado, especie, peso, especie_id, raza_id";

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const adminClient = createClient(supabaseUrl, serviceRoleKey);

        const method = req.method;
        const contentType = req.headers.get("content-type") ?? "";

        let body: any = {};
        let fotoFile: File | null = null;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                if (key === "foto") fotoFile = value as File;
                else body[key] = value;
            });
        } else {
            body = await req.json().catch(() => ({}));
        }

        if (method === "POST" || method === "PATCH") {
            const updates: any = {
                nombre: body.nombre,
                sexo: body.sexo,
                edad: body.edad ? Number(body.edad) : undefined,
                especie: body.especie,
                caracteristicas: body.caracteristicas,
                esterilizado: body.esterilizado === "true" || body.esterilizado === true,
                vacunado: body.vacunado === "true" || body.vacunado === true,
                desparasitado: body.desparasitado === "true" || body.desparasitado === true,
                peso: body.peso ? Number(body.peso) : null,
                especie_id: (body.especie_id && !isNaN(Number(body.especie_id))) ? Number(body.especie_id) : null,
                raza_id: (body.raza_id && !isNaN(Number(body.raza_id))) ? Number(body.raza_id) : null,
            };

            // Remover solo si es undefined, permitir null para limpiar el campo
            Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

            let peludoId = body.id;
            let peludoData;

            if (method === "POST") {
                const { data, error } = await adminClient.from("peludos").insert(updates).select(peludoSelect).single();
                if (error) throw error;
                peludoData = data;
                peludoId = data.id;
            } else {
                const { data, error } = await adminClient.from("peludos").update(updates).eq("id", peludoId).select(peludoSelect).single();
                if (error) throw error;
                peludoData = data;
            }

            if (fotoFile && fotoFile.size > 0) {
                const ext = fotoFile.name.split(".").pop();
                const path = `${peludoId}/${Date.now()}.${ext}`;
                const { error: uploadError } = await adminClient.storage.from("fotos-peludos").upload(path, fotoFile);
                if (!uploadError) {
                    const { data: { publicUrl } } = adminClient.storage.from("fotos-peludos").getPublicUrl(path);
                    await adminClient.from("imagenes").delete().eq("id_referencia", peludoId);
                    await adminClient.from("imagenes").insert({ id_referencia: peludoId, url: publicUrl });
                }
            }
            return jsonResponse(200, { data: peludoData });
        }

        if (method === "DELETE") {
            const id = new URL(req.url).searchParams.get("id");
            const { error } = await adminClient.from("peludos").delete().eq("id", id);
            if (error) throw error;
            return jsonResponse(200, { success: true });
        }

        return jsonResponse(405, { error: "Método no permitido" });
    } catch (err) {
        return jsonResponse(500, { error: err.message });
    }
});