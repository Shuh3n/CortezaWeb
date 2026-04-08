import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Volunteer from './pages/Volunteer';
import About from './pages/About';
import Contact from './pages/Contact';
import Salvaton from './pages/Salvaton';
import StorePage from './pages/StorePage';
import { ModalProvider } from './context/ModalContext';

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
      <ModalProvider>
        <div className="min-h-screen bg-neutral-soft">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/voluntario" element={<Volunteer />} />
              <Route path="/nosotros" element={<About />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/salvaton" element={<Salvaton />} />
              <Route path="/tienda" element={<StorePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ModalProvider>
    </Router>
  );
}

export default App;
