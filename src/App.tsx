import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import WorkAxes from './components/WorkAxes';
import Adoption from './components/Adoption';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-neutral-soft">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <WorkAxes />
        <Adoption />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
