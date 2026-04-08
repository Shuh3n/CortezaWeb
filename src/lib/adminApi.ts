import { supabase } from './supabase';

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
    throw new Error(deletePayload?.error ?? 'No se pudo desactivar la categoría.');
  }

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  throw new Error(payload?.error ?? 'No se pudo reactivar la categoría.');
}

export async function uploadPhotos(payload: { categoriaId: number; fecha: string; nombre?: string; files: File[] }) {
  const formData = new FormData();
  formData.append('categoriaId', String(payload.categoriaId));
  formData.append('fecha', payload.fecha);

  if (payload.nombre?.trim()) {
    formData.append('nombre', payload.nombre.trim());
  }

  payload.files.forEach((file) => formData.append('files', file));

  const response = await fetchFunctionWithAuth('/manage-photos', 'POST', {
    body: formData,
  });

  return parseResponse(response);
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
