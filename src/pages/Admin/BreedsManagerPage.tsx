import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PencilLine, RotateCcw, Trash2, CheckCircle2, AlertCircle, X, PlusCircle, Eye, EyeOff, ArrowLeft, Fingerprint, PawPrint } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createBreed, listAdminBreeds, setBreedStatus, updateBreed, listAdminSpecies } from '../../lib/adminApi';
import SearchableSelect from '../../components/SearchableSelect';

interface Species {
  id: number;
  nombre: string;
}

interface Breed {
  id: number;
  nombre: string;
  especie_id: number;
  activa: boolean;
  especies?: { nombre: string };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operación.';
}

export default function BreedsManagerPage() {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [newBreedName, setNewBreedName] = useState('');
  const [newBreedSpeciesId, setNewBreedSpeciesId] = useState<number>(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingSpeciesId, setEditingSpeciesId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [pendingDisableBreed, setPendingDisableBreed] = useState<Breed | null>(null);
  const [pendingReactivateBreed, setPendingReactivateBreed] = useState<Breed | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [filterSpeciesId, setFilterSpeciesId] = useState<number>(0);
  const navigate = useNavigate();

  async function refreshBreeds() {
    try {
      const data = (await listAdminBreeds({ includeInactive: true, speciesId: filterSpeciesId || undefined })) as Breed[];
      setBreeds(data);
    } catch (error) {
      console.error('No se pudieron cargar las razas.', error);
    }
  }

  useEffect(() => {
    refreshBreeds();
  }, [filterSpeciesId]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [breedsData, speciesData] = await Promise.all([
          listAdminBreeds({ includeInactive: true }),
          listAdminSpecies({ includeInactive: false }) // Solo especies activas para crear nuevas razas
        ]);
        if (!ignore) {
          setBreeds(breedsData as Breed[]);
          setSpecies(speciesData as Species[]);
        }
      } catch (error) {
        console.error('Error inicial:', error);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const activeItems = useMemo(() => breeds.filter(b => b.activa), [breeds]);
  const inactiveItems = useMemo(() => breeds.filter(b => !b.activa), [breeds]);
  const displayedItems = showInactive ? inactiveItems : activeItems;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newBreedSpeciesId) {
      setFeedback({ type: 'error', msg: 'Debes seleccionar una especie.' });
      return;
    }
    try {
      setIsSubmitting(true);
      const created = (await createBreed(newBreedName, newBreedSpeciesId)) as Breed;
      setBreeds(prev => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNewBreedName('');
      setNewBreedSpeciesId(0);
      setIsCreateModalOpen(false);
      setFeedback({ type: 'success', msg: 'Raza creada correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(id: number) {
    try {
      setIsSubmitting(true);
      const updated = (await updateBreed(id, editingName, editingSpeciesId)) as Breed;
      setBreeds(prev => prev.map(b => b.id === id ? updated : b).sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setEditingId(null);
      setFeedback({ type: 'success', msg: 'Raza actualizada correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(id: number, active: boolean) {
    try {
      setIsSubmitting(true);
      await setBreedStatus(id, active);
      await refreshBreeds();
      setFeedback({
        type: 'success',
        msg: active ? 'Raza reactivada.' : 'Raza desactivada.'
      });
    } catch (error) {
      setFeedback({ type: 'error', msg: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Notifications */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
              feedback.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' : 'bg-red-50/90 border-red-100 text-red-800'
            }`}
          >
            <div className={`p-2 rounded-xl ${feedback.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <p className="text-sm font-bold">{feedback.msg}</p>
            <button onClick={() => setFeedback(null)} className="ml-4 opacity-40 hover:opacity-100 cursor-pointer"><X size={20} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6">
        <button
          onClick={() => navigate('/admin/gestion')}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-primary/10 bg-white px-6 py-3 font-black uppercase tracking-widest text-primary shadow-sm transition hover:-translate-y-0.5 cursor-pointer text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Gestión
        </button>

        <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Datos Maestros</p>
          <h1 className="mt-2 text-3xl font-black text-text-h">Gestión de Razas</h1>
          <p className="mt-3 text-text-muted text-lg">Administra las razas asociadas a cada especie.</p>

          <div className="mt-8">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-secondary px-8 text-lg font-black text-white transition hover:opacity-90 shadow-lg shadow-secondary/20"
            >
              <PlusCircle className="h-6 w-6" />
              Agregar Raza
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowInactive(false)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all cursor-pointer ${!showInactive ? 'bg-primary text-white shadow-lg' : 'bg-neutral-soft text-text-muted'}`}
            >
              Activas ({activeItems.length})
            </button>
            <button
              onClick={() => setShowInactive(true)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all cursor-pointer flex items-center gap-2 ${showInactive ? 'bg-slate-700 text-white shadow-lg' : 'bg-neutral-soft text-text-muted'}`}
            >
              {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Inactivas ({inactiveItems.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <SearchableSelect
              options={[{ id: 0, nombre: 'Todas las especies' }, ...species]}
              value={filterSpeciesId}
              onChange={(id) => setFilterSpeciesId(id)}
              placeholder="Todas las especies"
              label="Filtrar por especie"
              icon={PawPrint}
            />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {displayedItems.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 py-12 text-center text-text-muted">
                No hay razas para mostrar.
              </motion.div>
            ) : (
              displayedItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  className={`rounded-[32px] border p-5 transition-all ${editingId === item.id ? 'border-primary bg-primary/5' : 'border-primary/10 bg-white'}`}
                >
                  {editingId === item.id ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col">
                          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
                            <Fingerprint className="h-4 w-4 text-primary" /> Nombre de la raza
                          </span>
                          <input
                            type="text"
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full rounded-2xl border border-primary/10 bg-white px-5 py-3 text-sm font-bold text-text-h outline-none focus:border-primary"
                            placeholder="Nombre de la raza"
                          />
                        </label>
                        <SearchableSelect
                          options={species}
                          value={editingSpeciesId}
                          onChange={(id) => setEditingSpeciesId(id)}
                          placeholder="Selecciona especie"
                          label="Especie"
                          icon={PawPrint}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(item.id)} className="flex-1 cursor-pointer rounded-2xl bg-primary px-6 py-4 font-black text-white">Guardar</button>
                        <button onClick={() => setEditingId(null)} className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-6 py-4 font-bold text-primary">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`rounded-2xl p-4 ${item.activa ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                          <Fingerprint size={24} />
                        </div>
                        <div>
                          <p className="text-xl font-black text-text-h uppercase tracking-tight">{item.nombre}</p>
                          <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">{item.especies?.nombre}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {item.activa ? (
                          <>
                            <button onClick={() => { setEditingId(item.id); setEditingName(item.nombre); setEditingSpeciesId(item.especie_id); }} className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-primary/10 bg-white px-5 py-3.5 font-black text-xs uppercase tracking-widest text-primary">
                              <PencilLine className="h-4 w-4" /> Editar
                            </button>
                            <button onClick={() => setPendingDisableBreed(item)} className="rounded-2xl border border-red-100 bg-red-50 p-3.5 text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setPendingReactivateBreed(item)} className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 font-black text-xs uppercase tracking-widest text-emerald-700">
                            <RotateCcw className="h-4 w-4" /> Reactivar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-10"
            >
              <h3 className="text-3xl font-black text-text-h italic uppercase">Nueva Raza</h3>
              <form className="mt-8 space-y-6" onSubmit={handleCreate}>
                <div className="space-y-6">
                  <SearchableSelect
                    options={species}
                    value={newBreedSpeciesId}
                    onChange={(id) => setNewBreedSpeciesId(id)}
                    placeholder="Selecciona especie"
                    label="Especie"
                    icon={PawPrint}
                    required
                  />
                  <label className="flex flex-col">
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
                      <Fingerprint className="h-4 w-4 text-primary" /> Nombre de la raza
                    </span>
                    <input
                      type="text"
                      value={newBreedName}
                      onChange={(e) => setNewBreedName(e.target.value)}
                      required
                      placeholder="Ej: Golden Retriever"
                      className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-5 py-4 text-lg font-bold outline-none focus:border-primary"
                    />
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 cursor-pointer rounded-2xl border border-primary/10 py-4 font-bold text-primary">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] cursor-pointer rounded-2xl bg-primary py-4 font-black uppercase text-white disabled:opacity-50">Crear</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {pendingDisableBreed && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingDisableBreed(null)}
              className="absolute inset-0 bg-red-950/20 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-10 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6"><Trash2 size={32} /></div>
              <h3 className="text-2xl font-black text-text-h uppercase">¿Desactivar raza?</h3>
              <p className="mt-3 text-lg font-medium">La raza <span className="font-black text-red-600">"{pendingDisableBreed.nombre}"</span> dejará de estar disponible.</p>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setPendingDisableBreed(null)} className="flex-1 cursor-pointer rounded-2xl border border-primary/10 py-4 font-bold text-primary">Volver</button>
                <button onClick={() => handleToggleStatus(pendingDisableBreed.id, false).then(() => setPendingDisableBreed(null))} className="flex-1 cursor-pointer rounded-2xl bg-red-600 py-4 font-black text-white">Desactivar</button>
              </div>
            </motion.div>
          </div>
        )}

        {pendingReactivateBreed && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingReactivateBreed(null)}
              className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl sm:p-10 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6"><RotateCcw size={32} /></div>
              <h3 className="text-2xl font-black text-text-h uppercase">¿Reactivar raza?</h3>
              <p className="mt-3 text-lg font-medium">Vas a volver a habilitar <span className="font-black text-emerald-600">"{pendingReactivateBreed.nombre}"</span>.</p>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setPendingReactivateBreed(null)} className="flex-1 cursor-pointer rounded-2xl border border-primary/10 py-4 font-bold text-primary">Cancelar</button>
                <button onClick={() => handleToggleStatus(pendingReactivateBreed.id, true).then(() => setPendingReactivateBreed(null))} className="flex-1 cursor-pointer rounded-2xl bg-emerald-600 py-4 font-black text-white">Reactivar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
