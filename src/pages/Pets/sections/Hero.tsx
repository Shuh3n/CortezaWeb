import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Species } from '../types';

interface HeroProps {
    search: string;
    setSearch: (v: string) => void;
    species: Species;
    setSpecies: (v: Species) => void;
    total: number;
    loading: boolean;
}

const Hero = ({ search, setSearch, species, setSpecies, total, loading }: HeroProps) => {
    const [showFilters, setShowFilters] = useState(false);
    const { t } = useTranslation();

    const speciesFilters: { value: Species; label: string; icon: string }[] = [
        { value: 'all',   label: t('mascotas.filtros.todos'),  icon: 'icons/paw_prints.svg' },
        { value: 'dog',   label: t('mascotas.filtros.perros'), icon: 'icons/dog_icon.svg' },
        { value: 'cat',   label: t('mascotas.filtros.gatos'),  icon: 'icons/cat_icon.svg' },
        { value: 'other', label: t('mascotas.filtros.otros'),  icon: 'icons/paw_prints.svg' }
    ];

    return (
        <>
            <section className="relative pt-32 pb-20 overflow-hidden px-4">
                <div className="absolute inset-0 z-0">
                    <img src="/images/bg-counter.jpg" alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
                </div>

                <div className="relative z-10 w-[70%] mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block px-5 py-2 rounded-full bg-white/20 text-white text-xs font-bold tracking-widest uppercase mb-6">
                            {t('mascotas.hero.etiqueta')}
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                            {t('mascotas.hero.titulo_1')}<br />
                            <span className="italic">{t('mascotas.hero.titulo_2')}</span>
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
                            {t('mascotas.hero.descripcion')}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mt-10 flex gap-3 max-w-xl mx-auto"
                    >
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                placeholder={t('mascotas.hero.buscar_placeholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 rounded-2xl border-0 bg-white/95 text-text-h placeholder:text-text-muted font-medium focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                                showFilters
                                    ? 'bg-white text-primary'
                                    : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                            }`}
                        >
                            <SlidersHorizontal size={18} />
                            <span className="hidden sm:inline">{t('mascotas.hero.filtros')}</span>
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            <div className="bg-white border-b border-slate-100 sticky top-20 z-40 shadow-sm">
                <div className="w-[70%] mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                            {t('mascotas.hero.especie')}
                        </span>
                        {speciesFilters.map((f) => (
                            <motion.button
                                key={f.value}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSpecies(f.value)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                                    species === f.value
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'bg-slate-100 text-text-muted hover:bg-primary/10 hover:text-primary'
                                }`}
                            >
                                <img
                                    src={f.icon}
                                    alt={f.label}
                                    className="w-4 h-4"
                                    style={species === f.value ? { filter: 'brightness(0) invert(1)' } : undefined}
                                />
                                {f.label}
                            </motion.button>
                        ))}

                        <div className="ml-auto text-sm font-medium text-text-muted">
                            {loading ? (
                                <span className="animate-pulse">{t('mascotas.hero.cargando')}</span>
                            ) : (
                                <span>
                                    <span className="font-black text-primary">{total}</span>{' '}
                                    {total !== 1 ? t('mascotas.hero.animales') : t('mascotas.hero.animal')} {' '}
                                    {total !== 1 ? t('mascotas.hero.disponibles') : t('mascotas.hero.disponible')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;
