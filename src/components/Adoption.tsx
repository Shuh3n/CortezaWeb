import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Adoption = () => {
  return (
    <section id="adopcion" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-primary/5 rounded-[48px] p-8 md:p-20 relative overflow-hidden"
        >
          {/* Decorative shapes */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 p-8 text-primary/10 translate-x-1/4 -translate-y-1/4"
          >
             <Sparkles size={300} />
          </motion.div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-text-h mb-8">
              Adopta un amor para toda la vida
            </h2>
            <p className="text-xl text-text-muted mb-10 leading-relaxed font-medium">
              Hay muchas razones para adoptar un animal, pero la mejor de todas es que salvarás una vida y a cambio tendrás su amor incondicional e inigualable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-primary/20 transition-all"
              >
                Ver Animales para Adopción
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary border-2 border-primary px-10 py-5 rounded-2xl font-bold text-xl hover:bg-primary/5 transition-all"
              >
                Formulario de Solicitud
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Adoption;
