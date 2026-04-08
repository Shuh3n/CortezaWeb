export const GALLERY_BUCKET = 'fotos-peludos';

export function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function slugifyText(value: string) {
  const sanitized = normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized || 'item';
}

export function slugifyFileName(fileName: string) {
  return slugifyText(fileName) || 'imagen';
}

export function buildGalleryStoragePath(fileName: string, now = new Date()) {
  const stamp = now.toISOString().replaceAll(':', '-');
  return `galeria/${stamp}-${slugifyFileName(fileName)}`;
}
