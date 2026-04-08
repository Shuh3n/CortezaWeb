import { motion } from 'framer-motion';
import { Heart, PawPrint, Users } from 'lucide-react';

const Stats = () => {
  const stats = [
    {
      icon: PawPrint,
      number: '259',
      label: 'Perros adoptados desde 2014',
      color: 'text-primary'
    },
    {
      icon: Heart,
      number: '219',
      label: 'Gatos adoptados desde 2014',
      color: 'text-secondary'
    },
    {
      icon: Users,
      number: '14',
      label: 'Animales apadrinados desde 2014',
      color: 'text-accent'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/bg-counter.jpg" 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
      </div>

      <div className="w-[70%] mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-xl transition-all"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 + index * 0.1 }}
                  className="flex justify-center mb-4"
                >
                  <Icon className="w-12 h-12 text-white" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-4xl font-bold text-white mb-2"
                >
                  {stat.number}
                </motion.h3>
                <p className="text-white/80 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-2xl"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ¡Abandonar a un animal, es abandonar un miembro de la familia!
          </h3>
          <p className="text-white/80 leading-relaxed text-lg font-medium">
            Los animales que rescatamos pasan meses, incluso años en el refugio, especialemente gatos y perros adultos o animales discapacitados, hasta que encontramos un propietario idóneo. Esta situación genera estrés en los animales, incluso si es por corto tiempo. Si tienes que separarte por algún motivo de el, primero busca un hogar por iniciativa propia.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
