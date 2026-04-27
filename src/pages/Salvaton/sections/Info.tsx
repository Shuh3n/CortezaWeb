import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const SalvatonInfo = () => {
  const { t } = useTranslation();

  return (
      <section className="py-20 px-4 bg-white">
        <div className="w-[70%] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
            >
              <div className="absolute -inset-4 bg-primary/5 rounded-[40px] rotate-2 -z-10" />
              <img
                 src="/images/salvatonimage.webp"
                 alt={t('salvaton.info.titulo_2')}
                 className="w-full rounded-[32px] shadow-2xl border-4 border-white"
              />            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
            >
              <h2 className="text-4xl font-extrabold text-text-h leading-tight">
                {t('salvaton.info.titulo_1')} <br />
                <span className="text-primary italic">{t('salvaton.info.titulo_2')}</span>
              </h2>
              <div className="w-20 h-1.5 bg-accent rounded-full" />
              <p className="text-lg text-text-muted leading-relaxed font-medium">
                {t('salvaton.info.p1')}
              </p>
              <p className="text-lg text-text-muted leading-relaxed">
                {t('salvaton.info.p2')}
              </p>
              <div className="p-6 bg-neutral-soft rounded-[24px] border border-primary/10">
                <p className="text-primary font-bold italic">
                  {t('salvaton.info.frase')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
  );
};

export default SalvatonInfo;