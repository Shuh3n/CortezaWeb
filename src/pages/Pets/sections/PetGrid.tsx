import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PetCard from './PetCard';
import type { Pet } from '../types';

const SkeletonCard = () => (
    <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 animate-pulse">
        <div className="h-60 bg-slate-100" />
        <div className="p-6 space-y-3">
            <div className="h-6 bg-slate-100 rounded-xl w-1/2" />
            <div className="h-4 bg-slate-100 rounded-xl w-1/3" />
            <div className="h-4 bg-slate-100 rounded-xl w-full" />
            <div className="h-4 bg-slate-100 rounded-xl w-4/5" />
            <div className="flex gap-3 pt-2">
                <div className="h-12 bg-slate-100 rounded-2xl flex-1" />
                <div className="h-12 bg-slate-100 rounded-2xl flex-1" />
            </div>
        </div>
    </div>
);

interface PetGridProps {
    pets: Pet[];
    loading: boolean;
    onAdopt: (pet: Pet) => void;
    onSponsor: (pet: Pet) => void;
    onClearFilters: () => void;
}

const PetGrid = ({ pets, loading, onAdopt, onSponsor, onClearFilters }: PetGridProps) => {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (pets.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
            >
                <div className="text-7xl mb-6">🐾</div>
                <h3 className="text-2xl font-black text-text-h mb-3">{t('mascotas.grid.sin_resultados_titulo')}</h3>
                <p className="text-text-muted font-medium">
                    {t('mascotas.grid.sin_resultados_desc')}
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClearFilters}
                    className="mt-6 bg-primary text-white px-8 py-3 rounded-2xl font-bold"
                >
                    {t('mascotas.grid.btn_ver_todos')}
                </motion.button>
            </motion.div>
        );
    }

    return (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
                {pets.map((pet) => (
                    <PetCard
                        key={pet.id}
                        pet={pet}
                        onAdopt={onAdopt}
                        onSponsor={onSponsor}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default PetGrid;