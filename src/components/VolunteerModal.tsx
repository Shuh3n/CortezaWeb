import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, MessageSquare, Send, ShieldCheck, Heart, Phone, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VolunteerFormData {
  nombre: string;
  correo: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}

const VolunteerModal = ({ isOpen, onClose }: VolunteerModalProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<VolunteerFormData>();

  const onSubmit = async (data: VolunteerFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/volunteer-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to send');

      setSubmitted(true);
      reset();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError(t('voluntariado.requisitos.formulario.error') || 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const areas = t('voluntariado.areas.lista', { returnObjects: true }) as any[];

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
              className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden pointer-events-auto relative max-h-[95vh] overflow-y-auto"
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all text-primary z-[120] hover:scale-110 active:scale-95 cursor-pointer border border-primary/10"
              >
                <X size={24} strokeWidth={3} />
              </button>

              <div className="bg-primary p-10 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Heart size={120} fill="white" />
                </div>
                <div className="relative z-10">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-xs font-bold tracking-widest uppercase mb-4">
                    {t('voluntariado.requisitos.formulario.etiqueta')}
                  </span>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                    {t('voluntariado.requisitos.formulario.titulo')}
                  </h3>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {!submitted ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                      <input
                        {...register('nombre', { required: true })}
                        placeholder={t('voluntariado.requisitos.formulario.placeholder_nombre')}
                        className="w-full pl-12 pr-4 py-4 bg-neutral-soft rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                      {errors.nombre && <span className="text-red-500 text-xs ml-4">{t('voluntariado.requisitos.formulario.error_requerido')}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                        <input
                          {...register('correo', { required: true, pattern: /^\S+@\S+$/i })}
                          type="email"
                          placeholder={t('voluntariado.requisitos.formulario.placeholder_correo')}
                          className="w-full pl-12 pr-4 py-4 bg-neutral-soft rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                        {errors.correo && <span className="text-red-500 text-xs ml-4">{t('voluntariado.requisitos.formulario.error_correo')}</span>}
                      </div>

                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                        <input
                          {...register('telefono', { required: true })}
                          type="tel"
                          placeholder={t('voluntariado.requisitos.formulario.placeholder_telefono') || 'Celular / WhatsApp'}
                          className="w-full pl-12 pr-4 py-4 bg-neutral-soft rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                        {errors.telefono && <span className="text-red-500 text-xs ml-4">{t('voluntariado.requisitos.formulario.error_requerido')}</span>}
                      </div>
                    </div>

                    <div className="relative">
                      <Controller
                        name="asunto"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsSelectOpen(!isSelectOpen)}
                              className="w-full flex items-center justify-between pl-12 pr-6 py-4 bg-neutral-soft rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-left cursor-pointer"
                            >
                              <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                              <span className={field.value ? 'text-text-h' : 'text-text-muted/60'}>
                                {field.value || t('voluntariado.requisitos.formulario.placeholder_area')}
                              </span>
                              <ChevronDown className={`transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`} size={20} />
                            </button>

                            <AnimatePresence>
                              {isSelectOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-primary/5 overflow-hidden z-50 py-2"
                                >
                                  {areas.map((area: any) => (
                                    <button
                                      key={area.title}
                                      type="button"
                                      onClick={() => {
                                        field.onChange(area.title);
                                        setIsSelectOpen(false);
                                      }}
                                      className="w-full px-6 py-3 text-left hover:bg-primary/5 transition-colors font-medium text-text-h cursor-pointer flex items-center gap-3"
                                    >
                                      <div className={`w-2 h-2 rounded-full ${field.value === area.title ? 'bg-primary' : 'bg-transparent'}`} />
                                      {area.title}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      />
                      {errors.asunto && <span className="text-red-500 text-xs ml-4">{t('voluntariado.requisitos.formulario.error_requerido')}</span>}
                    </div>

                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 text-primary/40" size={20} />
                      <textarea
                        {...register('mensaje', { required: true })}
                        placeholder={t('voluntariado.requisitos.formulario.placeholder_mensaje')}
                        rows={4}
                        className="w-full pl-12 pr-4 py-4 bg-neutral-soft rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                      />
                      {errors.mensaje && <span className="text-red-500 text-xs ml-4">{t('voluntariado.requisitos.formulario.error_requerido')}</span>}
                    </div>

                    {error && <div className="text-red-500 text-sm text-center font-bold">{error}</div>}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-4 rounded-3xl font-black uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={20} />
                          {t('voluntariado.requisitos.formulario.boton_enviar')}
                        </>
                      )}
                    </motion.button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Send size={40} />
                    </div>
                    <h4 className="text-2xl font-black text-text-h uppercase tracking-tighter">
                      {t('voluntariado.requisitos.formulario.exito_titulo')}
                    </h4>
                    <p className="text-text-muted font-medium">
                      {t('voluntariado.requisitos.formulario.exito_desc')}
                    </p>
                  </motion.div>
                )}

                <div className="pt-4 flex justify-center items-center gap-2 text-primary/40 font-bold text-[10px] uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  {t('voluntariado.requisitos.formulario.proteccion')}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VolunteerModal;
