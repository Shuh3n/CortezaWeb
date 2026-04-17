import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShieldCheck, Landmark } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationModal = ({ isOpen, onClose }: DonationModalProps) => {
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
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden pointer-events-auto relative"
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors text-primary z-10"
              >
                <X size={24} />
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
                  <h3 className="text-3xl font-black italic">¿Deseas Donar?</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-10 space-y-8">
                <div className="flex items-center gap-6 p-6 bg-neutral-soft rounded-3xl border border-primary/5">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Landmark className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-text-h uppercase text-xs tracking-wider mb-1">Fundación Corteza Terrestre</h4>
                    <p className="text-primary font-bold text-sm mb-2">NIT. 900.563.303-3</p>
                    <h4 className="font-black text-text-h uppercase text-xs tracking-wider mb-1">Cuenta de Ahorros Bancolombia</h4>
                    <p className="text-xl font-bold text-primary"># 06871131154</p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-xl group-hover:bg-primary/20 transition-all" />
                    <img 
                      src="/images/QR-BANCOLOMBIA.jpg" 
                      alt="QR Bancolombia" 
                      className="relative w-48 h-48 mx-auto rounded-2xl border-2 border-primary/10 bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DonacionCortezaTerrestre';
                      }}
                    />
                  </div>
                  <p className="text-sm text-text-muted font-medium px-8 leading-relaxed">
                    Escanea este código desde tu App Bancolombia para realizar tu aporte directamente a la fundación.
                  </p>
                </div>

                <div className="pt-4 flex justify-center items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
                  <ShieldCheck size={16} />
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
