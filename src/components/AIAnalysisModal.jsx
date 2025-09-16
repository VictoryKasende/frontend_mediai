import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ficheAIService } from '../services/api';
import { ActionIcons, MedicalIcons } from './Icons';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Composant pour relancer l'analyse IA d'une fiche de consultation
 * Permet de configurer les options d'analyse et suivre le progrès
 */
const AIAnalysisModal = ({ ficheId, isOpen, onClose, onAnalysisStarted }) => {
  const { showSuccess, showError, showInfo } = useNotification();
  const [loading, setLoading] = useState(false);
  const [analysisOptions, setAnalysisOptions] = useState({
    force_reanalysis: true,
    include_messages: true,
    analysis_type: 'complete'
  });

  /**
   * Lancer la relance d'analyse IA
   */
  const handleRelanceAnalysis = async () => {
    setLoading(true);
    try {
      const result = await ficheAIService.relanceAnalysis(ficheId, analysisOptions);
      
      showSuccess('Analyse IA lancée', 'L\'analyse IA a été relancée avec succès');
      showInfo('Information', `Tâche créée: ${result.task_id}. Temps estimé: ${result.estimated_completion ? new Date(result.estimated_completion).toLocaleTimeString() : '5 minutes'}`);
      
      // Notifier le composant parent
      if (onAnalysisStarted) {
        onAnalysisStarted(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la relance d\'analyse IA:', error);
      const errorMsg = error.detail || 'Erreur lors de la relance d\'analyse IA';
      showError('Erreur', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gérer le changement des options
   */
  const handleOptionChange = (key, value) => {
    setAnalysisOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-base font-bold">AI</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Relancer l'analyse IA
              </h3>
              <p className="text-sm text-gray-600">
                Fiche #{ficheId}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Information sur la relance */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5 shadow-md">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-blue-900 mb-2">
                  À propos de la relance d'analyse IA
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Cette fonctionnalité permet de relancer l'analyse automatique des données médicales 
                  par l'intelligence artificielle. Utile après l'ajout de nouvelles informations ou 
                  pour corriger une analyse précédente.
                </p>
              </div>
            </div>
          </div>

          {/* Options d'analyse */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">Options d'analyse</h4>
            
            {/* Type d'analyse */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'analyse
              </label>
              <select
                value={analysisOptions.analysis_type}
                onChange={(e) => handleOptionChange('analysis_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
              >
                <option value="complete">Analyse complète (diagnostic + recommandations)</option>
                <option value="diagnostic_only">Diagnostic uniquement</option>
                <option value="recommendation_only">Recommandations uniquement</option>
              </select>
            </div>

            {/* Options booléennes */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  id="force_reanalysis"
                  type="checkbox"
                  checked={analysisOptions.force_reanalysis}
                  onChange={(e) => handleOptionChange('force_reanalysis', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="force_reanalysis" className="text-sm text-gray-700">
                  <span className="font-medium">Forcer la re-analyse</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Effectuer une nouvelle analyse même si une analyse récente existe
                  </span>
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="include_messages"
                  type="checkbox"
                  checked={analysisOptions.include_messages}
                  onChange={(e) => handleOptionChange('include_messages', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5"
                />
                <label htmlFor="include_messages" className="text-sm text-gray-700">
                  <span className="font-medium">Inclure les messages</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Prendre en compte les messages échangés dans l'analyse
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Cas d'usage */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Cas d'usage recommandés</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                Nouvelles informations ajoutées via les messages
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                Correction d'erreurs dans la fiche médicale
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                Diagnostic IA insuffisant ou erroné
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                Mise à jour des algorithmes d'analyse
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm"
          >
            Annuler
          </Button>
          <Button
            onClick={handleRelanceAnalysis}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 text-sm shadow-lg transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyse en cours...</span>
              </div>
            ) : (
              'Relancer l\'analyse'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;