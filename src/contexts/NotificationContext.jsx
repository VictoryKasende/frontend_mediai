/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Toast from '../components/Toast';

// Contexte de notification
const NotificationContext = createContext();

/**
 * Hook pour utiliser les notifications
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification doit être utilisé dans un NotificationProvider');
  }
  return context;
};

/**
 * Provider de notification
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Supprimer une notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Supprimer toutes les notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Ajouter une notification
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    console.debug('[Notification] added', newNotification);

    // Supprimer automatiquement la notification après un délai sans référence externe
    if (newNotification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, newNotification.duration + 300); // +300ms pour l'animation
    }

    return id;
  }, []);

  const normalizeArgs = (a, b) => {
    // Si seul un argument fourni -> le traiter comme message
    if (b === undefined) {
      return { title: undefined, message: a };
    }
    return { title: a, message: b };
  };

  // Fonctions utilitaires pour différents types
  const showSuccess = useCallback((a, b, options = {}) => {
    const { title, message } = normalizeArgs(a, b);
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((a, b, options = {}) => {
    const { title, message } = normalizeArgs(a, b);
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 4000, // Les erreurs disparaissent après 4 secondes
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((a, b, options = {}) => {
    const { title, message } = normalizeArgs(a, b);
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((a, b, options = {}) => {
    const { title, message } = normalizeArgs(a, b);
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Container des toasts rendu via portal vers document.body pour éviter le découpage par des conteneurs avec overflow/transform */}
      {typeof document !== 'undefined' && createPortal(
        <div className="fixed top-8 right-8 z-[9999] space-y-3 max-w-none">
          {notifications.map((notification) => (
            <div key={notification.id} className="transition-transform duration-300 ease-out pointer-events-auto">
              <Toast
                type={notification.type}
                title={notification.title}
                message={notification.message}
                duration={notification.duration}
                onClose={() => removeNotification(notification.id)}
                isVisible={true}
              />
            </div>
          ))}
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
};
