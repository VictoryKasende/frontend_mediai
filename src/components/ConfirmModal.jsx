import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Icon, StatusIcons, ActionIcons } from './Icons';

/**
 * Composant de modal de confirmation
 * @param {boolean} isOpen - État ouvert/fermé
 * @param {function} onClose - Fonction de fermeture
 * @param {function} onConfirm - Fonction de confirmation
 * @param {string} title - Titre de la modal
 * @param {string} message - Message de confirmation
 * @param {string} type - Type (success, error, warning, info)
 * @param {string} confirmText - Texte du bouton de confirmation
 * @param {string} cancelText - Texte du bouton d'annulation
 * @param {boolean} loading - État de chargement
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  loading = false
}) => {
  
  const typeConfig = {
    success: {
      icon: StatusIcons.Success,
      iconColor: 'text-success',
      confirmVariant: 'primary'
    },
    error: {
      icon: StatusIcons.Error,
      iconColor: 'text-danger',
      confirmVariant: 'danger'
    },
    warning: {
      icon: StatusIcons.Warning,
      iconColor: 'text-warning',
      confirmVariant: 'warning'
    },
    info: {
      icon: StatusIcons.Info,
      iconColor: 'text-mediai-primary',
      confirmVariant: 'primary'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={config.confirmVariant}
        onClick={handleConfirm}
        loading={loading}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      size="sm"
      closeOnOverlayClick={!loading}
      footer={footer}
    >
      <div className="flex items-start space-x-4">
        {/* Icône */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            type === 'success' ? 'bg-success/10' :
            type === 'error' ? 'bg-danger/10' :
            type === 'warning' ? 'bg-warning/10' :
            'bg-mediai-primary/10'
          }`}>
            <Icon icon={config.icon} size="w-6 h-6" className={config.iconColor} />
          </div>
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="text-content-primary font-body leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
