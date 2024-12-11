'use client';

import React, { createContext, useContext, useState } from 'react';

interface SettingsModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const SettingsModalContext = createContext<
  SettingsModalContextType | undefined
>(undefined);

export function SettingsModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('settingsModalOpen') === 'true';
    }
    return false;
  });

  const openModal = () => {
    setIsOpen(true);
    localStorage.setItem('settingsModalOpen', 'true');
  };

  const closeModal = () => {
    setIsOpen(false);
    localStorage.setItem('settingsModalOpen', 'false');
  };

  return (
    <SettingsModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  const context = useContext(SettingsModalContext);
  if (context === undefined) {
    throw new Error(
      'useSettingsModal must be used within a SettingsModalProvider',
    );
  }
  return context;
}
