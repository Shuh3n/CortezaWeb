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
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Galeria</p>
        <h1 className="mt-2 text-3xl font-black text-text-h">Panel unificado de galeria</h1>
        <p className="mt-3 text-text-muted">Elegi que queres administrar: categorias o gestor de imagenes. Todo queda en esta misma pantalla.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sections.map((section, index) => {
            const Icon = section.icon;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                className="rounded-3xl border border-primary/10 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/20"
              >
                <Link to={section.to} className="block">
                  <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-2xl font-black text-text-h">{section.title}</h2>
                  <p className="mt-2 text-sm text-text-muted">{section.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
