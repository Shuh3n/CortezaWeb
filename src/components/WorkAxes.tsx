import { 
  Stethoscope, 
  Syringe, 
  ShieldCheck, 
  Megaphone, 
  Home, 
  Users 
} from 'lucide-react';
import { motion } from 'framer-motion';

const axes = [
  {
    title: 'Esterilización',
    description: 'Gestionamos y promovemos jornadas de esterilización en diferentes sectores para evitar la reproducción descontrolada.',
    icon: Syringe,
    color: 'bg-primary text-white shadow-primary/20'
  },
  {
    title: 'Atención Veterinaria',
    description: 'Brindamos tratamientos y cirugías urgentes para los animales del refugio y los que están en condición de calle.',
    icon: Stethoscope,
    color: 'bg-secondary text-white shadow-secondary/20'
  },
  {
    title: 'Buen Trato',
    description: 'Nos esforzamos para que los animales se sientan queridos y protegidos, reduciendo los traumas del abandono.',
    icon: ShieldCheck,
    color: 'bg-accent text-white shadow-accent/20'
  },
  {
    title: 'Somos Portavoces',
    description: 'Velamos por el cumplimiento de la legislación colombiana contra el maltrato animal y la explotación.',
    icon: Megaphone,
    color: 'bg-primary text-white shadow-primary/20'
  },
  {
    title: 'Adopciones Responsables',
    description: 'Ubicamos a los animales en hogares óptimos, incluyendo esterilización y seguimiento riguroso.',
    icon: Home,
    color: 'bg-secondary text-white shadow-secondary/20'
  },
  {
    title: 'Voluntariado',
    description: 'Unimos esfuerzos entre voluntarios, padrinos y simpatizantes para fortalecer el bienestar animal.',
    icon: Users,
    color: 'bg-accent text-white shadow-accent/20'
  }
];

const WorkAxes = () => {
  return (
    <section id="ejes" className="py-16 bg-neutral-soft px-4">
      <div className="w-[70%] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-h mb-6">¿Qué estamos haciendo?</h2>
          <p className="text-xl text-text-muted">
            Nuestros ejes de trabajo se enfocan en soluciones integrales para el bienestar animal en nuestra región.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {axes.map((axis, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all border border-slate-100 group cursor-default"
            >
              <div className={`w-14 h-14 ${axis.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <axis.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold text-text-h mb-4">{axis.title}</h3>
              <p className="text-text-muted leading-relaxed font-medium">
                {axis.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkAxes;
