import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Dog, Cat, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Define the type for our cities data based on the JSON structure
type Point = { name: string; address: string };
type Zone = { title: string; points: Point[] };
type City = { id: string; name: string; zones: Zone[] };

const SalvatonCities = () => {
  const { t } = useTranslation();
  // Get the cities array from the translations
  const citiesData = t('salvaton.cities.data', { returnObjects: true }) as City[];
  const [activeCity, setActiveCity] = useState<City>(citiesData[0]);

  return (
      <section className="py-20 px-4 bg-neutral-soft overflow-hidden">
        <div className="w-[70%] mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-text-h mb-4">{t('salvaton.cities.titulo')}</h2>
            <p className="text-text-muted text-lg font-medium">{t('salvaton.cities.subtitulo')}</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-12 items-start">
            <div className="lg:col-span-1 space-y-4">
              {citiesData.map((city) => (
                  <button
                      key={city.id}
                      onClick={() => setActiveCity(city)}
                      className={`w-full group flex items-center gap-4 p-5 rounded-[24px] transition-all duration-300 cursor-pointer ${
                          activeCity.id === city.id
                              ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-2'
                              : 'bg-white text-text-muted hover:bg-white hover:shadow-lg'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        activeCity.id === city.id ? 'bg-white/20' : 'bg-primary/10 group-hover:bg-primary/20'
                    }`}>
                      <MapPin className={activeCity.id === city.id ? 'text-white' : 'text-primary'} size={20} />
                    </div>
                    <span className="font-bold text-lg">{city.name}</span>
                  </button>
              ))}
            </div>

            <div className="lg:col-span-3 bg-white rounded-[48px] p-8 md:p-12 shadow-2xl border border-white/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Building2 size={200} className="text-primary" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                    key={activeCity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10"
                >
                  <h3 className="text-3xl font-black text-text-h mb-10 flex items-center gap-4">
                    <span className="w-2 h-8 bg-accent rounded-full" />
                    {activeCity.name}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-10">
                    {activeCity.zones.map((zone, zIdx) => (
                        <div key={zIdx}>
                          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary/60 mb-6 bg-primary/5 inline-block px-4 py-1 rounded-full">
                            {zone.title}
                          </h4>
                          <ul className="space-y-4">
                            {zone.points.map((point, pIdx) => (
                                <li 
                                    key={pIdx} 
                                    className="group flex items-start gap-4 cursor-pointer p-4 rounded-3xl transition-all duration-300 hover:bg-neutral-soft hover:shadow-md border border-transparent hover:border-primary/5"
                                    onClick={() => {
                                      const query = encodeURIComponent(`${point.name}, ${point.address}, ${activeCity.name}, Quindío, Colombia`);
                                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                                    }}
                                >
                                  <div className="mt-1 w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                                    {pIdx % 2 === 0 ? <Dog size={14} className="text-accent group-hover:text-white" /> : <Cat size={14} className="text-accent group-hover:text-white" />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-text-h leading-tight group-hover:text-primary transition-colors">{point.name}</p>
                                    <p className="text-xs text-text-muted font-medium mt-1">{point.address}</p>
                                  </div>
                                </li>
                            ))}
                          </ul>
                        </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
  );
};

export default SalvatonCities;