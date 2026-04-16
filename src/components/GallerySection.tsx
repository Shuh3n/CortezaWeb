import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { listGalleryImages } from '../lib/gallery';
import type { GalleryImage } from '../types/gallery';

function formatGalleryDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export default function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadImages() {
      try {
        setIsLoading(true);
        const data = await listGalleryImages();

        if (!ignore) {
          setImages(data);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error('No se pudo cargar la galería pública.', error);

        if (!ignore) {
          setErrorMessage('No pudimos cargar la galería en este momento.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadImages();

    return () => {
      ignore = true;
    };
  }, []);

  const featuredImages = useMemo(() => images.slice(0, 6), [images]);

  return (
    <section className="bg-neutral-soft px-4 py-20">
      <div className="mx-auto w-full max-w-[70%]">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: 'easeOut' }} className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary"><ImageIcon className="h-4 w-4" />Galería canina</span>
            <h2 className="mt-4 text-4xl font-black text-text-h md:text-5xl">Momentos que cuentan historias reales</h2>
            <p className="mt-4 max-w-2xl text-lg text-text-muted">Cada foto muestra rescates, adopciones y jornadas de la fundación. Aquí la galería acerca a las personas a la historia real de cada proceso.</p>
          </div>

          <div className="rounded-3xl bg-white px-6 py-5 shadow-lg shadow-primary/5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Fotos publicadas</p>
            <p className="mt-2 text-4xl font-black text-primary">{images.length}</p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="overflow-hidden rounded-[32px] bg-white shadow-lg shadow-primary/5"><div className="h-72 animate-pulse bg-primary/10" /><div className="space-y-3 p-6"><div className="h-4 w-24 animate-pulse rounded-full bg-primary/10" /><div className="h-6 w-3/4 animate-pulse rounded-full bg-primary/10" /><div className="h-4 w-1/2 animate-pulse rounded-full bg-primary/10" /></div></div>)}</div>
        ) : errorMessage ? (
          <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700">{errorMessage}</div>
        ) : featuredImages.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-primary/20 bg-white p-10 text-center"><p className="text-xl font-bold text-primary">Todavía no hay fotos cargadas.</p><p className="mt-2 text-text-muted">En cuanto el administrador publique imágenes, esta sección se actualizará automáticamente.</p></div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredImages.map((image, index) => (
                <motion.article
                  key={image.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
                  className="aspect-square overflow-hidden rounded-[32px] bg-white shadow-xl shadow-primary/8 transition hover:-translate-y-1"
                >
                  <img
                    src={image.url}
                    alt="Galería"
                    className="h-full w-full object-cover transition duration-500 hover:scale-110"
                  />
                </motion.article>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/galeria" className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-lg shadow-primary/25 transition hover:scale-105 hover:bg-primary/90">Ver galería completa <ArrowRight className="h-5 w-5" /></Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
