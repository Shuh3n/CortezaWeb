import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import LiveStream from '../components/LiveStream';
import WorkAxes from '../components/WorkAxes';
import Adoption from '../components/Adoption';
import Contact from '../components/Contact';

const Home = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <>
      <Hero />
      <Stats />
      <LiveStream />
      <WorkAxes />
      <Adoption />
      <Contact />
    </>
  );
};

export default Home;
