import { useEffect, useState } from 'react';
import { ShoppingBag, Heart, HandHelping } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { useTranslation } from 'react-i18next';
import { listGalleryImages } from '../lib/gallery';

const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800";

const Hero = () => {
  const { openDonationModal } = useModal();
  const { t } = useTranslation();
  const [heroImage, setHeroImage] = useState<string>(DEFAULT_HERO_IMAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadHeroImage() {
      try {
        const images = await listGalleryImages(undefined, 1, 10);
        if (!ignore && images.length > 0) {
          const randomIndex = Math.floor(Math.random() * images.length);
          setHeroImage(images[randomIndex].url);
        }
      } catch (error) {
        console.error('Error cargando imagen de hero:', error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadHeroImage();
    return () => {
      ignore = true;
    };
  }, []);
  
  return (
    <section id="inicio" className="relative min-h-[550px] flex items-center overflow-hidden bg-neutral-soft py-10 pt-32">
      {/* Mobile background image - visible only on small screens */}
      <div className="absolute inset-0 lg:hidden">
        <AnimatePresence mode="wait">
          {!isLoading && (
            <motion.img
              key={heroImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              src={heroImage}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-soft/80 via-transparent to-neutral-soft" />
      </div>

      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
      />

      <div className="w-full px-4 relative z-10">
        <div className="w-full lg:w-[85%] xl:w-[70%] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 tracking-wide"
              >
                {t('hero.etiqueta')}
              </motion.span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-text-h leading-[1.1] mb-6">
                {t('hero.titulo_inicio')} <br />
                <span className="text-primary underline decoration-accent/30 decoration-8 underline-offset-8 italic">
                  {t('hero.titulo_destacado')}
                </span>{' '}
                {t('hero.titulo_fin')}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-text-muted mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                {t('hero.descripcion')}
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link to="/tienda">
                  <motion.button
                    whileHover={{ scale: 1.05, translateY: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 group transition-shadow hover:shadow-primary/40 cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                    {t('hero.botones.comprar')}
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.05, translateY: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-secondary/20 group transition-shadow hover:shadow-secondary/40 cursor-pointer"
                >
                  <Heart className="w-5 h-5 transition-transform group-hover:scale-110" />
                  {t('hero.botones.apadrinar')}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, translateY: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openDonationModal}
                  className="flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-accent/20 group transition-shadow hover:shadow-accent/40 cursor-pointer"
                >
                  <HandHelping className="w-5 h-5 transition-transform group-hover:scale-110" />
                  {t('hero.botones.donar')}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "backOut" }}
              className="hidden lg:block relative"
            >
              <div className="relative z-10 w-full aspect-square rounded-[60px] overflow-hidden shadow-2xl border-8 border-white bg-white">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.img
                      key={heroImage}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      src={heroImage}
                      alt="Animal rescatado"
                      className="w-full h-full object-cover"
                    />
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl">
                  <p className="text-primary font-bold text-lg mb-1">{t('hero.tarjeta.titulo')}</p>
                  <p className="text-text-muted text-sm font-medium">{t('hero.tarjeta.subtitulo')}</p>
                </div>
              </div>
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 w-24 h-24 bg-accent rounded-full flex items-center justify-center text-white shadow-xl z-20"
              >
                <Heart fill="white" size={40} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
