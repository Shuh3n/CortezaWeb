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
    { label: 'Adopción', path: '/#adopcion' },
    { label: 'Tienda', path: '/tienda' },
    { label: 'Nosotros', path: '/nosotros' },
    { label: 'Voluntario', path: '/voluntario' },
    { label: 'Salvatón', path: '/salvaton' },
    { label: 'Contacto', path: '/contacto' },
  ];

  const isHome = location.pathname === '/';

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    const currentHash = location.hash;

    if (path === '/') {
      return currentPath === '/' && !currentHash;
    }
    
    if (path.includes('#')) {
      const [p, h] = path.split('#');
      return currentPath === p && currentHash === `#${h}`;
    }

    return currentPath === path;
  };

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    if (path === '/' && isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (path.startsWith('/#') && isHome) {
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-soft/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Corteza Terrestre Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-primary tracking-tight leading-none">Fundación</span>
                <span className="text-xl font-black text-primary tracking-tighter leading-none">Corteza Terrestre</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <motion.div key={item.label} whileHover={{ y: -2 }}>
                <Link
                  to={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`relative transition-colors font-bold ${isActive(item.path) ? 'text-primary' : 'text-text-muted hover:text-primary'
                    }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openDonationModal}
              className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-md shadow-primary/10"
            >
              Donar
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-muted hover:text-primary focus:outline-none z-50"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, i) => (
                <Link key={item.label} to={item.path} onClick={() => handleNavClick(item.path)}>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`block px-3 py-2 text-lg font-bold border-l-4 transition-all ${isActive(item.path)
                      ? 'text-primary border-primary bg-primary/5'
                      : 'text-text-muted border-transparent hover:border-primary hover:text-primary'
                      }`}
                  >
                    {item.label}
                  </motion.div>
                </Link>
              ))}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  setIsOpen(false);
                  openDonationModal();
                }}
                className="w-full bg-primary text-white px-6 py-4 rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20"
              >
                Donar Ahora
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
