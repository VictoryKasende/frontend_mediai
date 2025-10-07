import React, { useState, useEffect, useCallback } from 'react';
import { Icon, StatusIcons, ActionIcons } from './Icons';

/**
 * Composant Toast pour les notifications
 * @param {string} type - Type de toast (success, error, warning, info)
 * @param {string} title - Titre du toast
 * @param {string} message - Message du toast
 * @param {number} duration - Durée d'affichage en ms (0 = permanent)
 * @param {function} onClose - Fonction de fermeture
 * @param {boolean} isVisible - État de visibilité
 */
const Toast = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  isVisible = true
}) => {
  const [show, setShow] = useState(isVisible);
  const [progress, setProgress] = useState(100);

  // Configuration des types
  const toastConfig = {
    success: {
      icon: StatusIcons.Success,
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      iconColor: 'text-success',
      titleColor: 'text-success',
      textColor: 'text-content-primary'
    },
    error: {
      icon: StatusIcons.Error,
      bgColor: 'bg-danger/10',
      borderColor: 'border-danger/20',
      iconColor: 'text-danger',
      titleColor: 'text-danger',
      textColor: 'text-content-primary'
    },
    warning: {
      icon: StatusIcons.Warning,
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      iconColor: 'text-warning',
      titleColor: 'text-warning',
      textColor: 'text-content-primary'
    },
    info: {
      icon: StatusIcons.Info,
      bgColor: 'bg-mediai-primary/10',
      borderColor: 'border-mediai-primary/20',
      iconColor: 'text-mediai-primary',
      titleColor: 'text-mediai-primary',
      textColor: 'text-content-primary'
    }
  };

  const config = toastConfig[type] || toastConfig.info;

  // Définir handleClose avant les useEffect qui l'utilisent
  const handleClose = useCallback(() => {
    setShow(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Gestion de la fermeture automatique
  useEffect(() => {
    if (duration > 0 && show) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      // Animation de la barre de progression
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [duration, show, handleClose]);

  // Mettre à jour la visibilité
  useEffect(() => {
    setShow(isVisible);
    if (isVisible) {
      setProgress(100);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className={`
      relative min-w-[280px] max-w-md w-auto bg-white border-l-4 ${config.borderColor.replace('/20', '')} 
      rounded-lg shadow-2xl backdrop-blur-sm
      transform transition-all duration-300 ease-in-out
      ${show ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
    `}>
      {/* Barre de progression */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 h-1 bg-gradient-primary rounded-t-lg transition-all duration-100 ease-linear"
             style={{ width: `${progress}%` }}>
        </div>
      )}

      {/* Contenu du toast */}
      <div className="p-4">
        <div className="flex items-start">
          {/* Icône */}
          <div className="flex-shrink-0">
            <Icon icon={config.icon} size="w-5 h-5" className={config.iconColor} />
          </div>

          {/* Contenu */}
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className={`text-sm font-medium font-heading ${config.titleColor}`}>
                {title}
              </p>
            )}
            {message && (
              <p className={`text-sm font-body break-words ${config.textColor} ${title ? 'mt-1' : ''}`}>
                {message}
              </p>
            )}
          </div>

          {/* Bouton de fermeture */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className={`rounded-md inline-flex ${config.iconColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-mediai-primary`}
            >
              <span className="sr-only">Fermer</span>
              <Icon icon={ActionIcons.Close} size="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
