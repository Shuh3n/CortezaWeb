import { supabase } from './supabase';

const functionsBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No hay una sesión activa para ejecutar esta acción.');
  }

  return session.access_token;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as { data?: T; error?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? 'No se pudo completar la operación.');
  }

  return (payload?.data ?? payload) as T;
}

export async function createCategory(name: string) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${functionsBaseUrl}/manage-categories`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nombre: name }),
  });

  return parseResponse(response);
}

export async function updateCategory(id: number, name: string) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${functionsBaseUrl}/manage-categories`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, nombre: name }),
  });

  return parseResponse(response);
}

export async function softDeleteCategory(id: number) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${functionsBaseUrl}/manage-categories?id=${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseResponse(response);
}

export async function uploadPhotos(payload: { categoriaId: number; fecha: string; nombre?: string; files: File[] }) {
  const accessToken = await getAccessToken();
  const formData = new FormData();
  formData.append('categoriaId', String(payload.categoriaId));
  formData.append('fecha', payload.fecha);

  if (payload.nombre?.trim()) {
    formData.append('nombre', payload.nombre.trim());
  }

  payload.files.forEach((file) => formData.append('files', file));

  const response = await fetch(`${functionsBaseUrl}/manage-photos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return parseResponse(response);
}

export async function updatePhoto(payload: { id: number; categoriaId: number; fecha: string; nombre?: string }) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${functionsBaseUrl}/manage-photos`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function deletePhoto(id: number) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${functionsBaseUrl}/manage-photos?id=${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseResponse(response);
}
