import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form logic will be configured later
    console.log('Form data:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'ayuda@cortezaterrestre.org',
      link: 'mailto:ayuda@cortezaterrestre.org'
    },
    {
      icon: Phone,
      label: 'Teléfono',
      value: '(+57) 314 811 48 84',
      link: 'tel:+573148114884'
    },
    {
      icon: MapPin,
      label: 'Ubicación',
      value: 'Calle 22N No. 17-15, Edif. Ozono\nArmenia, Quindío',
      link: '#'
    }
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-white">
      <div className="w-[70%] mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
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
                  placeholder="Nombre"
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
                  name="email"
                  placeholder="Correo Electrónico"
                  value={formData.email}
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
                  placeholder="Asunto"
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
                  placeholder="Escribe aquí tu mensaje"
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
                  Al enviar el formulario acepto términos y condiciones de privacidad
                </label>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Enviar
              </motion.button>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-center"
                >
                  Gracias por contactar, en breve nos pondremos en contacto con usted.
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-h mb-2">
                Contáctanos
              </h2>
              <p className="text-text-muted text-lg">
                Escríbenos acerca de nuestros productos para ordenarlos o cualquier otra inquietud y te responderemos en la mayor brevedad posible.
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

            {/* Social Media Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="pt-8 border-t border-slate-100"
            >
              <p className="text-text-muted font-bold text-sm uppercase tracking-widest mb-6">También estamos en redes:</p>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/corteza_terrestre/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-neutral-soft flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group shadow-sm border border-slate-100"
                >
                  <Instagram size={24} className="group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://www.facebook.com/cortezaterrestre/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-neutral-soft flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all group shadow-sm border border-slate-100"
                >
                  <Facebook size={24} className="group-hover:scale-110 transition-transform" />
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
