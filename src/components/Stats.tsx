import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Stats = () => {
  return (
    <section className="relative py-20 overflow-hidden px-4">
      {/* Standard Background Image - No Fixed Effect */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/bg-counter.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />
      </div>

      <div className="w-[70%] mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Nuestra Huella en Armenia
            </h2>
            <p className="text-xl mb-8 leading-relaxed opacity-90">
              Cada cifra representa una vida que ha sido tocada por el amor y la dedicación de nuestros voluntarios. Trabajamos incansablemente para que estas historias tengan un final feliz.
            </p>
            <p className="text-lg italic opacity-80">
              — "Transformando el dolor en esperanza, una pata a la vez."
            </p>
          </motion.div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/20 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 opacity-10 group-hover:scale-110 transition-transform">
                <Heart size={80} className="text-white fill-white" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-black text-white mb-2">60+</div>
                <div className="text-lg font-bold text-white/90 mb-3">Vidas Protegidas</div>
                <div className="w-12 h-1 bg-accent rounded-full mb-4" />
                <p className="text-white/70 text-sm font-medium">
                  Animales bajo nuestro cuidado constante en el refugio.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/20 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 opacity-10 group-hover:scale-110 transition-transform">
                <Heart size={80} className="text-white fill-white" />
              </div>
              <div className="relative z-10">
                <div className="text-5xl font-black text-white mb-2">500+</div>
                <div className="text-lg font-bold text-white/90 mb-3">Adoptados</div>
                <div className="w-12 h-1 bg-accent rounded-full mb-4" />
                <p className="text-white/70 text-sm font-medium">
                  Hogares transformados por el amor de un rescatado.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/20 shadow-xl relative overflow-hidden group sm:col-span-2">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-5xl font-black text-white mb-1">100%</div>
                  <div className="text-lg font-bold text-white/90">Amor y Compromiso</div>
                </div>
                <div className="flex-1">
                  <p className="text-white/70 text-sm font-medium">
                    Nuestra dedicación es total para garantizar que ningún animal vuelva a sufrir el abandono.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
