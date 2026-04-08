import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Dog, Cat, Building2 } from 'lucide-react';

const citiesData = [
  {
    id: 'armenia',
    name: 'Armenia',
    zones: [
      {
        title: 'Zona Centro',
        points: [
          { name: 'Tienda de Ropa LVS', address: 'Cra. 13 # 18-53' },
          { name: 'Jazzfa Music', address: 'Cra. 14 # 22-06' },
          { name: 'Hotel la Quinta Porra', address: 'Cra. 14 # 15-48' },
          { name: 'Pantera Deportes', address: 'Cra. 15 # 19-02' },
          { name: 'Peluquería Canina Motitas', address: 'Cra. 16 # 9-50' },
          { name: 'Almacén el Vaquero', address: 'Cra. 16 # 15-45' },
          { name: 'Restaurante la Rana', address: 'Cra. 16 # 18-50' },
          { name: 'Almacén Flota Blanca 1', address: 'Cra. 16 # 20a-09' },
          { name: 'Foto Palacio', address: 'Cra. 17 # 20-40' },
          { name: 'Abox', address: 'Cra. 18 # 9-24' },
          { name: 'Lucía Trujillo Asesores de Imagen', address: 'Calle 14 # 14-41 Local 3' },
          { name: 'Tienda Deportiva Winners', address: 'Cra. 14 # 17-08' },
          { name: 'Tienda Deportiva Trotta', address: 'Unicentro 2do nivel local 72' },
          { name: 'Animales con Colas', address: 'Cra. 23 # 15-17' },
          { name: 'Almacén Concentrados del Quindío', address: 'Cra. 19 # 19-05' },
          { name: 'Rest. Veg. Natural Food Plaza', address: 'Av Bolívar Cra. 14 # 4-51' },
          { name: 'Mundo Cómputo', address: 'Cll. 21 # 11-23' },
          { name: 'Financoop Armenia', address: 'Cll. 20 # 15-33 Oficina 202' },
          { name: 'Almacén de Artesanía Martha Lucía', address: 'Cra. 16 # 14-60' },
          { name: 'Café Letbrogh&co', address: 'Cll. 9 # 13-26' },
          { name: 'Parqueadero Torre Mayor', address: 'Cra. 13 # 23-42' },
          { name: 'Peluches Mi Mejor Regalo', address: 'Cll. 21 # 24-56 Local 2' },
          { name: 'La Casa del Caucho', address: 'Cll. 12 # 19-45 local 25' },
          { name: 'Britania Models', address: 'Cra. 14 # 10-36 2do piso' }
        ]
      },
      {
        title: 'Zona Norte',
        points: [
          { name: 'Almacén El vaquero', address: 'Cra. 19 # 3-97' },
          { name: 'Metromarket', address: 'Cra. 19 # 26N-49 Locales 2-3' },
          { name: 'Safary Tienda de Mascotas', address: 'Cll. 2 N # 18-151' },
          { name: 'Papelería Caramelli', address: 'Cll. 4N # 14-10 Fundadores' },
          { name: 'Restaurante Kimara', address: 'Cll. 4N # 13-58 Fundadores' },
          { name: 'Cimev', address: 'Calle 5N # 18-19 B/Profesionales' },
          { name: 'Casa de Mascotas', address: 'Calle 10N # 13-42' },
          { name: 'Minimarket la 19', address: 'Edificio Torre Verde Local 12' },
          { name: 'Dr. Guillermo Aguirre', address: 'Edif. Caná Local 8' },
          { name: 'SuperGym', address: 'Cll. 15N # 12-48' },
          { name: 'CV Animal Friends', address: 'Cll. 21N # 9-25 Coinca' },
          { name: '¡Oh! My pets', address: 'Cra 19 # 22N - 23 local 4' },
          { name: 'Sublitex', address: 'Cll. 2 # 17-05' },
          { name: 'Hospital Veterinario San Blass', address: 'Cll. 2N # 18-151' }
        ]
      }
    ]
  },
  {
    id: 'montenegro',
    name: 'Montenegro',
    zones: [
      {
        title: 'Puntos de Recaudación',
        points: [
          { name: 'Colegio Santa María Goretti', address: 'Barrio Compartir' }
        ]
      }
    ]
  },
  {
    id: 'calarca',
    name: 'Calarcá',
    zones: [
      {
        title: 'Puntos de Recaudación',
        points: [
          { name: 'Hospital Vet. Animal Hospital', address: 'Cra 23 #38-39' }
        ]
      }
    ]
  }
];

const SalvatonCities = () => {
  const [activeCity, setActiveCity] = useState(citiesData[0]);

  return (
    <section className="py-20 px-4 bg-neutral-soft overflow-hidden">
      <div className="w-[70%] mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-text-h mb-4">Puntos de Recaudación</h2>
          <p className="text-text-muted text-lg font-medium">Encuentra la alcancía más cercana y deja tu huella</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-12 items-start">
          {/* Tabs Menu */}
          <div className="lg:col-span-1 space-y-4">
            {citiesData.map((city) => (
              <button
                key={city.id}
                onClick={() => setActiveCity(city)}
                className={`w-full group flex items-center gap-4 p-5 rounded-[24px] transition-all duration-300 ${
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

          {/* Content Area */}
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
                      <ul className="space-y-6">
                        {zone.points.map((point, pIdx) => (
                          <li key={pIdx} className="group flex items-start gap-4">
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
