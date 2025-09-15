import { useState } from 'react';

/**
 * Hook personnalisé pour gérer l'état du modal de paramètres
 */
export const useSettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal
  };
};
