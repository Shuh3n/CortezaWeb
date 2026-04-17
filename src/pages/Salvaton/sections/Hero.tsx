import { motion } from 'framer-motion';
import { useModal } from '../../../context/ModalContext';

const SalvatonHero = () => {
  const { openDonationModal } = useModal();

  return (
    <section className="relative pt-40 pb-20 px-4 overflow-hidden bg-primary text-white">
      {/* Basic Background Image - No Fixed Effect */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/baner-salvaton.jpg"
          alt=""
          className="w-full h-full object-cover brightness-75 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
      </div>

      <div className="w-[70%] mx-auto relative z-10 text-center lg:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent font-bold text-sm mb-6 tracking-widest uppercase"
          >
            Campaña Solidaria
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-8">
            Gran Plan <br />
            <span className="text-accent underline decoration-white/20 decoration-8 underline-offset-8">Salvatón</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl font-medium leading-relaxed">
            Dona alimento y ayúdanos a seguir protegiendo a los animales rescatados de Armenia y el Quindío.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openDonationModal}
              className="bg-accent text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-accent/20 hover:shadow-accent/40 transition-all cursor-pointer"
            >
              Quiero Donar
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default SalvatonHero;
