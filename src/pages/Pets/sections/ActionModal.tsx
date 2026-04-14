import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import type { Pet } from '../types';

interface ActionModalProps {
    pet: Pet | null;
    type: 'adopt' | 'sponsor';
    onClose: () => void;
}

const ActionModal = ({ pet, type, onClose }: ActionModalProps) => {
    const isAdopt = type === 'adopt';

    return (
        <AnimatePresence>
            {pet && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto relative"
                        >
                            {/* Close */}
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 p-2 hover:bg-slate-100 rounded-full transition-colors text-white hover:text-primary z-10"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="bg-primary p-8 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Heart size={100} fill="white" />
                                </div>
                                <div className="relative z-10">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-xs font-bold tracking-widest uppercase mb-3">
                    {isAdopt ? '¡Qué hermosa decisión!' : '¡Gracias por tu bondad!'}
                  </span>
                                    <h3 className="text-2xl font-black italic">
                                        {isAdopt ? `Adoptar a ${pet.name}` : `Apadrinar a ${pet.name}`}
                                    </h3>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-8 text-center space-y-5">
                                <p className="text-text-muted leading-relaxed">
                                    {isAdopt
                                        ? `Para iniciar el proceso de adopción de ${pet.name}, comunícate con nosotros y completa el formulario de solicitud. Queremos asegurarnos de que sea el hogar perfecto.`
                                        : `Apadrinar a ${pet.name} significa cubrir sus gastos de alimentación y atención veterinaria. Recibirás actualizaciones periódicas de su bienestar.`}
                                </p>

                                <div className="flex gap-3 pt-2">
                                    <a
                                        href="/contacto"
                                        className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold text-sm text-center hover:shadow-lg hover:shadow-primary/20 transition-all"
                                    >
                                        Contáctanos
                                    </a>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 border-2 border-slate-200 text-text-muted py-3 rounded-2xl font-bold text-sm hover:border-primary hover:text-primary transition-all"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ActionModal;