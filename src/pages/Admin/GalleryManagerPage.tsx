import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { CalendarDays, ImageUp, Tag, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { uploadPhotos } from '../../lib/adminApi';
import { listGalleryCategories } from '../../lib/gallery';
import type { GalleryCategory, GalleryImage } from '../../types/gallery';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operación.';
}

export default function AdminGalleryManagerPage() {
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(today());
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        const data = await listGalleryCategories();
        if (!ignore) {
          setCategories(data);
          setCategoriaId((current) => current ?? data[0]?.id ?? null);
        }
      } catch (error) {
        console.error('No se pudieron cargar las categorías.', error);
      }
    }

    void loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  const selectedCategory = useMemo(() => categories.find((category) => category.id === categoriaId) ?? null, [categories, categoriaId]);
  const recentImages = useMemo(() => recentUploads.slice(0, 5), [recentUploads]);

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    setFiles(selectedFiles);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(selectedFiles[0] ? URL.createObjectURL(selectedFiles[0]) : null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCategory) {
      setErrorMessage('Seleccione una categoría antes de publicar.');
      return;
    }

    if (files.length === 0) {
      setErrorMessage('Seleccione al menos una imagen para publicar.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const createdImages = (await uploadPhotos({ categoriaId: selectedCategory.id, fecha, nombre, files })) as GalleryImage[];

      setRecentUploads((current) => [...createdImages, ...current]);
      setNombre('');
      setFecha(today());
      setFiles([]);
      setSuccessMessage(`Se publicaron ${createdImages.length} imagen(es) correctamente.`);

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Galería</p>
            <h1 className="mt-2 text-3xl font-black text-text-h">Cargue una o varias fotos caninas</h1>
            <p className="mt-3 max-w-2xl text-text-muted">El nombre es opcional. Si lo deja vacío, cada foto usa su nombre de archivo. La categoría sí es obligatoria.</p>
          </div>

          <div className="rounded-3xl bg-primary/5 px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">Archivos seleccionados</p>
            <p className="mt-2 text-lg font-black text-primary">{files.length}</p>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><Type className="h-4 w-4 text-primary" />Nombre opcional</span>
              <input type="text" value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Ej: Rescate en la jornada del domingo" className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:-translate-y-0.5 focus:border-primary" />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><Tag className="h-4 w-4 text-primary" />Categoría</span>
              <select value={categoriaId ?? ''} onChange={(event) => setCategoriaId(Number(event.target.value))} className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:-translate-y-0.5 focus:border-primary">
                {categories.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
              </select>
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><CalendarDays className="h-4 w-4 text-primary" />Fecha visible</span>
              <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} required className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:-translate-y-0.5 focus:border-primary" />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><ImageUp className="h-4 w-4 text-primary" />Fotos</span>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesChange} required className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-text-muted outline-none transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white hover:file:opacity-90" />
            </label>
          </div>

          {errorMessage ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorMessage}</div> : null}
          {successMessage ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{successMessage}</div> : null}

          <motion.button whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }} type="submit" disabled={isSubmitting} className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? 'Publicando fotos...' : 'Publicar en galería'}</motion.button>
        </form>
      </section>

      <section className="space-y-6">
        <article className="overflow-hidden rounded-[32px] bg-white shadow-lg shadow-primary/5">
          <div className="border-b border-primary/10 px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Vista previa</p>
            <h2 className="mt-2 text-2xl font-black text-text-h">Así se verá la primera imagen</h2>
          </div>

          <div className="p-6">
            {preview ? (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="overflow-hidden rounded-[28px] border border-primary/10">
                <img src={preview} alt={nombre || 'Vista previa de la imagen'} className="h-80 w-full object-cover" />
                <div className="space-y-3 p-5">
                  <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">{selectedCategory?.nombre ?? 'Sin categoría'}</span>
                  <h3 className="text-2xl font-black text-text-h">{nombre || 'Se tomará el nombre del archivo'}</h3>
                  <p className="text-sm text-text-muted">Fecha: {fecha}</p>
                </div>
              </motion.div>
            ) : (
              <div className="flex min-h-80 items-center justify-center rounded-[28px] border border-dashed border-primary/20 bg-primary/5 p-8 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">Seleccione fotos para ver la vista previa</p>
                  <p className="mt-2 text-text-muted">La primera imagen seleccionada se muestra aquí como referencia.</p>
                </div>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Sesión actual</p>
          <h2 className="mt-2 text-2xl font-black text-text-h">Últimas cargas de esta sesión</h2>

          <div className="mt-6 space-y-4">
            {recentImages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-8 text-center text-text-muted">Todavía no ha subido imágenes en esta sesión.</div>
            ) : (
              recentImages.map((image) => (
                <div key={image.id} className="flex items-center gap-4 rounded-3xl border border-primary/10 p-4">
                  <img src={image.url} alt={image.nombre} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-black text-text-h">{image.nombre}</p>
                    <p className="text-sm text-text-muted">{image.categoria.nombre} • {image.fecha}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </motion.div>
  );
}
