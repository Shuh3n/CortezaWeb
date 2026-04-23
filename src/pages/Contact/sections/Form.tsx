import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    asunto: '',
    mensaje: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to send');

      setSubmitted(true);
      setFormData({ nombre: '', correo: '', asunto: '', mensaje: '' });
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError(t('contacto_form.error_envio') || 'Error al enviar el mensaje. Intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('contacto_form.info.email'),
      value: 'ayuda@cortezaterrestre.org',
      link: 'mailto:ayuda@cortezaterrestre.org'
    },
    {
      icon: Phone,
      label: t('contacto_form.info.telefono'),
      value: '(+57) 314 811 48 84',
      link: 'tel:+573148114884'
    },
    {
      icon: MapPin,
      label: t('contacto_form.info.ubicacion'),
      value: t('contacto_form.info.direccion'),
      link: '#'
    }
  ];

  return (
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="w-[70%] mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                  <input
                      type="text"
                      name="nombre"
                      placeholder={t('contacto_form.placeholders.nombre')}
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-soft border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                  />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                  <input
                      type="email"
                      name="correo"
                      placeholder={t('contacto_form.placeholders.email')}
                      value={formData.correo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-soft border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                  />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                  <input
                      type="text"
                      name="asunto"
                      placeholder={t('contacto_form.placeholders.asunto')}
                      value={formData.asunto}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-soft border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                  />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                <textarea
                    name="mensaje"
                    placeholder={t('contacto_form.placeholders.mensaje')}
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-neutral-soft border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    required
                />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 mb-4"
                >
                  <input
                      type="checkbox"
                      id="privacy"
                      className="rounded"
                      required
                  />
                  <label htmlFor="privacy" className="text-sm text-text-muted">
                    {t('contacto_form.privacidad')}
                  </label>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      {t('contacto_form.boton_enviar')}
                    </>
                  )}
                </motion.button>

                {submitted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-center font-medium"
                    >
                      {t('contacto_form.mensaje_exito')}
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-center font-medium"
                    >
                      {error}
                    </motion.div>
                )}
              </form>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-h mb-2">
                  {t('contacto_form.titulo')}
                </h2>
                <p className="text-text-muted text-lg">
                  {t('contacto_form.descripcion')}
                </p>
              </div>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                      <motion.a
                          key={index}
                          href={info.link}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="flex items-start gap-4 group cursor-pointer"
                      >
                        <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-h mb-1">{info.label}</h3>
                          <p className="text-text-muted whitespace-pre-line group-hover:text-primary transition-colors">
                            {info.value}
                          </p>
                        </div>
                      </motion.a>
                  );
                })}
              </div>

              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="pt-8 border-t border-slate-100"
              >
                <p className="text-text-muted font-bold text-sm uppercase tracking-widest mb-6">{t('contacto_form.redes')}</p>
                <div className="flex gap-4">
                  <a
                      href="https://www.instagram.com/corteza_terrestre/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl bg-neutral-soft flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group shadow-sm border border-slate-100"
                  >
                    <img
                        src="/icons/instagram.svg"
                        alt="Instagram"
                        className="w-6 h-6 group-hover:brightness-0 group-hover:invert transition-all group-hover:scale-110"
                    />
                  </a>
                  <a
                      href="https://www.facebook.com/cortezaterrestre/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl bg-neutral-soft flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group shadow-sm border border-slate-100"
                  >
                    <img
                        src="/icons/facebook.svg"
                        alt="Facebook"
                        className="w-6 h-6 group-hover:brightness-0 group-hover:invert transition-all group-hover:scale-110"
                    />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
  );
};

export default ContactForm;
