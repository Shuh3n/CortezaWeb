import { motion } from 'framer-motion';
import AboutHero from './sections/Hero';
import Mission from './sections/Mission';
import Team from './sections/Team';
import Stats from './sections/Stats';
import Testimonials from './sections/Testimonials';

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AboutHero />
      <Mission />
      <Team />
      <Stats />
      <Testimonials />
    </motion.div>
  );
};

export default About;
