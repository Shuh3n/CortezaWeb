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
    XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SearchableSelect from '../../components/SearchableSelect';

// ─── Types ────────────────────────────────────────────────────────────────────

type Sexo = 'macho' | 'hembra';

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
    especie_id: number | null;
    raza_id: number | null;
    especies?: { id: number; nombre: string };
    razas?: { id: number; nombre: string };
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
    especie_id: '',
    raza_id: '',
    especie: '',
    peso: '',
    caracteristicas: '',
    esterilizado: false,
    vacunado: false,
    desparasitado: false,
};

type FormState = typeof EMPTY_FORM;

// ─── Custom Components ────────────────────────────────────────────────────────

function CustomSexoSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex gap-2 p-1.5 bg-neutral-soft rounded-[24px] border border-primary/5">
            {[
                { id: 'macho', label: 'Macho', icon: '♂️' },
                { id: 'hembra', label: 'Hembra', icon: '♀️' },
            ].map((opt) => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange(opt.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                        value === opt.id
                            ? 'bg-white text-primary shadow-sm ring-1 ring-primary/10'
                            : 'text-text-muted opacity-60 hover:opacity-100'
                    }`}
                >
                    <span className="text-base">{opt.icon}</span>
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// ─── PeludoFormFields ─────────────────────────────────────────────────────────

function PeludoFormFields({
                              form,
                              onChangeText,
                              onChangeBool,
                              especies,
                              razas,
                          }: {
    form: FormState;
    onChangeText: (key: keyof FormState, value: string) => void;
    onChangeBool: (key: keyof FormState, value: boolean) => void;
    especies: { id: number; nombre: string }[];
    razas: { id: number; nombre: string }[];
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
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary font-medium"
                    />
                </label>

                <div className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main">
            <Filter className="h-4 w-4 text-primary" /> Sexo *
          </span>
                    <CustomSexoSelect 
                        value={form.sexo} 
                        onChange={(val) => onChangeText('sexo', val)} 
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <SearchableSelect
                    label="Especie"
                    icon={Stethoscope}
                    options={especies}
                    value={form.especie_id}
                    onChange={(id) => {
                        onChangeText('especie_id', String(id));
                        onChangeText('raza_id', '');
                    }}
                    placeholder="Seleccionar especie..."
                    required
                />

                <SearchableSelect
                    label="Raza"
                    icon={PawPrint}
                    options={razas}
                    value={form.raza_id}
                    onChange={(id) => onChangeText('raza_id', String(id))}
                    placeholder="Seleccionar raza..."
                    required
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary font-medium"
                    />
                </label>

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
                        className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary font-medium"
                    />
                </label>
            </div>

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
                    className="w-full rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 outline-none transition focus:border-primary resize-none font-medium"
                />
            </label>

            <div>
                <span className="mb-3 block text-xs font-black uppercase tracking-widest text-primary/50 text-center">
                    Estado de Salud (Selecciona los que apliquen)
                </span>
                <div className="grid grid-cols-3 gap-3">
                    {(
                        [
                            { key: 'esterilizado', label: 'Esterilizado', short: 'Est.', Icon: ShieldCheck },
                            { key: 'vacunado', label: 'Vacunado', short: 'Vac.', Icon: Syringe },
                            { key: 'desparasitado', label: 'Desparasitado', short: 'Des.', Icon: Bug },
                        ] as const
                    ).map(({ key, short, Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onChangeBool(key, !form[key])}
                            className={`group relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all duration-300 cursor-pointer ${
                                form[key]
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                                    : 'border-primary/5 bg-neutral-soft text-text-muted hover:border-primary/20'
                            }`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${form[key] ? 'bg-emerald-100' : 'bg-white/50 group-hover:bg-white'}`}>
                                <Icon className={`h-5 w-5 ${form[key] ? 'text-emerald-600' : 'text-primary/40'}`} />
                            </div>
                            <div className="text-center">
                                <span className="block text-[10px] font-black uppercase tracking-wider">{short}</span>
                                <span className={`text-[8px] font-bold uppercase tracking-tighter transition-opacity ${form[key] ? 'opacity-100' : 'opacity-0'}`}>
                                    Seleccionado
                                </span>
                            </div>
                            {form[key] && (
                                <motion.div 
                                    layoutId={`check-${key}`}
                                    className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md"
                                >
                                    <CheckCircle2 size={12} />
                                </motion.div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PetManagementPage() {
    const [peludos, setPeludos] = useState<Peludo[]>([]);
    const [especies, setEspecies] = useState<{ id: number; nombre: string }[]>([]);
    const [allRazas, setAllRazas] = useState<{ id: number; nombre: string; especie_id: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Auto-close feedback
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => {
                setFeedback(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const [searchText, setSearchText] = useState('');
    const [especieFilter, setEspecieFilter] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const PETS_PER_PAGE = 12;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPeludo, setEditingPeludo] = useState<Peludo | null>(null);
    const [pendingDeletePeludo, setPendingDeletePeludo] = useState<Peludo | null>(null);

    const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
    const [createFile, setCreateFile] = useState<File | null>(null);
    const [createPreview, setCreatePreview] = useState<string | null>(null);
    const createFileRef = useRef<HTMLInputElement | null>(null);

    const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const editFileRef = useRef<HTMLInputElement | null>(null);

    // ── Pagination & Options ─────────────────────────────────────────────────────

    const totalPages = Math.max(1, Math.ceil(peludos.length / PETS_PER_PAGE));
    const paginatedPeludos = useMemo(() => {
        const start = (currentPage - 1) * PETS_PER_PAGE;
        return peludos.slice(start, start + PETS_PER_PAGE);
    }, [currentPage, peludos]);

    const createRazas = useMemo(() => 
        allRazas.filter(r => r.especie_id === Number(createForm.especie_id)), 
    [allRazas, createForm.especie_id]);

    const editRazas = useMemo(() => 
        allRazas.filter(r => r.especie_id === Number(editForm.especie_id)), 
    [allRazas, editForm.especie_id]);

    // ── Fetch ────────────────────────────────────────────────────────────────────

    async function fetchData() {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (especieFilter.trim()) params.set('especie', especieFilter.trim());
            if (searchText.trim()) params.set('search', searchText.trim());

            const [peludosRes, metadataRes] = await Promise.all([
                fetch(`${FUNCTION_URL}/get-peludos?${params.toString()}`),
                fetch(`${FUNCTION_URL}/get-metadata`)
            ]);

            const peludosJson = await peludosRes.json();
            const metadataJson = await metadataRes.json();

            if (!peludosRes.ok) throw new Error(peludosJson.error ?? 'Error al cargar peludos.');
            if (!metadataRes.ok) throw new Error(metadataJson.error ?? 'Error al cargar metadatos.');
            
            setPeludos(peludosJson.data ?? []);
            setEspecies(metadataJson.data?.especies ?? []);
            setAllRazas(metadataJson.data?.razas ?? []);
            setCurrentPage(1);
        } catch (err) {
            setFeedback({ type: 'error', msg: getErrorMessage(err) });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────────

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

            const headers = await getAuthHeader();
            const formData = new FormData();
            formData.append('nombre', createForm.nombre);
            formData.append('sexo', createForm.sexo);
            formData.append('edad', createForm.edad);
            formData.append('especie_id', createForm.especie_id);
            formData.append('raza_id', createForm.raza_id);
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

            const json = (await res.json()) as { data?: Peludo; error?: string };
            if (!res.ok) throw new Error(json.error ?? 'Error al crear peludo.');

            setFeedback({ type: 'success', msg: `${createForm.nombre} fue registrado correctamente.` });
            closeCreateModal();
            await fetchData();
        } catch (err) {
            setFeedback({ type: 'error', msg: getErrorMessage(err) });
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleOpenEdit(peludo: Peludo) {
        setEditingPeludo(peludo);
        setEditForm({
            nombre: peludo.nombre,
            sexo: peludo.sexo,
            edad: String(peludo.edad),
            especie_id: String(peludo.especie_id ?? ''),
            raza_id: String(peludo.raza_id ?? ''),
            especie: peludo.especie,
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

            const headers = await getAuthHeader();
            const formData = new FormData();
            formData.append('id', String(editingPeludo.id));
            formData.append('nombre', editForm.nombre);
            formData.append('sexo', editForm.sexo);
            formData.append('edad', editForm.edad);
            formData.append('especie_id', editForm.especie_id);
            formData.append('raza_id', editForm.raza_id);
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
            await fetchData();
        } catch (err) {
            setFeedback({ type: 'error', msg: getErrorMessage(err) });
        } finally {
            setIsSubmitting(false);
        }
    }

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

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error ?? 'Error al eliminar peludo.');
            }

            setPeludos((current) => current.filter((p) => p.id !== pendingDeletePeludo.id));
            setPendingDeletePeludo(null);
            setFeedback({ type: 'success', msg: 'Peludo eliminado correctamente.' });
        } catch (err) {
            setFeedback({ type: 'error', msg: getErrorMessage(err) });
        } finally {
            setIsSubmitting(false);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────────

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="space-y-8"
        >
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

            <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,_#2d5a27_0%,_#8b4513_100%)] px-6 py-10 text-white shadow-2xl shadow-primary/20 sm:px-10">
                <motion.div
                    animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/15 blur-3xl"
                />
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Módulo de Peludos</p>
                        <h1 className="mt-3 text-4xl font-black md:text-5xl italic uppercase tracking-tighter">Gestión de Peludos</h1>
                        <p className="mt-4 max-w-2xl text-lg text-white/85 font-medium">
                            Registrá, editá y gestioná cada animal de la Fundación en un solo lugar.
                        </p>
                    </div>
                    <div className="rounded-[28px] bg-white/10 px-8 py-6 backdrop-blur-md border border-white/10 text-center min-w-[160px]">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Total Peludos</p>
                        <p className="mt-2 text-4xl font-black">{isLoading ? '...' : peludos.length}</p>
                    </div>
                </div>
            </section>

            <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex h-16 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-secondary px-8 text-lg font-black text-white transition hover:opacity-90 shadow-lg shadow-secondary/20 uppercase tracking-widest"
                >
                    <PlusCircle className="h-6 w-6" />
                    Registrar nuevo peludo
                </button>

                <form className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); fetchData(); }}>
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
                            <select
                                value={especieFilter}
                                onChange={(e) => setEspecieFilter(e.target.value)}
                                className="w-full bg-transparent text-sm font-bold text-text-h outline-none cursor-pointer appearance-none"
                            >
                                <option value="">Todas las especies</option>
                                {especies.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
                            </select>
                        </div>
                    </label>

                    <div className="flex self-end items-center gap-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-8 font-black text-[11px] uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            Filtrar
                        </button>
                        {(searchText.trim() !== '' || especieFilter !== '') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchText('');
                                    setEspecieFilter('');
                                    void fetchData();
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

            <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Resultados</p>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="mt-2 text-2xl font-black text-text-h italic uppercase tracking-tighter">Peludos Registrados</h2>
                    <p className="text-sm text-text-muted font-bold">Página {currentPage} de {totalPages}</p>
                </div>

                <div className="mt-6">
                    {isLoading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-80 animate-pulse rounded-[32px] bg-neutral-soft" />
                            ))}
                        </div>
                    ) : peludos.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 px-5 py-12 text-center text-text-muted font-bold italic">
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
                                            className="group overflow-hidden rounded-[32px] border border-primary/10 bg-white transition hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full"
                                        >
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
                                                <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                                                    peludo.sexo === 'macho'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-pink-100 text-pink-700'
                                                }`}>
                          {peludo.sexo}
                        </span>
                                            </div>

                                            <div className="space-y-3 p-5 flex-1 flex flex-col">
                                                <div>
                                                    <p className="truncate text-lg font-black text-text-h italic uppercase tracking-tight">{peludo.nombre}</p>
                                                    <p className="mt-0.5 text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 italic">
                                                        {peludo.especies?.nombre || peludo.especie}
                                                        <span className="h-1 w-1 rounded-full bg-primary/30" />
                                                        {peludo.razas?.nombre || 'Criollo'}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-[10px] text-text-muted font-black uppercase tracking-widest">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                              {peludo.edad} meses
                          </span>
                                                    {peludo.peso != null && (
                                                        <span className="flex items-center gap-1">
                              <Weight className="h-3.5 w-3.5" />
                                                            {peludo.peso}kg
                            </span>
                                                    )}
                                                </div>

                                                <div className="flex gap-1.5">
                                                    {[
                                                        { ok: peludo.esterilizado, label: 'Est.' },
                                                        { ok: peludo.vacunado, label: 'Vac.' },
                                                        { ok: peludo.desparasitado, label: 'Des.' },
                                                    ].map(({ ok, label }) => (
                                                        <span
                                                            key={label}
                                                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter ${
                                                                ok ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-text-muted/50'
                                                            }`}
                                                        >
                              {label}
                            </span>
                                                    ))}
                                                </div>

                                                <div className="flex gap-2 pt-4 mt-auto">
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

                            {totalPages > 1 && (
                                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        Anterior
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: totalPages }).map((_, i) => {
                                            const page = i + 1;
                                            return (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`h-11 w-11 cursor-pointer rounded-2xl font-bold transition ${
                                                        page === currentPage
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
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
                                        className="cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50"
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
                {isCreateModalOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCreateModal} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm" />
                        <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl sm:p-8 custom-scrollbar">
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary/60">Nuevo registro</p>
                                <h3 className="mt-2 text-2xl font-black text-text-h italic uppercase tracking-tighter">Registrar peludo</h3>
                                <form className="mt-6 space-y-6" onSubmit={handleCreateSubmit}>
                                    <PeludoFormFields
                                        form={createForm}
                                        especies={especies}
                                        razas={createRazas}
                                        onChangeText={(key, value) => setCreateForm((prev) => ({ ...prev, [key]: value }))}
                                        onChangeBool={(key, value) => setCreateForm((prev) => ({ ...prev, [key]: value }))}
                                    />
                                    <label className="block">
                                        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><ImageUp className="h-4 w-4 text-primary" /> Foto del peludo</span>
                                        <input ref={createFileRef} type="file" accept="image/*" onChange={handleCreateFileChange} className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-text-muted text-sm outline-none transition file:bg-primary file:text-white file:rounded-full file:px-4 file:py-1 file:border-0 file:mr-4 font-bold" />
                                    </label>
                                    {createPreview && <img src={createPreview} className="h-48 w-full object-cover rounded-2xl border border-primary/10 shadow-sm" alt="Preview" />}
                                    <div className="mt-8 flex justify-end gap-3 font-black">
                                        <button type="button" onClick={closeCreateModal} className="px-6 py-4 text-primary uppercase text-xs tracking-widest cursor-pointer hover:bg-neutral-100 rounded-2xl transition-all">Cancelar</button>
                                        <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-10 py-4 rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 cursor-pointer hover:opacity-90 transition-all">{isSubmitting ? 'Guardando...' : 'Registrar peludo'}</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingPeludo && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingPeludo(null)} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm" />
                        <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl sm:p-8 custom-scrollbar">
                                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary/60">Editar registro</p>
                                <h3 className="mt-2 text-2xl font-black text-text-h italic uppercase tracking-tighter">Actualizar información</h3>
                                <div className="mt-6 space-y-6">
                                    <PeludoFormFields
                                        form={editForm}
                                        especies={especies}
                                        razas={editRazas}
                                        onChangeText={(key, value) => setEditForm((prev) => ({ ...prev, [key]: value }))}
                                        onChangeBool={(key, value) => setEditForm((prev) => ({ ...prev, [key]: value }))}
                                    />
                                    <label className="block">
                                        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-text-main"><ImageUp className="h-4 w-4 text-primary" /> Reemplazar foto</span>
                                        <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditFileChange} className="w-full cursor-pointer rounded-2xl border border-primary/10 bg-neutral-soft px-4 py-3 text-text-muted text-sm outline-none transition file:bg-primary file:text-white file:rounded-full file:px-4 file:py-1 file:border-0 file:mr-4 font-bold" />
                                    </label>
                                    {editPreview && <img src={editPreview} className="h-48 w-full object-cover rounded-2xl border border-primary/10 shadow-sm" alt="Preview" />}
                                </div>
                                <div className="mt-8 flex justify-end gap-3 font-black">
                                    <button type="button" onClick={() => setEditingPeludo(null)} className="px-6 py-4 text-primary uppercase text-xs tracking-widest cursor-pointer hover:bg-neutral-100 rounded-2xl transition-all">Cancelar</button>
                                    <button type="button" onClick={() => void handleSaveEdit()} disabled={isSubmitting} className="bg-primary text-white px-10 py-4 rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 cursor-pointer hover:opacity-90 transition-all">{isSubmitting ? 'Guardando...' : 'Guardar cambios'}</button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {pendingDeletePeludo && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPendingDeletePeludo(null)} className="fixed inset-0 z-[100] bg-primary/20 backdrop-blur-sm" />
                        <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center px-4">
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="pointer-events-auto w-full max-w-xl rounded-[32px] bg-white p-10 shadow-2xl text-center">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mb-8"><Trash2 size={40} /></div>
                                <h3 className="text-3xl font-black text-text-h italic uppercase tracking-tighter">¿Eliminar peludo?</h3>
                                <p className="mt-4 text-text-muted font-bold text-lg">Esta acción es permanente. Se eliminará el registro de <span className="text-red-600 uppercase">"{pendingDeletePeludo.nombre}"</span> y todas sus fotos del sistema.</p>
                                <div className="mt-10 flex justify-center gap-4 font-black">
                                    <button type="button" onClick={() => setPendingDeletePeludo(null)} className="px-8 py-4 text-primary uppercase text-xs tracking-widest cursor-pointer hover:bg-neutral-100 rounded-2xl transition-all">No, cancelar</button>
                                    <button type="button" onClick={() => void handleConfirmDelete()} disabled={isSubmitting} className="bg-red-600 text-white px-10 py-4 rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-red-200 disabled:opacity-50 cursor-pointer hover:bg-red-700 transition-all">Sí, eliminar para siempre</button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
