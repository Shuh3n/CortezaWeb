import { useEffect, useMemo, useState } from 'react';
import { FolderKanban, ImageIcon, Package, ShoppingBag, AlertTriangle, ImagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { listGalleryImages, summarizeGalleryImages } from '../../lib/gallery';
import type { GalleryImage } from '../../types/gallery';

export default function AdminDashboardPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function loadMetrics() {
      const { count: total, error: err1 } = await supabase.from('products').select('id', { count: 'exact', head: true });
      const { count: low, error: err2 } = await supabase.from('products').select('id', { count: 'exact', head: true }).lte('stock', 5);

      if (!ignore) {
        setProductCount(total || 0);
        setLowStockCount(low || 0);
      }
    }

    async function loadDashboard() {
      if (ignore) return;
      setIsLoading(true);
      console.log('🔄 Iniciando carga de Dashboard...');

      // 1. Cargar Imágenes de Galería
      try {
        const galleryData = await listGalleryImages();
        if (!ignore) {
          console.log('✅ Galería cargada:', galleryData.length, 'fotos');
          setImages(galleryData);
        }
      } catch (err) {
        console.error('❌ Error en métricas de galería:', err);
      }

      // 2. Cargar Métricas de Tienda
      try {
        await loadMetrics();
        console.log('✅ Tienda cargada');
      } catch (err) {
        console.error('❌ Error en métricas de tienda:', err);
      }

      if (!ignore) {
        setIsLoading(false);
        setErrorMessage(null);
      }
    }

    void loadDashboard();

    // 3. Real-time listener para cambios en productos
    const channel = supabase
      .channel('dashboard-products', { config: { broadcast: { self: true } } })
      .on('postgres_changes', { event: '*', table: 'products', schema: 'public' }, () => {
        console.log('📊 Cambio detectado en productos, actualizando métricas...');
        void loadMetrics();
      })
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const summary = useMemo(() => summarizeGalleryImages(images), [images]);
  const topCategories = useMemo(() => Object.entries(summary.categories).slice(0, 4), [summary.categories]);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,_#2d5a27_0%,_#8b4513_100%)] px-6 py-10 text-white shadow-2xl shadow-primary/20 sm:px-10">
        <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Panel General</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">Bienvenido de nuevo</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">Control total de tu ecosistema: desde la galería de fotos hasta el inventario de la tienda.</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin/galeria')}
              className="h-14 px-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3"
            >
              Galería
              <ImagePlus size={18} />
            </button>
            <button
              onClick={() => navigate('/admin/tienda')}
              className="h-14 px-8 rounded-2xl bg-white shadow-xl shadow-black/20 font-black text-sm uppercase tracking-widest text-primary hover:scale-[1.03] transition-all flex items-center gap-3"
            >
              Tienda
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </section>

      {errorMessage ? <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-4 text-red-700">{errorMessage}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Fotos Publicadas', value: isLoading ? '...' : String(summary.total), icon: ImageIcon, tone: 'bg-primary/10 text-primary' },
          { label: 'Productos Tienda', value: isLoading ? '...' : String(productCount), icon: Package, tone: 'bg-secondary/10 text-secondary' },
          { label: 'Stock Bajo', value: isLoading ? '...' : String(lowStockCount), icon: AlertTriangle, tone: lowStockCount > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600' },
          { label: 'Categorías Galería', value: isLoading ? '...' : String(topCategories.length), icon: FolderKanban, tone: 'bg-slate-900/5 text-slate-700' },
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
