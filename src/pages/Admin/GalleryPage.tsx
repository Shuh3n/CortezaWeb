import { useState } from 'react';
import { FolderCog, ImagePlus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminManagementPage from './ManagementPage';
import AdminGalleryManagerPage from './GalleryManagerPage';

type View = 'menu' | 'categories' | 'images';

export default function AdminGalleryPage() {
  const [view, setView] = useState<View>('menu');

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {view === 'menu' && (
          <motion.section
            key="menu"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Galería</p>
            <h1 className="mt-2 text-3xl font-black text-text-h">Panel unificado de galería</h1>
            <p className="mt-3 text-text-muted">Elegí qué querés administrar: categorías o gestor de imágenes. Todo queda en esta misma pantalla.</p>

            <div className="mt-8 space-y-4">
              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => setView('categories')}
                className="w-full text-left rounded-3xl border border-primary/10 bg-white p-6 transition hover:border-primary/20 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                  <div className="inline-flex shrink-0 self-start rounded-2xl bg-primary/10 p-4 text-primary sm:self-center">
                    <FolderCog className="h-8 w-8" />
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <h2 className="text-2xl font-black text-text-h">Categorías</h2>
                    <p className="mt-2 text-base text-text-muted">Crear, editar, desactivar y reactivar categorías.</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => setView('images')}
                className="w-full text-left rounded-3xl border border-primary/10 bg-white p-6 transition hover:border-primary/20 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                  <div className="inline-flex shrink-0 self-start rounded-2xl bg-primary/10 p-4 text-primary sm:self-center">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <h2 className="text-2xl font-black text-text-h">Gestor de imágenes</h2>
                    <p className="mt-2 text-base text-text-muted">Ver, buscar, filtrar, editar y eliminar imágenes de la galería.</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.section>
        )}

        {view !== 'menu' && (
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button
              onClick={() => setView('menu')}
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/10 bg-white px-6 py-3 font-black uppercase tracking-widest text-primary shadow-sm transition hover:-translate-y-0.5 cursor-pointer text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al menú de galería
            </button>

            {view === 'categories' ? <AdminManagementPage /> : <AdminGalleryManagerPage />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
