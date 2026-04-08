import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PencilLine, PlusCircle, RotateCcw, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createCategory, setCategoryStatus, updateCategory } from '../../lib/adminApi';
import { listGalleryCategories } from '../../lib/gallery';
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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingDisableCategory, setPendingDisableCategory] = useState<GalleryCategory | null>(null);

  async function refreshCategories() {
    const data = await listGalleryCategories(true, true);
    setCategories(data);
  }

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        const data = await listGalleryCategories(true, true);
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

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setFeedback(null);
      const created = (await createCategory(newCategoryName)) as GalleryCategory;
      setCategories((current) => [...current, created].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
      setNewCategoryName('');
      setFeedback('La categoría se creó correctamente.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveCategory(id: number) {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setFeedback(null);
      const updated = (await updateCategory(id, editingName)) as GalleryCategory;
      setCategories((current) => current.map((category) => (category.id === id ? updated : category)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
      setEditingId(null);
      setEditingName('');
      setFeedback('La categoría se actualizó correctamente.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetCategoryStatus(id: number, active: boolean, name: string) {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setFeedback(null);
      await setCategoryStatus(id, active, name);
      await refreshCategories();
      setFeedback(active ? 'La categoría se reactivó correctamente.' : 'La categoría se desactivó correctamente.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDisableCategory() {
    if (!pendingDisableCategory) {
      return;
    }

    await handleSetCategoryStatus(pendingDisableCategory.id, false, pendingDisableCategory.nombre);
    setPendingDisableCategory(null);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Gestión</p>
        <h1 className="mt-2 text-3xl font-black text-text-h">Crear categorías</h1>
        <p className="mt-3 text-text-muted">Desde aquí se crean, editan y gestionan categorías con estado activo/inactivo para conservar historial.</p>

        <form className="mt-8 space-y-5" onSubmit={handleCreateCategory}>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-text-main">Nombre visible</span>
            <input
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              required
              placeholder="Ej: Historias con final feliz"
              className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:-translate-y-0.5 focus:border-primary"
            />
          </label>

          {errorMessage ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorMessage}</div> : null}
          {feedback ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{feedback}</div> : null}

          <motion.button whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }} type="submit" disabled={isSubmitting} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
            <PlusCircle className="h-5 w-5" />
            Crear categoría
          </motion.button>
        </form>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Categorías activas</p>
            <h2 className="mt-2 text-3xl font-black text-text-h">Administra tu estructura</h2>
          </div>
          <div className="rounded-3xl bg-primary/5 px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">Total</p>
            <p className="mt-2 text-lg font-black text-primary">{activeCategories.length}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {activeCategories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-8 text-center text-text-muted">Todavía no hay categorías activas.</div>
          ) : (
            activeCategories.map((category) => (
              <div key={category.id} className="rounded-3xl border border-primary/10 p-4">
                {editingId === category.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => void handleSaveCategory(category.id)} className="cursor-pointer rounded-2xl bg-primary px-4 py-3 font-semibold text-white">Guardar</button>
                      <button type="button" onClick={() => { setEditingId(null); setEditingName(''); }} className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xl font-black text-text-h">{category.nombre}</p>
                      <p className="mt-1 text-sm text-text-muted">Slug: {category.slug}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => { setEditingId(category.id); setEditingName(category.nombre); }}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5"
                      >
                        <PencilLine className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDisableCategory(category)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition hover:-translate-y-0.5"
                      >
                        <Trash2 className="h-4 w-4" />
                        Desactivar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-10 border-t border-primary/10 pt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Categorías inactivas</p>
              <h3 className="mt-2 text-2xl font-black text-text-h">Reactivar categorías</h3>
            </div>
            <div className="rounded-3xl bg-slate-100 px-5 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Total</p>
              <p className="mt-2 text-lg font-black text-slate-700">{inactiveCategories.length}</p>
            </div>
          </div>

          <div className="space-y-4">
            {inactiveCategories.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-8 text-center text-text-muted">No hay categorías inactivas.</div>
            ) : (
              inactiveCategories.map((category) => (
                <div key={`inactive-${category.id}`} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xl font-black text-text-h">{category.nombre}</p>
                    <p className="mt-1 text-sm text-text-muted">Slug: {category.slug}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSetCategoryStatus(category.id, true, category.nombre)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 transition hover:-translate-y-0.5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reactivar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {pendingDisableCategory ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingDisableCategory(null)}
              className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm"
            />

            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="pointer-events-auto w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-8"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">Confirmación</p>
                <h3 className="mt-2 text-2xl font-black text-text-h">¿Estás seguro de desactivar esta categoría?</h3>
                <p className="mt-3 text-text-muted">
                  Esta acción ocultará la categoría en formularios públicos, pero conservará su historial para poder reactivarla.
                </p>

                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-semibold text-red-800">Categoría seleccionada</p>
                  <p className="mt-1 text-lg font-black text-red-700">{pendingDisableCategory.nombre}</p>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingDisableCategory(null)}
                    className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void handleConfirmDisableCategory()}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Trash2 className="h-4 w-4" />
                    Sí, desactivar
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
