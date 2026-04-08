import { motion } from 'framer-motion';
import ContactForm from './sections/Form';
import Map from './sections/Map';

const Contact = () => {
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
        className="relative bg-gradient-to-br from-neutral-soft via-primary/5 to-accent/5 pt-52 pb-24 px-4 overflow-hidden"
      >
        {/* Background decorations */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.2 }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.4 }}
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl" 
        />
        <div className="w-[70%] mx-auto relative z-10 text-center md:text-left">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 tracking-widest uppercase"
          >
            Contacto
          </motion.span>
          <h1 className="text-5xl md:text-7xl font-black text-text-h mb-6 leading-tight">
            ¿Hablamos?
          </h1>
          <p className="text-xl text-text-muted font-medium max-w-xl">
            Estamos aquí para escucharte y trabajar juntos por el bienestar animal. Escríbenos y nos pondremos en contacto pronto.
          </p>
        </div>
      </motion.section>

      {/* Form Section */}
      <ContactForm />

      {/* Map Section */}
      <Map />
    </motion.div>
  );
};

export default Contact;
