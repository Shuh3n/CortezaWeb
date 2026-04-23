/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import DonationModal from '../components/DonationModal';
import VolunteerModal from '../components/VolunteerModal';

type ModalType = 'donation' | 'volunteer' | null;

interface ModalContextType {
  activeModal: ModalType;
  openDonationModal: () => void;
  openVolunteerModal: () => void;
  closeModal: () => void;
  // For backward compatibility (if needed)
  closeDonationModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openDonationModal = () => setActiveModal('donation');
  const openVolunteerModal = () => setActiveModal('volunteer');
  const closeModal = () => setActiveModal(null);

  return (
    <ModalContext.Provider 
      value={{ 
        activeModal, 
        openDonationModal, 
        openVolunteerModal, 
        closeModal,
        closeDonationModal: closeModal
      }}
    >
      {children}
      <DonationModal 
        isOpen={activeModal === 'donation'} 
        onClose={closeModal} 
      />
      <VolunteerModal 
        isOpen={activeModal === 'volunteer'} 
        onClose={closeModal} 
      />
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
