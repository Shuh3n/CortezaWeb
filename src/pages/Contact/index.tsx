import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ContactForm from './sections/Form';
import Map from './sections/Map';

const Contact = () => {
  const { t } = useTranslation();

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
      >
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative pt-52 pb-24 px-4 overflow-hidden bg-primary"
        >
          <div className="absolute inset-0 z-0">
            <img
                src="/images/baner-voluntario.jpg"
                alt={t('contacto_page.etiqueta')}
                className="w-full h-full object-cover brightness-[0.4] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/20" />
          </div>

          <div className="w-[70%] mx-auto relative z-10 text-center md:text-left text-white">
            <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white font-bold text-sm mb-6 tracking-widest uppercase backdrop-blur-md"
            >
              {t('contacto_page.etiqueta')}
            </motion.span>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              {t('contacto_page.titulo')}
            </h1>
            <p className="text-xl text-white/90 font-medium max-w-xl">
              {t('contacto_page.descripcion')}
            </p>
          </div>
        </motion.section>

        <ContactForm />

        <Map />
      </motion.div>
  );
};

export default Contact;