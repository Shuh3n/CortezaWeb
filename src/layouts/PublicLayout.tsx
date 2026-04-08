import { Outlet } from 'react-router-dom';
import { Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAdminPwa } from '../hooks/useAdminPwa';

export default function PublicLayout() {
  const { canInstall, canInstallPrompt, installApp } = useAdminPwa(true);

  async function handleInstallClick() {
    if (!canInstallPrompt) {
      window.alert('Abrí el menú del navegador y elegí "Instalar app" o "Agregar a pantalla de inicio".');
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
          Instalar app
        </button>
      ) : null}
      <Footer />
    </div>
  );
}
