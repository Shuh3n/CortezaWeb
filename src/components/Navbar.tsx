import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'es', label: 'ES', flagUrl: 'https://flagcdn.com/w40/co.png', name: 'Español' },
  { code: 'en', label: 'EN', flagUrl: 'https://flagcdn.com/w40/us.png', name: 'English' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const { openDonationModal } = useModal();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: t('navbar.menu.inicio'), path: '/' },
    { label: t('navbar.menu.nosotros'), path: '/nosotros' },
    { label: t('navbar.menu.salvaton'), path: '/salvaton' },
    { label: t('navbar.menu.adoptar'), path: '/adoptar' },
    { label: t('navbar.menu.voluntario'), path: '/voluntario' },
    { label: t('navbar.menu.tienda'), path: '/tienda' },
    { label: t('navbar.menu.galeria'), path: '/galeria' },
    { label: t('navbar.menu.contacto'), path: '/contacto' },
  ];

  const currentLanguage = languages.find(l => i18n.language.startsWith(l.code)) || languages[0];

  const toggleLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLangOpen(false);
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    const currentHash = location.hash;
    if (path === '/') return currentPath === '/' && !currentHash;
    if (path.includes('#')) {
      const [p, h] = path.split('#');
      return currentPath === p && currentHash === `#${h}`;
    }
    if (path === '/galeria') return currentPath.startsWith('/galeria');
    return currentPath === path;
  };

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    if (path.includes('#')) {
      const [p, h] = path.split('#');
      if (location.pathname === p) {
        const element = document.getElementById(h);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    if (location.pathname === path && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
      <nav className="fixed top-0 left-0 w-full z-50 bg-neutral-soft/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo Section */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                <div className="flex flex-col">
                  <span className="leading-none tracking-tight text-lg font-bold text-primary">{t('navbar.fundacion')}</span>
                  <span className="leading-none tracking-tighter text-xl font-black text-primary">Corteza Terrestre</span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {navItems.map((item) => (
                  <motion.div key={item.path} whileHover={{ y: -2 }}>
                    <Link
                        to={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`relative transition-colors font-bold text-sm lg:text-base ${isActive(item.path) ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                    >
                      {item.label}
                      {isActive(item.path) && (
                          <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </Link>
                  </motion.div>
              ))}

              {/* Language Dropdown (Desktop) */}
              <div className="relative ml-2" ref={langMenuRef}>
                <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/50 hover:bg-white transition-all font-bold text-sm text-text-muted hover:text-primary cursor-pointer"
                >
                  <img
                      src={currentLanguage.flagUrl}
                      alt={currentLanguage.label}
                      className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm"
                  />
                  <span>{currentLanguage.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isLangOpen && (
                      <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                      >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => toggleLanguage(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                                    i18n.language.startsWith(lang.code)
                                        ? 'bg-primary/5 text-primary'
                                        : 'text-text-muted hover:bg-slate-50 hover:text-primary'
                                }`}
                            >
                              <img
                                  src={lang.flagUrl}
                                  alt={lang.label}
                                  className="w-6 h-4 object-cover rounded-[2px] shadow-sm"
                              />
                              <span>{lang.name}</span>
                            </button>
                        ))}
                      </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openDonationModal}
                  className="cursor-pointer rounded-full bg-primary px-5 py-2 font-bold text-white shadow-md shadow-primary/10 transition-all hover:bg-opacity-90 text-sm lg:text-base"
              >
                {t('navbar.donar')}
              </motion.button>
            </div>

            {/* Mobile Button */}
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="z-50 text-text-muted hover:text-primary focus:outline-none cursor-pointer">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                  className="overflow-hidden border-t border-slate-100 bg-white shadow-xl md:hidden"
              >
                <div className="px-4 py-6 space-y-4">
                  {navItems.map((item, i) => (
                      <Link key={item.path} to={item.path} onClick={() => handleNavClick(item.path)}>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`block px-3 py-2 text-lg font-bold border-l-4 ${isActive(item.path) ? 'text-primary border-primary bg-primary/5' : 'text-text-muted border-transparent'}`}
                        >
                          {item.label}
                        </motion.div>
                      </Link>
                  ))}

                  {/* Language Selection (Mobile) */}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="px-3 mb-3 text-xs font-black text-slate-400 uppercase tracking-widest">Idioma / Language</p>
                    <div className="grid grid-cols-2 gap-3 px-3">
                      {languages.map((lang) => (
                          <button
                              key={lang.code}
                              onClick={() => { toggleLanguage(lang.code); setIsOpen(false); }}
                              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold cursor-pointer ${
                                  i18n.language.startsWith(lang.code)
                                      ? 'border-primary bg-primary/5 text-primary'
                                      : 'border-slate-100 text-text-muted'
                              }`}
                          >
                            <img
                                src={lang.flagUrl}
                                alt={lang.label}
                                className="w-6 h-4 object-cover rounded-[2px] shadow-sm"
                            />
                            {lang.label}
                          </button>
                      ))}
                    </div>
                  </div>

                  <motion.button
                      onClick={() => { setIsOpen(false); openDonationModal(); }}
                      className="mt-6 w-full cursor-pointer rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/20"
                  >
                    {t('navbar.donar_ahora')}
                  </motion.button>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </nav>
  );
};

export default Navbar;