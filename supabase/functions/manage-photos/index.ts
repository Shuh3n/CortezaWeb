import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const GALLERY_BUCKET = "fotos-peludos";

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

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugifyText(value: string) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

function buildGalleryStoragePath(fileName: string, now = new Date()) {
  const stamp = now.toISOString().replaceAll(":", "-");
  return `galeria/${stamp}-${slugifyText(fileName) || "imagen"}`;
}

function getDefaultImageName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return normalizeText(baseName) || "Imagen";
}

function extractStoragePathFromPublicUrl(publicUrl: string) {
  try {
    const parsedUrl = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${GALLERY_BUCKET}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    const encodedPath = parsedUrl.pathname.slice(markerIndex + marker.length);
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

const photoSelect = `
  id,
  nombre,
  fecha,
  url,
  created_at,
  deleted_at,
  categoria_id,
  categoria:galeria_categorias (
    id,
    nombre,
    slug,
    activa,
    created_at,
    updated_at,
    deleted_at
  )
`;

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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { error: "Falta token de autorización." });
    }

    const token = authHeader.replace("Bearer ", "");
    
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return jsonResponse(401, { error: "No autorizado o token inválido." });
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const categoriaId = Number(url.searchParams.get("categoriaId") ?? 0);
      const nombre = String(url.searchParams.get("nombre") ?? "").trim();
      const includeDeleted = url.searchParams.get("includeDeleted") === "true";

      let query = adminClient
        .from("imagenes")
        .select(photoSelect)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);

      if (!includeDeleted) {
        query = query.is("deleted_at", null);
      }

      if (categoriaId > 0) {
        query = query.eq("categoria_id", categoriaId);
      }

      if (nombre) {
        query = query.ilike("nombre", `%${nombre}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Database error (GET):", error);
        return jsonResponse(500, { error: `No se pudieron listar las imágenes: ${error.message}` });
      }

      return jsonResponse(200, { data: data ?? [] });
    }

    if (req.method === "POST") {
      const form = await req.formData();
      const categoriaId = Number(form.get("categoriaId") ?? 0);
      const fecha = String(form.get("fecha") ?? "").trim();
      const nombreInput = String(form.get("nombre") ?? "").trim();
      const files = form.getAll("files").filter((entry) => entry instanceof File) as File[];

      if (!categoriaId || categoriaId <= 0) {
        return jsonResponse(400, { error: "Categoría inválida." });
      }

      if (!fecha) {
        return jsonResponse(400, { error: "La fecha es obligatoria." });
      }

      if (files.length === 0) {
        return jsonResponse(400, { error: "Debe enviar al menos una imagen." });
      }

      const createdRows = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const storagePath = buildGalleryStoragePath(file.name, new Date(Date.now() + index));

        const { error: uploadError } = await adminClient.storage
          .from(GALLERY_BUCKET)
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "image/jpeg",
          });

        if (uploadError) {
          console.error("Storage error:", uploadError);
          return jsonResponse(500, { error: `No se pudo subir una imagen: ${uploadError.message}` });
        }

        const { data: { publicUrl } } = adminClient.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath);

        const nombre = nombreInput || getDefaultImageName(file.name);

        const { data: row, error: insertError } = await adminClient
          .from("imagenes")
          .insert({
            nombre,
            fecha,
            url: publicUrl,
            categoria_id: categoriaId,
            deleted_at: null,
          })
          .select(photoSelect)
          .single();

        if (insertError || !row) {
          console.error("Database error (POST):", insertError);
          return jsonResponse(500, { error: `No se pudo registrar la imagen: ${insertError?.message}` });
        }

        createdRows.push(row);
      }

      return jsonResponse(200, { data: createdRows });
    }

    if (req.method === "PATCH") {
      const body = await req.json().catch(() => null);
      const id = Number(body?.id ?? 0);

      if (!id || id <= 0) {
        return jsonResponse(400, { error: "ID de imagen inválido." });
      }

      const updates: Record<string, any> = {};
      
      if (body?.categoriaId) updates.categoria_id = Number(body.categoriaId);
      if (body?.fecha) updates.fecha = String(body.fecha);
      if (body?.nombre !== undefined) updates.nombre = String(body.nombre).trim() || null;

      const { data, error } = await adminClient
        .from("imagenes")
        .update(updates)
        .eq("id", id)
        .select(photoSelect)
        .single();

      if (error || !data) {
        console.error("Database error (PATCH):", error);
        return jsonResponse(500, { error: `No se pudo actualizar la imagen: ${error?.message}` });
      }

      return jsonResponse(200, { data });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = Number(url.searchParams.get("id") ?? 0);
      const idsParam = url.searchParams.get("ids");
      const categoriaId = Number(url.searchParams.get("categoriaId") ?? 0);

      let query = adminClient.from("imagenes").select("id, url");

      if (idsParam) {
        const ids = idsParam.split(",").map(Number).filter(n => !isNaN(n) && n > 0);
        if (ids.length === 0) return jsonResponse(400, { error: "Lista de IDs inválida." });
        query = query.in("id", ids);
      } else if (categoriaId > 0) {
        query = query.eq("categoria_id", categoriaId);
      } else if (id > 0) {
        query = query.eq("id", id);
      } else {
        return jsonResponse(400, { error: "Debe proporcionar id, ids o categoriaId para eliminar." });
      }

      const { data: rows, error: fetchError } = await query;

      if (fetchError || !rows) {
        console.error("Database error (DELETE fetch):", fetchError);
        return jsonResponse(500, { error: `Error obteniendo imágenes: ${fetchError?.message}` });
      }

      if (rows.length === 0) {
        return jsonResponse(200, { data: { count: 0 }, message: "No se encontraron imágenes." });
      }

      const storagePaths = rows
        .map(row => extractStoragePathFromPublicUrl(row.url))
        .filter((path): path is string => !!path);

      if (storagePaths.length > 0) {
        const { error: storageError } = await adminClient.storage.from(GALLERY_BUCKET).remove(storagePaths);
        if (storageError) {
          console.error("Storage error (DELETE):", storageError);
          return jsonResponse(500, { error: `Error eliminando archivos: ${storageError.message}` });
        }
      }

      const rowIds = rows.map(r => r.id);
      const { error: deleteError } = await adminClient.from("imagenes").delete().in("id", rowIds);

      if (deleteError) {
        console.error("Database error (DELETE):", deleteError);
        return jsonResponse(500, { error: `Error eliminando registros: ${deleteError.message}` });
      }

      return jsonResponse(200, { data: { deletedIds: rowIds, count: rowIds.length } });
    }

    return jsonResponse(405, { error: "Método no permitido." });
  } catch (error: any) {
    console.error("Unexpected error in function:", error);
    return jsonResponse(500, { error: error.message || "Error inesperado en el servidor." });
  }
});
