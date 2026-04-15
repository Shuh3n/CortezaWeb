import { GALLERY_BUCKET, normalizeText, slugifyText } from '../constants/gallery';
import type { GalleryCategory, GalleryImage } from '../types/gallery';
import { supabase } from './supabase';

const IMAGE_SELECT = `
  id,
  nombre,
  fecha,
  url,
  created_at,
  deleted_at,
  categoria_id,
  galeria_categorias!inner (
    id,
    nombre,
    slug,
    activa,
    created_at,
    updated_at,
    deleted_at
  )
`;

function mapGalleryImage(row: {
  id: number;
  nombre: string;
  fecha: string;
  url: string;
  created_at: string;
  deleted_at?: string | null;
  categoria_id: number;
  galeria_categorias: GalleryCategory | GalleryCategory[] | null;
}): GalleryImage {
  const category = Array.isArray(row.galeria_categorias) ? row.galeria_categorias[0] : row.galeria_categorias;

  if (!category) {
    throw new Error('La imagen no tiene categoría asociada.');
  }

  return {
    id: row.id,
    nombre: row.nombre,
    fecha: row.fecha,
    url: row.url,
    created_at: row.created_at,
    deleted_at: row.deleted_at ?? null,
    categoria_id: row.categoria_id,
    categoria: category,
  };
}

export function summarizeGalleryImages(images: GalleryImage[]) {
  const categories = images.reduce<Record<string, number>>((accumulator, image) => {
    accumulator[image.categoria.nombre] = (accumulator[image.categoria.nombre] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    total: images.length,
    latest: images[0] ?? null,
    categories,
  };
}

export function getDefaultImageName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  return normalizeText(baseName) || 'Imagen';
}

export async function listGalleryCategories(includeInactive = false, includeDeleted = false) {
  let query = supabase
    .from('galeria_categorias')
    .select('id, nombre, slug, activa, created_at, updated_at, deleted_at')
    .order('nombre', { ascending: true });

  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  if (!includeInactive) {
    query = query.eq('activa', true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as GalleryCategory[];
}

export async function listGalleryImages(categorySlug?: string) {
  let query = supabase
    .from('imagenes')
    .select(IMAGE_SELECT)
    .is('deleted_at', null)
    .eq('galeria_categorias.activa', true)
    .is('galeria_categorias.deleted_at', null)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false });

  if (categorySlug) {
    const normalizedSlug = slugifyText(categorySlug);
    const { data: category, error: categoryError } = await supabase
      .from('galeria_categorias')
      .select('id')
      .eq('slug', normalizedSlug)
      .is('deleted_at', null)
      .maybeSingle();

    if (categoryError) {
      throw categoryError;
    }

    if (!category) {
      return [];
    }

    query = query.eq('categoria_id', category.id);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapGalleryImage(row as never));
}

export async function listGallerySummary() {
  const [categories, images] = await Promise.all([listGalleryCategories(), listGalleryImages()]);

  return categories.map((category) => {
    const categoryImages = images.filter((image) => image.categoria_id === category.id);
    return {
      category,
      total: categoryImages.length,
      cover: categoryImages[0]?.url ?? null,
    };
  });
}

export async function deleteGalleryPhotoRow(id: number) {
  const { error } = await supabase.from('imagenes').delete().eq('id', id);
  if (error) throw error;
}

export { GALLERY_BUCKET };
