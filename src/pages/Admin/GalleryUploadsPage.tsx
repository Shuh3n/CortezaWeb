import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminGalleryManagerPage from './GalleryManagerPage';

export default function AdminGalleryUploadsPage() {
  return (
    <div className="space-y-4">
      <Link
        to="/admin/galeria"
        className="inline-flex items-center gap-2 rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a /galeria
      </Link>

      <AdminGalleryManagerPage />
    </div>
  );
}
