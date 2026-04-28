import AdminGalleryManagerPage from './GalleryManagerPage';

/**
 * Este componente ahora actúa como un wrapper directo para el gestor de imágenes,
 * ya que la gestión de categorías se movió al hub central de Gestión.
 */
export default function AdminGalleryPage() {
  return <AdminGalleryManagerPage />;
}
