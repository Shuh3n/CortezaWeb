/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ModalProvider, useModal } from './ModalContext';
import React from 'react';

// Mock DonationModal to avoid rendering issues
vi.mock('../components/DonationModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="donation-modal">Modal Open <button onClick={onClose}>Close</button></div> : null
  )
}));

vi.mock('../components/VolunteerModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    isOpen ? <div data-testid="volunteer-modal">Modal Open <button onClick={onClose}>Close</button></div> : null
  )
}));

describe('ModalContext Multi-modal behavior', () => {
  it('should manage volunteer modal state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ModalProvider>{children}</ModalProvider>
    );

    const { result } = renderHook(() => useModal(), { wrapper });

    // Initial state
    expect(result.current.activeModal).toBe(null);

    // Open volunteer modal
    act(() => {
      result.current.openVolunteerModal();
    });
    expect(result.current.activeModal).toBe('volunteer');

    // Close modal
    act(() => {
      result.current.closeModal();
    });
    expect(result.current.activeModal).toBe(null);
  });

  it('should manage donation modal state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ModalProvider>{children}</ModalProvider>
    );

    const { result } = renderHook(() => useModal(), { wrapper });

    // Open donation modal
    act(() => {
      result.current.openDonationModal();
    });
    expect(result.current.activeModal).toBe('donation');
  });
});
