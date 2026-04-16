import { Link } from 'react-router-dom';
import { FolderCog, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

const sections: Array<{
  id: 'categories' | 'uploads';
  to: string;
  title: string;
  description: string;
  icon: typeof FolderCog;
}> = [
  {
    id: 'categories',
    to: '/admin/galeria/categorias',
    title: 'Categorias',
    description: 'Crear, editar, desactivar y reactivar categorias.',
    icon: FolderCog,
  },
  {
    id: 'uploads',
    to: '/admin/galeria/cargas',
    title: 'Gestor de imagenes',
    description: 'Ver, buscar, filtrar, editar y eliminar imagenes de la galeria.',
    icon: ImagePlus,
  },
];

export default function AdminGalleryPage() {
  const categorySection = sections.find(s => s.id === 'categories')!;
  const imageSection = sections.find(s => s.id === 'uploads')!;
  const CategoryIcon = categorySection.icon;
  const ImageIcon = imageSection.icon;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Galeria</p>
        <h1 className="mt-2 text-3xl font-black text-text-h">Panel unificado de galeria</h1>
        <p className="mt-3 text-text-muted">Elegi que queres administrar: categorias o gestor de imagenes. Todo queda en esta misma pantalla.</p>

        <div className="mt-8 space-y-4">
          {/* Categorías - Primera opción, ancho completo */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-primary/10 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-primary/20"
          >
            <Link to={categorySection.to} className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
              <div className="inline-flex shrink-0 self-start rounded-2xl bg-primary/10 p-4 text-primary sm:self-center">
                <CategoryIcon className="h-8 w-8" />
              </div>
              <div className="mt-4 sm:mt-0">
                <h2 className="text-2xl font-black text-text-h">{categorySection.title}</h2>
                <p className="mt-2 text-base text-text-muted">{categorySection.description}</p>
              </div>
            </Link>
          </motion.div>

          {/* Gestor de Imágenes - Debajo */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.35 }}
            className="rounded-3xl border border-primary/10 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-primary/20"
          >
            <Link to={imageSection.to} className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
              <div className="inline-flex shrink-0 self-start rounded-2xl bg-primary/10 p-4 text-primary sm:self-center">
                <ImageIcon className="h-8 w-8" />
              </div>
              <div className="mt-4 sm:mt-0">
                <h2 className="text-2xl font-black text-text-h">{imageSection.title}</h2>
                <p className="mt-2 text-base text-text-muted">{imageSection.description}</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
