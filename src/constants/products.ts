export const PRODUCTS_BUCKET = 'tienda-salvatore';

export function slugifyFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w.-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function buildProductStoragePath(fileName: string) {
  const stamp = Date.now();
  const name = fileName.split('.')[0];
  const ext = fileName.split('.').pop();
  return `${slugifyFileName(name)}-${stamp}.${ext}`;
}
