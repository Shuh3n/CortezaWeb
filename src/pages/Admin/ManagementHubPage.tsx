import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { PawPrint, Fingerprint, FolderCog } from 'lucide-react';

const managementOptions = [
  {
    to: '/admin/gestion/especies',
    label: 'Especies',
    description: 'Administra las especies de peludos (Perro, Gato, etc.)',
    icon: PawPrint,
    color: 'bg-emerald-500',
  },
  {
    to: '/admin/gestion/razas',
    label: 'Razas',
    description: 'Gestiona las razas asociadas a cada especie.',
    icon: Fingerprint,
    color: 'bg-blue-500',
  },
  {
    to: '/admin/gestion/categorias',
    label: 'Categorías Galería',
    description: 'Organiza las fotos de la galería por categorías.',
    icon: FolderCog,
    color: 'bg-amber-500',
  },
];

export default function ManagementHubPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="space-y-8"
    >
      <section className="rounded-[32px] bg-white p-6 shadow-lg shadow-primary/5 sm:p-8 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/60">Configuración</p>
        <h1 className="mt-2 text-3xl font-black text-text-h">Centro de Gestión</h1>
        <p className="mt-3 text-text-muted text-lg max-w-2xl">
          Administra los datos maestros y la estructura del sitio desde un solo lugar.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {managementOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={option.to}
                className="group block h-full rounded-[32px] border border-primary/5 bg-white p-8 transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className={`inline-flex rounded-2xl ${option.color} p-4 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon size={32} />
                </div>
                <h2 className="mt-6 text-2xl font-black text-text-h group-hover:text-primary transition-colors">
                  {option.label}
                </h2>
                <p className="mt-2 text-text-muted leading-relaxed">
                  {option.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-2">
                  <span>Gestionar</span>
                  <div className="h-px w-8 bg-primary" />
                </div>
              </NavLink>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
