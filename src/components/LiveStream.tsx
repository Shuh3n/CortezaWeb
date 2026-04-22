import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LiveStream = () => {
  const { t } = useTranslation();

  return (
      <section className="py-20 bg-neutral-soft" id="stream">
        <div className="w-[90%] md:w-[70%] mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-text-main">
              {t('stream.titulo')}
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              {t('stream.descripcion')}
            </p>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-gray-900 group flex items-center justify-center border-4 border-white/80"
          >
            <div className="relative text-center z-10 p-8 max-w-md bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-10 h-10 text-primary ml-2 fill-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t('stream.proximamente')}</h3>
              <p className="text-white/70">
                {t('stream.proximamente_desc')}
              </p>
            </div>

            <div className="absolute inset-0 opacity-40 bg-[url('/images/bg-counter.jpg')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
          </motion.div>
        </div>
      </section>
  );
};

export default LiveStream;