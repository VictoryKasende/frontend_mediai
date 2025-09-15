import React, { useEffect } from 'react';
import { Icon, ActionIcons } from './Icons';

/**
 * Composant Modal réutilisable avec design Mediai
 * @param {boolean} isOpen - État ouvert/fermé de la modal
 * @param {function} onClose - Fonction de fermeture
 * @param {string} title - Titre de la modal
 * @param {string} size - Taille de la modal (sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, full)
 * @param {string} maxWidth - Taille maximale personnalisée (remplace size si fourni)
 * @param {boolean} closeOnOverlayClick - Fermer en cliquant sur l'overlay
 * @param {string} type - Type de modal (default, success, error, warning, info)
 * @param {React.ReactNode} children - Contenu de la modal
 * @param {React.ReactNode} footer - Contenu du footer (boutons d'action)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  maxWidth,
  closeOnOverlayClick = true,
  type = 'default',
  children,
  footer
}) => {
  // Fermer la modal avec la touche Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le défilement du body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Classes selon la taille
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full mx-4'
  };

  // Configuration des types de modal
  const typeConfig = {
    default: {
      headerBg: 'bg-white',
      headerBorder: 'border-border-primary',
      titleColor: 'text-content-primary'
    },
    success: {
      headerBg: 'bg-success/5',
      headerBorder: 'border-success/20',
      titleColor: 'text-success'
    },
    error: {
      headerBg: 'bg-danger/5',
      headerBorder: 'border-danger/20',
      titleColor: 'text-danger'
    },
    warning: {
      headerBg: 'bg-warning/5',
      headerBorder: 'border-warning/20',
      titleColor: 'text-warning'
    },
    info: {
      headerBg: 'bg-mediai-primary/5',
      headerBorder: 'border-mediai-primary/20',
      titleColor: 'text-mediai-primary'
    }
  };

  const config = typeConfig[type] || typeConfig.default;

  // Ne pas rendre si la modal n'est pas ouverte
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
        ></div>

        {/* Centrage vertical pour mobile */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* Modal */}
        <div
          className={`inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full border border-border-primary ${
            maxWidth ? maxWidth : (sizeClasses[size] || sizeClasses.md)
          }`}
        >
          {/* Header */}
          {title && (
            <div className={`${config.headerBg} px-6 pt-6 pb-4 border-b ${config.headerBorder}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-heading font-semibold ${config.titleColor}`}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-content-tertiary hover:text-content-primary hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-mediai-primary transition-colors"
                  title="Fermer"
                >
                  <span className="sr-only">Fermer</span>
                  <Icon icon={ActionIcons.Close} size="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Contenu */}
          <div className="bg-white px-6 py-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="bg-surface-muted px-6 py-4 border-t border-border-primary">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
