import {
  Stethoscope,
  Syringe,
  ShieldCheck,
  Megaphone,
  Home,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const axesConfig = [
  {
    icon: Syringe,
    color: 'bg-primary text-white shadow-primary/20'
  },
  {
    icon: Stethoscope,
    color: 'bg-secondary text-white shadow-secondary/20'
  },
  {
    icon: ShieldCheck,
    color: 'bg-accent text-white shadow-accent/20'
  },
  {
    icon: Megaphone,
    color: 'bg-primary text-white shadow-primary/20'
  },
  {
    icon: Home,
    color: 'bg-secondary text-white shadow-secondary/20'
  },
  {
    icon: Users,
    color: 'bg-accent text-white shadow-accent/20'
  }
];

const WorkAxes = () => {
  const { t } = useTranslation();
  const items = t('ejes_trabajo.items', { returnObjects: true }) as Array<{ titulo: string, descripcion: string }>;

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
            <h2 className="text-4xl md:text-5xl font-bold text-text-h mb-6">{t('ejes_trabajo.titulo')}</h2>
            <p className="text-xl text-text-muted">
              {t('ejes_trabajo.descripcion')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((axis, index) => {
              const Icon = axesConfig[index].icon;
              return (
                  <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                      className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all border border-slate-100 group cursor-default"
                  >
                    <div className={`w-14 h-14 ${axesConfig[index].color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-text-h mb-4">{axis.titulo}</h3>
                    <p className="text-text-muted leading-relaxed font-medium">
                      {axis.descripcion}
                    </p>
                  </motion.div>
              );
            })}
          </div>
        </div>
      </section>
  );
};

export default WorkAxes;