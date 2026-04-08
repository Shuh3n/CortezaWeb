import { motion } from 'framer-motion';

const Map = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center items-center py-12 px-4 bg-neutral-soft"
    >
      <div className="h-96 md:h-[500px] w-[70%] overflow-hidden rounded-3xl shadow-xl shadow-primary/10 border border-primary/20">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.426867570262!2d-75.65951842991537!3d4.560392533605088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38f4e78b56057f%3A0xcc30c8e6cbb01e59!2sCl.%2022%20Nte.%20%2317-15%2C%20Armenia%2C%20Quind%C3%ADo%2C%20Colombia!5e0!3m2!1ses!2sde!4v1585151418716!5m2!1ses!2sde"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación Fundación Corteza Terrestre"
        />
      </div>
    </motion.section>
  );
};

export default Map;
