import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useLayoutEffect, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Volunteer from './pages/Volunteer';
import About from './pages/About';
import Contact from './pages/Contact';
import Salvaton from './pages/Salvaton';
import PublicGalleryPage from './pages/Gallery';
import StorePage from './pages/StorePage';
import DianPage from './pages/Dian';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { ModalProvider } from './context/ModalContext';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginPage from './pages/Admin/LoginPage';
import AdminDashboardPage from './pages/Admin/DashboardPage';
import AdminGalleryPage from './pages/Admin/GalleryPage';
import AdminProductManagerPage from './pages/Admin/ProductManagerPage';
import Pets from "./pages/Pets";
import PetManagement from './pages/Admin/PetManagement';

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function GlobalLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-8"
      >
        <img src="/favicon.ico" alt="Corteza Logo" className="h-24 w-24 object-contain" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl"
        />
      </motion.div>

      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-primary/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full rounded-full bg-primary"
        />
      </div>
      
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 animate-pulse">
        Cargando Corteza
      </p>
    </motion.div>
  );
}

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1800); // Un poco más de tiempo para que se vea la barrita
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        {isAppLoading && <GlobalLoader key="global-loader" />}
      </AnimatePresence>
      
      {!isAppLoading && (
        <AuthProvider>
          <ModalProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/adoptar" element={<Pets />} />
                <Route path="/galeria" element={<PublicGalleryPage />} />
                <Route path="/galeria/:slug" element={<PublicGalleryPage />} />
                <Route path="/voluntario" element={<Volunteer />} />
                <Route path="/nosotros" element={<About />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/salvaton" element={<Salvaton />} />
                <Route path="/tienda" element={<StorePage />} />
                <Route path="/dian" element={<DianPage />} />
                <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
              </Route>

              <Route path="/admin" element={<AdminLoginPage />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="galeria" element={<AdminGalleryPage />} />
                <Route path="tienda" element={<AdminProductManagerPage />} />
                <Route path="gestion" element={<Navigate to="/admin/galeria" replace />} />
                <Route path="peludos" element={<PetManagement />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ModalProvider>
        </AuthProvider>
      )}
    </Router>
  );
}

export default App;
