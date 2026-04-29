import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShieldCheck, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationModal = ({ isOpen, onClose }: DonationModalProps) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleCopy = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
      <AnimatePresence>
        {isOpen && (
            <>
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] cursor-pointer"
              />

              <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[110] px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden pointer-events-auto relative"
                >
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="absolute top-6 right-6 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all text-primary z-[120] hover:scale-110 active:scale-95 cursor-pointer border border-primary/10"
                      aria-label={t('donacion_modal.cerrar')}
                  >
                    <X size={24} strokeWidth={3} />
                  </button>

                  <div className="bg-primary p-10 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Heart size={120} fill="white" />
                    </div>
                    <div className="relative z-10">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-xs font-bold tracking-widest uppercase mb-4">
                    {t('donacion_modal.apoyo')}
                  </span>
                      <h3 className="text-3xl font-black italic">{t('donacion_modal.donde')}</h3>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="p-6 bg-neutral-soft rounded-3xl border border-primary/5 space-y-4 text-center">
                      <div className="space-y-1">
                        <h4 className="font-black text-text-h uppercase text-xs tracking-wider">{t('donacion_modal.a_nombre_de')}</h4>
                        <p className="text-primary font-bold text-lg">{t('donacion_modal.fundacion')}</p>
                        <p className="text-text-muted font-bold text-sm uppercase tracking-widest">{t('donacion_modal.nit')}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center group relative">
                          <h4 className="font-black text-text-h uppercase text-[10px] tracking-wider mb-1">{t('donacion_modal.bancos.bancolombia')}</h4>
                          <p className="text-xs font-bold text-text-muted mb-1">{t('donacion_modal.bancos.ahorros')}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-primary font-bold">31900001585</p>
                            <button
                                onClick={() => handleCopy('31900001585', 'bancolombia')}
                                className="p-1.5 hover:bg-primary/5 rounded-lg transition-colors text-primary/60 hover:text-primary cursor-pointer"
                                title={t('donacion_modal.bancos.copiar')}
                            >
                              {copiedAccount === 'bancolombia' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center group relative">
                          <h4 className="font-black text-text-h uppercase text-[10px] tracking-wider mb-1">{t('donacion_modal.bancos.davivienda')}</h4>
                          <p className="text-xs font-bold text-text-muted mb-1">{t('donacion_modal.bancos.ahorros')}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-primary font-bold">108900693624</p>
                            <button
                                onClick={() => handleCopy('108900693624', 'davivienda')}
                                className="p-1.5 hover:bg-primary/5 rounded-lg transition-colors text-primary/60 hover:text-primary cursor-pointer"
                                title={t('donacion_modal.bancos.copiar')}
                            >
                              {copiedAccount === 'davivienda' ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-primary/5 rounded-[24px] border border-primary/10 text-center">
                      <p className="text-sm text-primary font-bold leading-relaxed italic">
                        {t('donacion_modal.certificado')}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-center items-center gap-2 text-primary/40 font-bold text-[10px] uppercase tracking-widest">
                      <ShieldCheck size={14} />
                      {t('donacion_modal.protegida')}
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