import { Mail, Phone, Clock, Globe, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Correo',
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
      icon: Clock,
      label: 'Horario',
      value: 'Lun - Vie: 8am - 12m / 2pm - 6pm',
      link: '#'
    }
  ];

  return (
    <section id="contacto" className="py-24 bg-neutral-soft overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-h mb-8">Hablemos</h2>
            <p className="text-xl text-text-muted mb-12 max-w-lg">
              ¿Tenés dudas o querés apadrinar a uno de nuestros protegidos? Ponete en contacto con nosotros. Estamos para escucharte.
            </p>
            
            <div className="space-y-8">
              {contactInfo.map((item, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 group"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <item.icon size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">{item.label}</p>
                    <a 
                      href={item.link} 
                      className="text-xl font-medium text-text-h hover:text-primary transition-colors"
                    >
                      {item.value}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Media Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex items-center gap-6"
            >
              <p className="text-text-muted font-bold text-sm uppercase tracking-widest">Síguenos:</p>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/corteza_terrestre/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all shadow-sm group"
                >
                  <Globe size={24} className="group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://www.facebook.com/cortezaterrestre/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all shadow-sm group"
                >
                  <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full h-full min-h-[400px] bg-slate-200 rounded-[48px] overflow-hidden shadow-inner border-8 border-white flex items-center justify-center"
          >
               <div className="text-center p-8">
                 <Mail size={48} className="mx-auto mb-4 text-primary opacity-20" />
                 <h3 className="text-2xl font-bold text-text-h mb-2">Fundación Corteza Terrestre</h3>
                 <p className="text-text-muted font-medium italic">"Luchamos por los que no tienen voz"</p>
               </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
