import { Outlet } from 'react-router-dom';
import { Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAdminPwa } from '../hooks/useAdminPwa';

export default function PublicLayout() {
  const { canInstall, canInstallPrompt, isIos, installApp } = useAdminPwa(true);

  async function handleInstallClick() {
    if (!canInstallPrompt) {
      if (isIos) {
        window.alert('En iPhone: abrí Compartir en Safari y elegí "Agregar a pantalla de inicio".');
      } else {
        window.alert('En PC: abrí el menú del navegador (Chrome/Edge) y elegí "Instalar app" o "Agregar a escritorio".');
      }
      return;
    }

    await installApp();
  }

  return (
    <div className="min-h-screen bg-neutral-soft">
      <Navbar />
      <main>
        <Outlet />
      </main>
      {canInstall ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:opacity-90"
          title="Instalar aplicación"
        >
          <Download className="h-4 w-4" />
          {isIos ? 'Instalar en iPhone' : 'Instalar en PC'}
        </button>
      ) : null}
      <Footer />
    </div>
  );
}
