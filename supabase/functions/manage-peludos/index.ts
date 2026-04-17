import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ─── CORS ────────────────────────────────────────────────────────────────────

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, PATCH, DELETE, OPTIONS",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_SEXO = ["macho", "hembra"] as const;
type SexoPeludo = (typeof VALID_SEXO)[number];

function jsonResponse(status: number, payload: unknown) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

function isValidSexo(value: unknown): value is SexoPeludo {
    return VALID_SEXO.includes(value as SexoPeludo);
}

function getEnvironment() {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !serviceRoleKey || !anonKey) {
        throw new Error(
            "Faltan variables SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY."
        );
    }
    return { url, serviceRoleKey, anonKey };
}

function extractBearerToken(req: Request): string | null {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return null;
    return authHeader.slice("Bearer ".length).trim();
}

async function ensureAuthenticated(
    req: Request,
    url: string,
    anonKey: string
) {
    const token = extractBearerToken(req);
    if (!token) throw new Error("Falta token de autorización.");

    const authClient = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) throw new Error("No autorizado.");
    return data.user;
}

// Campos que se devuelven tras cada mutación
const peludoSelect =
    "id, nombre, sexo, edad, caracteristicas, esterilizado, vacunado, desparasitado, especie, peso";

// ─── Upload de imagen al Storage ─────────────────────────────────────────────

