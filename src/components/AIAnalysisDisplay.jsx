import React, { useState, useRef } from 'react';
import { MedicalIcons, ActionIcons, StatusIcons } from './Icons';
import Button from './Button';
import MarkdownRenderer from './MarkdownRenderer';

/**
 * Composant d'affichage structuré de l'analyse IA avec mode édition médecin
 * @param {Object} analysisData - Données de l'analyse IA
 * @param {boolean} isEditable - Mode édition pour les médecins
 * @param {function} onSave - Callback de sauvegarde des modifications
 * @param {boolean} showReferences - Afficher les références
 */
const AIAnalysisDisplay = ({ 
  analysisData = {}, 
  isEditable = false, 
  onSave, 
  showReferences = true,
  isLoading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    diagnostic: analysisData.diagnostic || '',
    recommandations: analysisData.recommandations || '',
    traitement: analysisData.traitement || '',
    examen_complementaire: analysisData.examen_complementaire || '',
    references: analysisData.references || [],
    commentaire_medecin: analysisData.commentaire_medecin || '',
    confidence_score: analysisData.confidence_score || 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const editFormRef = useRef(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      diagnostic: analysisData.diagnostic || '',
      recommandations: analysisData.recommandations || '',
      traitement: analysisData.traitement || '',
      examen_complementaire: analysisData.examen_complementaire || '',
      references: analysisData.references || [],
      commentaire_medecin: analysisData.commentaire_medecin || '',
      confidence_score: analysisData.confidence_score || 0
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      diagnostic: analysisData.diagnostic || '',
      recommandations: analysisData.recommandations || '',
      traitement: analysisData.traitement || '',
      examen_complementaire: analysisData.examen_complementaire || '',
      references: analysisData.references || [],
      commentaire_medecin: analysisData.commentaire_medecin || '',
      confidence_score: analysisData.confidence_score || 0
    });
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addReference = () => {
    setEditedData(prev => ({
      ...prev,
      references: [...prev.references, { title: '', url: '', type: 'article' }]
    }));
  };

  const updateReference = (index, field, value) => {
    setEditedData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const removeReference = (index) => {
    setEditedData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 80) return 'Haute confiance';
    if (score >= 60) return 'Confiance modérée';
    return 'Faible confiance';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header avec score de confiance */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center">
            <MedicalIcons.Brain className="w-5 h-5 mr-2" />
            Analyse IA Médicale
          </h3>
          <div className="flex items-center space-x-3">
            {editedData.confidence_score > 0 && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(editedData.confidence_score)}`}>
                {getConfidenceLabel(editedData.confidence_score)} ({editedData.confidence_score}%)
              </div>
            )}
            {isEditable && !isEditing && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleEdit}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                <ActionIcons.Edit className="w-4 h-4 mr-2" />
                Éditer
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {isEditing ? (
          /* Mode édition */
          <form ref={editFormRef} className="space-y-6">
            {/* Diagnostic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnostic *
              </label>
              <textarea
                value={editedData.diagnostic}
                onChange={(e) => handleInputChange('diagnostic', e.target.value)}
                placeholder="Diagnostic principal..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20 transition-all resize-none"
                required
              />
            </div>

            {/* Recommandations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommandations
              </label>
              <textarea
                value={editedData.recommandations}
                onChange={(e) => handleInputChange('recommandations', e.target.value)}
                placeholder="Recommandations thérapeutiques..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20 transition-all resize-none"
              />
            </div>

            {/* Traitement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Traitement proposé
              </label>
              <textarea
                value={editedData.traitement}
                onChange={(e) => handleInputChange('traitement', e.target.value)}
                placeholder="Plan de traitement détaillé..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20 transition-all resize-none"
              />
            </div>

            {/* Examens complémentaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Examens complémentaires
              </label>
              <textarea
                value={editedData.examen_complementaire}
                onChange={(e) => handleInputChange('examen_complementaire', e.target.value)}
                placeholder="Examens supplémentaires recommandés..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20 transition-all resize-none"
              />
            </div>

            {/* Commentaire médecin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire médecin
              </label>
              <textarea
                value={editedData.commentaire_medecin}
                onChange={(e) => handleInputChange('commentaire_medecin', e.target.value)}
                placeholder="Vos observations et commentaires..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20 transition-all resize-none"
              />
            </div>

            {/* Références */}
            {showReferences && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Références médicales
                  </label>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={addReference}
                  >
                    <ActionIcons.Plus className="w-4 h-4 mr-2" />
                    Ajouter référence
                  </Button>
                </div>
                <div className="space-y-3">
                  {editedData.references.map((ref, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={ref.title}
                          onChange={(e) => updateReference(index, 'title', e.target.value)}
                          placeholder="Titre de la référence..."
                          className="px-3 py-2 border border-gray-300 rounded text-sm focus:border-mediai-primary focus:ring-1 focus:ring-mediai-primary"
                        />
                        <input
                          type="url"
                          value={ref.url}
                          onChange={(e) => updateReference(index, 'url', e.target.value)}
                          placeholder="URL (optionnel)..."
                          className="px-3 py-2 border border-gray-300 rounded text-sm focus:border-mediai-primary focus:ring-1 focus:ring-mediai-primary"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeReference(index)}
                        className="text-red-600 hover:bg-red-50 border-red-300"
                      >
                        <ActionIcons.Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Annuler
              </Button>
              <Button 
                type="button" 
                onClick={handleSave}
                disabled={isSaving || !editedData.diagnostic.trim()}
                className="min-w-[100px]"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  'Sauvegarder'
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Mode lecture */
          <div className="space-y-6">
            {/* Diagnostic */}
            {analysisData.diagnostic && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MedicalIcons.Diagnostic className="w-4 h-4 mr-2 text-mediai-primary" />
                  Diagnostic
                </h4>
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={analysisData.diagnostic} />
                </div>
              </div>
            )}

            {/* Recommandations */}
            {analysisData.recommandations && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MedicalIcons.Prescription className="w-4 h-4 mr-2 text-green-500" />
                  Recommandations
                </h4>
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={analysisData.recommandations} />
                </div>
              </div>
            )}

            {/* Traitement */}
            {analysisData.traitement && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MedicalIcons.Pills className="w-4 h-4 mr-2 text-purple-500" />
                  Traitement proposé
                </h4>
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={analysisData.traitement} />
                </div>
              </div>
            )}

            {/* Examens complémentaires */}
            {analysisData.examen_complementaire && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MedicalIcons.Lab className="w-4 h-4 mr-2 text-orange-500" />
                  Examens complémentaires
                </h4>
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={analysisData.examen_complementaire} />
                </div>
              </div>
            )}

            {/* Commentaire médecin */}
            {analysisData.commentaire_medecin && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <MedicalIcons.Doctor className="w-4 h-4 mr-2" />
                  Commentaire du médecin
                </h4>
                <div className="prose prose-sm max-w-none text-blue-800">
                  <MarkdownRenderer content={analysisData.commentaire_medecin} />
                </div>
              </div>
            )}

            {/* Références */}
            {showReferences && analysisData.references && analysisData.references.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <MedicalIcons.Book className="w-4 h-4 mr-2 text-indigo-500" />
                  Références médicales
                </h4>
                <div className="space-y-2">
                  {analysisData.references.map((ref, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MedicalIcons.ExternalLink className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{ref.title}</p>
                        {ref.url && (
                          <a 
                            href={ref.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Voir la source
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message si aucune analyse */}
            {!analysisData.diagnostic && !analysisData.recommandations && !analysisData.traitement && (
              <div className="text-center py-8">
                <MedicalIcons.Brain className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Aucune analyse IA disponible pour cette consultation</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisDisplay;