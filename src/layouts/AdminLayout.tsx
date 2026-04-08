import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, FolderCog, ImagePlus, Info, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAdminPwa } from '../hooks/useAdminPwa';

const navigation = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/galeria', label: 'Galería', icon: ImagePlus },
  { to: '/admin/gestion', label: 'Gestión', icon: FolderCog },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const [showIosInstallGuide, setShowIosInstallGuide] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { canInstall, canInstallPrompt, canShowIosGuide, isStandalone, installApp } = useAdminPwa(location.pathname.startsWith('/admin'));

  const adminName = useMemo(() => user?.email ?? 'Administrador', [user?.email]);
  const showExpandedDesktop = !isCollapsed || isHoveringSidebar;

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('No se pudo cerrar la sesión.', error);
    }
  }

  async function handleInstall() {
    if (!canInstallPrompt && canShowIosGuide) {
      setShowIosInstallGuide(true);
      return;
    }

    try {
      await installApp();
    } catch (error) {
      console.error('No se pudo abrir la instalación de la app.', error);
    }
  }

  const installLabel = canInstallPrompt ? 'Descargar app' : 'Instalar en iPhone';
  const installTitle = canInstallPrompt
    ? 'Instalar el panel en este dispositivo'
    : 'Ver pasos para instalar el panel en iPhone';

  return (
    <div className="min-h-screen bg-neutral-soft text-text-main">
      <div className="flex min-h-screen">
        <aside
          onMouseEnter={() => setIsHoveringSidebar(true)}
          onMouseLeave={() => setIsHoveringSidebar(false)}
          className={`fixed inset-y-0 left-0 z-40 border-r border-primary/10 bg-primary text-white shadow-2xl transition-all duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${showExpandedDesktop ? 'w-72' : 'w-24'} lg:translate-x-0`}
        >
          <div className="flex h-full flex-col">
            <div className={`flex border-b border-white/10 px-4 py-6 ${showExpandedDesktop ? 'items-center justify-between' : 'justify-center'}`}>
              {showExpandedDesktop ? (
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/70">Panel</p>
                  <h1 className="text-2xl font-black">Corteza</h1>
                </div>
              ) : (
                <img src="/icons/favicon-48x48.png" alt="Corteza" className="h-10 w-10 rounded-2xl bg-white/10 p-2" />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCollapsed((current) => !current)}
                  className="hidden cursor-pointer rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 lg:inline-flex"
                  aria-label="Colapsar panel lateral"
                >
                  <ChevronLeft className={`h-5 w-5 transition-transform ${showExpandedDesktop ? '' : 'rotate-180'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="cursor-pointer rounded-full bg-white/10 p-2 lg:hidden"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className={`border-b border-white/10 px-4 py-5 ${showExpandedDesktop ? 'block' : 'hidden'}`}>
              <p className="text-sm text-white/70">Sesión iniciada con</p>
              <p className="mt-1 break-all font-semibold">{adminName}</p>
            </div>

            <nav className="flex-1 space-y-2 px-3 py-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center rounded-2xl px-4 py-3 font-semibold transition cursor-pointer ${
                        showExpandedDesktop ? 'gap-3 justify-start' : 'justify-center'
                      } ${isActive ? 'bg-white text-primary shadow-lg' : 'text-white/85 hover:bg-white/10 hover:text-white'}`
                    }
                    title={item.label}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {showExpandedDesktop ? <span>{item.label}</span> : null}
                  </NavLink>
                );
              })}
            </nav>

            <div className="space-y-3 border-t border-white/10 p-3">
              {canInstall ? (
                <button
                  type="button"
                  onClick={handleInstall}
                  className={`flex w-full cursor-pointer items-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-bold text-white transition hover:bg-white/15 ${
                    showExpandedDesktop ? 'justify-center gap-2' : 'justify-center'
                  }`}
                  title={installTitle}
                >
                  <Download className="h-5 w-5 shrink-0" />
                  {showExpandedDesktop ? <span>{installLabel}</span> : null}
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className={`flex w-full cursor-pointer items-center rounded-2xl bg-accent px-4 py-3 font-bold text-white shadow-lg shadow-black/10 transition hover:opacity-90 ${
                  showExpandedDesktop ? 'justify-center gap-2' : 'justify-center'
                }`}
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {showExpandedDesktop ? <span>Cerrar sesión</span> : null}
              </button>
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
                {canInstall ? (
                  <button
                    type="button"
                    onClick={handleInstall}
                    className="hidden cursor-pointer rounded-2xl border border-primary/10 bg-white px-4 py-3 font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 lg:inline-flex lg:items-center lg:gap-2"
                    title={installTitle}
                  >
                    <Download className="h-4 w-4" />
                    {installLabel}
                  </button>
                ) : null}
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
        {showIosInstallGuide ? (
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
                  <h3 className="text-xl font-black text-text-h">Instalar en iPhone</h3>
                  <p className="mt-1 text-sm text-text-muted">Safari no muestra botón automático. Hazlo manualmente en 3 pasos:</p>
                </div>
              </div>

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

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowIosInstallGuide(false)}
                  className="rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:opacity-90"
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
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Cerrar menú lateral"
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
