import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openDonationModal } = useModal();
  const location = useLocation();

  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Galería', path: '/galeria' },
    { label: 'Voluntario', path: '/voluntario' },
    { label: 'Nosotros', path: '/nosotros' },
    { label: 'Salvatón', path: '/salvaton' },
    { label: 'Contacto', path: '/contacto' },
  ];

  const isActive = (path: string) => (path === '/galeria' ? location.pathname.startsWith('/galeria') : location.pathname === path);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-slate-200 bg-neutral-soft/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <img src="/logo.png" alt="Fundación Corteza Terrestre" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="leading-none tracking-tight text-lg font-bold text-primary">Fundación</span>
                <span className="leading-none tracking-tighter text-xl font-black text-primary">Corteza Terrestre</span>
              </div>
            </Link>
          </motion.div>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <motion.div key={item.label}>
                <Link
                  to={item.path}
                  className={`relative font-bold transition-colors ${isActive(item.path) ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                >
                  <motion.span whileHover={{ y: -2 }}>{item.label}</motion.span>
                  {isActive(item.path) ? <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary" /> : null}
                </Link>
              </motion.div>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openDonationModal}
              className="cursor-pointer rounded-full bg-primary px-6 py-2.5 font-bold text-white shadow-md shadow-primary/10 transition-all hover:bg-opacity-90"
            >
              Donar
            </motion.button>
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="z-50 text-text-muted hover:text-primary focus:outline-none cursor-pointer">
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-slate-100 bg-white shadow-xl md:hidden"
          >
            <div className="space-y-4 px-4 py-6">
              {navItems.map((item, index) => (
                <Link key={item.label} to={item.path}>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => setIsOpen(false)}
                    className={`block border-l-4 px-3 py-2 text-lg font-bold transition-all ${
                      isActive(item.path)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-transparent text-text-muted hover:border-primary hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </motion.div>
                </Link>
              ))}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                onClick={() => {
                  setIsOpen(false);
                  openDonationModal();
                }}
                className="mt-4 w-full cursor-pointer rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/20"
              >
                Donar ahora
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