async function uploadImage(
    adminClient: ReturnType<typeof createClient>,
    file: File
): Promise<string> {
    const ext = file.name.split(".").pop() ?? "jpg";
    const nombreArchivo = `${Date.now()}_${crypto.randomUUID()}.${ext}`;

    const { error: storageError } = await adminClient.storage
        .from("fotos-peludos")
        .upload(nombreArchivo, file, { contentType: file.type });

    if (storageError) {
        throw new Error(`Error al subir imagen: ${storageError.message}`);
    }

    const { data: urlData } = adminClient.storage
        .from("fotos-peludos")
        .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { url, serviceRoleKey, anonKey } = getEnvironment();
        await ensureAuthenticated(req, url, anonKey);

        const adminClient = createClient(url, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });

        // ── POST — crear peludo (con o sin foto) ──────────────────────────────────
        if (req.method === "POST") {
            const contentType = req.headers.get("content-type") ?? "";
            const isMultipart = contentType.includes("multipart/form-data");

            let nombre: string | undefined;
            let sexo: string | undefined;
            let edadRaw: string | number | undefined;
            let caracteristicas: string | undefined;
            let esterilizado = false;
            let vacunado = false;
            let desparasitado = false;
            let especie = "Sin especificar";
            let pesoRaw: string | number | null | undefined;
            let fotoFile: File | null = null;

            if (isMultipart) {
                // Petición desde formulario con archivo
                const formData = await req.formData().catch(() => null);
                if (!formData) return jsonResponse(400, { error: "FormData inválido." });

                nombre = (formData.get("nombre") as string | null)?.trim();
                sexo = formData.get("sexo") as string | null ?? undefined;
                edadRaw = formData.get("edad") as string | null ?? undefined;
                caracteristicas = (formData.get("caracteristicas") as string | null)?.trim();
                esterilizado = formData.get("esterilizado") === "true";
                vacunado = formData.get("vacunado") === "true";
                desparasitado = formData.get("desparasitado") === "true";
                especie = (formData.get("especie") as string | null)?.trim() || "Sin especificar";
                pesoRaw = formData.get("peso") as string | null;
                fotoFile = formData.get("foto") as File | null;
            } else {
                // Petición JSON sin archivo
                const body = (await req.json().catch(() => null)) as {
                    nombre?: string;
                    sexo?: string;
                    edad?: number;
                    caracteristicas?: string;
                    esterilizado?: boolean;
                    vacunado?: boolean;
                    desparasitado?: boolean;
                    especie?: string;
                    peso?: number | null;
                } | null;

                nombre = body?.nombre?.trim();
                sexo = body?.sexo;
                edadRaw = body?.edad;
                caracteristicas = body?.caracteristicas?.trim();
                esterilizado = body?.esterilizado ?? false;
                vacunado = body?.vacunado ?? false;
                desparasitado = body?.desparasitado ?? false;
                especie = body?.especie?.trim() || "Sin especificar";
                pesoRaw = body?.peso;
            }

            // Validaciones
            if (!nombre) {
                return jsonResponse(400, { error: "El nombre del peludo es obligatorio." });
            }
            if (!isValidSexo(sexo)) {
                return jsonResponse(400, { error: "El sexo debe ser 'macho' o 'hembra'." });
            }
            const edad = Number(edadRaw ?? 0);
            if (!Number.isInteger(edad) || edad <= 0) {
                return jsonResponse(400, {
                    error: "La edad debe ser un número entero mayor que 0.",
                });
            }
            if (!caracteristicas) {
                return jsonResponse(400, {
                    error: "Las características del peludo son obligatorias.",
                });
            }
            const peso = pesoRaw != null && pesoRaw !== "" ? Number(pesoRaw) : null;

            // Insertar peludo
            const { data: peludo, error: peludoError } = await adminClient
                .from("peludos")
                .insert({
                    nombre,
                    sexo,
                    edad,
                    caracteristicas,
                    esterilizado,
                    vacunado,
                    desparasitado,
                    especie,
                    peso,
                })
                .select(peludoSelect)
                .single();

            if (peludoError || !peludo) {
                return jsonResponse(500, {
                    error: peludoError?.message ?? "No se pudo crear el peludo.",
                });
            }

            // Subir imagen si se adjuntó una
            if (fotoFile && fotoFile.size > 0) {
                try {
                    const publicUrl = await uploadImage(adminClient, fotoFile);
                    await adminClient
                        .from("imagenes")
                        .insert({ id_referencia: peludo.id, url: publicUrl });
                } catch (imgErr) {
                    // El peludo ya fue creado; registramos el error pero no revertimos
                    console.error("Error al guardar imagen:", imgErr);
                    return jsonResponse(207, {
                        data: peludo,
                        warning:
                            "Peludo creado, pero hubo un error al subir la imagen. Puedes intentar subirla por separado.",
                    });
                }
            }

            return jsonResponse(201, { data: peludo });
        }

        // ── PATCH — actualizar peludo ─────────────────────────────────────────────
        if (req.method === "PATCH") {
            const contentType = req.headers.get("content-type") ?? "";
            const isMultipart = contentType.includes("multipart/form-data");

            let id: number;
            const updates: Record<string, unknown> = {};
            let fotoFile: File | null = null;

            if (isMultipart) {
                const formData = await req.formData().catch(() => null);
                if (!formData) return jsonResponse(400, { error: "FormData inválido." });

                id = Number(formData.get("id") ?? 0);
                const nombre = (formData.get("nombre") as string | null)?.trim();
                if (nombre !== undefined && nombre !== null) updates.nombre = nombre;

                const sexo = formData.get("sexo") as string | null;
                if (sexo) updates.sexo = sexo;

                const edadStr = formData.get("edad") as string | null;
                if (edadStr) updates.edad = Number(edadStr);

                const caracteristicas = (formData.get("caracteristicas") as string | null)?.trim();
                if (caracteristicas !== undefined && caracteristicas !== null)
                    updates.caracteristicas = caracteristicas;

                const esterilizado = formData.get("esterilizado");
                if (esterilizado !== null) updates.esterilizado = esterilizado === "true";

                const vacunado = formData.get("vacunado");
                if (vacunado !== null) updates.vacunado = vacunado === "true";

                const desparasitado = formData.get("desparasitado");
                if (desparasitado !== null) updates.desparasitado = desparasitado === "true";

                const especie = (formData.get("especie") as string | null)?.trim();
                if (especie !== undefined && especie !== null)
                    updates.especie = especie || "Sin especificar";

                const pesoStr = formData.get("peso") as string | null;
                if (pesoStr !== null) updates.peso = pesoStr !== "" ? Number(pesoStr) : null;

                fotoFile = formData.get("foto") as File | null;
            } else {
                const body = (await req.json().catch(() => null)) as {
                    id?: number;
                    nombre?: string;
                    sexo?: string;
                    edad?: number;
                    caracteristicas?: string;
                    esterilizado?: boolean;
                    vacunado?: boolean;
                    desparasitado?: boolean;
                    especie?: string;
                    peso?: number | null;
                } | null;

                id = Number(body?.id ?? 0);

                if (typeof body?.nombre === "string") {
                    const nombre = body.nombre.trim();
                    if (!nombre)
                        return jsonResponse(400, { error: "El nombre no puede estar vacío." });
                    updates.nombre = nombre;
                }
                if (body?.sexo !== undefined) {
                    if (!isValidSexo(body.sexo))
                        return jsonResponse(400, { error: "El sexo debe ser 'macho' o 'hembra'." });
                    updates.sexo = body.sexo;
                }
                if (body?.edad !== undefined) {
                    const edad = Number(body.edad);
                    if (!Number.isInteger(edad) || edad <= 0)
                        return jsonResponse(400, {
                            error: "La edad debe ser un número entero mayor que 0.",
                        });
                    updates.edad = edad;
                }
                if (typeof body?.caracteristicas === "string") {
                    const caracteristicas = body.caracteristicas.trim();
                    if (!caracteristicas)
                        return jsonResponse(400, {
                            error: "Las características no pueden estar vacías.",
                        });
                    updates.caracteristicas = caracteristicas;
                }
                if (typeof body?.esterilizado === "boolean") updates.esterilizado = body.esterilizado;
                if (typeof body?.vacunado === "boolean") updates.vacunado = body.vacunado;
                if (typeof body?.desparasitado === "boolean") updates.desparasitado = body.desparasitado;
                if (typeof body?.especie === "string")
                    updates.especie = body.especie.trim() || "Sin especificar";
                if (body?.peso !== undefined) updates.peso = body.peso ?? null;
            }

            if (!Number.isFinite(id) || id <= 0) {
                return jsonResponse(400, { error: "ID de peludo inválido." });
            }

            // Subir nueva foto si se adjuntó
            if (fotoFile && fotoFile.size > 0) {
                try {
                    const publicUrl = await uploadImage(adminClient, fotoFile);
                    // Reemplazar imagen existente (desvincular la anterior e insertar la nueva)
                    await adminClient
                        .from("imagenes")
                        .update({ id_referencia: null })
                        .eq("id_referencia", id);
                    await adminClient
                        .from("imagenes")
                        .insert({ id_referencia: id, url: publicUrl });
                } catch (imgErr) {
                    console.error("Error al actualizar imagen:", imgErr);
                    // Continuamos igual para actualizar el resto de campos
                }
            }

            if (Object.keys(updates).length === 0 && !fotoFile) {
                return jsonResponse(400, { error: "No hay campos para actualizar." });
            }

            // Si sólo cambió la foto, devolvemos el peludo sin hacer update vacío
            if (Object.keys(updates).length === 0) {
                const { data: peludo } = await adminClient
                    .from("peludos")
                    .select(peludoSelect)
                    .eq("id", id)
                    .single();
                return jsonResponse(200, { data: peludo });
            }

            const { data, error } = await adminClient
                .from("peludos")
                .update(updates)
                .eq("id", id)
                .select(peludoSelect)
                .single();

            if (error || !data) {
                return jsonResponse(500, {
                    error: error?.message ?? "No se pudo actualizar el peludo.",
                });
            }

            return jsonResponse(200, { data });
        }

        // ── DELETE — eliminar peludo ──────────────────────────────────────────────
        if (req.method === "DELETE") {
            const requestUrl = new URL(req.url);
            const id = Number(requestUrl.searchParams.get("id") ?? 0);

            if (!Number.isFinite(id) || id <= 0) {
                return jsonResponse(400, { error: "ID de peludo inválido." });
            }

            // Obtener URLs de imágenes antes de desvincular (para borrar del Storage)
            const { data: imagenes } = await adminClient
                .from("imagenes")
                .select("url")
                .eq("id_referencia", id);

            // Desvincular imágenes en la tabla
            const { error: unlinkError } = await adminClient
                .from("imagenes")
                .update({ id_referencia: null })
                .eq("id_referencia", id);

            if (unlinkError) {
                return jsonResponse(500, {
                    error: unlinkError.message ?? "No se pudieron desvincular las imágenes.",
                });
            }

            // Eliminar archivos del Storage
            if (imagenes && imagenes.length > 0) {
                const paths = imagenes
                    .map((img: { url: string }) => {
                        try {
                            const u = new URL(img.url);
                            // La ruta dentro del bucket es la parte tras "/fotos-peludos/"
                            const parts = u.pathname.split("/fotos-peludos/");
                            return parts[1] ?? null;
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean) as string[];

                if (paths.length > 0) {
                    await adminClient.storage.from("fotos-peludos").remove(paths);
                }
            }

            // Eliminar el peludo
            const { error: deleteError } = await adminClient
                .from("peludos")
                .delete()
                .eq("id", id);

            if (deleteError) {
                return jsonResponse(500, {
                    error: deleteError.message ?? "No se pudo eliminar el peludo.",
                });
            }

            return jsonResponse(200, { data: { id } });
        }

        return jsonResponse(405, { error: "Método no permitido." });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error inesperado.";
        const status =
            message === "No autorizado." || message === "Falta token de autorización."
                ? 401
                : 500;
        return jsonResponse(status, { error: message });
    }
});