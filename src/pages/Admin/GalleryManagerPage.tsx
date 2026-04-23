import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ImageUp, PencilLine, PlusCircle, Search, Tag, Trash2, Type, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { deletePhoto, listAdminCategories, listAdminImages, updatePhoto, uploadPhotos } from '../../lib/adminApi';
import type { GalleryCategory, GalleryImage } from '../../types/gallery';
import { X } from 'lucide-react';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operacion.';
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminGalleryManagerPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [editingFecha, setEditingFecha] = useState(today());
  const [editingCategoriaId, setEditingCategoriaId] = useState<number | null>(null);
  const [pendingDeleteImage, setPendingDeleteImage] = useState<GalleryImage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const IMAGES_PER_PAGE = 50;
  const [uploadNombre, setUploadNombre] = useState('');
  const [uploadCategoriaId, setUploadCategoriaId] = useState<number | null>(null);
  const [uploadFecha, setUploadFecha] = useState(today());
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [enlargedPreview, setEnlargedPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-close notifications
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  async function refreshImages() {
    setIsLoading(true);

    try {
      const result = await listAdminImages({
        categoriaId: categoryFilter === 'all' ? null : Number(categoryFilter),
        nombre: searchName,
        includeDeleted: false,
      });
      setImages(result);
      setCurrentPage(1);
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        const [loadedCategories, loadedImages] = await Promise.all([
          listAdminCategories({ includeInactive: false, includeDeleted: false }),
          listAdminImages({ includeDeleted: false }),
        ]);

        if (ignore) return;

        setCategories(loadedCategories);
        setImages(loadedImages);
        setUploadCategoriaId(loadedCategories[0]?.id ?? null);
      } catch (error) {
        if (!ignore) setFeedback({ type: 'error', msg: getErrorMessage(error) });
      }    }

    void loadInitialData();

    // Sincronización en tiempo real para imágenes
    const channel = supabase
      .channel('gallery-realtime')
      .on(
        'postgres_changes',
        { event: '*', table: 'imagenes', schema: 'public' },
        async (payload) => {
          if (ignore) return;

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { data: updatedImg, error } = await supabase
              .from('imagenes')
              .select(`
                id,
                nombre,
                fecha,
                url,
                created_at,
                deleted_at,
                categoria_id,
                galeria_categorias (
                  id,
                  nombre,
                  slug,
                  activa
                )
              `)
              .eq('id', (payload.new as any).id)
              .maybeSingle();

            if (error || !updatedImg) return;

            setImages((prev) => {
              const exists = prev.some(img => img.id === updatedImg.id);
              if (exists) {
                return prev.map(img => img.id === updatedImg.id ? (updatedImg as any) : img);
              }
              return [(updatedImg as any), ...prev].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            });
          } else if (payload.eventType === 'DELETE') {
            setImages((prev) => prev.filter(img => img.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [categoryFilter, searchName]);

  const totalShown = images.length;
  const totalPages = Math.max(1, Math.ceil(images.length / IMAGES_PER_PAGE));
  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * IMAGES_PER_PAGE;
    return images.slice(start, start + IMAGES_PER_PAGE);
  }, [currentPage, images]);

  const PaginationControls = () => (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        disabled={currentPage === 1}
        className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          if (totalPages > 7) {
            if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 2) {
              if (Math.abs(page - currentPage) === 3) return <span key={page} className="px-1 text-primary/40">...</span>;
              return null;
            }
          }
          return (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`h-11 w-11 cursor-pointer rounded-2xl font-bold transition ${
                page === currentPage
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white text-primary shadow-sm hover:-translate-y-0.5'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        disabled={currentPage === totalPages}
        className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  );

  function handleOpenEdit(image: GalleryImage) {
    setEditingImage(image);
    setEditingNombre(image.nombre ?? '');
    setEditingFecha(image.fecha || today());
    setEditingCategoriaId(image.categoria_id);
    setFeedback(null);
  }

  async function handleSaveEdit() {
    if (!editingImage || !editingCategoriaId) {
      setFeedback({ type: 'error', msg: 'Debe seleccionar una categoria para actualizar la imagen.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const updated = (await updatePhoto({
        id: editingImage.id,
        categoriaId: editingCategoriaId,
        fecha: editingFecha,
        nombre: editingNombre,
      })) as GalleryImage;

      setImages((current) => current.map((image) => (image.id === updated.id ? updated : image)));
      setEditingImage(null);
      setFeedback({ type: 'success', msg: 'La imagen se actualizó correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteImage) {
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await deletePhoto(pendingDeleteImage.id);
      setImages((current) => current.filter((image) => image.id !== pendingDeleteImage.id));
      setPendingDeleteImage(null);
      setFeedback({ type: 'success', msg: 'La imagen se eliminó correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await refreshImages();
  }

  function handleUploadFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    setUploadFiles(selectedFiles);

    // Limpiar previews viejos
    uploadPreviews.forEach(url => URL.revokeObjectURL(url));
    
    // Generar nuevos previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setUploadPreviews(newPreviews);
  }

  function closeUploadModal() {
    setIsUploadModalOpen(false);
    setUploadNombre('');
    setUploadFecha(today());
    setUploadFiles([]);
    setUploadProgress(0);

    // Limpiar todas las URLs de preview
    uploadPreviews.forEach(url => URL.revokeObjectURL(url));
    setUploadPreviews([]);
    setEnlargedPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uploadCategoriaId) {
      setFeedback({ type: 'error', msg: 'Seleccione una categoria para subir las imagenes.' });
      return;
    }

    if (uploadFiles.length === 0) {
      setFeedback({ type: 'error', msg: 'Seleccione al menos una imagen para subir.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      setUploadProgress(0);

      const created = (await uploadPhotos({
        categoriaId: uploadCategoriaId,
        fecha: uploadFecha,
        nombre: uploadNombre,
        files: uploadFiles,
        onProgress: (progress) => setUploadProgress(progress),
      })) as GalleryImage[];

      setFeedback({ type: 'success', msg: `Se subieron ${created.length} imagen(es) correctamente.` });
      closeUploadModal();
      await refreshImages();
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="space-y-8">
      {/* Lightbox for Preview */}
      <AnimatePresence>
        {enlargedPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
            onClick={() => setEnlargedPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEnlargedPreview(null)}
                className="absolute right-6 top-6 z-10 rounded-full bg-slate-950/50 p-2 text-white transition hover:bg-slate-950"
              >
                <X size={24} />
              </button>
              <img src={enlargedPreview} alt="Preview ampliada" className="max-h-[85vh] w-full object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Floating Notifications */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${feedback.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800'
              : 'bg-red-50/90 border-red-100 text-red-800'
              }`}
          >
            <div className={`p-2 rounded-xl ${feedback.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex flex-col">
              <p className="font-black text-sm uppercase tracking-widest leading-none mb-1">
                {feedback.type === 'success' ? 'Éxito' : 'Error'}
              </p>
              <p className="text-sm font-bold opacity-80">{feedback.msg}</p>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="ml-4 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,_#2d5a27_0%,_#8b4513_100%)] px-6 py-10 text-white shadow-2xl shadow-primary/20 sm:px-10">
        <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Módulo de Galería</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">Gestión de Imágenes</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">Controla visualmente el contenido de la Fundación. Sube, edita y organiza tus fotos en un solo lugar.</p>
          </div>

          <div className="rounded-[28px] bg-white/10 px-8 py-6 backdrop-blur-md border border-white/10 text-center min-w-[160px]">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Total Fotos</p>
            <p className="mt-2 text-4xl font-black">{totalShown}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">

        <div className="mt-8 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-secondary px-8 text-lg font-black text-white transition hover:opacity-90 shadow-lg shadow-secondary/20"
          >
            <PlusCircle className="h-6 w-6" />
            Agregar nuevas fotos
          </button>
        </div>

        <form className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]" onSubmit={handleSubmitFilters}>
          <label className="block relative">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-primary/50">Categoría</span>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl border border-primary/10 bg-neutral-soft/50 text-sm font-bold text-text-h outline-none transition focus:border-primary focus:bg-white appearance-none cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-primary/50">Nombre</span>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-primary/10 bg-neutral-soft/50 px-4 focus-within:border-primary focus-within:bg-white transition-all">
              <Search className="h-5 w-5 text-primary/30" />
              <input
                type="text"
                value={searchName}
                onChange={(event) => setSearchName(event.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full bg-transparent text-sm font-bold text-text-h outline-none placeholder:text-text-muted/30"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-8 font-black text-[11px] uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            Filtrar
          </button>
        </form>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Resultados</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="mt-2 text-2xl font-black text-text-h">Imágenes Cargadas</h2>
          <p className="text-sm text-text-muted">Página {currentPage} de {totalPages}</p>
        </div>

        {totalPages > 1 && !isLoading && images.length > 0 && (
          <div className="mb-8">
            <PaginationControls />
          </div>
        )}

        <div className="mt-6">
          {isLoading ? (
            <div className="rounded-3xl border border-primary/10 bg-primary/5 px-5 py-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-lg font-bold text-primary italic">Cargando imágenes...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-8 text-center text-text-muted">No hay imágenes para los filtros seleccionados.</div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedImages.map((image) => (
                  <div key={image.id} className="group overflow-hidden rounded-[32px] border border-primary/10 bg-white transition hover:shadow-xl hover:shadow-primary/5">
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      <img src={image.url} alt={image.nombre ?? 'Imagen de galería'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-black text-text-h">{image.nombre ?? 'Sin nombre'}</p>
                        <p className="mt-1 truncate text-sm text-text-muted">{image.categoria?.nombre ?? 'Sin categoría'}</p>
                        <p className="text-xs text-primary/60 font-semibold uppercase tracking-wider">{image.fecha}</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(image)}
                          className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/10 bg-white py-2.5 text-sm font-bold text-primary transition hover:bg-primary/5"
                        >
                          <PencilLine className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteImage(image)}
                          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10">
                  <PaginationControls />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isUploadModalOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeUploadModal}
              className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm"
            />

            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="pointer-events-auto relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[40px]"
              >
                {/* Header fijo */}
                <div className="border-b border-primary/5 p-5 sm:px-10 sm:py-8">
                  <button
                    onClick={closeUploadModal}
                    className="absolute right-4 top-4 rounded-full bg-neutral-soft p-2 text-primary transition hover:bg-primary/10 sm:right-8 sm:top-8"
                  >
                    <X size={20} />
                  </button>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 sm:text-xs">Agregar fotos</p>
                  <h3 className="mt-1 text-xl font-black text-text-h sm:mt-2 sm:text-3xl italic uppercase tracking-tighter">Subir imágenes</h3>
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-10 custom-scrollbar">
                  <form id="upload-form" className="space-y-6" onSubmit={handleUploadSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><Type className="h-4 w-4 text-primary" />Nombre opcional</span>
                        <input
                          type="text"
                          value={uploadNombre}
                          onChange={(event) => setUploadNombre(event.target.value)}
                          placeholder="Ej: Jornada del sábado"
                          className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><Tag className="h-4 w-4 text-primary" />Categoría</span>
                        <select
                          value={uploadCategoriaId ?? ''}
                          onChange={(event) => setUploadCategoriaId(Number(event.target.value))}
                          className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base cursor-pointer"
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.nombre}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><CalendarDays className="h-4 w-4 text-primary" />Fecha visible</span>
                        <input
                          type="date"
                          value={uploadFecha}
                          onChange={(event) => setUploadFecha(event.target.value)}
                          required
                          className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><ImageUp className="h-4 w-4 text-primary" />Fotos</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleUploadFilesChange}
                          required
                          className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-[11px] text-text-muted outline-none transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-[10px] file:font-black file:uppercase file:text-white hover:file:opacity-90 sm:text-sm sm:file:px-4 sm:file:py-2 sm:file:text-xs"
                        />
                      </label>
                    </div>

                    {uploadPreviews.length > 0 ? (
                      <div className="space-y-3">
                        <span className="flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm">
                          <ImageUp className="h-4 w-4 text-primary" />
                          Vista previa ({uploadPreviews.length} fotos)
                        </span>
                        <div className="max-h-[220px] sm:max-h-[320px] overflow-y-auto rounded-3xl border border-primary/10 bg-neutral-soft/30 p-3 sm:p-4 custom-scrollbar">
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
                            {uploadPreviews.map((url, index) => (
                              <motion.div
                                key={url}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 border-white shadow-sm transition hover:shadow-md sm:rounded-2xl"
                                onClick={() => setEnlargedPreview(url)}
                              >
                                <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                                <div className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100">
                                  <PlusCircle className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                                </div>

                              </motion.div>
                            ))}
                          </div>
                        </div>
                        <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 sm:text-[10px]">Toca una imagen para ampliar</p>
                      </div>
                    ) : null}

                    {isSubmitting ? (
                      <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-primary sm:text-sm uppercase tracking-widest">Subiendo...</span>
                          <span className="text-sm font-black text-primary">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white sm:h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="h-full rounded-full bg-primary"
                          />
                        </div>
                      </div>
                    ) : null}
                  </form>
                </div>

                {/* Footer fijo con acciones */}
                <div className="flex flex-col-reverse gap-3 border-t border-primary/5 bg-neutral-soft/30 p-5 sm:flex-row sm:justify-end sm:gap-4 sm:p-8">
                  <button
                    type="button"
                    onClick={closeUploadModal}
                    className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-primary transition hover:bg-neutral-100 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    form="upload-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:text-sm"
                  >
                    Publicar ahora
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editingImage ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingImage(null)}
              className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm"
            />

            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="pointer-events-auto relative flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[40px]"
              >
                {/* Header */}
                <div className="border-b border-primary/5 p-5 sm:px-10 sm:py-8">
                  <button
                    onClick={() => setEditingImage(null)}
                    className="absolute right-4 top-4 rounded-full bg-neutral-soft p-2 text-primary transition hover:bg-primary/10 sm:right-8 sm:top-8"
                  >
                    <X size={20} />
                  </button>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 sm:text-xs">Editar imagen</p>
                  <h3 className="mt-1 text-xl font-black text-text-h sm:mt-2 sm:text-3xl italic uppercase tracking-tighter">Actualizar info</h3>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-10 custom-scrollbar">
                  <form id="edit-form" className="space-y-5" onSubmit={(e) => { e.preventDefault(); void handleSaveEdit(); }}>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-text-main sm:text-sm">Nombre</span>
                      <input
                        type="text"
                        value={editingNombre}
                        onChange={(event) => setEditingNombre(event.target.value)}
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-text-main sm:text-sm">Fecha visible</span>
                      <input
                        type="date"
                        value={editingFecha}
                        onChange={(event) => setEditingFecha(event.target.value)}
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-bold text-text-main sm:text-sm">Categoría</span>
                      <select
                        value={editingCategoriaId ?? ''}
                        onChange={(event) => setEditingCategoriaId(Number(event.target.value))}
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base cursor-pointer"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.nombre}
                          </option>
                        ))}
                      </select>
                    </label>
                  </form>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-3 border-t border-primary/5 bg-neutral-soft/30 p-5 sm:flex-row sm:justify-end sm:gap-4 sm:p-8">
                  <button
                    type="button"
                    onClick={() => setEditingImage(null)}
                    className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-primary transition hover:bg-neutral-100 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    form="edit-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:text-sm"
                  >
                    Guardar cambios
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDeleteImage ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingDeleteImage(null)}
              className="fixed inset-0 z-[100] bg-red-950/20 backdrop-blur-sm"
            />

            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="pointer-events-auto relative flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[40px]"
              >
                <div className="p-6 text-center sm:p-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
                    <Trash2 size={32} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600 sm:text-xs">Confirmación</p>
                  <h3 className="mt-2 text-xl font-black text-text-h sm:text-3xl italic uppercase tracking-tighter">¿Eliminar imagen?</h3>
                  <p className="mt-4 text-sm text-text-muted sm:text-lg leading-relaxed">
                    Esta acción es <span className="font-black text-red-600 uppercase">permanente</span>. La imagen se borrará de la base de datos y del servidor.
                  </p>

                  <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-800/50">Seleccionada</p>
                    <p className="mt-1 text-base font-black text-red-700 truncate">{pendingDeleteImage.nombre || 'Sin nombre'}</p>
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setPendingDeleteImage(null)}
                      className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-primary transition hover:bg-neutral-100 sm:w-auto"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void handleConfirmDelete()}
                      className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    >
                      Si, eliminar permanentemente
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
