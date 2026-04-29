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

const peludoSelect = "id, nombre, sexo, edad, caracteristicas, esterilizado, vacunado, desparasitado, especie, peso, especie_id, raza_id, sonido_url";

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
        let sonidoFile: File | null = null;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                if (key === "foto") fotoFile = value as File;
                else if (key === "sonido") sonidoFile = value as File;
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

            // Manejo de Foto
            if (fotoFile && fotoFile.size > 0) {
                const ext = fotoFile.name.split(".").pop();
                const mimeType = fotoFile.type;
                
                // Validar tipo MIME
                const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!validImageTypes.includes(mimeType)) {
                    throw new Error(`Tipo de imagen no valido: ${mimeType}. Se permiten JPG, PNG y WebP.`);
                }
                
                // Validar tamaño (máximo 20MB)
                const MAX_SIZE = 20 * 1024 * 1024;
                if (fotoFile.size > MAX_SIZE) {
                    throw new Error(`El archivo de imagen es demasiado grande. Maximo 20MB.`);
                }
                
                const path = `${peludoId}/${Date.now()}.${ext}`;
                const { error: uploadError } = await adminClient.storage.from("fotos-peludos").upload(path, fotoFile);
                
                if (uploadError) {
                    console.error(`Error al subir foto para peludo ${peludoId}:`, uploadError);
                    throw new Error(`Error al subir imagen: ${uploadError.message}`);
                }
                
                console.log(`Foto subida exitosamente: ${path}`);
                
                const { data: urlData } = adminClient.storage.from("fotos-peludos").getPublicUrl(path);
                if (!urlData?.publicUrl) {
                    throw new Error('No se pudo obtener la URL publica de la foto.');
                }
                
                const { error: deleteError } = await adminClient.from("imagenes").delete().eq("id_referencia", peludoId);
                if (deleteError) console.warn(`Advertencia al limpiar imagenes antiguas:`, deleteError);
                
                const { error: insertError } = await adminClient.from("imagenes").insert({ id_referencia: peludoId, url: urlData.publicUrl });
                if (insertError) {
                    console.error(`Error al guardar foto en BD:`, insertError);
                    throw new Error(`Error al guardar foto: ${insertError.message}`);
                }
                
                console.log(`Foto registrada en BD: ${urlData.publicUrl}`);
            }

            // Manejo de Sonido
            if (sonidoFile && sonidoFile.size > 0) {
                const ext = sonidoFile.name.split(".").pop();
                const mimeType = sonidoFile.type;
                
                // Validar tipo MIME
                const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a'];
                if (!validTypes.includes(mimeType)) {
                    throw new Error(`Tipo de audio no válido: ${mimeType}. Se permiten MP3 y M4A.`);
                }
                
                // Validar tamaño (máximo 10MB)
                const MAX_SIZE = 10 * 1024 * 1024;
                if (sonidoFile.size > MAX_SIZE) {
                    throw new Error(`El archivo de audio es demasiado grande. Máximo 10MB.`);
                }
                
                const path = `${peludoId}/${Date.now()}.${ext}`;
                const { error: uploadError } = await adminClient.storage.from("sonidos-peludos").upload(path, sonidoFile);
                
                if (uploadError) {
                    console.error(`❌ Error al subir sonido para peludo ${peludoId}:`, uploadError);
                    throw new Error(`Error al subir audio: ${uploadError.message}`);
                }
                
                console.log(`✅ Sonido subido exitosamente: ${path}`);
                
                const { data: urlData } = adminClient.storage.from("sonidos-peludos").getPublicUrl(path);
                if (!urlData?.publicUrl) {
                    throw new Error('No se pudo obtener la URL pública del sonido.');
                }
                
                const { error: updateError } = await adminClient
                    .from("peludos")
                    .update({ sonido_url: urlData.publicUrl })
                    .eq("id", peludoId);
                
                if (updateError) {
                    console.error(`❌ Error al actualizar sonido_url en base de datos:`, updateError);
                    throw new Error(`Error al guardar URL de audio: ${updateError.message}`);
                }
                
                console.log(`✅ sonido_url actualizado en BD: ${urlData.publicUrl}`);
                if (peludoData) peludoData.sonido_url = urlData.publicUrl;
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