import { motion } from 'framer-motion';
import VolunteerHero from './sections/Hero';
import VolunteerAreas from './sections/Areas';
import VolunteerRequirements from './sections/Requirements';
import VolunteerTestimonials from './sections/Testimonials';

export default function Volunteer() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <VolunteerHero />
      <VolunteerAreas />
      <VolunteerRequirements />
      <VolunteerTestimonials />
    </motion.div>
  );
}
