import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShieldCheck, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationModal = ({ isOpen, onClose }: DonationModalProps) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] cursor-pointer"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[110] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden pointer-events-auto relative"
            >
              {/* Close Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="absolute top-6 right-6 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all text-primary z-[120] hover:scale-110 active:scale-95 cursor-pointer border border-primary/10"
                aria-label="Cerrar modal"
              >
                <X size={24} strokeWidth={3} />
              </button>

              {/* Header */}
              <div className="bg-primary p-10 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Heart size={120} fill="white" />
                </div>
                <div className="relative z-10">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-xs font-bold tracking-widest uppercase mb-4">
                    Tu apoyo salva vidas
                  </span>
                  <h3 className="text-3xl font-black italic">¿DÓNDE DONAR?</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                <div className="p-6 bg-neutral-soft rounded-3xl border border-primary/5 space-y-4 text-center">
                  <div className="space-y-1">
                    <h4 className="font-black text-text-h uppercase text-xs tracking-wider">A nombre de:</h4>
                    <p className="text-primary font-bold text-lg">Fundación Corteza Terrestre</p>
                    <p className="text-text-muted font-bold text-sm uppercase tracking-widest">NIT: 900.126.931</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center group relative">
                      <h4 className="font-black text-text-h uppercase text-[10px] tracking-wider mb-1">Bancolombia</h4>
                      <p className="text-xs font-bold text-text-muted mb-1">Ahorros</p>
                      <div className="flex items-center gap-2">
                        <p className="text-primary font-bold">31900001585</p>
                        <button 
                          onClick={() => handleCopy('31900001585', 'bancolombia')}
                          className="p-1.5 hover:bg-primary/5 rounded-lg transition-colors text-primary/60 hover:text-primary"
                          title="Copiar cuenta"
                        >
                          {copiedAccount === 'bancolombia' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center group relative">
                      <h4 className="font-black text-text-h uppercase text-[10px] tracking-wider mb-1">Davivienda</h4>
                      <p className="text-xs font-bold text-text-muted mb-1">Ahorros</p>
                      <div className="flex items-center gap-2">
                        <p className="text-primary font-bold">108900693624</p>
                        <button 
                          onClick={() => handleCopy('108900693624', 'davivienda')}
                          className="p-1.5 hover:bg-primary/5 rounded-lg transition-colors text-primary/60 hover:text-primary"
                          title="Copiar cuenta"
                        >
                          {copiedAccount === 'davivienda' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-[24px] border border-primary/10 text-center">
                  <p className="text-sm text-primary font-bold leading-relaxed italic">
                    "Solicita tu certificado de donación y obten beneficios tributarios del 25%."
                  </p>
                </div>

                <div className="pt-2 flex justify-center items-center gap-2 text-primary/40 font-bold text-[10px] uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  Transacción protegida y segura
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DonationModal;