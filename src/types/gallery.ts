export interface GalleryCategory {
  id: number;
  nombre: string;
  slug: string;
  activa: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface GalleryImage {
  id: number;
  nombre: string;
  fecha: string;
  url: string;
  created_at: string;
  deleted_at?: string | null;
  categoria_id: number;
  categoria: GalleryCategory;
}

export interface GalleryUploadInput {
  nombre?: string;
  categoriaId: number;
  fecha: string;
  files: File[];
}
