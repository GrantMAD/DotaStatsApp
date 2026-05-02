import React, { createContext, useContext, useState, useCallback } from 'react';
import { HeroStats } from '../services/opendota';
import { PlayerHeroStats } from '../components/HeroDetailModal';

export type ModalType = 'player' | 'match' | 'hero' | 'team' | 'league';

export interface ModalItem {
  type: ModalType;
  id: string | number;
  props?: any;
}

interface ModalContextType {
  modalStack: ModalItem[];
  pushModal: (type: ModalType, id: string | number, props?: any) => void;
  popModal: () => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalStack, setModalStack] = useState<ModalItem[]>([]);

  const pushModal = useCallback((type: ModalType, id: string | number, props?: any) => {
    setModalStack(prev => [...prev, { type, id, props }]);
  }, []);

  const popModal = useCallback(() => {
    setModalStack(prev => prev.slice(0, -1));
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack([]);
  }, []);

  return (
    <ModalContext.Provider value={{ modalStack, pushModal, popModal, closeAllModals }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}
