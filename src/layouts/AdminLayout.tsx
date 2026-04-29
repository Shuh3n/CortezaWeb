import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Download,
  ImagePlus,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  PawPrint,
  ShoppingBag,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAdminPwa } from '../hooks/useAdminPwa';

const navigation = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Principal' },
  { to: '/admin/peludos', label: 'Peludos', icon: PawPrint, section: 'Adopciones' },
  { to: '/admin/tienda', label: 'Tienda', icon: ShoppingBag, section: 'Comercio' },
  { to: '/admin/galeria', label: 'Galería', icon: ImagePlus, section: 'Contenido' },
  { to: '/admin/gestion', label: 'Gestión', icon: Settings, section: 'Configuración' },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const hoverExpandTimeoutRef = useRef<number | null>(null);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { canInstallPrompt, canShowIosGuide, isStandalone, installApp } = useAdminPwa(location.pathname.startsWith('/admin'));

  const adminName = useMemo(() => user?.email?.split('@')[0] ?? 'Admin', [user?.email]);
  const showExpandedDesktop = !isCollapsed || isHoverExpanded;

  // Auto-show iOS guide on first admin visit (no install button on iOS).
  useEffect(() => {
    if (!canShowIosGuide) return;
    const shown = localStorage.getItem('corteza-ios-install-shown');
    if (!shown) {
      const timer = window.setTimeout(() => {
        setShowInstallGuide(true);
        localStorage.setItem('corteza-ios-install-shown', '1');
      }, 2000);
      return () => window.clearTimeout(timer);
    }
  }, [canShowIosGuide]);

  useEffect(() => {
    return () => {
      if (hoverExpandTimeoutRef.current !== null) {
        window.clearTimeout(hoverExpandTimeoutRef.current);
      }
    };
  }, []);

  function handleSidebarMouseEnter() {
    if (!isCollapsed) {
      return;
    }

    if (hoverExpandTimeoutRef.current !== null) {
      window.clearTimeout(hoverExpandTimeoutRef.current);
    }

    hoverExpandTimeoutRef.current = window.setTimeout(() => {
      setIsHoverExpanded(true);
    }, 850);
  }

  function handleSidebarMouseLeave() {
    if (hoverExpandTimeoutRef.current !== null) {
      window.clearTimeout(hoverExpandTimeoutRef.current);
      hoverExpandTimeoutRef.current = null;
    }

    setIsHoverExpanded(false);
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('No se pudo cerrar la sesión.', error);
    }
  }

  async function handleInstall() {
    if (!canInstallPrompt) {
      setShowInstallGuide(true);
      return;
    }

    try {
      await installApp();
    } catch (error) {
      console.error('No se pudo abrir la instalación de la app.', error);
    }
  }

  // Button visible only when native install prompt is available (Android / PC) or already installed.
  const showInstallButton = canInstallPrompt || isStandalone;
  const installTitle = isStandalone ? 'Panel ya instalado' : 'Instalar el panel en este dispositivo';

  return (
    <div className="min-h-screen bg-neutral-soft text-text-main">
      <div className="flex min-h-screen">
        <aside
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
          className={`fixed inset-y-0 left-0 z-40 border-r border-white/5 bg-[linear-gradient(180deg,_#2d5a27_0%,_#1e3f1b_100%)] text-white shadow-[10px_0_40px_rgba(0,0,0,0.1)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${showExpandedDesktop ? 'w-72' : 'w-24'} lg:translate-x-0`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-6 py-8">
              {showExpandedDesktop ? (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4"
                >
                  <div className="relative">
                    <img src="/logo.png" alt="Corteza" className="h-11 w-11 rounded-2xl bg-white p-1.5 shadow-lg" />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#2d5a27] bg-emerald-400 shadow-sm" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Corteza</p>
                    <h1 className="text-xl font-black italic tracking-tighter">ADMIN</h1>
                  </div>
                </motion.div>
              ) : (
                <img src="/logo.png" alt="Corteza" className="h-11 w-11 rounded-2xl bg-white/10 p-1.5 shadow-lg backdrop-blur-md transition-transform hover:scale-110" />
              )}

              <button
                type="button"
                onClick={() => {
                  setIsHoverExpanded(false);
                  setIsCollapsed((current) => !current);
                }}
                className="hidden cursor-pointer rounded-xl bg-white/5 p-2 text-white/60 transition-all hover:bg-white/15 hover:text-white lg:inline-flex"
                aria-label="Colapsar panel lateral"
              >
                <ChevronLeft className={`h-5 w-5 transition-transform duration-500 ${showExpandedDesktop ? '' : 'rotate-180'}`} />
              </button>
            </div>

            <div className="flex-1 space-y-8 px-4 py-4 overflow-y-auto custom-scrollbar">
              {/* Agrupamos por secciones si está expandido */}
              {Array.from(new Set(navigation.map(n => n.section))).map((section) => (
                <div key={section} className="space-y-2">
                  {showExpandedDesktop && (
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                      {section}
                    </p>
                  )}
                  {navigation.filter(n => n.section === section).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`group relative flex items-center rounded-2xl px-4 py-3.5 font-bold transition-all duration-300 cursor-pointer ${
                          showExpandedDesktop ? 'gap-4 justify-start' : 'justify-center'
                        } ${isActive 
                          ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        title={item.label}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="active-pill"
                            className="absolute left-0 h-6 w-1 rounded-r-full bg-accent"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 text-accent' : 'group-hover:scale-110'}`} />
                        {showExpandedDesktop ? <span className="text-sm tracking-tight">{item.label}</span> : null}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="p-4 space-y-4">
              <div className={`flex items-center gap-3 rounded-[24px] bg-black/20 p-3 backdrop-blur-xl border border-white/5 ${showExpandedDesktop ? '' : 'justify-center'}`}>
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-accent to-secondary p-0.5 shadow-lg">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1e3f1b] text-sm font-black uppercase">
                    {adminName[0]}
                  </div>
                </div>
                {showExpandedDesktop && (
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black uppercase tracking-widest text-accent">Admin</p>
                    <p className="truncate text-[11px] font-bold text-white/50">{user?.email}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {showInstallButton && (
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={handleInstall}
                      disabled={isStandalone}
                      className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-white/10 transition-all active:scale-95 ${
                        isStandalone 
                          ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                          : 'bg-white/5 text-white hover:bg-white/15'
                      }`}
                    >
                      <Download size={20} />
                    </button>
                    
                    {/* Tooltip personalizado */}
                    <div className="absolute bottom-full left-0 mb-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap"
                      >
                        {installTitle}
                        <div className="absolute top-full left-5 -mt-1 border-4 border-transparent border-t-slate-900" />
                      </motion.div>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={`flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 ${showExpandedDesktop ? 'flex-1 gap-2 text-xs font-black uppercase tracking-widest' : 'w-12'}`}
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                  {showExpandedDesktop && <span>Salir</span>}
                </button>
              </div>
            </div>
          </div>
        </aside>


        <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${showExpandedDesktop ? 'lg:pl-72' : 'lg:pl-24'}`}>
          <header className="sticky top-0 z-30 border-b border-primary/10 bg-neutral-soft/95 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">Administración</p>
                <h2 className="text-2xl font-black text-primary">Fundación Corteza Terrestre</h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="cursor-pointer rounded-2xl border border-primary/10 bg-white p-3 text-primary shadow-sm lg:hidden"
                  aria-label="Abrir menú"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {isStandalone ? (
              <div className="mb-5 rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm font-medium text-primary shadow-sm">
                Aplicación instalada: ya puedes abrir este panel desde tu escritorio o pantalla principal.
              </div>
            ) : null}
            <Outlet />
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showInstallGuide ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-h">Instalar aplicación</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    {canShowIosGuide
                      ? 'Safari no muestra botón automático. Hazlo manualmente en 3 pasos:'
                      : 'Si el navegador no mostró el prompt, puedes instalarla manualmente en PC desde el menú del navegador.'}
                  </p>
                </div>
              </div>

              {canShowIosGuide ? (
                <ol className="mt-5 space-y-3 text-sm text-text-main">
                  <li className="rounded-2xl bg-neutral-soft px-4 py-3">
                    1. Tocá el botón <span className="font-semibold">Compartir</span> en Safari.
                  </li>
                  <li className="rounded-2xl bg-neutral-soft px-4 py-3">
                    2. Elegí <span className="font-semibold">Agregar a pantalla de inicio</span>.
                  </li>
                  <li className="rounded-2xl bg-neutral-soft px-4 py-3">
                    3. Confirmá con <span className="font-semibold">Agregar</span> y abrí el panel desde el ícono.
                  </li>
                </ol>
              ) : (
                <ol className="mt-5 space-y-3 text-sm text-text-main">
                  <li className="rounded-2xl bg-neutral-soft px-4 py-3">
                    1. Abrí el menú del navegador (Chrome/Edge: <span className="font-semibold">⋮</span>).
                  </li>
                  <li className="rounded-2xl bg-neutral-soft px-4 py-3">
                    2. Seleccioná <span className="font-semibold">Instalar app</span> o <span className="font-semibold">Agregar a escritorio</span>.
                  </li>
                  <li className="rounded-2xl bg-neutral-soft px-4 py-3">
                    3. Confirmá instalación y abrí Corteza desde el acceso directo.
                  </li>
                </ol>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInstallGuide(false)}
                  className="rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:opacity-90 cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
        {isSidebarOpen ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Cerrar menú lateral"
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
