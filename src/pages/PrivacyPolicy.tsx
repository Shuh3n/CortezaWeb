import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: `1. ${t('privacidad.secciones.0.titulo')}`,
      content: (
          <>
            <p>
              {t('privacidad.secciones.0.contenido_p1')}
              <a href="https://cortezaterrestre.org" className="text-primary hover:underline font-semibold">{t('privacidad.secciones.0.contenido_url')}</a>
              {t('privacidad.secciones.0.contenido_p2')}
            </p>
            <p className="mt-3">
              {t('privacidad.secciones.0.contenido_p3')}
            </p>
          </>
      ),
    },
    {
      title: `2. ${t('privacidad.secciones.1.titulo')}`,
      content: (
          <ul className="list-disc pl-6 space-y-2 marker:text-primary">
            <li><strong>{t('privacidad.secciones.1.li_1')}</strong>{t('privacidad.secciones.1.li_1_val')}</li>
            <li><strong>{t('privacidad.secciones.1.li_2')}</strong> <a href="https://cortezaterrestre.org" className="text-primary hover:underline font-semibold">https://cortezaterrestre.org</a></li>
            <li><strong>{t('privacidad.secciones.1.li_3')}</strong> <a href="mailto:ayuda@cortezaterrestre.org" className="text-primary hover:underline font-semibold">ayuda@cortezaterrestre.org</a></li>
          </ul>
      ),
    },
    {
      title: `3. ${t('privacidad.secciones.2.titulo')}`,
      content: (
          <>
            <p className="mb-4">
              {t('privacidad.secciones.2.p1')}
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>{t('privacidad.secciones.2.li_1')}</strong>{t('privacidad.secciones.2.li_1_val')}</li>
              <li><strong>{t('privacidad.secciones.2.li_2')}</strong>{t('privacidad.secciones.2.li_2_val')}</li>
              <li><strong>{t('privacidad.secciones.2.li_3')}</strong>{t('privacidad.secciones.2.li_3_val')}</li>
            </ul>
          </>
      ),
    },
    {
      title: `4. ${t('privacidad.secciones.3.titulo')}`,
      content: (
          <>
            <p className="mb-4">
              {t('privacidad.secciones.3.p1')}
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>{t('privacidad.secciones.3.li_1')}</strong>{t('privacidad.secciones.3.li_1_val')}</li>
              <li><strong>{t('privacidad.secciones.3.li_2')}</strong>{t('privacidad.secciones.3.li_2_val')}</li>
              <li><strong>{t('privacidad.secciones.3.li_3')}</strong>{t('privacidad.secciones.3.li_3_val')}</li>
              <li><strong>{t('privacidad.secciones.3.li_4')}</strong>{t('privacidad.secciones.3.li_4_val')}</li>
              <li><strong>{t('privacidad.secciones.3.li_5')}</strong>{t('privacidad.secciones.3.li_5_val')}</li>
            </ul>
          </>
      ),
    },
    {
      title: `5. ${t('privacidad.secciones.4.titulo')}`,
      content: (
          <>
            <p className="mb-4">
              {t('privacidad.secciones.4.p1')}
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li>{t('privacidad.secciones.4.li_1')}</li>
              <li>{t('privacidad.secciones.4.li_2')}</li>
              <li>{t('privacidad.secciones.4.li_3')}</li>
              <li>{t('privacidad.secciones.4.li_4')}</li>
              <li>{t('privacidad.secciones.4.li_5')}</li>
            </ul>
            <p className="mt-4">
              {t('privacidad.secciones.4.p2')} <a href="mailto:ayuda@cortezaterrestre.org" className="text-primary hover:underline font-semibold">ayuda@cortezaterrestre.org</a>.
            </p>
          </>
      ),
    },
    {
      title: `6. ${t('privacidad.secciones.5.titulo')}`,
      content: (
          <>
            <p>{t('privacidad.secciones.5.p1')}</p>
            <p className="mt-3">{t('privacidad.secciones.5.p2')}</p>
          </>
      ),
    },
    {
      title: `7. ${t('privacidad.secciones.6.titulo')}`,
      content: (
          <p>{t('privacidad.secciones.6.p1')}</p>
      ),
    },
    {
      title: `8. ${t('privacidad.secciones.7.titulo')}`,
      content: (
          <p>{t('privacidad.secciones.7.p1')}</p>
      ),
    },
    {
      title: `9. ${t('privacidad.secciones.8.titulo')}`,
      content: (
          <p>{t('privacidad.secciones.8.p1')}</p>
      ),
    },
    {
      title: `10. ${t('privacidad.secciones.9.titulo')}`,
      content: (
          <>
            <p className="mb-4">
              {t('privacidad.secciones.9.p1')}
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-primary">
              <li><strong>{t('privacidad.secciones.9.li_1')}</strong> <a href="mailto:ayuda@cortezaterrestre.org" className="text-primary hover:underline font-semibold">ayuda@cortezaterrestre.org</a></li>
              <li><strong>{t('privacidad.secciones.9.li_2')}</strong> <a href="https://cortezaterrestre.org" className="text-primary hover:underline font-semibold">https://cortezaterrestre.org</a></li>
            </ul>
          </>
      ),
    },
  ];

  return (
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
      >
        <section className="relative pt-40 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/70" />

          <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl"
          />
          <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"
          />

          <div className="w-full lg:w-[70%] mx-auto relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-center"
            >
              <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-8 border border-white/20"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>

              <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent font-bold text-sm mb-6 tracking-widest uppercase"
              >
                {t('privacidad.hero.etiqueta')}
              </motion.span>

              <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6"
              >
                {t('privacidad.hero.titulo_1')}{' '}
                <span className="text-accent underline decoration-white/20 decoration-4 underline-offset-8">
                {t('privacidad.hero.titulo_2')}
              </span>
              </motion.h1>

              <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-white/80 max-w-2xl mx-auto font-medium leading-relaxed"
              >
                {t('privacidad.hero.actualizacion')}
              </motion.p>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 60L1440 60L1440 30C1440 30 1200 0 720 0C240 0 0 30 0 30L0 60Z" fill="#fdfaf6" />
            </svg>
          </div>
        </section>

        <section className="bg-neutral-soft pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {sections.map((section, i) => (
                  <motion.div
                      key={i}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-40px' }}
                      variants={sectionVariants}
                      className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/10 transition-all duration-300"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-text-h mb-4 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary text-sm font-black shrink-0">
                    {i + 1}
                  </span>
                      {section.title.replace(/^\d+\.\s*/, '')}
                    </h2>
                    <div className="text-text-main leading-relaxed pl-12">
                      {section.content}
                    </div>
                  </motion.div>
              ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-12 text-center"
            >
              <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('privacidad.boton_volver')}
              </Link>
            </motion.div>
          </div>
        </section>
      </motion.div>
  );
};

export default PrivacyPolicy;