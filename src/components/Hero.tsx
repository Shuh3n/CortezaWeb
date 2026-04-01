import { ShoppingBag, Heart, HandHelping } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-neutral-soft">
      {/* Mobile background image - visible only on small screens */}
      <div className="absolute inset-0 lg:hidden">
        <img 
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800" 
          alt="" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-soft/80 via-transparent to-neutral-soft" />
      </div>

      {/* Background decoration */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 tracking-wide"
            >
              FUNDADA EN 2007 • ARMENIA, QUINDÍO
            </motion.span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-text-h leading-[1.1] mb-8">
              Refugio animal en Armenia: <br />
              <span className="text-primary underline decoration-accent/30 decoration-8 underline-offset-8 italic">
                Luchamos
              </span> por los que no tienen voz
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-text-muted mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              "Luchamos por la libertad, respeto y justicia para todos los animales, sin excepción de especies."
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <motion.button 
                whileHover={{ scale: 1.05, translateY: -4 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 group transition-shadow hover:shadow-primary/40"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                Compra Nuestros Productos
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05, translateY: -4 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-secondary/20 group transition-shadow hover:shadow-secondary/40"
              >
                <Heart className="w-5 h-5 transition-transform group-hover:scale-110" />
                Apadrina un Animal
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05, translateY: -4 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-accent/20 group transition-shadow hover:shadow-accent/40"
              >
                <HandHelping className="w-5 h-5 transition-transform group-hover:scale-110" />
                Donar
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "backOut" }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 w-full aspect-square rounded-[60px] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800" 
                alt="Perro del refugio" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl">
                <p className="text-primary font-bold text-lg mb-1">Max está buscando un hogar</p>
                <p className="text-text-muted text-sm font-medium">Recuperado de abandono en Armenia</p>
              </div>
            </div>
            {/* Floating elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-accent rounded-full flex items-center justify-center text-white shadow-xl z-20"
            >
              <Heart fill="white" size={40} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
