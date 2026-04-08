import { createContext, useContext, useState, type ReactNode } from 'react';
import DonationModal from '../components/DonationModal';

interface ModalContextType {
  openDonationModal: () => void;
  closeDonationModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const openDonationModal = () => setIsDonationModalOpen(true);
  const closeDonationModal = () => setIsDonationModalOpen(false);

  return (
    <ModalContext.Provider value={{ openDonationModal, closeDonationModal }}>
      {children}
      <DonationModal isOpen={isDonationModalOpen} onClose={closeDonationModal} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
