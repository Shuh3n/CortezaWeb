import { motion } from 'framer-motion';

const AboutHero = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative pt-40 pb-20 px-4 overflow-hidden"
    >
      {/* Basic Background Image - No Fixed Effect */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/baner-about.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40" />
      </div>
      
      {/* Background decorations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2"
      />
      
      <div className="w-[70%] mx-auto relative z-10">
        <div className="text-center md:text-left">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent font-bold text-sm mb-6 tracking-widest uppercase"
          >
            Sobre Nosotros
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-black text-white leading-tight mb-6"
          >
            Nuestra labor por <br />
            Los que no tienen voz
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-white/90 max-w-2xl font-medium leading-relaxed"
          >
            Luchamos por la libertad, respeto y justicia para todos los animales, sin excepción de especies.
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutHero;
