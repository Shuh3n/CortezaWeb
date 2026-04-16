import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
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
import AdminGalleryCategoriesPage from './pages/Admin/GalleryCategoriesPage';
import AdminGalleryUploadsPage from './pages/Admin/GalleryUploadsPage';
import AdminProductManagerPage from './pages/Admin/ProductManagerPage';
import Pets from "./pages/Pets";

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
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
              <Route path="galeria/categorias" element={<AdminGalleryCategoriesPage />} />
              <Route path="galeria/cargas" element={<AdminGalleryUploadsPage />} />
              <Route path="gestion" element={<Navigate to="/admin/galeria/categorias" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
