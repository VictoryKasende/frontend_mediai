import React from 'react';
import { Icon, StatusIcons } from '../../../components/Icons';

/**
 * Modal de rejet rapide d'une consultation
 */
const QuickRejectModal = ({ 
  isOpen, 
  onClose, 
  consultation,
  rejectReason,
  setRejectReason,
  onReject,
  formatPatientName,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-border-light">
        <div className="bg-red-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-heading flex items-center">
              <Icon icon={StatusIcons.Error} size="w-6 h-6" className="mr-3" />
              Rejet de Consultation
            </h3>
            {consultation && (
              <p className="text-white/80 text-sm mt-2">
                Patient: {formatPatientName(consultation)} • Consultation #{consultation.id}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Attention - Rejet de consultation</h4>
            <p className="text-sm text-red-700">
              Cette action rejettera définitivement la consultation. Veuillez spécifier un motif détaillé pour informer l'équipe et le patient.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-mediai-dark mb-2">
              Motif de rejet <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Informations insuffisantes, symptômes non clairs, nécessite consultation physique..."
              rows="5"
              className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-light resize-none"
            />
            <p className="text-xs text-mediai-medium mt-1">
              Minimum 20 caractères requis pour un motif valide
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border-light">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-border-light text-mediai-medium rounded-lg hover:bg-light transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={onReject}
              disabled={rejectReason.trim().length < 20 || isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
            >
              <Icon icon={StatusIcons.Error} size="w-4 h-4" />
              <span>{isLoading ? 'Rejet...' : 'Rejeter consultation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickRejectModal;