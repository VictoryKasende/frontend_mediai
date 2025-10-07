import { useState, useCallback } from 'react';

/**
 * Hook pour gérer les modals de confirmation
 */
export const useConfirmModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    onConfirm: null,
    loading: false
  });

  // Ouvrir la modal de confirmation
  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Confirmation',
        message: options.message || 'Êtes-vous sûr de vouloir continuer ?',
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Confirmer',
        cancelText: options.cancelText || 'Annuler',
        loading: false,
        onConfirm: () => {
          resolve(true);
          closeModal();
        }
      });
    });
  }, [closeModal]);

  // Fermer la modal
  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Définir l'état de chargement
  const setLoading = useCallback((loading) => {
    setModalState(prev => ({ ...prev, loading }));
  }, []);

  // Fonctions spécialisées
  const confirmDelete = useCallback((itemName) => {
    return showConfirm({
      title: 'Supprimer l\'élément',
      message: `Êtes-vous sûr de vouloir supprimer "${itemName}" ? Cette action est irréversible.`,
      type: 'error',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });
  }, [showConfirm]);

  const confirmSave = useCallback((message = 'Voulez-vous sauvegarder les modifications ?') => {
    return showConfirm({
      title: 'Sauvegarder',
      message,
      type: 'info',
      confirmText: 'Sauvegarder',
      cancelText: 'Annuler'
    });
  }, [showConfirm]);

  const confirmCancel = useCallback((message = 'Voulez-vous vraiment annuler ? Les modifications non sauvegardées seront perdues.') => {
    return showConfirm({
      title: 'Annuler les modifications',
      message,
      type: 'warning',
      confirmText: 'Oui, annuler',
      cancelText: 'Continuer'
    });
  }, [showConfirm]);

  return {
    modalState,
    showConfirm,
    closeModal,
    setLoading,
    confirmDelete,
    confirmSave,
    confirmCancel
  };
};
