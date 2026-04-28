import { useEffect, useMemo, useRef, useState, memo, type ChangeEvent, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ImageUp, PencilLine, PlusCircle, Search, Tag, Trash2, Type, CheckCircle2, AlertCircle, Filter, CheckSquare, Square, Trash, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { deletePhoto, deletePhotos, deletePhotosByCategory, listAdminCategories, listAdminImages, updatePhoto, uploadPhotos } from '../../lib/adminApi';
import type { GalleryCategory, GalleryImage } from '../../types/gallery';
import { X } from 'lucide-react';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operacion.';
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Optimized Image Card Component
const GalleryImageCard = memo(({ 
  image, 
  isSelected, 
  onToggleSelect, 
  onEdit, 
  onDelete 
}: { 
  image: GalleryImage; 
  isSelected: boolean; 
  onToggleSelect: (id: number) => void; 
  onEdit: (image: GalleryImage) => void; 
  onDelete: (image: GalleryImage) => void; 
}) => {
  return (
    <div 
      className={`group relative overflow-hidden rounded-[32px] border transition-all duration-300 ${
        isSelected 
          ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' 
          : 'border-primary/10 bg-white hover:shadow-xl hover:shadow-primary/5'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleSelect(image.id)}
        className={`absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-300 ${
          isSelected 
            ? 'bg-primary border-primary text-white shadow-lg' 
            : 'bg-white/80 border-primary/20 text-primary opacity-0 group-hover:opacity-100 hover:scale-110'
        }`}
      >
        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
      </button>

      <div 
        className="relative aspect-square overflow-hidden bg-neutral-100 cursor-pointer"
        onClick={() => onToggleSelect(image.id)}
      >
        <img src={image.url} alt={image.nombre ?? 'Imagen de galería'} className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${isSelected ? 'scale-105 brightness-90' : ''}`} />
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
            onClick={() => onEdit(image)}
            className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/10 bg-white py-2.5 text-sm font-bold text-primary transition hover:bg-primary/5"
          >
            <PencilLine className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(image)}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

// Separate component for Bulk Delete Modal to prevent parent re-renders while typing
function BulkDeleteModal({ 
  pending, 
  selectedCount, 
  isSubmitting, 
  onConfirm, 
  onClose 
}: { 
  pending: { type: 'selected' | 'category', categoryId?: number, categoryName?: string };
  selectedCount: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [confirmation, setConfirmation] = useState('');
  
  const expectedPhrase = pending.type === 'selected' 
    ? `eliminar ${selectedCount} fotos` 
    : `eliminar fotos ${pending.categoryName}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600 sm:text-xs">Confirmación Masiva</p>
            <h3 className="mt-2 text-xl font-black text-text-h sm:text-3xl italic uppercase tracking-tighter">
              {pending.type === 'selected' 
                ? `¿Eliminar ${selectedCount} imágenes?` 
                : `¿Vaciar categoría "${pending.categoryName}"?`}
            </h3>
            <p className="mt-4 text-sm text-text-muted sm:text-lg leading-relaxed">
              Esta acción es <span className="font-black text-red-600 uppercase">permanente</span>. 
              {pending.type === 'selected' 
                ? ' Todas las imágenes seleccionadas' 
                : ' Todas las imágenes pertenecientes a esta categoría'} se borrarán de la base de datos y del servidor.
            </p>

            <div className="mt-8 rounded-2xl bg-neutral-soft/50 p-6">
              <p className="mb-4 text-sm font-bold text-text-h">
                Para confirmar, escribí la siguiente frase:
                <br />
                <span className="mt-2 inline-block rounded-lg bg-white px-3 py-1 font-black text-red-600 shadow-sm">
                  {expectedPhrase}
                </span>
              </p>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Escribí la frase aquí..."
                className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-center font-bold outline-none transition focus:border-red-500"
                autoFocus
              />
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-primary transition hover:bg-neutral-100 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting || confirmation !== expectedPhrase}
                onClick={onConfirm}
                className="w-full flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : 'Si, eliminar todo permanentemente'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
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
  const [pendingBulkDelete, setPendingBulkDelete] = useState<{ type: 'selected' | 'category', categoryId?: number, categoryName?: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
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
  const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null);
  const filterDropdownTriggerRef = useRef<HTMLButtonElement | null>(null);
  const editDropdownTriggerRef = useRef<HTMLButtonElement | null>(null);

  const [dropdownRect, setDropdownRect] = useState<{ top: number, left: number, width: number } | null>(null);
  const [filterDropdownRect, setFilterDropdownRect] = useState<{ top: number, left: number, width: number } | null>(null);
  const [editDropdownRect, setEditDropdownRect] = useState<{ top: number, left: number, width: number } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);

  // Auto-close feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Update dropdown positions
  useEffect(() => {
    if (isCategoryDropdownOpen && dropdownTriggerRef.current) {
      const rect = dropdownTriggerRef.current.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width });
    }
  }, [isCategoryDropdownOpen]);

  useEffect(() => {
    if (isFilterDropdownOpen && filterDropdownTriggerRef.current) {
      const rect = filterDropdownTriggerRef.current.getBoundingClientRect();
      setFilterDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width });
    }
  }, [isFilterDropdownOpen]);

  useEffect(() => {
    if (isEditDropdownOpen && editDropdownTriggerRef.current) {
      const rect = editDropdownTriggerRef.current.getBoundingClientRect();
      setEditDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width });
    }
  }, [isEditDropdownOpen]);

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
      setSelectedIds([]);
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
          listAdminImages({ 
            categoriaId: categoryFilter === 'all' ? null : Number(categoryFilter),
            nombre: searchName,
            includeDeleted: false 
          }),
        ]);

        if (ignore) return;

        setCategories(loadedCategories);
        setImages(loadedImages);
        setUploadCategoriaId(loadedCategories[0]?.id ?? null);
      } catch (error) {
        if (!ignore) setFeedback({ type: 'error', msg: getErrorMessage(error) });
      }
    }

    void loadInitialData();

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
              .eq('id', (payload.new as { id: number }).id)
              .maybeSingle();

            if (error || !updatedImg) return;

            const matchesCategory = categoryFilter === 'all' || updatedImg.categoria_id === Number(categoryFilter);
            const matchesName = !searchName || updatedImg.nombre?.toLowerCase().includes(searchName.toLowerCase());

            if (matchesCategory && matchesName) {
              setImages((prev) => {
                const exists = prev.some(img => img.id === updatedImg.id);
                if (exists) {
                  return prev.map(img => img.id === updatedImg.id ? (updatedImg as unknown as GalleryImage) : img);
                }
                return [(updatedImg as unknown as GalleryImage), ...prev].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
              });
            } else {
              setImages((prev) => prev.filter(img => img.id !== updatedImg.id));
            }
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
    if (!pendingDeleteImage) return;
    try {
      setIsSubmitting(true);
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

  async function handleConfirmBulkDelete() {
    if (!pendingBulkDelete) return;
    try {
      setIsSubmitting(true);
      if (pendingBulkDelete.type === 'selected') {
        await deletePhotos(selectedIds);
        setImages(prev => prev.filter(img => !selectedIds.includes(img.id)));
        setSelectedIds([]);
        setFeedback({ type: 'success', msg: 'Las imágenes seleccionadas se eliminaron correctamente.' });
      } else if (pendingBulkDelete.type === 'category' && pendingBulkDelete.categoryId) {
        await deletePhotosByCategory(pendingBulkDelete.categoryId);
        setImages(prev => prev.filter(img => img.categoria_id !== pendingBulkDelete.categoryId));
        setSelectedIds(prev => prev.filter(id => {
          const img = images.find(i => i.id === id);
          return img?.categoria_id !== pendingBulkDelete.categoryId;
        }));
        setFeedback({ type: 'success', msg: `Todas las imágenes de la categoría "${pendingBulkDelete.categoryName}" se eliminaron correctamente.` });
      }
      setPendingBulkDelete(null);
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleToggleSelect(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function handleSelectAllVisible() {
    const visibleIds = paginatedImages.map(img => img.id);
    const allVisibleSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  }

  function handleUploadFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    setUploadFiles(selectedFiles);
    uploadPreviews.forEach(url => URL.revokeObjectURL(url));
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setUploadPreviews(newPreviews);
  }

  function closeUploadModal() {
    setIsUploadModalOpen(false);
    setUploadNombre('');
    setUploadFecha(today());
    setUploadFiles([]);
    setUploadProgress(0);
    uploadPreviews.forEach(url => URL.revokeObjectURL(url));
    setUploadPreviews([]);
    setEnlargedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  async function handleSubmitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await refreshImages();
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (isUploadModalOpen) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (isUploadModalOpen && e.dataTransfer.files?.length > 0) { const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/')); if (droppedFiles.length > 0) { setUploadFiles(prev => [...prev, ...droppedFiles]); const newPreviews = droppedFiles.map(file => URL.createObjectURL(file)); setUploadPreviews(prev => [...prev, ...newPreviews]); } } };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="space-y-8" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <AnimatePresence>
        {isDragging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-primary/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center gap-6 rounded-[40px] border-4 border-dashed border-white bg-primary/20 p-16 text-white">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-primary shadow-2xl"><ImageUp size={48} className="animate-bounce" /></div>
              <div className="text-center"><h2 className="text-4xl font-black italic uppercase tracking-tighter">¡Soltá las imágenes!</h2><p className="mt-2 text-xl font-bold opacity-80">Se añadirán automáticamente a la lista</p></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {enlargedPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md" onClick={() => setEnlargedPreview(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setEnlargedPreview(null)} className="absolute right-6 top-6 z-10 rounded-full bg-slate-950/50 p-2 text-white transition hover:bg-slate-950"><X size={24} /></button>
              <img src={enlargedPreview} alt="Preview ampliada" className="max-h-[85vh] w-full object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, x: 20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }} className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${feedback.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' : 'bg-red-50/90 border-red-100 text-red-800'}`}>
            <div className={`p-2 rounded-xl ${feedback.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>{feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}</div>
            <div className="flex flex-col"><p className="font-black text-sm uppercase tracking-widest leading-none mb-1">{feedback.type === 'success' ? 'Éxito' : 'Error'}</p><p className="text-sm font-bold opacity-80">{feedback.msg}</p></div>
            <button onClick={() => setFeedback(null)} className="ml-4 opacity-40 hover:opacity-100 transition-opacity"><X size={20} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,_#2d5a27_0%,_#8b4513_100%)] px-6 py-10 text-white shadow-2xl shadow-primary/20 sm:px-10">
        <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Módulo de Galería</p><h1 className="mt-3 text-4xl font-black md:text-5xl italic uppercase tracking-tighter">Gestión de Imágenes</h1><p className="mt-4 max-w-2xl text-lg text-white/85 font-medium">Controla visualmente el contenido de la Fundación. Sube, edita y organiza tus fotos en un solo lugar.</p></div>
          <div className="rounded-[28px] bg-white/10 px-8 py-6 backdrop-blur-md border border-white/10 text-center min-w-[160px]"><p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Total Fotos</p><p className="mt-2 text-4xl font-black">{totalShown}</p></div>
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="mt-8 flex flex-col gap-4"><button type="button" onClick={() => setIsUploadModalOpen(true)} className="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-secondary px-8 text-lg font-black text-white transition hover:opacity-90 shadow-lg shadow-secondary/20 uppercase tracking-widest"><PlusCircle className="h-6 w-6" />Agregar nuevas fotos</button></div>
        <form className="mt-8 grid gap-6 md:grid-cols-[1.5fr_1.5fr_auto]" onSubmit={handleSubmitFilters}>
          <div className="relative">
            <span className="mb-2 block text-xs font-black uppercase tracking-widest text-primary/50">Categoría</span>
            <div className="relative">
              <button ref={filterDropdownTriggerRef} type="button" onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} className="flex h-12 w-full items-center justify-between rounded-2xl border border-primary/10 bg-neutral-soft/50 px-4 text-sm font-bold text-text-h outline-none transition focus:border-primary focus:bg-white cursor-pointer">
                <div className="flex items-center gap-3"><Filter className="h-5 w-5 text-primary/30" /><span>{categoryFilter === 'all' ? 'Todas las categorías' : categories.find(c => String(c.id) === categoryFilter)?.nombre}</span></div>
                <Filter className={`h-4 w-4 text-primary/40 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isFilterDropdownOpen && filterDropdownRect && (
                  <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setIsFilterDropdownOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="fixed z-[120] mt-2 max-h-60 overflow-y-auto rounded-2xl border border-primary/10 bg-white p-2 shadow-2xl custom-scrollbar" style={{ top: filterDropdownRect.top, left: filterDropdownRect.left, width: filterDropdownRect.width }}>
                      <button type="button" onClick={() => { setCategoryFilter('all'); setIsFilterDropdownOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all hover:bg-primary/5 ${categoryFilter === 'all' ? 'bg-primary/10 text-primary' : 'text-text-h'}`}><div className={`h-2 w-2 rounded-full ${categoryFilter === 'all' ? 'bg-primary' : 'bg-primary/20'}`} />Todas las categorías</button>
                      {categories.map((category) => (<button key={category.id} type="button" onClick={() => { setCategoryFilter(String(category.id)); setIsFilterDropdownOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all hover:bg-primary/5 ${categoryFilter === String(category.id) ? 'bg-primary/10 text-primary' : 'text-text-h'}`}><div className={`h-2 w-2 rounded-full ${categoryFilter === String(category.id) ? 'bg-primary' : 'bg-primary/20'}`} />{category.nombre}</button>))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-widest text-primary/50">Nombre</span><div className="flex h-12 items-center gap-3 rounded-2xl border border-primary/10 bg-neutral-soft/50 px-4 focus-within:border-primary focus-within:bg-white transition-all"><Search className="h-5 w-5 text-primary/30" /><input type="text" value={searchName} onChange={(event) => setSearchName(event.target.value)} placeholder="Buscar por nombre..." className="w-full bg-transparent text-sm font-bold text-text-h outline-none placeholder:text-text-muted/30" /></div></label>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={isLoading} className="flex-1 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-10 font-black text-[11px] uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 cursor-pointer">Filtrar ahora</button>
            {(categoryFilter !== 'all' || searchName.trim() !== '') && (
              <button 
                type="button" 
                onClick={async () => {
                  setCategoryFilter('all');
                  setSearchName('');
                  setIsLoading(true);
                  try {
                    const result = await listAdminImages({
                      categoriaId: null,
                      nombre: '',
                      includeDeleted: false,
                    });
                    setImages(result);
                    setCurrentPage(1);
                    setSelectedIds([]);
                  } catch (error) {
                    setFeedback({ type: 'error', msg: getErrorMessage(error) });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-white text-primary shadow-lg shadow-primary/5 hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                title="Limpiar filtros"
              >
                <XCircle size={20} />
              </button>
            )}
          </div>
        </form>
      </section>

      <AnimatePresence>
        {(selectedIds.length > 0 || (categoryFilter !== 'all' && images.length > 0)) && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="sticky top-6 z-[90] flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-slate-900 px-6 py-4 text-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"><CheckSquare size={20} /></div><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Acciones masivas</p><p className="text-sm font-bold">{selectedIds.length > 0 ? `${selectedIds.length} seleccionadas` : 'Nada seleccionado'}</p></div></div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {selectedIds.length > 0 && (<><button onClick={() => setSelectedIds([])} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest transition hover:bg-white/20 cursor-pointer"><XCircle size={14} />Limpiar</button><button onClick={() => setPendingBulkDelete({ type: 'selected' })} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-widest transition hover:bg-red-600 shadow-lg shadow-red-500/20 cursor-pointer"><Trash size={14} />Eliminar seleccionadas</button></>)}
              {categoryFilter !== 'all' && (<button onClick={() => { const cat = categories.find(c => String(c.id) === categoryFilter); setPendingBulkDelete({ type: 'category', categoryId: Number(categoryFilter), categoryName: cat?.nombre }); }} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-400 transition hover:bg-red-500 hover:text-white cursor-pointer"><Trash2 size={14} />Vaciar categoría</button>)}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Resultados</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="mt-2 text-2xl font-black text-text-h italic uppercase tracking-tighter">Imágenes Cargadas</h2>
          <div className="flex items-center gap-4">
            {!isLoading && images.length > 0 && (<button onClick={handleSelectAllVisible} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:opacity-70 transition cursor-pointer">{paginatedImages.every(img => selectedIds.includes(img.id)) ? (<><XCircle size={16} /> Deseleccionar todo</>) : (<><CheckSquare size={16} /> Seleccionar página</>)}</button>)}
            <p className="text-sm text-text-muted">Página {currentPage} de {totalPages}</p>
          </div>
        </div>
        {totalPages > 1 && !isLoading && images.length > 0 && (<div className="mb-8"><PaginationControls /></div>)}
        <div className="mt-6">
          {isLoading ? (<div className="rounded-3xl border border-primary/10 bg-primary/5 px-5 py-20 text-center flex flex-col items-center justify-center gap-4"><div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /><p className="text-lg font-bold text-primary italic">Cargando imágenes...</p></div>) : images.length === 0 ? (<div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-8 text-center text-text-muted">No hay imágenes para los filtros seleccionados.</div>) : (<><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{paginatedImages.map((image) => (<GalleryImageCard key={image.id} image={image} isSelected={selectedIds.includes(image.id)} onToggleSelect={handleToggleSelect} onEdit={handleOpenEdit} onDelete={setPendingDeleteImage} />))}</div>{totalPages > 1 && (<div className="mt-10"><PaginationControls /></div>)}</>)}
        </div>
      </section>

      <AnimatePresence>
        {isUploadModalOpen ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeUploadModal} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm" />
            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="pointer-events-auto relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[40px]">
                <div className="border-b border-primary/5 p-5 sm:px-10 sm:py-8"><button onClick={closeUploadModal} className="absolute right-4 top-4 rounded-full bg-neutral-soft p-2 text-primary transition hover:bg-primary/10 sm:right-8 sm:top-8"><X size={20} /></button><p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 sm:text-xs">Agregar fotos</p><h3 className="mt-1 text-xl font-black text-text-h sm:mt-2 sm:text-3xl italic uppercase tracking-tighter">Subir imágenes</h3></div>
                <div className="flex-1 overflow-y-auto p-5 sm:p-10 custom-scrollbar relative">
                  <form id="upload-form" className="space-y-6" onSubmit={handleUploadSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><Type className="h-4 w-4 text-primary" />Nombre opcional</span><input type="text" value={uploadNombre} onChange={(event) => setUploadNombre(event.target.value)} placeholder="Ej: Jornada del sábado" className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base font-medium" /></label>
                      <div className="relative">
                        <span className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><Tag className="h-4 w-4 text-primary" />Categoría</span>
                        <div className="relative">
                          <button ref={dropdownTriggerRef} type="button" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} className="flex h-12 w-full items-center justify-between rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm font-bold text-text-h outline-none transition focus:border-primary sm:text-base cursor-pointer"><span>{categories.find(c => c.id === uploadCategoriaId)?.nombre || 'Seleccionar...'}</span><Filter className={`h-4 w-4 text-primary/40 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} /></button>
                          <AnimatePresence>
                            {isCategoryDropdownOpen && dropdownRect && (
                              <>
                                <div className="fixed inset-0 z-[110]" onClick={() => setIsCategoryDropdownOpen(false)} />
                                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="fixed z-[120] mt-2 max-h-60 overflow-y-auto rounded-2xl border border-primary/10 bg-white p-2 shadow-2xl custom-scrollbar" style={{ top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}>
                                  {categories.map((category) => (<button key={category.id} type="button" onClick={() => { setUploadCategoriaId(category.id); setIsCategoryDropdownOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all hover:bg-primary/5 ${uploadCategoriaId === category.id ? 'bg-primary/10 text-primary' : 'text-text-h'}`}><div className={`h-2 w-2 rounded-full ${uploadCategoriaId === category.id ? 'bg-primary' : 'bg-primary/20'}`} />{category.nombre}</button>))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><CalendarDays className="h-4 w-4 text-primary" />Fecha visible</span><input type="date" value={uploadFecha} onChange={(event) => setUploadFecha(event.target.value)} className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base font-medium" /></label>
                      <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><ImageUp className="h-4 w-4 text-primary" />Fotos</span><div onClick={() => fileInputRef.current?.click()} className="group relative flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-primary/20 bg-neutral-soft/50 p-8 transition-all hover:border-primary/50 hover:bg-white"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110"><ImageUp size={24} /></div><div className="text-center"><p className="text-sm font-black uppercase tracking-widest text-primary">Seleccionar o arrastrar imágenes</p><p className="mt-1 text-[10px] font-bold text-text-muted opacity-60">Puede subir múltiples archivos a la vez</p></div><input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUploadFilesChange} className="hidden" /></div></label>
                    </div>
                    {uploadPreviews.length > 0 ? (
                      <div className="space-y-3"><span className="flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><ImageUp className="h-4 w-4 text-primary" />Vista previa ({uploadPreviews.length} fotos)</span><div className="max-h-[220px] sm:max-h-[320px] overflow-y-auto rounded-3xl border border-primary/10 bg-neutral-soft/30 p-3 sm:p-4 custom-scrollbar"><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">{uploadPreviews.map((url, index) => (<motion.div key={url} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.02 }} className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 border-white shadow-sm transition hover:shadow-md sm:rounded-2xl" onClick={() => setEnlargedPreview(url)}><img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" /><div className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100"><PlusCircle className="text-white w-5 h-5 sm:w-6 sm:h-6" /></div></motion.div>))}</div></div><p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 sm:text-[10px]">Toca una imagen para ampliar</p></div>
                    ) : null}
                  </form>
                  {isSubmitting && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]"
                    >
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
                          <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageUp className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-black italic uppercase tracking-tighter text-primary">Publicando contenido</p>
                          <p className="mt-1 text-sm font-bold text-text-muted">Por favor, no cierres esta ventana</p>
                        </div>
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                            <span>Progreso</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${uploadProgress}%` }} 
                              className="h-full bg-primary shadow-lg shadow-primary/20" 
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-primary/5 bg-neutral-soft/30 p-5 sm:flex-row sm:justify-end sm:gap-4 sm:p-8"><button type="button" onClick={closeUploadModal} className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-primary transition hover:bg-neutral-100 sm:w-auto sm:text-sm">Cancelar</button><button form="upload-form" type="submit" disabled={isSubmitting} className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:text-sm">{isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Publicando...</>) : ('Publicar ahora')}</button></div>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editingImage ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingImage(null)} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm" />
            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="pointer-events-auto relative flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[40px]">
                <div className="border-b border-primary/5 p-5 sm:px-10 sm:py-8"><button onClick={() => setEditingImage(null)} className="absolute right-4 top-4 rounded-full bg-neutral-soft p-2 text-primary transition hover:bg-primary/10 sm:right-8 sm:top-8"><X size={20} /></button><p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/60 sm:text-xs">Editar imagen</p><h3 className="mt-1 text-xl font-black text-text-h sm:mt-2 sm:text-3xl italic uppercase tracking-tighter">Actualizar info</h3></div>
                <div className="flex-1 overflow-y-auto p-5 sm:p-10 custom-scrollbar">
                  <form id="edit-form" className="space-y-5" onSubmit={(e) => { e.preventDefault(); void handleSaveEdit(); }}>
                    <label className="block"><span className="mb-2 block text-xs font-bold text-text-main sm:text-sm">Nombre</span><input type="text" value={editingNombre} onChange={(event) => setEditingNombre(event.target.value)} className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base font-medium" /></label>
                    <label className="block"><span className="mb-2 block text-xs font-bold text-text-main sm:text-sm">Fecha visible</span><input type="date" value={editingFecha} onChange={(event) => setEditingFecha(event.target.value)} className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm outline-none transition focus:border-primary sm:text-base font-medium" /></label>
                    <div className="relative">
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-text-main sm:text-sm"><Tag className="h-4 w-4 text-primary" />Categoría</span>
                      <div className="relative">
                        <button ref={editDropdownTriggerRef} type="button" onClick={() => setIsEditDropdownOpen(!isEditDropdownOpen)} className="flex h-12 w-full items-center justify-between rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-sm font-bold text-text-h outline-none transition focus:border-primary sm:text-base cursor-pointer"><span>{categories.find(c => c.id === editingCategoriaId)?.nombre || 'Seleccionar...'}</span><Filter className={`h-4 w-4 text-primary/40 transition-transform ${isEditDropdownOpen ? 'rotate-180' : ''}`} /></button>
                        <AnimatePresence>
                          {isEditDropdownOpen && editDropdownRect && (
                            <>
                              <div className="fixed inset-0 z-[110]" onClick={() => setIsEditDropdownOpen(false)} />
                              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="fixed z-[120] mt-2 max-h-60 overflow-y-auto rounded-2xl border border-primary/10 bg-white p-2 shadow-2xl custom-scrollbar" style={{ top: editDropdownRect.top, left: editDropdownRect.left, width: editDropdownRect.width }}>
                                {categories.map((category) => (<button key={category.id} type="button" onClick={() => { setEditingCategoriaId(category.id); setIsEditDropdownOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all hover:bg-primary/5 ${editingCategoriaId === category.id ? 'bg-primary/10 text-primary' : 'text-text-h'}`}><div className={`h-2 w-2 rounded-full ${editingCategoriaId === category.id ? 'bg-primary' : 'bg-primary/20'}`} />{category.nombre}</button>))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-primary/5 bg-neutral-soft/30 p-5 sm:flex-row sm:justify-end sm:gap-4 sm:p-8"><button type="button" onClick={() => setEditingImage(null)} className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-primary transition hover:bg-neutral-100 sm:w-auto sm:text-sm">Cancelar</button><button form="edit-form" type="submit" disabled={isSubmitting} className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:text-sm">Guardar cambios</button></div>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDeleteImage ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPendingDeleteImage(null)} className="fixed inset-0 z-[100] bg-red-950/20 backdrop-blur-sm" />
            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="pointer-events-auto relative flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[40px]">
                <div className="p-6 text-center sm:p-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6"><Trash2 size={32} /></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600 sm:text-xs">Confirmación</p><h3 className="mt-2 text-xl font-black text-text-h sm:text-3xl italic uppercase tracking-tighter">¿Eliminar imagen?</h3><p className="mt-4 text-sm text-text-muted sm:text-lg leading-relaxed">Esta acción es <span className="font-black text-red-600 uppercase">permanente</span>. La imagen se borrará de la base de datos y del servidor.</p>
                  <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-left"><p className="text-[10px] font-black uppercase tracking-widest text-red-800/50">Seleccionada</p><p className="mt-1 text-base font-black text-red-700 truncate">{pendingDeleteImage.nombre || 'Sin nombre'}</p></div>
                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:gap-4"><button type="button" onClick={() => setPendingDeleteImage(null)} className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest text-primary transition hover:bg-neutral-100 sm:w-auto">Cancelar</button><button type="button" disabled={isSubmitting} onClick={() => void handleConfirmDelete()} className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">Si, eliminar permanentemente</button></div>
                </div>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>{pendingBulkDelete && (<BulkDeleteModal pending={pendingBulkDelete} selectedCount={selectedIds.length} isSubmitting={isSubmitting} onConfirm={handleConfirmBulkDelete} onClose={() => setPendingBulkDelete(null)} />)}</AnimatePresence>
    </motion.div>
  );
}
