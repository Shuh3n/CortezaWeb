import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const VolunteerHero = () => {
  const { t } = useTranslation();

  return (
      <section className="relative pt-40 pb-20 overflow-hidden bg-neutral-soft">
        <div className="absolute inset-0 z-0">
          <img
              src="/images/baner-voluntario.jpg"
              alt=""
              className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/40" />
        </div>

        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
        />

        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="w-[70%] mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4">
                {t('voluntariado.hero.titulo_1')} <span className="text-accent underline decoration-white/20">{t('voluntariado.hero.titulo_2')}</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl font-medium">
                {t('voluntariado.hero.descripcion')}
              </p>

              <div className="bg-primary/20 backdrop-blur-md rounded-3xl p-8 max-w-3xl border border-white/20 shadow-2xl">
                <p className="text-white text-lg leading-relaxed mb-4 font-medium">
                  {t('voluntariado.hero.texto_1')}
                </p>
                <p className="text-white text-lg leading-relaxed font-medium">
                  {t('voluntariado.hero.texto_2_inicio')}
                  <span className="font-bold text-accent">{t('voluntariado.hero.texto_2_bold')}</span>
                  {t('voluntariado.hero.texto_2_medio')}
                  <Link to="/contacto" className="text-accent hover:text-white underline decoration-2 underline-offset-4 font-bold transition-colors">
                    {t('voluntariado.hero.texto_2_enlace')}
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
  );
};

export default VolunteerHero;