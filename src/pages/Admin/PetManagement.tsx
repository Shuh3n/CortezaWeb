import { useEffect, useRef, useState, useMemo, type ChangeEvent, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    PlusCircle,
    Search,
    Trash2,
    PencilLine,
    CheckCircle2,
    AlertCircle,
    Filter,
    PawPrint,
    Weight,
    CalendarDays,
    FileText,
    ImageUp,
    Stethoscope,
    ShieldCheck,
    Syringe,
    Bug,
    X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type Sexo = 'macho' | 'hembra';
type Especie = 'perro' | 'gato' | 'otra';

export interface PeludoImagen {
    id: number;
    url: string;
}

export interface Peludo {
    id: number;
    nombre: string;
    sexo: Sexo;
    edad: number;
    caracteristicas: string;
    esterilizado: boolean;
    vacunado: boolean;
    desparasitado: boolean;
    especie: string;
    peso: number | null;
    imagenes?: PeludoImagen[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'error' in error) {
        return String((error as Record<string, unknown>).error);
    }
    return 'No se pudo completar la operación.';
}

function normalizeEspecie(value: string): Especie {
    const normalized = value.trim().toLowerCase();
    if (normalized.includes('perr') || normalized.includes('dog')) return 'perro';
    if (normalized.includes('gat') || normalized.includes('cat')) return 'gato';
    return 'otra';
}

function getEspeciePersonalizada(value: string): string {
    return normalizeEspecie(value) === 'otra' ? value.trim() : '';
}

function resolveEspecie(form: FormState): string {
    return form.especie === 'otra' ? form.especiePersonalizada.trim() : form.especie;
}

/** Obtiene el JWT de la sesión activa para enviarlo a las Edge Functions */
async function getAuthHeader(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('No autorizado. Iniciá sesión nuevamente.');
    return { Authorization: `Bearer ${token}` };
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const EMPTY_FORM = {
    nombre: '',
    sexo: 'macho' as Sexo,
    edad: '',
    especie: 'perro' as Especie,
    especiePersonalizada: '',
    peso: '',
    caracteristicas: '',
    esterilizado: false,
    vacunado: false,
    desparasitado: false,
};

type FormState = typeof EMPTY_FORM;

// ─── PeludoFormFields — definido FUERA del componente principal para que React
//     no lo destruya y recree en cada render (lo que causaría pérdida de foco). ──

function PeludoFormFields({
                              form,
                              onChangeText,
                              onChangeBool,
                          }: {
    form: FormState;
    onChangeText: (key: keyof FormState, value: string) => void;
    onChangeBool: (key: keyof FormState, value: boolean) => void;
}) {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
            <PawPrint className="h-4 w-4 text-primary" /> Nombre *
          </span>
                    <input
                        type="text"
                        required
                        value={form.nombre}
                        onChange={(e) => onChangeText('nombre', e.target.value)}
                        placeholder="Ej: Luna"
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                    />
                </label>

                <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
            <Filter className="h-4 w-4 text-primary" /> Sexo *
          </span>
                    <select
                        required
                        value={form.sexo}
                        onChange={(e) => onChangeText('sexo', e.target.value)}
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                    >
                        <option value="macho">Macho</option>
                        <option value="hembra">Hembra</option>
                    </select>
                </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
            <Stethoscope className="h-4 w-4 text-primary" /> Especie *
          </span>
                    <select
                        required
                        value={form.especie}
                        onChange={(e) => onChangeText('especie', e.target.value)}
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                    >
                        <option value="perro">Perro</option>
                        <option value="gato">Gato</option>
                        <option value="otra">Otra</option>
                    </select>
                </label>

                {form.especie === 'otra' && (
                    <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
            <Stethoscope className="h-4 w-4 text-primary" /> ¿Cuál especie? *
          </span>
                        <input
                            type="text"
                            required
                            value={form.especiePersonalizada}
                            onChange={(e) => onChangeText('especiePersonalizada', e.target.value)}
                            placeholder="Ej: Conejo"
                            className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                        />
                    </label>
                )}

                <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
            <CalendarDays className="h-4 w-4 text-primary" /> Edad (meses) *
          </span>
                    <input
                        type="number"
                        required
                        min={1}
                        step={1}
                        value={form.edad}
                        onChange={(e) => onChangeText('edad', e.target.value)}
                        placeholder="Ej: 18"
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                    />
                </label>
            </div>

            <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
          <Weight className="h-4 w-4 text-primary" /> Peso (kg)
        </span>
                <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.peso}
                    onChange={(e) => onChangeText('peso', e.target.value)}
                    placeholder="Ej: 4.5"
                    className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary"
                />
            </label>

            <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
          <FileText className="h-4 w-4 text-primary" /> Características *
        </span>
                <textarea
                    required
                    rows={3}
                    value={form.caracteristicas}
                    onChange={(e) => onChangeText('caracteristicas', e.target.value)}
                    placeholder="Comportamiento, historial médico, necesidades especiales..."
                    className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary resize-none"
                />
            </label>

            {/* Boolean toggles */}
            <div className="grid grid-cols-3 gap-3">
                {(
                    [
                        { key: 'esterilizado', label: 'Esterilizado', Icon: ShieldCheck },
                        { key: 'vacunado', label: 'Vacunado', Icon: Syringe },
                        { key: 'desparasitado', label: 'Desparasitado', Icon: Bug },
                    ] as const
                ).map(({ key, label, Icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onChangeBool(key, !form[key])}
                        className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-wider transition ${
                            form[key]
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-primary/10 bg-neutral-soft text-text-muted'
                        }`}
                    >
                        <Icon className="h-5 w-5" />
                        {label}
                        <span className={`text-[10px] font-black ${form[key] ? 'text-emerald-600' : 'text-text-muted/50'}`}>
              {form[key] ? 'Sí' : 'No'}
            </span>
                    </button>
                ))}
            </div>
        </>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PetManagementPage() {
    const [peludos, setPeludos] = useState<Peludo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [especieFilter, setEspecieFilter] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const PETS_PER_PAGE = 12;

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPeludo, setEditingPeludo] = useState<Peludo | null>(null);
    const [pendingDeletePeludo, setPendingDeletePeludo] = useState<Peludo | null>(null);

    // Create form
    const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
    const [createFile, setCreateFile] = useState<File | null>(null);
    const [createPreview, setCreatePreview] = useState<string | null>(null);
    const createFileRef = useRef<HTMLInputElement | null>(null);

    // Edit form
    const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const editFileRef = useRef<HTMLInputElement | null>(null);

    // ── Fetch ────────────────────────────────────────────────────────────────────

    async function fetchPeludos() {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (especieFilter.trim()) params.set('especie', especieFilter.trim());
            if (searchText.trim()) params.set('search', searchText.trim());

            const res = await fetch(`${FUNCTION_URL}/get-peludos?${params.toString()}`);
            const json = (await res.json()) as { data?: Peludo[]; error?: string };

            if (!res.ok) throw new Error(json.error ?? 'Error al cargar peludos.');
            setPeludos(json.data ?? []);
            setCurrentPage(1);
        } catch (err) {
            setFeedback({ type: 'error', msg: getErrorMessage(err) });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void fetchPeludos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Pagination ────────────────────────────────────────────────────────────────

    const totalPages = Math.max(1, Math.ceil(peludos.length / PETS_PER_PAGE));
    const paginatedPeludos = useMemo(() => {
        const start = (currentPage - 1) * PETS_PER_PAGE;
        return peludos.slice(start, start + PETS_PER_PAGE);
    }, [currentPage, peludos]);

    // ── Create ────────────────────────────────────────────────────────────────────

    function handleCreateFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setCreateFile(file);
        if (createPreview) URL.revokeObjectURL(createPreview);
        setCreatePreview(file ? URL.createObjectURL(file) : null);
    }

    function closeCreateModal() {
        setIsCreateModalOpen(false);
        setCreateForm(EMPTY_FORM);
        setCreateFile(null);
        if (createPreview) { URL.revokeObjectURL(createPreview); setCreatePreview(null); }
        if (createFileRef.current) createFileRef.current.value = '';
    }

    async function handleCreateSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            setFeedback(null);

            const especie = resolveEspecie(createForm);
            if (!especie) {
                setFeedback({ type: 'error', msg: 'Debe indicar la especie del peludo.' });
                return;
            }

            const headers = await getAuthHeader();
            const formData = new FormData();
            formData.append('nombre', createForm.nombre);
            formData.append('sexo', createForm.sexo);
            formData.append('edad', createForm.edad);
            formData.append('especie', especie);
            formData.append('caracteristicas', createForm.caracteristicas);
            formData.append('esterilizado', String(createForm.esterilizado));
            formData.append('vacunado', String(createForm.vacunado));
            formData.append('desparasitado', String(createForm.desparasitado));
            if (createForm.peso) formData.append('peso', createForm.peso);
            if (createFile) formData.append('foto', createFile);

            const res = await fetch(`${FUNCTION_URL}/manage-peludos`, {
                method: 'POST',
                headers,
                body: formData,
            });

            const json = (await res.json()) as { data?: Peludo; error?: string; warning?: string };
            if (!res.ok && res.status !== 207) throw new Error(json.error ?? 'Error al crear peludo.');

            const msg = json.warning
                ? `${createForm.nombre} creado. Advertencia: ${json.warning}`
                : `${createForm.nombre} fue registrado correctamente.`;

            setFeedback({ type: json.warning ? 'error' : 'success', msg });
            closeCreateModal();
            await fetchPeludos();
        } catch (err) {
            setFeedback({ type: 'error', msg: getErrorMessage(err) });
        } finally {
            setIsSubmitting(false);
        }
    }

    // ── Edit ──────────────────────────────────────────────────────────────────────

    function handleOpenEdit(peludo: Peludo) {
        setEditingPeludo(peludo);
        setEditForm({
            nombre: peludo.nombre,
            sexo: peludo.sexo,
            edad: String(peludo.edad),
            especie: normalizeEspecie(peludo.especie),
            especiePersonalizada: getEspeciePersonalizada(peludo.especie),
            peso: peludo.peso != null ? String(peludo.peso) : '',
            caracteristicas: peludo.caracteristicas,
            esterilizado: peludo.esterilizado,
            vacunado: peludo.vacunado,
            desparasitado: peludo.desparasitado,
        });
        setEditFile(null);
        setEditPreview(peludo.imagenes?.[0]?.url ?? null);
        setFeedback(null);
    }

    function handleEditFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setEditFile(file);
        if (file) setEditPreview(URL.createObjectURL(file));
    }

    async function handleSaveEdit() {
        if (!editingPeludo) return;
        try {
            setIsSubmitting(true);
            setFeedback(null);

            const especie = resolveEspecie(editForm);
            if (!especie) {
                setFeedback({ type: 'error', msg: 'Debe indicar la especie del peludo.' });
                return;
            }

            const headers = await getAuthHeader();
            const formData = new FormData();
            formData.append('id', String(editingPeludo.id));
            formData.append('nombre', editForm.nombre);
            formData.append('sexo', editForm.sexo);
            formData.append('edad', editForm.edad);
            formData.append('especie', especie);
            formData.append('caracteristicas', editForm.caracteristicas);
            formData.append('esterilizado', String(editForm.esterilizado));
            formData.append('vacunado', String(editForm.vacunado));
            formData.append('desparasitado', String(editForm.desparasitado));
            formData.append('peso', editForm.peso);
            if (editFile) formData.append('foto', editFile);

            const res = await fetch(`${FUNCTION_URL}/manage-peludos`, {
                method: 'PATCH',
                headers,
                body: formData,
            });

            const json = (await res.json()) as { data?: Peludo; error?: string };
            if (!res.ok) throw new Error(json.error ?? 'Error al actualizar peludo.');

            setFeedback({ type: 'success', msg: 'Animal actualizado correctamente.' });
            setEditingPeludo(null);
            await fetchPeludos();
        } catch (err) {
            setFeedback({ type: 'error', msg: getErrorMessage(err) });
        } finally {
            setIsSubmitting(false);
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────────────

    async function handleConfirmDelete() {
        if (!pendingDeletePeludo) return;
        try {
            setIsSubmitting(true);
            setFeedback(null);

            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTION_URL}/manage-peludos?id=${pendingDeletePeludo.id}`, {
                method: 'DELETE',
                headers,
            });

            const json = (await res.json()) as { data?: unknown; error?: string };
            if (!res.ok) throw new Error(json.error ?? 'Error al eliminar peludo.');

            setPeludos((current) => current.filter((p) => p.id !== pendingDeletePeludo.id));
            setPendingDeletePeludo(null);
            setFeedback({ type: 'success', msg: 'Peludo eliminado correctamente.' });
        } catch (err) {
            setFeedback({ type: 'error', msg: getErrorMessage(err) });
        } finally {
            setIsSubmitting(false);
        }
    }

    // ── Filter submit ─────────────────────────────────────────────────────────────

    async function handleSubmitFilters(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await fetchPeludos();
    }

    // ── Render ────────────────────────────────────────────────────────────────────

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="space-y-8"
        >
            {/* Floating notifications */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`fixed top-6 right-6 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
                            feedback.type === 'success'
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
                        <button onClick={() => setFeedback(null)} className="ml-4 opacity-40 hover:opacity-100 transition-opacity">
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero banner */}
            <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,_#2d5a27_0%,_#8b4513_100%)] px-6 py-10 text-white shadow-2xl shadow-primary/20 sm:px-10">
                <motion.div
                    animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl"
                />
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Módulo de Peludos</p>
                        <h1 className="mt-3 text-4xl font-black md:text-5xl">Gestión de Peludos</h1>
                        <p className="mt-4 max-w-2xl text-lg text-white/85">
                            Registrá, editá y gestioná cada animal de la Fundación en un solo lugar.
                        </p>
                    </div>
                    <div className="rounded-[28px] bg-white/10 px-8 py-6 backdrop-blur-md border border-white/10 text-center min-w-[160px]">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Total Peludos</p>
                        <p className="mt-2 text-4xl font-black">{isLoading ? '...' : peludos.length}</p>
                    </div>
                </div>
            </section>

            {/* Controls */}
            <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-secondary px-8 text-lg font-black text-white transition hover:opacity-90 shadow-lg shadow-secondary/20"
                >
                    <PlusCircle className="h-6 w-6" />
                    Registrar nuevo peludo
                </button>

                <form className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmitFilters}>
                    <label className="block">
                        <span className="mb-2 block text-xs font-black uppercase tracking-widest text-primary/50">Buscar</span>
                        <div className="flex h-12 items-center gap-3 rounded-2xl border border-primary/10 bg-neutral-soft/50 px-4 focus-within:border-primary focus-within:bg-white transition-all">
                            <Search className="h-5 w-5 text-primary/30" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="Nombre o características..."
                                className="w-full bg-transparent text-sm font-bold text-text-h outline-none placeholder:text-text-muted/30"
                            />
                        </div>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-xs font-black uppercase tracking-widest text-primary/50">Especie</span>
                        <div className="flex h-12 items-center gap-3 rounded-2xl border border-primary/10 bg-neutral-soft/50 px-4 focus-within:border-primary focus-within:bg-white transition-all">
                            <Stethoscope className="h-5 w-5 text-primary/30" />
                            <input
                                type="text"
                                value={especieFilter}
                                onChange={(e) => setEspecieFilter(e.target.value)}
                                placeholder="Ej: perro, gato..."
                                className="w-full bg-transparent text-sm font-bold text-text-h outline-none placeholder:text-text-muted/30"
                            />
                        </div>
                    </label>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex h-12 self-end items-center justify-center rounded-2xl bg-primary px-8 font-black text-[11px] uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        Filtrar
                    </button>
                </form>
            </section>

            {/* Grid */}
            <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Resultados</p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="mt-2 text-2xl font-black text-text-h">Peludos Registrados</h2>
                    <p className="text-sm text-text-muted">Página {currentPage} de {totalPages}</p>
                </div>

                <div className="mt-6">
                    {isLoading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-80 animate-pulse rounded-[32px] bg-neutral-soft" />
                            ))}
                        </div>
                    ) : peludos.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-12 text-center text-text-muted">
                            No hay peludos para los filtros seleccionados.
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {paginatedPeludos.map((peludo) => {
                                    const foto = peludo.imagenes?.[0]?.url ?? null;
                                    return (
                                        <motion.div
                                            key={peludo.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="group overflow-hidden rounded-[32px] border border-primary/10 bg-white transition hover:shadow-xl hover:shadow-primary/5"
                                        >
                                            {/* Photo */}
                                            <div className="relative aspect-square overflow-hidden bg-neutral-100">
                                                {foto ? (
                                                    <img
                                                        src={foto}
                                                        alt={peludo.nombre}
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-primary/5">
                                                        <PawPrint className="h-12 w-12 text-primary/20" />
                                                    </div>
                                                )}
                                                {/* Sexo badge */}
                                                <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                                                    peludo.sexo === 'macho'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-pink-100 text-pink-700'
                                                }`}>
                          {peludo.sexo}
                        </span>
                                            </div>

                                            {/* Info */}
                                            <div className="space-y-3 p-5">
                                                <div>
                                                    <p className="truncate text-lg font-black text-text-h">{peludo.nombre}</p>
                                                    <p className="mt-0.5 text-sm font-semibold text-primary/60 uppercase tracking-wider">
                                                        {peludo.especie}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-xs text-text-muted font-semibold">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                              {peludo.edad}m
                          </span>
                                                    {peludo.peso != null && (
                                                        <span className="flex items-center gap-1">
                              <Weight className="h-3.5 w-3.5" />
                                                            {peludo.peso}kg
                            </span>
                                                    )}
                                                </div>

                                                {/* Health indicators */}
                                                <div className="flex gap-1.5">
                                                    {[
                                                        { ok: peludo.esterilizado, label: 'Est.' },
                                                        { ok: peludo.vacunado, label: 'Vac.' },
                                                        { ok: peludo.desparasitado, label: 'Des.' },
                                                    ].map(({ ok, label }) => (
                                                        <span
                                                            key={label}
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                                                                ok ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-text-muted/50'
                                                            }`}
                                                        >
                              {label}
                            </span>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(peludo)}
                                                        className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/10 bg-white py-2.5 text-sm font-bold text-primary transition hover:bg-primary/5"
                                                    >
                                                        <PencilLine className="h-4 w-4" />
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPendingDeletePeludo(peludo)}
                                                        className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }).map((_, i) => {
                                            const page = i + 1;
                                            if (totalPages > 7 && page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 2) {
                                                if (Math.abs(page - currentPage) === 3) return <span key={page} className="px-1 text-primary/40">...</span>;
                                                return null;
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
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

            {/* ── CREATE MODAL ─────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeCreateModal}
                            className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm"
                        />
                        <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                                className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl sm:p-8"
                            >
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">Nuevo registro</p>
                                <h3 className="mt-2 text-2xl font-black text-text-h">Registrar peludo</h3>

                                <form className="mt-6 space-y-4" onSubmit={handleCreateSubmit}>
                                    <PeludoFormFields
                                        form={createForm}
                                        onChangeText={(key, value) => setCreateForm((prev) => ({ ...prev, [key]: value }))}
                                        onChangeBool={(key, value) => setCreateForm((prev) => ({ ...prev, [key]: value }))}
                                    />

                                    <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
                      <ImageUp className="h-4 w-4 text-primary" /> Foto del peludo
                    </span>
                                        <input
                                            ref={createFileRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCreateFileChange}
                                            className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-text-muted outline-none transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white hover:file:opacity-90"
                                        />
                                    </label>

                                    {createPreview && (
                                        <div className="overflow-hidden rounded-2xl border border-primary/10">
                                            <img src={createPreview} alt="Vista previa" className="h-48 w-full object-cover" />
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap justify-end gap-3">
                                        <button type="button" onClick={closeCreateModal} className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary">
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {isSubmitting ? 'Guardando...' : 'Registrar peludo'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* ── EDIT MODAL ───────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {editingPeludo && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setEditingPeludo(null)}
                            className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm"
                        />
                        <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                                className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl sm:p-8"
                            >
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/60">Editar peludo</p>
                                <h3 className="mt-2 text-2xl font-black text-text-h">Actualizar información</h3>

                                <div className="mt-6 space-y-4">
                                    <PeludoFormFields
                                        form={editForm}
                                        onChangeText={(key, value) => setEditForm((prev) => ({ ...prev, [key]: value }))}
                                        onChangeBool={(key, value) => setEditForm((prev) => ({ ...prev, [key]: value }))}
                                    />

                                    <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
                      <ImageUp className="h-4 w-4 text-primary" /> Reemplazar foto
                    </span>
                                        <input
                                            ref={editFileRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditFileChange}
                                            className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-text-muted outline-none transition file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white hover:file:opacity-90"
                                        />
                                    </label>

                                    {editPreview && (
                                        <div className="overflow-hidden rounded-2xl border border-primary/10">
                                            <img src={editPreview} alt="Vista previa" className="h-48 w-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex flex-wrap justify-end gap-3">
                                    <button type="button" onClick={() => setEditingPeludo(null)} className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => void handleSaveEdit()}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* ── DELETE CONFIRM MODAL ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {pendingDeletePeludo && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setPendingDeletePeludo(null)}
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
                                <h3 className="mt-2 text-2xl font-black text-text-h">¿Estás seguro de eliminar este peludo?</h3>
                                <p className="mt-3 text-text-muted">
                                    Esta acción elimina el registro y sus imágenes del Storage permanentemente.
                                </p>

                                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-red-800">Peludo seleccionado</p>
                                    <p className="mt-1 text-lg font-black text-red-700">{pendingDeletePeludo.nombre}</p>
                                    <p className="text-sm text-red-600">{pendingDeletePeludo.especie} · {pendingDeletePeludo.sexo}</p>
                                </div>

                                <div className="mt-6 flex flex-wrap justify-end gap-3">
                                    <button type="button" onClick={() => setPendingDeletePeludo(null)} className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => void handleConfirmDelete()}
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Sí, eliminar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
