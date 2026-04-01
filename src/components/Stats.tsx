import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Stats = () => {
  return (
    <section className="py-24 bg-white border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text-h mb-8 leading-tight">
              Cada Vida Cuenta
            </h2>
            <p className="text-xl text-text-muted mb-8 leading-relaxed">
              "La Fundación Corteza Terrestre en la actualidad cuenta con una población de 
              <span className="text-primary font-bold"> 60 animales entre perros y gatos</span>, 
              animales que son atendidos para posteriormente ser recuperados y darlos en adopción."
            </p>
            <p className="text-lg text-text-muted italic">
              — Con tu ayuda salvamos a los animales de la crueldad y el abandono.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-md"
          >
            <div className="bg-neutral-soft p-12 rounded-[40px] shadow-2xl shadow-primary/5 border border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Heart size={120} className="text-primary fill-primary" />
              </div>
              <div className="relative z-10">
                <div className="text-6xl font-black text-primary mb-2">60+</div>
                <div className="text-xl font-bold text-text-h mb-4">Vidas Protegidas</div>
                <div className="w-16 h-1.5 bg-accent rounded-full mb-6" />
                <p className="text-text-muted font-medium">
                  Perros y gatos recuperados de situaciones críticas en el Quindío.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
