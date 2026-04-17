import { Mail, Phone, Clock } from 'lucide-react';
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
    <section id="contacto" className="py-24 bg-neutral-soft overflow-hidden px-4">
      <div className="w-full lg:w-[85%] xl:w-[70%] mx-auto">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full h-full min-h-[400px] rounded-[48px] overflow-hidden shadow-2xl border-8 border-white group relative"
          >
            <img 
              src="/images/cuidado-gatos.jpg" 
              alt="Hablemos" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-10 left-10 right-10 z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Fundación Corteza Terrestre</h3>
              <p className="text-white/90 font-medium italic">"Luchamos por los que no tienen voz"</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
