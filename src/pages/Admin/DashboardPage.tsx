import { useEffect, useMemo, useState } from 'react';
import { FolderKanban, ImageIcon, LayoutDashboard, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { listGalleryImages, summarizeGalleryImages } from '../../lib/gallery';
import type { GalleryImage } from '../../types/gallery';

export default function AdminDashboardPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        const data = await listGalleryImages();

        if (!ignore) {
          setImages(data);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error('No se pudo cargar el dashboard.', error);

        if (!ignore) {
          setErrorMessage('No pudimos cargar las métricas del panel.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const summary = useMemo(() => summarizeGalleryImages(images), [images]);
  const topCategories = useMemo(() => Object.entries(summary.categories).slice(0, 4), [summary.categories]);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,_rgba(45,90,39,1),_rgba(139,69,19,0.95))] px-6 py-8 text-white shadow-2xl shadow-primary/20 sm:px-8">
        <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Dashboard</p>
            <h1 className="mt-3 text-4xl font-black">Bienvenido al panel administrativo</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">Gestiona galerías, categorías y contenido desde un panel pensado para moverse rápido y claro.</p>
          </div>

          <div className="rounded-[28px] bg-white/10 px-6 py-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Estado</p>
            <p className="mt-2 text-3xl font-black">{isLoading ? 'Cargando...' : `${summary.total} fotos`}</p>
          </div>
        </div>
      </section>

      {errorMessage ? <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-red-700">{errorMessage}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Fotos publicadas', value: isLoading ? '...' : String(summary.total), icon: ImageIcon, tone: 'bg-primary/10 text-primary' },
          { label: 'Categorías activas', value: isLoading ? '...' : String(topCategories.length), icon: FolderKanban, tone: 'bg-secondary/10 text-secondary' },
          { label: 'Última carga', value: summary.latest?.nombre ?? 'Sin datos', icon: Sparkles, tone: 'bg-accent/15 text-secondary' },
          { label: 'Módulos', value: 'Dashboard + Galería', icon: LayoutDashboard, tone: 'bg-slate-900/5 text-slate-700' },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.article key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }} className="rounded-[28px] bg-white p-6 shadow-lg shadow-primary/5">
              <div className={`inline-flex rounded-2xl p-3 ${card.tone}`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">{card.label}</p>
              <p className="mt-2 text-3xl font-black text-text-h">{card.value}</p>
            </motion.article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Fotos recientes</p>
            <h2 className="mt-2 text-2xl font-black text-text-h">Lo último que llegó al sitio</h2>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-3xl bg-neutral-soft" />)
            ) : images.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-8 text-center">Todavía no hay fotos cargadas en la galería.</div>
            ) : (
              images.slice(0, 4).map((image) => (
                <div key={image.id} className="flex flex-col gap-4 rounded-3xl border border-primary/10 p-4 sm:flex-row sm:items-center">
                  <img src={image.url} alt={image.nombre} className="h-24 w-full rounded-2xl object-cover sm:w-28" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/60">{image.categoria.nombre}</p>
                    <p className="mt-1 text-xl font-black text-text-h">{image.nombre}</p>
                    <p className="mt-1 text-sm text-text-muted">Fecha visible: {image.fecha}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.article>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.4 }} className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Distribución</p>
          <h2 className="mt-2 text-2xl font-black text-text-h">Fotos por categoría</h2>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-3xl bg-neutral-soft" />)
            ) : topCategories.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-8 text-center">Cuando subas imágenes vas a ver el reparto por categoría.</div>
            ) : (
              topCategories.map(([category, total]) => (
                <div key={category} className="rounded-3xl border border-primary/10 p-4 transition hover:-translate-y-0.5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-text-h">{category}</p>
                      <p className="text-sm text-text-muted">Contenido visible en la galería pública</p>
                    </div>
                    <span className="rounded-full bg-primary px-4 py-2 font-bold text-white">{total}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.article>
      </section>
    </motion.div>
  );
}
