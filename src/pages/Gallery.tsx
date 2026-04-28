import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { listGalleryImages, listGallerySummary } from '../lib/gallery';
import type { GalleryImage } from '../types/gallery';

const IMAGES_PER_PAGE = 20;

function formatGalleryDate(date: string, language: string) {
  const locale = language.startsWith('es') ? 'es-CO' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export default function PublicGalleryPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<Array<{ category: GalleryImage['categoria']; total: number; cover: string | null }>>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadGallery() {
      try {
        setIsLoading(true);
        // Reset images to avoid showing old category data
        if (slug) {
          setImages([]);
        }

        // Traemos el resumen (conteos y portadas) y solo la primera página de la categoría actual
        const [summaryData, imageData] = await Promise.all([
          listGallerySummary(),
          listGalleryImages(slug, currentPage, IMAGES_PER_PAGE)
        ]);

        if (!ignore) {
          setSummary(summaryData);
          setImages(imageData);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error('No se pudo cargar la página de galería.', error);
        if (!ignore) {
          setErrorMessage(t('galeria.error'));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadGallery();
    return () => {
      ignore = true;
    };
  }, [slug, t, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [slug]);

  useEffect(() => {
    if (!selectedImage) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedImage(null);
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedImage]);

  const currentCategory = useMemo(() => summary.find((item) => item.category.slug === slug) ?? null, [summary, slug]);
  const totalCount = currentCategory?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / IMAGES_PER_PAGE));
  const paginatedImages = images; // Ya vienen paginadas del server

  function showPreviousImage() {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((image) => image.id === selectedImage.id);
    if (currentIndex > 0) setSelectedImage(images[currentIndex - 1]);
  }

  function showNextImage() {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((image) => image.id === selectedImage.id);
    if (currentIndex >= 0 && currentIndex < images.length - 1) setSelectedImage(images[currentIndex + 1]);
  }

  return (
      <div className="bg-neutral-soft px-4 pb-20 pt-32">
        <div className="mx-auto max-w-[70%] space-y-10">
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-[32px] bg-[linear-gradient(135deg,_rgba(45,90,39,1),_rgba(139,69,19,0.95))] px-6 py-10 text-white shadow-2xl shadow-primary/20 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">{t('galeria.etiqueta')}</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">{t('galeria.titulo')}</h1>
            <p className="mt-4 max-w-3xl text-lg text-white/85">{t('galeria.descripcion')}</p>
          </motion.section>

          {errorMessage ? <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">{errorMessage}</div> : null}

          {!slug ? (
              <section>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">{t('galeria.categorias.etiqueta')}</p>
                    <h2 className="mt-2 text-3xl font-black text-text-h">{t('galeria.categorias.titulo')}</h2>
                  </div>
                  <div className="rounded-3xl bg-white px-5 py-4 shadow-lg shadow-primary/5">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">{t('galeria.categorias.total')}</p>
                    <p className="mt-2 text-lg font-black text-primary">{summary.length}</p>
                  </div>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-[32px] bg-white shadow-lg shadow-primary/5" />)}</div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {summary.map((item, index) => (
                          <motion.article key={item.category.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }} className="overflow-hidden rounded-[32px] bg-white shadow-lg shadow-primary/5 transition hover:-translate-y-1 cursor-pointer">
                            <Link to={`/galeria/${item.category.slug}`} className="block">
                              <div className="relative h-52 w-full overflow-hidden bg-primary/10">
                                {item.cover ? <img src={item.cover} alt={item.category.nombre} className="h-full w-full object-cover transition duration-500 hover:scale-105" /> : <div className="flex h-full items-center justify-center text-primary"><Images className="h-10 w-10" /></div>}
                              </div>
                              <div className="space-y-4 p-6 text-center">
                                <div>
                                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">{item.total} {t('galeria.categorias.fotos')}</p>
                                  <h3 className="mt-2 text-2xl font-black text-text-h">{item.category.nombre}</h3>
                                </div>
                                <span className="inline-flex cursor-pointer items-center gap-2 font-bold text-primary transition hover:gap-3">{t('galeria.categorias.ver')}<ArrowRight className="h-4 w-4" /></span>
                              </div>
                            </Link>
                          </motion.article>
                      ))}
                    </div>
                )}
              </section>
          ) : null}

          {slug && currentCategory ? (
              <section className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">{t('galeria.detalle.etiqueta')}</p>
                    <h2 className="mt-2 text-3xl font-black text-text-h">{currentCategory.category.nombre}</h2>
                    <p className="mt-2 text-sm text-text-muted">{t('galeria.detalle.mostrando')} {paginatedImages.length} {t('galeria.detalle.de')} {images.length} {t('galeria.detalle.fotos')}</p>
                  </div>
                  <Link to="/galeria" className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5"><ArrowLeft className="h-4 w-4" />{t('galeria.detalle.volver')}</Link>
                </div>

                {images.length === 0 && !isLoading ? (
                    <div className="rounded-3xl border border-dashed border-primary/20 bg-white px-5 py-8 text-center text-text-muted">{t('galeria.detalle.vacia')}</div>
                ) : (
                    <>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {paginatedImages.map((image, index) => (
                            <motion.button
                                key={image.id}
                                type="button"
                                initial={{ opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
                                onClick={() => setSelectedImage(image)}
                                className="group aspect-square cursor-pointer overflow-hidden rounded-[32px] bg-white shadow-xl shadow-primary/8 transition hover:-translate-y-1"
                            >
                              <img
                                  src={image.url}
                                  alt="Galería"
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                              />
                            </motion.button>
                        ))}
                      </div>

                      {totalPages > 1 ? (
                          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{t('galeria.detalle.anterior')}</button>
                            {Array.from({ length: totalPages }).map((_, index) => {
                              const page = index + 1;
                              return <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-11 w-11 cursor-pointer rounded-2xl font-bold transition ${page === currentPage ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-primary shadow-sm hover:-translate-y-0.5'}`}>{page}</button>;
                            })}
                            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{t('galeria.detalle.siguiente')}</button>
                          </div>
                      ) : null}
                    </>
                )}
              </section>
          ) : null}
        </div>

        <AnimatePresence>
          {selectedImage ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4">
                <button type="button" className="absolute inset-0 cursor-pointer" onClick={() => setSelectedImage(null)} aria-label="Cerrar imagen ampliada" />
                <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 8 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl lg:flex-row">
                  <div className="relative flex-1 bg-slate-950">
                    <img src={selectedImage.url} alt={selectedImage.nombre} className="h-full max-h-[70vh] w-full object-contain lg:max-h-[92vh]" />
                    <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-4 top-4 inline-flex cursor-pointer items-center justify-center rounded-full bg-white/90 p-3 text-slate-900 shadow-lg transition hover:scale-105" aria-label="Cerrar"><X className="h-5 w-5" /></button>
                    <button type="button" onClick={showPreviousImage} className="absolute left-4 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 p-3 text-slate-900 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40" disabled={images.findIndex((image) => image.id === selectedImage.id) <= 0} aria-label="Imagen anterior"><ChevronLeft className="h-5 w-5" /></button>
                    <button type="button" onClick={showNextImage} className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 p-3 text-slate-900 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40" disabled={images.findIndex((image) => image.id === selectedImage.id) >= images.length - 1} aria-label="Imagen siguiente"><ChevronRight className="h-5 w-5" /></button>
                  </div>
                  <div className="w-full space-y-4 p-6 lg:w-[360px]">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">{selectedImage.categoria.nombre}</p>
                    <p className="text-sm text-text-muted">{t('galeria.modal.fecha')}: {formatGalleryDate(selectedImage.fecha, i18n.language)}</p>
                    <p className="text-sm text-text-muted">{t('galeria.modal.imagen')} {images.findIndex((image) => image.id === selectedImage.id) + 1} {t('galeria.modal.de')} {images.length}</p>
                  </div>
                </motion.div>
              </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
  );
}