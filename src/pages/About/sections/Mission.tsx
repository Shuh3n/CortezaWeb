import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { listGalleryImages } from '../../../lib/gallery';
import type { GalleryImage } from '../../../types/gallery';

const Mission = () => {
  const { t } = useTranslation();
  const [galleryImage, setGalleryImage] = useState<GalleryImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadRandomImage() {
      try {
        // Reducimos a 6 imágenes para agilizar la consulta inicial
        const images = await listGalleryImages(undefined, 1, 6);
        if (!ignore && images.length > 0) {
          const randomIndex = Math.floor(Math.random() * images.length);
          setGalleryImage(images[randomIndex]);
        }
      } catch (error) {
        console.error('Error cargando imagen de nosotros:', error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadRandomImage();
    return () => {
      ignore = true;
    };
  }, []);

  return (
      <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
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
        <div className="w-full max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-black text-text-h uppercase italic tracking-tighter leading-none">
                {t('about.mission.titulo')}
              </h2>
              <div className="space-y-4 text-text-muted leading-relaxed font-medium text-lg">
                <p>{t('about.mission.p1')}</p>
                <p>{t('about.mission.p2')}</p>
                <p>
                  {t('about.mission.p3_start')}
                  <a href="/tienda" className="text-primary font-black hover:underline cursor-pointer">{t('about.mission.p3_link')}</a>
                  {t('about.mission.p3_end')}
                </p>
              </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative group"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-[32px] blur-2xl transform group-hover:scale-105 transition-transform duration-500" />
              <div className="relative aspect-square md:aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border-8 border-white bg-white">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </motion.div>
                  ) : galleryImage ? (
                    <motion.img
                      key={galleryImage.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      src={galleryImage.url}
                      alt={galleryImage.categoria.nombre}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center"
                    >
                      <div className="text-center text-text-muted">
                        <div className="text-6xl mb-4">🐾</div>
                        <p className="text-lg font-black uppercase tracking-widest">{t('about.mission.logo_text')}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!isLoading && galleryImage && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                    <p className="text-white font-black uppercase tracking-[0.2em] text-xs bg-primary/80 w-fit px-4 py-1.5 rounded-full shadow-lg">
                      {galleryImage.categoria.nombre}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
  );
};

export default Mission;