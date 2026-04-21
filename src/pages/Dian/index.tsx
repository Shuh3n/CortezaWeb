import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    FileText,
    FileBarChart,
    ShieldCheck,
    FileSignature,
    Landmark,
    Users,
    Scale,
    AlertTriangle
} from 'lucide-react';

const dianDocumentsBase = [
    { icon: FileBarChart, url: 'https://kxuppzqnlmprozyprjuz.supabase.co/storage/v1/object/public/documentos-dian/informe-gestion.pdf' },
    { icon: Landmark, url: 'https://kxuppzqnlmprozyprjuz.supabase.co/storage/v1/object/public/documentos-dian/estados-financieros.pdf' },
    { icon: ShieldCheck, url: 'https://kxuppzqnlmprozyprjuz.supabase.co/storage/v1/object/public/documentos-dian/requisitos-esal.pdf' },
    { icon: FileSignature, url: 'https://kxuppzqnlmprozyprjuz.supabase.co/storage/v1/object/public/documentos-dian/acta-constitucion.pdf' },
    { icon: FileText, url: 'https://kxuppzqnlmprozyprjuz.supabase.co/storage/v1/object/public/documentos-dian/certificado-existencia.pdf' },
    { icon: Users, url: 'https://kxuppzqnlmprozyprjuz.supabase.co/storage/v1/object/public/documentos-dian/acta-asamblea.pdf' },
    { icon: Scale, url: 'https://kxuppzqnlmprozyprjuz.supabase.co/storage/v1/object/public/documentos-dian/estatutos.pdf' },
    { icon: AlertTriangle, url: 'https://kxuppzqnlmprozyprjuz.supabase.co/storage/v1/object/public/documentos-dian/responsabilidad-penal.pdf' },
];

export default function DianPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50 pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 -skew-y-6 transform origin-top-left -z-10" />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="text-sm font-bold tracking-[0.3em] uppercase text-primary/70 block mb-3">
                            {t('dian.etiqueta')}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-text-h mb-6 tracking-tight">
                            {t('dian.titulo')}
                        </h1>
                        <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
                            {t('dian.descripcion')}
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dianDocumentsBase.map((doc, idx) => {
                        const Icon = doc.icon;
                        return (
                            <motion.a
                                key={idx}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.4 }}
                                className="group flex flex-col items-center p-8 bg-white/70 backdrop-blur-md border border-white/60 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <Icon size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-center font-bold text-text-main leading-tight mb-3">
                                    {t(`dian.documentos.${idx}.titulo`)}
                                </h3>
                                <span className="mt-auto text-sm font-semibold text-primary/70 group-hover:text-primary transition-colors flex items-center gap-1">
                                    {t('dian.ver_documento')}
                                </span>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}