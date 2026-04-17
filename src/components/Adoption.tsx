import { Heart, PawPrint } from 'lucide-react';
import { motion } from 'framer-motion';

const Adoption = () => {
  return (
    <section id="adopcion" className="py-16 bg-white overflow-hidden px-4">
      <div className="w-full lg:w-[85%] xl:w-[70%] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-primary/5 rounded-[48px] p-8 md:p-20 relative overflow-hidden"
        >
          {/* Subtle Floating Pattern Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.09]">
            <motion.div
              animate={{ y: [0, -30, 0], x: [0, 15, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-8 right-12 text-primary"
            >
              <Heart size={180} fill="currentColor" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 40, 0], x: [0, -20, 0], rotate: [0, -12, 0] }}
              transition={{ duration: 8, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-10 right-[15%] text-primary"
            >
              <PawPrint size={250} fill="currentColor" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-1/4 right-60 text-primary"
            >
              <Heart size={100} fill="currentColor" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0], rotate: [0, 20, 0] }}
              transition={{ duration: 7, repeat: Infinity, delay: 2 }}
              className="absolute bottom-10 left-10 text-primary"
            >
              <PawPrint size={140} fill="currentColor" />
            </motion.div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-text-h mb-6">
              Adopta un amor para toda la vida
            </h2>
            <p className="text-xl text-text-muted mb-8 leading-relaxed font-medium">
              Hay muchas razones para adoptar un animal, pero la mejor de todas es que salvarás una vida y a cambio tendrás su amor incondicional e inigualable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = "/adoptar"}
                className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-primary/20 transition-all shadow-lg"
              >
                Ver Animales para Adopción
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Adoption;
