import React from 'react';
import { Icon, MedicalIcons } from '../../../components/Icons';

/**
 * Modal de validation rapide d'une consultation
 */
const QuickValidateModal = ({ 
  isOpen, 
  onClose, 
  consultation,
  validationData,
  setValidationData,
  onValidate,
  formatPatientName,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-border-light">
        <div className="bg-green-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-heading flex items-center">
              <Icon icon={MedicalIcons.Check} size="w-6 h-6" className="mr-3" />
              Validation Rapide
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
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-semibold text-green-800 mb-2">Validation rapide de consultation</h4>
            <p className="text-sm text-green-700">
              Complétez les champs essentiels pour valider cette consultation. Cette action changera le statut en "Validée par médecin".
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-mediai-dark mb-2">
                Diagnostic <span className="text-red-500">*</span>
              </label>
              <textarea
                value={validationData.diagnostic}
                onChange={(e) => setValidationData(prev => ({ ...prev, diagnostic: e.target.value }))}
                placeholder="Diagnostic principal et différentiel..."
                rows="3"
                className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-mediai-dark mb-2">
                Traitement <span className="text-red-500">*</span>
              </label>
              <textarea
                value={validationData.traitement}
                onChange={(e) => setValidationData(prev => ({ ...prev, traitement: e.target.value }))}
                placeholder="Plan de traitement: médicaments, posologie, durée..."
                rows="4"
                className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-mediai-dark mb-2">
                Recommandations
              </label>
              <textarea
                value={validationData.recommandations}
                onChange={(e) => setValidationData(prev => ({ ...prev, recommandations: e.target.value }))}
                placeholder="Recommandations générales pour le suivi..."
                rows="3"
                className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-mediai-dark mb-2">
                Examens complémentaires
              </label>
              <textarea
                value={validationData.examen_complementaire}
                onChange={(e) => setValidationData(prev => ({ ...prev, examen_complementaire: e.target.value }))}
                placeholder="Examens de laboratoire, imagerie, consultations spécialisées..."
                rows="2"
                className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light resize-none"
              />
            </div>
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
              onClick={onValidate}
              disabled={!validationData.diagnostic.trim() || !validationData.traitement.trim() || isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
            >
              <Icon icon={MedicalIcons.Check} size="w-4 h-4" />
              <span>{isLoading ? 'Validation...' : 'Valider consultation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickValidateModal;