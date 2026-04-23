import { motion } from 'framer-motion';
import { CheckCircle2, Heart, Shield, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../../context/ModalContext';

const icons = [CheckCircle2, Heart, Shield, Users];

const VolunteerRequirements = () => {
  const { t } = useTranslation();
  const { openVolunteerModal } = useModal();
  const requirements = t('voluntariado.requisitos.lista', { returnObjects: true }) as Array<{ title: string, description: string }>;

  return (
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary/5 via-accent/10 to-primary/5 overflow-hidden">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"
        />
        <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.2 }}
            className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-accent/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"
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
              {t('voluntariado.requisitos.titulo')}
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              {t('voluntariado.requisitos.subtitulo')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2 space-y-8">
              {requirements.slice(0, 2).map((req, index) => {
                const Icon = icons[index];
                return (
                    <motion.div
                        key={req.title}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left"
                    >
                      <div className="w-14 h-14 shrink-0 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 text-white">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text-h mb-2">{req.title}</h3>
                        <p className="text-text-muted text-sm leading-relaxed">{req.description}</p>
                      </div>
                    </motion.div>
                );
              })}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="lg:col-span-1"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                <img
                    src="/images/cuidado-gatos.jpg"
                    alt="Cuidado de gatos"
                    className="relative z-10 w-full aspect-square object-cover rounded-full border-4 border-white shadow-2xl"
                />
              </div>
            </motion.div>

            <div className="lg:col-span-2 space-y-8">
              {requirements.slice(2, 4).map((req, index) => {
                const Icon = icons[index + 2];
                return (
                    <motion.div
                        key={req.title}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex flex-col md:flex-row-reverse items-center md:items-start gap-4 text-center md:text-right"
                    >
                      <div className="w-14 h-14 shrink-0 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20 text-white">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text-h mb-2">{req.title}</h3>
                        <p className="text-text-muted text-sm leading-relaxed">{req.description}</p>
                      </div>
                    </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 text-center"
          >
            <p className="text-text-muted mb-6 max-w-2xl mx-auto text-lg whitespace-pre-line">
              {t('voluntariado.requisitos.cta_texto')}
            </p>
            <motion.button
                whileHover={{ scale: 1.05, translateY: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={openVolunteerModal}
                className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all cursor-pointer"
            >
              {t('voluntariado.requisitos.cta_boton')}
            </motion.button>
          </motion.div>
        </div>
      </section>
  );
};

export default VolunteerRequirements;
