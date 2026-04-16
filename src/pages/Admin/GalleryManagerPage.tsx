import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ImageUp, PencilLine, PlusCircle, Search, Tag, Trash2, Type } from 'lucide-react';
import { deletePhoto, listAdminCategories, listAdminImages, updatePhoto, uploadPhotos } from '../../lib/adminApi';
import type { GalleryCategory, GalleryImage } from '../../types/gallery';

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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function refreshImages() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await listAdminImages({
        categoriaId: categoryFilter === 'all' ? null : Number(categoryFilter),
        nombre: searchName,
        includeDeleted: false,
      });
      setImages(result);
      setCurrentPage(1);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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

        if (ignore) {
          return;
        }

        setCategories(loadedCategories);
        setImages(loadedImages);
        setUploadCategoriaId(loadedCategories[0]?.id ?? null);
      } catch (error) {
        if (!ignore) {
          setErrorMessage(getErrorMessage(error));
        }
      }
    }

    void loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const totalShown = images.length;
  const totalPages = Math.max(1, Math.ceil(images.length / IMAGES_PER_PAGE));
  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * IMAGES_PER_PAGE;
    return images.slice(start, start + IMAGES_PER_PAGE);
  }, [currentPage, images]);

  function handleOpenEdit(image: GalleryImage) {
    setEditingImage(image);
    setEditingNombre(image.nombre ?? '');
    setEditingFecha(image.fecha || today());
    setEditingCategoriaId(image.categoria_id);
    setErrorMessage(null);
    setFeedback(null);
  }

  async function handleSaveEdit() {
    if (!editingImage || !editingCategoriaId) {
      setErrorMessage('Debe seleccionar una categoria para actualizar la imagen.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setFeedback(null);

      const updated = (await updatePhoto({
        id: editingImage.id,
        categoriaId: editingCategoriaId,
        fecha: editingFecha,
        nombre: editingNombre,
      })) as GalleryImage;

      setImages((current) => current.map((image) => (image.id === updated.id ? updated : image)));
      setEditingImage(null);
      setFeedback('La imagen se actualizo correctamente.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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
      setErrorMessage(null);
      setFeedback(null);
      await deletePhoto(pendingDeleteImage.id);
      setImages((current) => current.filter((image) => image.id !== pendingDeleteImage.id));
      setPendingDeleteImage(null);
      setFeedback('La imagen se elimino correctamente.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
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

    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
    }

    setUploadPreview(selectedFiles[0] ? URL.createObjectURL(selectedFiles[0]) : null);
  }

  function closeUploadModal() {
    setIsUploadModalOpen(false);
    setUploadNombre('');
    setUploadFecha(today());
    setUploadFiles([]);
    setUploadProgress(0);

    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
      setUploadPreview(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uploadCategoriaId) {
      setErrorMessage('Seleccione una categoria para subir las imagenes.');
      return;
    }

    if (uploadFiles.length === 0) {
      setErrorMessage('Seleccione al menos una imagen para subir.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setFeedback(null);
      setUploadProgress(0);

      const created = (await uploadPhotos({
        categoriaId: uploadCategoriaId,
        fecha: uploadFecha,
        nombre: uploadNombre,
        files: uploadFiles,
        onProgress: (progress) => setUploadProgress(progress),
      })) as GalleryImage[];

      setFeedback(`Se subieron ${created.length} imagen(es) correctamente.`);
      closeUploadModal();
      await refreshImages();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="space-y-6">
      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Gestor de imagenes</p>
            <h1 className="mt-2 text-3xl font-black text-text-h">Administra fotos de la galeria</h1>
            <p className="mt-3 text-text-muted">Filtra por categoria, busca por nombre, edita datos o elimina con soft delete.</p>
          </div>

          <div className="rounded-3xl bg-primary/5 px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">Mostradas</p>
            <p className="mt-2 text-lg font-black text-primary">{totalShown}</p>
          </div>
        </div>

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
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-text-main">Categoria</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
            >
              <option value="all">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-text-main">Buscar por nombre</span>
            <div className="flex items-center gap-2 rounded-2xl border border-primary/10 bg-neutral-soft px-3 py-2">
              <Search className="h-4 w-4 text-primary" />
              <input
                type="text"
                value={searchName}
                onChange={(event) => setSearchName(event.target.value)}
                placeholder="Ej: rescate, jornada, peludo"
                className="w-full bg-transparent py-1 outline-none"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-auto inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-primary px-5 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Buscar
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setSearchName('');
              void (async () => {
                setIsLoading(true);
                setErrorMessage(null);
                try {
                  const result = await listAdminImages({ includeDeleted: false });
                  setImages(result);
                } catch (error) {
                  setErrorMessage(getErrorMessage(error));
                } finally {
                  setIsLoading(false);
                }
              })();
            }}
            className="mt-auto inline-flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-primary/10 bg-white px-5 font-semibold text-primary transition hover:-translate-y-0.5"
          >
            Limpiar
          </button>
        </form>

        {errorMessage ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorMessage}</div> : null}
        {feedback ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{feedback}</div> : null}
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Resultados</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="mt-2 text-2xl font-black text-text-h">Imagenes cargadas</h2>
          <p className="text-sm text-text-muted">Pagina {currentPage} de {totalPages}</p>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="rounded-3xl border border-primary/10 bg-primary/5 px-5 py-8 text-center text-text-muted">Cargando imagenes...</div>
          ) : images.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-8 text-center text-text-muted">No hay imagenes para los filtros seleccionados.</div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedImages.map((image) => (
                  <div key={image.id} className="group overflow-hidden rounded-[32px] border border-primary/10 bg-white transition hover:shadow-xl hover:shadow-primary/5">
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      <img src={image.url} alt={image.nombre ?? 'Imagen de galeria'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-black text-text-h">{image.nombre ?? 'Sin nombre'}</p>
                        <p className="mt-1 truncate text-sm text-text-muted">{image.categoria?.nombre ?? 'Sin categoria'}</p>
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
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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

            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="pointer-events-auto w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-8"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">Agregar fotos</p>
                <h3 className="mt-2 text-2xl font-black text-text-h">Subir imagenes a la galeria</h3>

                <form className="mt-6 space-y-4" onSubmit={handleUploadSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><Type className="h-4 w-4 text-primary" />Nombre opcional</span>
                      <input
                        type="text"
                        value={uploadNombre}
                        onChange={(event) => setUploadNombre(event.target.value)}
                        placeholder="Ej: Jornada del sabado"
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><Tag className="h-4 w-4 text-primary" />Categoria</span>
                      <select
                        value={uploadCategoriaId ?? ''}
                        onChange={(event) => setUploadCategoriaId(Number(event.target.value))}
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.nombre}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><CalendarDays className="h-4 w-4 text-primary" />Fecha visible</span>
                      <input
                        type="date"
                        value={uploadFecha}
                        onChange={(event) => setUploadFecha(event.target.value)}
                        required
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><ImageUp className="h-4 w-4 text-primary" />Fotos</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadFilesChange}
                        required
                        className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-text-muted outline-none transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white hover:file:opacity-90"
                      />
                    </label>
                  </div>

                  {uploadPreview ? (
                    <div className="overflow-hidden rounded-2xl border border-primary/10">
                      <img src={uploadPreview} alt="Vista previa de carga" className="h-56 w-full object-cover" />
                    </div>
                  ) : null}

                  {isSubmitting ? (
                    <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">Subiendo imagenes...</span>
                        <span className="text-sm font-black text-primary">{uploadProgress}%</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-white">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Publicar en galeria
                    </button>
                  </div>
                </form>
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

            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="pointer-events-auto w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-8"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">Editar imagen</p>
                <h3 className="mt-2 text-2xl font-black text-text-h">Actualiza la informacion</h3>

                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-text-main">Nombre</span>
                    <input
                      type="text"
                      value={editingNombre}
                      onChange={(event) => setEditingNombre(event.target.value)}
                      className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-text-main">Fecha visible</span>
                    <input
                      type="date"
                      value={editingFecha}
                      onChange={(event) => setEditingFecha(event.target.value)}
                      className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-text-main">Categoria</span>
                    <select
                      value={editingCategoriaId ?? ''}
                      onChange={(event) => setEditingCategoriaId(Number(event.target.value))}
                      className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingImage(null)}
                    className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleSaveEdit()}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
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
              className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm"
            />

            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="pointer-events-auto w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-8"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">Confirmacion</p>
                <h3 className="mt-2 text-2xl font-black text-text-h">Estas seguro de eliminar esta imagen?</h3>
                <p className="mt-3 text-text-muted">Esta accion aplica soft delete y la imagen dejara de verse en la galeria publica.</p>

                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-800">Imagen seleccionada</p>
                  <p className="mt-1 text-lg font-black text-red-700">{pendingDeleteImage.nombre || 'Sin nombre'}</p>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteImage(null)}
                    className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleConfirmDelete()}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Trash2 className="h-4 w-4" />
                    Si, eliminar
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
