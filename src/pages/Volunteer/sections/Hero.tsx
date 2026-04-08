import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const VolunteerHero = () => {
  return (
    <section className="relative pt-40 pb-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/baner-voluntario.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40" />
      </div>
      {/* Background decorations */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.2 }}
        className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.4 }}
        className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl" 
      />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10"><div className="w-[70%] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4">
            Conviértete en <span className="text-accent underline decoration-white/20">Voluntario</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl font-medium">
            Dona tu tiempo y únete a nosotros en la labor de cuidar y proteger a los animales
          </p>
          
          <div className="bg-primary/20 backdrop-blur-md rounded-3xl p-8 max-w-3xl border border-white/20 shadow-2xl">
            <p className="text-white text-lg leading-relaxed mb-4 font-medium">
              Si eres una persona mayor de 14 años, además comprometida, respetuosa, tolerante y paciente frente a todas las especies, 
              aquí encontrarás una breve descripción de las diversas áreas de voluntariado para vincularte en esta labor.
            </p>
            <p className="text-white text-lg leading-relaxed font-medium">
              No importa tu profesión, solo contar con un <span className="font-bold text-accent">seguro médico vigente</span>. 
              También puedes realizar el trabajo social de bachiller y prácticas universitarias. <Link to="/contacto" className="text-accent hover:text-white underline decoration-2 underline-offset-4 font-bold transition-colors">¡Contáctanos!</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
    </section>
  );
};

export default VolunteerHero;
