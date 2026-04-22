import { motion } from 'framer-motion';
import { CheckCircle2, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CommitmentList = ({
                            items,
                            icon,
                        }: {
    items: string[];
    icon?: 'heart';
}) => (
    <ul className="space-y-4">
        {items.map((item, i) => (
            <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3 items-start"
            >
                <span className="mt-0.5 flex-shrink-0 text-primary">
                  {icon === 'heart'
                      ? <Heart size={18} className="fill-primary" />
                      : <CheckCircle2 size={18} />
                  }
                </span>
                <p className="text-text-muted font-medium leading-relaxed text-sm">{item}</p>
            </motion.li>
        ))}
    </ul>
);

const Commitments = () => {
    const { t } = useTranslation();
    const sponsorCommitments = t('mascotas.compromisos.items_apadrinar', { returnObjects: true }) as string[];
    const adoptCommitments = t('mascotas.compromisos.items_adoptar', { returnObjects: true }) as string[];

    return (
        <section className="py-16 bg-white px-4">
            <div className="w-[70%] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-text-h mb-6">
                        {t('mascotas.compromisos.titulo_principal')}
                    </h2>
                    <p className="text-xl text-text-muted font-medium leading-relaxed">
                        {t('mascotas.compromisos.desc_principal')}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-primary/5 rounded-[32px] p-8 border border-primary/10"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Heart size={20} className="text-white fill-white" />
                            </div>
                            <h3 className="text-xl font-black text-text-h">
                                {t('mascotas.compromisos.titulo_apadrinar')}
                            </h3>
                        </div>
                        <CommitmentList items={sponsorCommitments} icon="heart" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-primary/5 rounded-[32px] p-8 border border-primary/10"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 size={20} className="text-white" />
                            </div>
                            <h3 className="text-xl font-black text-text-h">
                                {t('mascotas.compromisos.titulo_adoptar')}
                            </h3>
                        </div>
                        <CommitmentList items={adoptCommitments} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Commitments;