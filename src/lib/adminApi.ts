import { supabase } from './supabase';
import { GALLERY_BUCKET, buildGalleryStoragePath } from '../constants/gallery';
import { getDefaultImageName } from './gallery';
import type { GalleryCategory, GalleryImage } from '../types/gallery';

const functionsBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return session.access_token;
  }

  const {
    data: { session: refreshedSession },
  } = await supabase.auth.refreshSession();

  if (!refreshedSession?.access_token) {
    throw new Error('No hay una sesión activa para ejecutar esta acción.');
  }

  return refreshedSession.access_token;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? `No se pudo completar la operación (${response.status}).`);
  }

  return (payload?.data ?? payload) as T;
}

async function updateCategoryStatusDirect(id: number, active: boolean) {
  const updates: { activa: boolean; deleted_at: string | null } = {
    activa: active,
    deleted_at: active ? null : new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('galeria_categorias')
    .update(updates)
    .eq('id', id)
    .select('id, nombre, slug, activa, created_at, updated_at, deleted_at')
    .single();

  if (error) {
    throw new Error(error.message || 'No se pudo actualizar el estado de la categoría.');
  }

  return data as GalleryCategory;
}

function getFunctionHeaders(accessToken: string, contentType?: 'application/json') {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    apikey: supabaseAnonKey,
  };

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  return headers;
}

async function fetchFunctionWithAuth(path: string, method: 'POST' | 'PATCH' | 'DELETE', options?: { body?: BodyInit; contentType?: 'application/json' }) {
  let accessToken = await getAccessToken();
  let response = await fetch(`${functionsBaseUrl}${path}`, {
    method,
    headers: getFunctionHeaders(accessToken, options?.contentType),
    body: options?.body,
  });

  if (response.status !== 401) {
    return response;
  }

  // Retry once after refreshing the auth session, common for expired access tokens.
  await supabase.auth.refreshSession();
  accessToken = await getAccessToken();

  response = await fetch(`${functionsBaseUrl}${path}`, {
    method,
    headers: getFunctionHeaders(accessToken, options?.contentType),
    body: options?.body,
  });

  return response;
}

export async function createCategory(name: string) {
  const response = await fetchFunctionWithAuth('/manage-categories', 'POST', {
    contentType: 'application/json',
    body: JSON.stringify({ nombre: name }),
  });

  return parseResponse(response);
}

export async function updateCategory(id: number, name: string) {
  const response = await fetchFunctionWithAuth('/manage-categories', 'PATCH', {
    contentType: 'application/json',
    body: JSON.stringify({ id, nombre: name }),
  });

  return parseResponse(response);
}

export async function softDeleteCategory(id: number) {
  return setCategoryStatus(id, false);
}

export async function setCategoryStatus(id: number, active: boolean, name?: string) {
  const response = await fetchFunctionWithAuth('/manage-categories', 'PATCH', {
    contentType: 'application/json',
    body: JSON.stringify({
      id,
      nombre: name,
      activa: active,
    }),
  });

  if (response.ok) {
    return parseResponse(response);
  }

  if (!active) {
    // Compatibility fallback for deployments that still use DELETE for logical removal.
    const deleteResponse = await fetchFunctionWithAuth(`/manage-categories?id=${id}`, 'DELETE', {
      body: undefined,
    });

    if (deleteResponse.ok) {
      return parseResponse(deleteResponse);
    }

    const deletePayload = (await deleteResponse.json().catch(() => null)) as { error?: string } | null;

    try {
      return await updateCategoryStatusDirect(id, active);
    } catch {
      throw new Error(deletePayload?.error ?? 'No se pudo desactivar la categoría.');
    }
  }

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;

  try {
    return await updateCategoryStatusDirect(id, active);
  } catch {
    throw new Error(payload?.error ?? 'No se pudo reactivar la categoría.');
  }
}

async function uploadPhotosDirect(payload: { categoriaId: number; fecha: string; nombre?: string; files: File[]; onProgress?: (progress: number) => void }) {
  const createdImages: GalleryImage[] = [];
  const totalFiles = payload.files.length;

  const normalizeCategory = (value: GalleryCategory | GalleryCategory[] | null | undefined): GalleryCategory => {
    if (Array.isArray(value)) {
      const first = value[0];
      if (first) {
        return first;
      }
    }

    if (value && !Array.isArray(value)) {
      return value;
    }

    throw new Error('No se pudo resolver la categoría de la imagen creada.');
  };

  for (let index = 0; index < totalFiles; index += 1) {
    const file = payload.files[index];
    const storagePath = buildGalleryStoragePath(file.name, new Date(Date.now() + index));

    const { error: uploadError } = await supabase.storage.from(GALLERY_BUCKET).upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

    if (uploadError) {
      throw new Error(uploadError.message || 'No se pudo subir una de las imágenes al storage.');
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath);

    const resolvedName = payload.nombre?.trim() || getDefaultImageName(file.name);

    const { data: row, error: insertError } = await supabase
      .from('imagenes')
      .insert({
        nombre: resolvedName,
        fecha: payload.fecha,
        url: publicUrl,
        categoria_id: payload.categoriaId,
      })
      .select(
        `
        id,
        nombre,
        fecha,
        url,
        created_at,
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
      `,
      )
      .single();

    if (insertError || !row) {
      throw new Error(insertError?.message || 'No se pudo registrar una de las imágenes en la base de datos.');
    }

    const normalizedRow = row as Omit<GalleryImage, 'categoria'> & {
      categoria: GalleryCategory | GalleryCategory[] | null;
    };

    createdImages.push({
      ...normalizedRow,
      categoria: normalizeCategory(normalizedRow.categoria),
    });
    payload.onProgress?.(Math.round(((index + 1) / totalFiles) * 100));
  }

  return createdImages;
}

export async function uploadPhotos(payload: { categoriaId: number; fecha: string; nombre?: string; files: File[]; onProgress?: (progress: number) => void }) {
  const formData = new FormData();
  formData.append('categoriaId', String(payload.categoriaId));
  formData.append('fecha', payload.fecha);

  if (payload.nombre?.trim()) {
    formData.append('nombre', payload.nombre.trim());
  }

  payload.files.forEach((file) => formData.append('files', file));

  try {
    const response = await fetchFunctionWithAuth('/manage-photos', 'POST', {
      body: formData,
    });

    const result = await parseResponse<GalleryImage[]>(response);
    payload.onProgress?.(100);
    return result;
  } catch {
    return uploadPhotosDirect(payload);
  }
}

export async function updatePhoto(payload: { id: number; categoriaId: number; fecha: string; nombre?: string }) {
  const response = await fetchFunctionWithAuth('/manage-photos', 'PATCH', {
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function deletePhoto(id: number) {
  const response = await fetchFunctionWithAuth(`/manage-photos?id=${id}`, 'DELETE', {
    body: undefined,
  });

  return parseResponse(response);
}
