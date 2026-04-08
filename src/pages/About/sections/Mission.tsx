import { motion } from 'framer-motion';

const Mission = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative py-16 md:py-20 px-4 bg-gradient-to-br from-accent/5 via-white to-secondary/5 overflow-hidden"
    >
      {/* Background decorations */}
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
      <div className="w-[70%] mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-h">
              Sensibilizamos y educamos sobre el maltrato animal
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                La Fundación Corteza Terrestre es fundada y tiene sus inicios a comienzos del año 2007, somos una organización sin ánimo de lucro que labora de manera voluntaria, nos dedicamos a la defensa y protección de los animales, trabajamos en la sensibilización de la comunidad, generando espacios de educación y atención básica a animales en condición de calle o víctimas de maltrato, así promovemos importantes cambios en la sociedad.
              </p>
              <p>
                Actualmente contamos con un hogar de paso, en el que albergamos más de 60 animales entre perros y gatos rescatados de la calle y el abandono, los recuperamos y posteriormente los damos en adopción. Los miembros de la organización somos veganos o vegetarianos, porque respetamos la libertad de todos los animales sin excepción de especies.
              </p>
              <p>
                Dentro de la fundación Corteza Terrestre adelantamos actividades para el sostenimiento económico de los animales como lo es el recaudo de fondos monetarios o de otras ayudas físicas, elementales para el funcionamiento del refugio, donados por la ciudadanía. También vendemos artículos para reducir desechos como cepillos en madera, vasos plegables, etc.; también ofrecemos regalos personalizados bajo nuestra marca <a href="/" className="text-primary font-semibold hover:underline">"Salvatore Souvenirs"</a> como, mugs, camisetas, caramañolas, manillas, gorras, llaveros, entre otros; así pretendemos ser auto-sostenibles.
              </p>
            </div>
          </motion.div>

          {/* Right image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 h-80 md:h-96 flex items-center justify-center">
              <div className="text-center text-text-muted">
                <div className="text-6xl mb-4">🐾</div>
                <p className="text-lg font-semibold">Fundación Corteza Terrestre</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Mission;
