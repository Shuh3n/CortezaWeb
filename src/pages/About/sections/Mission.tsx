import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Mission = () => {
  const { t } = useTranslation();

  return (
      <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative py-16 md:py-20 px-4 bg-gradient-to-br from-accent/5 via-white to-secondary/5 overflow-hidden"
      >
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
        />
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.2 }}
            className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"
        />
        <div className="w-[70%] mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-text-h">
                {t('about.mission.titulo')}
              </h2>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>{t('about.mission.p1')}</p>
                <p>{t('about.mission.p2')}</p>
                <p>
                  {t('about.mission.p3_start')}
                  <a href="/" className="text-primary font-semibold hover:underline">{t('about.mission.p3_link')}</a>
                  {t('about.mission.p3_end')}
                </p>
              </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-xl overflow-hidden shadow-xl"
            >
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 h-80 md:h-96 flex items-center justify-center">
                <div className="text-center text-text-muted">
                  <div className="text-6xl mb-4">🐾</div>
                  <p className="text-lg font-semibold">{t('about.mission.logo_text')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
  );
};

export default Mission;