import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';

const CtaBanner = () => (
    <section className="py-16 bg-white px-4">
        <div className="w-[70%] mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-primary/5 rounded-[48px] p-10 md:p-16 text-center relative overflow-hidden"
            >
                {/* Decorative rotating paw */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-0 right-0 opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none"
                >
                    <PawPrint size={280} className="text-primary" />
                </motion.div>

                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black text-text-h mb-4">
                        ¿No encuentras al indicado?
                    </h2>
                    <p className="text-text-muted text-lg mb-8 max-w-xl mx-auto font-medium leading-relaxed">
                        Déjanos tus datos y te avisamos cuando llegue un nuevo animal que coincida con lo que buscas.
                    </p>
                    <motion.a
                        href="/contacto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/20 transition-all"
                    >
                        Contáctanos
                    </motion.a>
                </div>
            </motion.div>
        </div>
    </section>
);

export default CtaBanner;