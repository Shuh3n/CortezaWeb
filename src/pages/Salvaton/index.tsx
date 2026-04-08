import { motion } from 'framer-motion';
import SalvatonHero from './sections/Hero';
import SalvatonInfo from './sections/Info';
import SalvatonCities from './sections/Cities';

const Salvaton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <SalvatonHero />
      <SalvatonInfo />
      <SalvatonCities />
    </motion.div>
  );
};

export default Salvaton;
