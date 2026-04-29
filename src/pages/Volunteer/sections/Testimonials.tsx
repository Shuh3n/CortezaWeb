import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VolunteerTestimonials = () => {
  const { t } = useTranslation();
  const testimonials = t('voluntariado.testimonios.lista', { returnObjects: true }) as Array<{ name: string, role: string, text: string }>;

  return (
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-neutral-soft to-secondary/5">
        <div className="w-[70%] mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-text-h mb-4">
              {t('voluntariado.testimonios.titulo')}
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              {t('voluntariado.testimonios.subtitulo')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
                <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>

                  <p className="text-text-muted leading-relaxed mb-6">
                    "{testimonial.text}"
                  </p>

                  <div>
                    <p className="font-bold text-text-h">{testimonial.name}</p>
                    <p className="text-primary text-sm">{testimonial.role}</p>
                  </div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
};

export default VolunteerTestimonials;