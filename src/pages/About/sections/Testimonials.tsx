import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

  const testimonials = t('about.testimonials.items', { returnObjects: true }) as Array<{ text: string, author: string }>;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="w-[70%] mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-h mb-4">
              {t('about.testimonials.titulo')}
            </h2>
          </motion.div>

          <div className="relative">
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-8 md:p-12"
            >
              <div className="flex justify-center mb-6">
                <Quote className="w-12 h-12 text-primary/30" />
              </div>
              <p className="text-xl md:text-2xl text-text-h font-light leading-relaxed text-center mb-8">
                "{testimonials[currentIndex].text}"
              </p>
              <p className="text-center text-primary font-bold text-lg">
                — {testimonials[currentIndex].author}
              </p>
            </motion.div>

            <div className="flex justify-center gap-4 mt-8">
              <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prev}
                  className="bg-primary text-white p-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setCurrentIndex(index)}
                        className={`rounded-full transition-all cursor-pointer ${
                            index === currentIndex
                                ? 'bg-primary w-3 h-3'
                                : 'bg-text-muted/30 w-2 h-2 hover:bg-text-muted/50'
                        }`}
                    />
                ))}
              </div>

              <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={next}
                  className="bg-primary text-white p-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>
  );
};

export default Testimonials;