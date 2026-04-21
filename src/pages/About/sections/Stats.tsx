import { motion } from 'framer-motion';
import { Heart, PawPrint, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Stats = () => {
    const { t } = useTranslation();

    const stats = [
        { icon: PawPrint, number: '259', label: t('about.stats.items.0.label') },
        { icon: Heart, number: '219', label: t('about.stats.items.1.label') },
        { icon: Users, number: '14', label: t('about.stats.items.2.label') }
    ];

    return (
        <section className="relative py-16 md:py-24 px-4 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="/images/bg-counter.jpg" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
            </div>

            <div className="w-[70%] mx-auto relative z-10">
                <motion.div initial="hidden" whileInView="visible" transition={{ staggerChildren: 0.2 }} className="grid md:grid-cols-3 gap-8 mb-16">
                    {stats.map((stat, index) => (
                        <motion.div key={index} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-xl">
                            <div className="flex justify-center mb-4"><stat.icon className="w-12 h-12 text-white" /></div>
                            <h3 className="text-4xl font-bold text-white mb-2">{stat.number}</h3>
                            <p className="text-white/80 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 shadow-2xl">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{t('about.stats.mensaje_titulo')}</h3>
                    <p className="text-white/80 leading-relaxed text-lg font-medium">{t('about.stats.mensaje_desc')}</p>
                </motion.div>
            </div>
        </section>
    );
};

export default Stats;