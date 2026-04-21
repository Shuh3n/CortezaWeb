import { motion } from 'framer-motion';
import { Heart, Truck, Gift, CheckCircle2, Users, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const icons = [CheckCircle2, Heart, Truck, Gift, Users, Megaphone];

const VolunteerAreas = () => {
  const { t } = useTranslation();
  const areas = t('voluntariado.areas.lista', { returnObjects: true }) as Array<{ title: string, description: string }>;

  return (
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-accent/10 to-neutral-soft overflow-hidden">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl"
        />
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.2 }}
            className="absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl -translate-x-1/2"
        />
        <div className="w-[70%] mx-auto relative z-10">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-text-h mb-4">
              {t('voluntariado.areas.titulo')}
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              {t('voluntariado.areas.subtitulo')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {areas.map((area, index) => {
              const Icon = icons[index % icons.length];
              const colors = [
                'bg-primary shadow-primary/20',
                'bg-secondary shadow-secondary/20',
                'bg-accent shadow-accent/20',
                'bg-primary shadow-primary/20',
                'bg-secondary shadow-secondary/20',
                'bg-accent shadow-accent/20'
              ];
              const currentColor = colors[index % colors.length];

              return (
                  <motion.div
                      key={area.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ translateY: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                      className="bg-white rounded-[32px] p-8 border border-slate-100 hover:border-primary/30 transition-all group shadow-sm"
                  >
                    <div className={`w-14 h-14 ${currentColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg text-white`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-2xl font-bold text-text-h mb-3">{area.title}</h3>
                    <p className="text-text-muted leading-relaxed font-medium">{area.description}</p>
                  </motion.div>
              );
            })}
          </div>
        </div>
      </section>
  );
};

export default VolunteerAreas;