import SalvatoreStore from '../components/SalvatoreStore';
import { useEffect } from 'react';

const StorePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <SalvatoreStore />
    </div>
  );
};

export default StorePage;
