import { motion } from 'framer-motion';
import { CheckCircle2, Heart } from 'lucide-react';

const sponsorCommitments = [
    'Una ayuda mínima por el animal que decidas apadrinar es de $50.000 COP al mes.',
    'Dejar que la fundación cubra las necesidades básicas del animal con el dinero aportado.',
    'Responder por gastos extras en medicina o tratamientos, en caso de ser necesario.',
    'Puedes visitar, incluso darle un paseo fuera de las instalaciones de la fundación, durante uno o varios días. Esto será acordado previamente por la logística que esto implica.',
];

const adoptCommitments = [
    'No abandonar a tu mascota por ningún motivo (vejez, comportamiento, enfermedad, etc.).',
    'Tratarlo con amor y respeto. No lo dejarás expuesto a las inclemencias del clima, tampoco a una soledad prolongada, especialmente en época de vacaciones, no lo entregarás a zoonosis, perreras o universidades para experimentación, mucho menos para ser comercializado o explotado.',
    'Suministrarle atención médica adecuada cuando lo necesite.',
    'Esterilizar a tu peludo. Este es un compromiso fundamental; si te niegas, nos negamos a aprobar su adopción.',
    'Recibir visitas de control. Para nosotros es fundamental garantizar la adaptación de nuestros animales a su nuevo hogar, por ello hacemos visitas de seguimiento.',
];

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

const Commitments = () => (
    <section className="py-16 bg-white px-4">
        <div className="w-[70%] mx-auto">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center max-w-3xl mx-auto mb-12"
            >
                <h2 className="text-4xl md:text-5xl font-bold text-text-h mb-6">
                    Adopta un amor para toda la vida
                </h2>
                <p className="text-xl text-text-muted font-medium leading-relaxed">
                    Hay muchas razones para adoptar un animal, pero la mejor de todas es que salvarás una vida
                    y a cambio tendrás su amor incondicional e inigualable.
                </p>
            </motion.div>

            {/* Two columns */}
            <div className="grid md:grid-cols-2 gap-8">

                {/* Sponsor */}
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
                            Cuando apadrinas te comprometes a:
                        </h3>
                    </div>
                    <CommitmentList items={sponsorCommitments} icon="heart" />
                </motion.div>

                {/* Adopt */}
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
                            Cuando adoptas te comprometes a:
                        </h3>
                    </div>
                    <CommitmentList items={adoptCommitments} />
                </motion.div>

            </div>
        </div>
    </section>
);

export default Commitments;