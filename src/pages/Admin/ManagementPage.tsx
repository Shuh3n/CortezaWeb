import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PencilLine, RotateCcw, Trash2, CheckCircle2, AlertCircle, X, FolderPlus, Eye, EyeOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createCategory, listAdminCategories, setCategoryStatus, updateCategory } from '../../lib/adminApi';
import type { GalleryCategory } from '../../types/gallery';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operación.';
}

export default function AdminManagementPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [pendingDisableCategory, setPendingDisableCategory] = useState<GalleryCategory | null>(null);
  const [pendingReactivateCategory, setPendingReactivateCategory] = useState<GalleryCategory | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  async function refreshCategories() {
    const data = await listAdminCategories({ includeInactive: true, includeDeleted: true });
    setCategories(data);
  }

  // Auto-close notifications
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        const data = await listAdminCategories({ includeInactive: true, includeDeleted: true });
        if (!ignore) {
          setCategories(data);
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

  const activeCategories = useMemo(() => categories.filter((category) => category.activa && !category.deleted_at), [categories]);
  const inactiveCategories = useMemo(() => categories.filter((category) => !category.activa || Boolean(category.deleted_at)), [categories]);

  const displayedCategories = showInactive ? inactiveCategories : activeCategories;

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setFeedback(null);
      const created = (await createCategory(newCategoryName)) as GalleryCategory;
      setCategories((current) => [...current, created].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
      setNewCategoryName('');
      setIsCreateModalOpen(false);
      setFeedback({ type: 'success', msg: 'La categoría se creó correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveCategory(id: number) {
    try {
      setIsSubmitting(true);
      setFeedback(null);
      const updated = (await updateCategory(id, editingName)) as GalleryCategory;
      setCategories((current) => current.map((category) => (category.id === id ? updated : category)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
      setEditingId(null);
      setEditingName('');
      setFeedback({ type: 'success', msg: 'La categoría se actualizó correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetCategoryStatus(id: number, active: boolean, name: string) {
    try {
      setIsSubmitting(true);
      setFeedback(null);
      await setCategoryStatus(id, active, name);
      await refreshCategories();
      setFeedback({
        type: 'success',
        msg: active ? 'La categoría se reactivó correctamente.' : 'La categoría se desactivó correctamente.'
      });
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDisableCategory() {
    if (!pendingDisableCategory) return;
    await handleSetCategoryStatus(pendingDisableCategory.id, false, pendingDisableCategory.nombre);
    setPendingDisableCategory(null);
  }

  async function handleConfirmReactivateCategory() {
    if (!pendingReactivateCategory) return;
    await handleSetCategoryStatus(pendingReactivateCategory.id, true, pendingReactivateCategory.nombre);
    setPendingReactivateCategory(null);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="space-y-8">
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
            <button onClick={() => setFeedback(null)} className="ml-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header / Action */}
      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Configuración</p>
        <h1 className="mt-2 text-3xl font-black text-text-h">Gestión de Categorías</h1>
        <p className="mt-3 text-text-muted text-lg">Define la estructura visual de la galería organizando el contenido por temas.</p>

        <div className="mt-8">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-secondary px-8 text-lg font-black text-white transition hover:opacity-90 shadow-lg shadow-secondary/20"
          >
            <FolderPlus className="h-6 w-6" />
            Crear nueva categoría
          </button>
        </div>
      </section>

      {/* List Section */}
      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowInactive(false)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all cursor-pointer ${!showInactive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-neutral-soft text-text-muted hover:bg-neutral-100'}`}
            >
              Activas ({activeCategories.length})
            </button>
            <button
              onClick={() => setShowInactive(true)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2 ${showInactive ? 'bg-slate-700 text-white shadow-lg shadow-slate-200' : 'bg-neutral-soft text-text-muted hover:bg-neutral-100'}`}
            >
              {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Inactivas ({inactiveCategories.length})
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {displayedCategories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-12 text-center text-text-muted font-medium"
              >
                No hay categorías {showInactive ? 'inactivas' : 'activas'} para mostrar.
              </motion.div>
            ) : (
              displayedCategories.map((category) => (
                <motion.div
                  layout
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`rounded-[32px] border p-5 transition-all ${editingId === category.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-primary/10 bg-white'}`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {editingId === category.id ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex flex-col gap-4 md:flex-row md:items-center"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full rounded-2xl border border-primary/20 bg-white px-5 py-4 text-lg font-black text-text-h outline-none focus:border-primary shadow-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') void handleSaveCategory(category.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => void handleSaveCategory(category.id)}
                            disabled={isSubmitting}
                            className="flex-1 cursor-pointer rounded-2xl bg-primary px-6 py-4 font-black text-white shadow-lg shadow-primary/10 disabled:opacity-50"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-6 py-4 font-bold text-primary"
                          >
                            Cancelar
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="display"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`rounded-2xl p-4 ${category.activa ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                            {category.activa ? <CheckCircle2 size={24} /> : <EyeOff size={24} />}
                          </div>
                          <div>
                            <p className="text-xl font-black text-text-h uppercase tracking-tight">{category.nombre}</p>
                            <p className="mt-0.5 text-sm font-semibold text-text-muted opacity-60">URL: /galeria/{category.slug}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.activa ? (
                            <>
                              <button
                                onClick={() => { setEditingId(category.id); setEditingName(category.nombre); }}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-primary/10 bg-white px-5 py-3.5 font-black text-xs uppercase tracking-widest text-primary shadow-sm transition hover:-translate-y-0.5"
                              >
                                <PencilLine className="h-4 w-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => setPendingDisableCategory(category)}
                                className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-3.5 text-red-600 transition hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setPendingReactivateCategory(category)}
                              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 font-black text-xs uppercase tracking-widest text-emerald-700 transition hover:-translate-y-0.5"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Reactivar
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* MODALS */}
      <AnimatePresence>
        {/* Create Modal */}
        {isCreateModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm" />
            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="pointer-events-auto w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">Nueva sección</p>
                <h3 className="mt-2 text-3xl font-black text-text-h italic uppercase">Crear categoría</h3>
                <form className="mt-8 space-y-6" onSubmit={handleCreateCategory}>
                  <label className="block">
                    <span className="mb-2 block text-sm font-black uppercase tracking-widest text-primary/50">Nombre visible</span>
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                      placeholder="Ej: Eventos 2026"
                      className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-5 py-4 text-lg font-bold outline-none transition focus:border-primary focus:bg-white"
                    />
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 cursor-pointer rounded-2xl border border-primary/10 bg-white py-4 font-bold text-primary">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="flex-[2] cursor-pointer rounded-2xl bg-primary py-4 font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 disabled:opacity-50">Crear categoría</button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}

        {/* Disable Confirmation */}
        {pendingDisableCategory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPendingDisableCategory(null)} className="fixed inset-0 z-[100] bg-red-950/20 backdrop-blur-sm" />
            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="pointer-events-auto w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
                  <EyeOff size={32} />
                </div>
                <h3 className="text-center text-2xl font-black text-text-h uppercase tracking-tighter">¿Desactivar categoría?</h3>
                <p className="mt-3 text-center text-text-muted text-lg font-medium leading-relaxed">
                  La categoría <span className="font-black text-red-600">"{pendingDisableCategory.nombre}"</span> dejará de ser visible en el sitio público.
                </p>
                <div className="mt-8 flex gap-3">
                  <button onClick={() => setPendingDisableCategory(null)} className="flex-1 cursor-pointer rounded-2xl border border-primary/10 bg-white py-4 font-bold text-primary">Volver</button>
                  <button onClick={() => void handleConfirmDisableCategory()} className="flex-1 cursor-pointer rounded-2xl bg-red-600 py-4 font-black uppercase tracking-widest text-white shadow-lg shadow-red-200">Sí, desactivar</button>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Reactivate Confirmation */}
        {pendingReactivateCategory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPendingReactivateCategory(null)} className="fixed inset-0 z-[100] bg-emerald-950/20 backdrop-blur-sm" />
            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="pointer-events-auto w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
                  <RotateCcw size={32} />
                </div>
                <h3 className="text-center text-2xl font-black text-text-h uppercase tracking-tighter">¿Reactivar categoría?</h3>
                <p className="mt-3 text-center text-text-muted text-lg font-medium leading-relaxed">
                  Vas a volver a mostrar <span className="font-black text-emerald-600">"{pendingReactivateCategory.nombre}"</span> en el sitio público.
                </p>
                <div className="mt-8 flex gap-3">
                  <button onClick={() => setPendingReactivateCategory(null)} className="flex-1 cursor-pointer rounded-2xl border border-primary/10 bg-white py-4 font-bold text-primary">No, cancelar</button>
                  <button onClick={() => void handleConfirmReactivateCategory()} className="flex-1 cursor-pointer rounded-2xl bg-emerald-600 py-4 font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-200">Sí, reactivar</button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
