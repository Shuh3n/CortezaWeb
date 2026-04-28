import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Syringe, Bug, Weight, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Pet } from '../types';

// ─── Sound Button ──────────────────────────────────────────────────────────────

const SoundButton = ({ soundUrl }: { soundUrl: string | null }) => {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { t } = useTranslation();

    useEffect(() => () => { audioRef.current?.pause(); }, []);

    const toggle = () => {
        if (!soundUrl) return;
        if (!audioRef.current) {
            audioRef.current = new Audio(soundUrl);
            audioRef.current.onended = () => setPlaying(false);
        }
        if (playing) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setPlaying(false);
        } else {
            audioRef.current.play();
            setPlaying(true);
        }
    };

    return (
        <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!soundUrl}
            title={soundUrl ? (playing ? t('mascotas.tarjeta.sonido_detener') : t('mascotas.tarjeta.sonido_escuchar')) : t('mascotas.tarjeta.sonido_no_disponible')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md
                ${soundUrl
                ? 'bg-white hover:bg-primary hover:text-white text-primary cursor-pointer'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'
            }`}
        >
            <img src="/icons/sound_button.svg" alt={playing ? 'Detener' : 'Escuchar sonido'} className="w-5 h-5" />
        </motion.button>
    );
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const speciesIcon: Record<Pet['species'], string> = {
    dog:   '/icons/dog_icon.svg',
    cat:   '/icons/cat_icon.svg',
    other: '/icons/paw_prints.svg',
};

const sizeLabel: Record<Pet['size'], string> = {
    small:  'Pequeño',
    medium: 'Mediano',
    large:  'Grande',
};

const genderLabel: Record<Pet['gender'], string> = {
    male:   '♂ Macho',
    female: '♀ Hembra',
};

function formatAge(years: number, months: number): string {
    if (years > 0 && months > 0)
        return `${years} año${years > 1 ? 's' : ''} y ${months} mes${months > 1 ? 'es' : ''}`;
    if (years > 0)
        return `${years} año${years > 1 ? 's' : ''}`;
    return `${months} mes${months > 1 ? 'es' : ''}`;
}

// ─── Health Badge ──────────────────────────────────────────────────────────────

interface HealthBadgeProps {
    ok: boolean;
    label: string;
    icon: React.ReactNode;
}

const HealthBadge = ({ ok, label, icon }: HealthBadgeProps) => (
    <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            ok
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-slate-50 text-slate-400 border border-slate-100'
        }`}
    >
        {icon}
        <span>{label}</span>
        {ok
            ? <CheckCircle2 size={11} className="ml-0.5" />
            : <XCircle size={11} className="ml-0.5 opacity-40" />
        }
    </div>
);

// ─── Pet Card ──────────────────────────────────────────────────────────────────

interface PetCardProps {
    pet: Pet;
    onAdopt: (pet: Pet) => void;
    onSponsor: (pet: Pet) => void;
}

const PetCard = ({ pet, onAdopt, onSponsor }: PetCardProps) => {
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group flex flex-col"
        >
            {/* ── Image ── */}
            <div className="relative overflow-hidden h-60 bg-primary/5">
                {!imgError && pet.image_url ? (
                    <img
                        src={pet.image_url}
                        alt={pet.name}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <img src={speciesIcon[pet.species]} alt={pet.species} className="w-20 h-20 opacity-20" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                    {pet.is_urgent && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            ⚡ Urgente
                        </span>
                    )}
                    <span className="bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded-full shadow">
                        {genderLabel[pet.gender]}
                    </span>
                </div>

                {/* Sound button */}
                <div className="absolute top-4 right-4">
                    <SoundButton soundUrl={pet.sound_url} />
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* ── Content ── */}
            <div className="p-6 flex flex-col flex-1 gap-4">

                {/* Name + species icon */}
                <div>
                    <div className="flex items-start justify-between mb-1">
                        <h3 className="text-2xl font-black text-text-h">{pet.name}</h3>
                        <img src={speciesIcon[pet.species]} alt={pet.species} className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-primary italic">
                        <span>{pet.species_name}</span>
                        <span className="w-1 h-1 rounded-full bg-primary/30" />
                        <span>{pet.breed}</span>
                    </div>
                </div>

                {/* Quick stats chips */}
                <div className="flex gap-2 flex-wrap">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                        {formatAge(pet.age_years, pet.age_months)}
                    </span>
                    <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full">
                        {sizeLabel[pet.size]}
                    </span>
                    {pet.peso_kg != null && (
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Weight size={11} />
                            {pet.peso_kg} kg
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-text-muted text-sm leading-relaxed font-medium line-clamp-3">
                    {pet.description}
                </p>

                {/* Health indicators */}
                <div>
                    <p className="text-xs font-black text-text-muted uppercase tracking-wider mb-2">
                        Estado de salud
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <HealthBadge
                            ok={pet.esterilizado}
                            label="Esterilizado"
                            icon={<ShieldCheck size={12} />}
                        />
                        <HealthBadge
                            ok={pet.vacunado}
                            label="Vacunado"
                            icon={<Syringe size={12} />}
                        />
                        <HealthBadge
                            ok={pet.desparasitado}
                            label="Desparasitado"
                            icon={<Bug size={12} />}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-auto pt-2">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onAdopt(pet)}
                        className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                    >
                        Adoptar
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onSponsor(pet)}
                        className="flex-1 bg-white text-primary border-2 border-primary py-3 rounded-2xl font-bold text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <Heart size={14} />
                        Apadrinar
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default PetCard;