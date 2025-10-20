import React, { useState } from 'react';
import Icons from '../../../components/Icons';
import MarkdownRenderer from '../../../components/MarkdownRenderer';

const { StatusIcons, NavigationIcons, MedicalIcons, ActionIcons, Icon } = Icons;

// Fonctions utilitaires
const formatPatientName = (consultation) => {
  const nom = consultation?.nom || '';
  const prenom = consultation?.prenom || '';
  return `${prenom} ${nom}`.trim() || 'Nom non spécifié';
};

const formatDate = (dateString, fallback = 'Non programmée') => {
  if (!dateString) return fallback;
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return fallback;
  }
};

const getConsultationDate = (consultation) => {
  return consultation.date_consultation || consultation.date_rdv || consultation.created_at;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'en_attente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'en_cours':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'termine':
    case 'validee_medecin':
    case 'terminee':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'analyse_terminee':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'rejetee':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'reporte':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatutColor = (statut) => {
  switch(statut) {
    case 'en_analyse': return 'bg-mediai-primary text-white';
    case 'analyse_terminee': return 'bg-success text-white';
    case 'valide_medecin': return 'bg-mediai-secondary text-white';
    case 'rejete_medecin': return 'bg-danger text-white';
    case 'en_attente': return 'bg-warning text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getStatutLabel = (statut) => {
  switch(statut) {
    case 'en_analyse': return 'En analyse';
    case 'analyse_terminee': return 'Analyse terminée';
    case 'valide_medecin': return 'Validée';
    case 'rejete_medecin': return 'Rejetée';
    case 'en_attente': return 'En attente';
    default: return statut;
  }
};

const getUrgenceColor = (urgence) => {
  switch(urgence) {
    case 'haute': return 'bg-danger text-white';
    case 'moyenne': return 'bg-warning text-white';
    case 'faible': return 'bg-success text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getUrgencyColor = (urgence) => {
  switch (urgence) {
    case 'elevee':
      return 'bg-red-100 text-red-800';
    case 'normale':
      return 'bg-green-100 text-green-800';
    case 'faible':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Fonctions de vérification des permissions
const isConsultationValidated = (consultation) => {
  if (!consultation) return false;
  return consultation.status === 'valide_medecin' || consultation.status === 'validee';
};

const isConsultationComplete = (consultation) => {
  if (!consultation) return false;
  return !!(
    consultation.diagnostic && 
    consultation.diagnostic.trim() !== '' &&
    consultation.traitement && 
    consultation.traitement.trim() !== ''
  );
};

/**
 * Composant de détails d'une consultation sélectionnée
 */
const ConsultationDetails = ({
  consultation,
  onBack,
  onEdit,
  onDelete,
  onValidate,
  onReject,
  onWhatsApp,
  onMessages,
  onPrint,
  onExportPDF,
  onAnalyzeWithIA,
  isLoading = false,
  children // Pour les actions supplémentaires
}) => {
  if (!consultation) {
    return (
      <div className="bg-white rounded-2xl shadow-custom border border-border-light p-12 text-center">
        <Icon icon={StatusIcons.FileText} size="w-16 h-16" className="mx-auto text-mediai-light mb-4" />
        <h3 className="text-lg font-semibold text-mediai-medium mb-2">
          Sélectionnez une consultation
        </h3>
        <p className="text-mediai-medium">
          Choisissez une consultation dans la liste pour voir ses détails.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-border-light p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onBack && onBack()}
                className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors"
              >
                <Icon icon={NavigationIcons.ArrowLeft} size="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg lg:text-2xl font-bold text-mediai-dark font-heading">
                  Consultation #{consultation.id}
                </h2>
                <p className="text-sm lg:text-base text-mediai-medium font-body">
                  {formatPatientName(consultation)}
                </p>
              </div>
            </div>
            
            {/* Actions desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Compléter/Éditer - Seulement si pas encore validée */}
              {!isConsultationValidated(consultation) && (
                <button
                  onClick={() => onEdit(consultation)}
                  className="px-4 py-2 bg-mediai-primary text-white rounded-lg hover:bg-mediai-secondary transition-colors font-body"
                >
                  Compléter
                </button>
              )}
              
              {/* Messages - Seulement si validée */}
              {isConsultationValidated(consultation) && (
                <button
                  onClick={() => onMessages && onMessages(consultation)}
                  className="px-4 py-2 bg-gray-100 text-mediai-dark rounded-lg hover:bg-gray-200 transition-colors font-body"
                >
                  Messages
                </button>
              )}
              
              {/* WhatsApp - Seulement si validée ET complète */}
              {isConsultationValidated(consultation) && isConsultationComplete(consultation) && consultation.telephone && (
                <button
                  onClick={() => onWhatsApp && onWhatsApp(consultation)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-body flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
              )}
              
              {/* Relancer IA - Seulement si en_analyse ET validée */}
              {consultation.status === 'en_analyse' && isConsultationValidated(consultation) && (
                <button
                  onClick={() => onAnalyzeWithIA && onAnalyzeWithIA(consultation.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-body flex items-center space-x-2"
                >
                  <Icon icon={Icons.AI} size="w-4 h-4" />
                  <span>Relancer IA</span>
                </button>
              )}
              
              {/* Imprimer - Seulement si validée ET complète */}
              {isConsultationValidated(consultation) && isConsultationComplete(consultation) && (
                <button
                  onClick={() => onPrint && onPrint(consultation)}
                  className="px-4 py-2 bg-success text-white rounded-lg hover:bg-mediai-dark transition-colors font-body"
                >
                  Imprimer
                </button>
              )}
              
              {/* Export PDF - Seulement si validée ET complète */}
              {isConsultationValidated(consultation) && isConsultationComplete(consultation) && (
                <button
                  onClick={() => onExportPDF && onExportPDF(consultation)}
                  className="px-4 py-2 bg-medium text-white rounded-lg hover:bg-mediai-dark transition-colors font-body"
                >
                  Export PDF
                </button>
              )}
            </div>

            {/* Actions mobile */}
            <div className="lg:hidden space-y-3">
              <div className="flex space-x-2">
                {/* Compléter - Seulement si pas encore validée */}
                {!isConsultationValidated(consultation) && (
                  <button
                    onClick={() => onEdit(consultation)}
                    className="flex-1 px-3 py-2 bg-mediai-primary text-white rounded-lg text-sm font-body"
                  >
                    Compléter
                  </button>
                )}
                
                {/* Messages - Seulement si validée */}
                {isConsultationValidated(consultation) && (
                  <button
                    onClick={() => onMessages && onMessages(consultation)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-body flex items-center justify-center space-x-1"
                  >
                    <Icon icon={NavigationIcons.Chat} size="w-4 h-4" />
                    <span>Messages</span>
                  </button>
                )}
              </div>
              
              {/* Autres actions - Seulement si validée ET complète */}
              {isConsultationValidated(consultation) && isConsultationComplete(consultation) && (
                <div className="flex space-x-2">
                  {consultation.telephone && (
                    <button
                      onClick={() => onWhatsApp && onWhatsApp(consultation)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-body flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>WhatsApp</span>
                    </button>
                  )}
                  <button
                    onClick={() => onPrint && onPrint(consultation)}
                    className="flex-1 px-3 py-2 bg-success text-white rounded-lg text-sm font-body"
                  >
                    Imprimer
                  </button>
                  <button
                    onClick={() => onExportPDF && onExportPDF(consultation)}
                    className="flex-1 px-3 py-2 bg-medium text-white rounded-lg text-sm font-body"
                  >
                    PDF
                  </button>
                </div>
              )}
              
              {/* Relancer IA - Seulement si en_analyse ET validée */}
              {consultation.status === 'en_analyse' && isConsultationValidated(consultation) && (
                <button
                  onClick={() => onAnalyzeWithIA && onAnalyzeWithIA(consultation.id)}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-body flex items-center justify-center space-x-2"
                >
                  <Icon icon={Icons.AI} size="w-4 h-4" />
                  <span>Relancer l'analyse IA</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Détails de la consultation - Layout unifié comme ConsultationDetails */}
        <div className="space-y-4 lg:space-y-6">{/* START_CONSULTATION_DETAILS */}
          
          {/* Informations patient */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <Icon icon={Icons.Profile} size="w-5 h-5" className="mr-2 text-mediai-primary" />
              Informations patient
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Nom complet</label>
                <p className="text-mediai-dark text-sm lg:text-base font-medium">{formatPatientName(consultation)}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Âge</label>
                <p className="text-mediai-dark text-sm lg:text-base">{consultation.age || 'N/A'} ans</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Sexe</label>
                <p className="text-mediai-dark text-sm lg:text-base">{consultation.sexe || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Téléphone</label>
                <p className="text-mediai-dark text-sm lg:text-base">{consultation.telephone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">État civil</label>
                <p className="text-mediai-dark text-sm lg:text-base">{consultation.etat_civil || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Occupation</label>
                <p className="text-mediai-dark text-sm lg:text-base">{consultation.occupation || 'N/A'}</p>
              </div>
            </div>
            {(consultation.avenue || consultation.quartier || consultation.commune) && (
              <div className="mt-4">
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Adresse</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {[consultation.avenue, consultation.quartier, consultation.commune]
                    .filter(Boolean).join(', ') || 'Non renseignée'}
                </p>
              </div>
            )}
          </div>

          {/* Contact d'urgence */}
          {(consultation.contact_nom || consultation.contact_telephone || consultation.contact_adresse) && (
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
                <Icon icon={Icons.Phone} size="w-5 h-5" className="mr-2 text-orange-500" />
                Contact d'urgence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Nom</label>
                  <p className="text-mediai-dark text-sm lg:text-base">{consultation.contact_nom || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Téléphone</label>
                  <p className="text-mediai-dark text-sm lg:text-base">{consultation.contact_telephone || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Adresse</label>
                  <p className="text-mediai-dark text-sm lg:text-base">{consultation.contact_adresse || 'Non renseignée'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Informations de consultation */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <Icon icon={Icons.Calendar} size="w-5 h-5" className="mr-2 text-mediai-primary" />
              Informations de consultation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Numéro de dossier</label>
                <p className="text-mediai-dark text-sm lg:text-base font-mono">{consultation.numero_dossier || `CONS-${consultation.id}`}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Date de consultation</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {formatDate(getConsultationDate(consultation), 'Non programmée')}
                </p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Heure</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {consultation.heure_debut && consultation.heure_fin 
                    ? `${consultation.heure_debut} - ${consultation.heure_fin}`
                    : consultation.heure_debut || 'Non programmée'
                  }
                </p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Status</label>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatutColor(consultation.status)}`}>
                    {getStatutLabel(consultation.status)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Urgence</label>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getUrgenceColor(consultation.urgence)}`}>
                  {consultation.urgence || 'Normal'}
                </span>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Date de création</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {formatDate(consultation.created_at, 'Non disponible')}
                </p>
              </div>
            </div>
          </div>

          {/* Signes vitaux */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <Icon icon={Icons.Heart} size="w-5 h-5" className="mr-2 text-red-500" />
              Signes vitaux
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <label className="block text-xs font-medium text-red-600 mb-1">Température</label>
                <p className="text-lg font-bold text-red-700">{consultation.temperature || '-'}°C</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <label className="block text-xs font-medium text-blue-600 mb-1">SpO2</label>
                <p className="text-lg font-bold text-blue-700">{consultation.spo2 || '-'}%</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <label className="block text-xs font-medium text-green-600 mb-1">Poids</label>
                <p className="text-lg font-bold text-green-700">{consultation.poids || '-'} kg</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <label className="block text-xs font-medium text-purple-600 mb-1">Tension</label>
                <p className="text-lg font-bold text-purple-700">{consultation.tension_arterielle || '-'}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <label className="block text-xs font-medium text-orange-600 mb-1">Pouls</label>
                <p className="text-lg font-bold text-orange-700">{consultation.pouls || '-'} bpm</p>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-lg">
                <label className="block text-xs font-medium text-cyan-600 mb-1">Fréq. resp.</label>
                <p className="text-lg font-bold text-cyan-700">{consultation.frequence_respiratoire || '-'}/min</p>
              </div>
            </div>
            </div>

          {/* Motif et histoire */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <Icon icon={Icons.Document} size="w-5 h-5" className="mr-2 text-mediai-primary" />
              Motif et anamnèse
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Motif de consultation</label>
                <p className="text-mediai-dark text-sm lg:text-base">{consultation.motif_consultation || 'Non spécifié'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Histoire de la maladie</label>
                <p className="text-mediai-dark text-sm lg:text-base">{consultation.histoire_maladie || 'Non spécifiée'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Antécédents médicaux</label>
                <p className="text-mediai-dark text-sm lg:text-base">{consultation.autres_antecedents || 'Aucun antécédent spécifié'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Allergies médicamenteuses</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {consultation.allergie_medicamenteuse ? 
                    (consultation.medicament_allergique || 'Allergie confirmée') : 
                    'Aucune allergie connue'
                  }
                </p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Médicaments actuels</label>
                <p className="text-mediai-dark text-sm lg:text-base">{consultation.details_medicaments || 'Aucun médicament spécifié'}</p>
              </div>
            </div>
          </div>

          {/* Analyse et hypothèses - Nouveaux champs */}
          {(consultation.diagnostic_ia || consultation.analyses_proposees || consultation.hypothese_patient_medecin) && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 lg:p-6 shadow-sm border border-purple-200">
              <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
                <Icon icon={Icons.Brain} size="w-5 h-5" className="mr-2 text-purple-600" />
                Analyse et hypothèses diagnostiques
              </h3>
              <div className="space-y-4">
                {consultation.diagnostic_ia && (
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-purple-700 mb-2">
                      Diagnostic d'analyse
                    </label>
                    <div className="bg-white p-4 rounded-lg border border-purple-100">
                      <MarkdownRenderer content={consultation.diagnostic_ia} />
                    </div>
                  </div>
                )}
                
                {consultation.hypothese_patient_medecin && (
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-indigo-700 mb-2">
                      Hypothèse diagnostique du médecin
                    </label>
                    <div className="bg-white p-4 rounded-lg border border-indigo-100">
                      <p className="text-mediai-dark text-sm lg:text-base whitespace-pre-wrap">
                        {consultation.hypothese_patient_medecin}
                      </p>
                    </div>
                  </div>
                )}
                
                {consultation.analyses_proposees && (
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-blue-700 mb-2">
                      Analyses proposées
                    </label>
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <p className="text-mediai-dark text-sm lg:text-base whitespace-pre-wrap">
                        {consultation.analyses_proposees}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Examen clinique */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <Icon icon={Icons.Stethoscope} size="w-5 h-5" className="mr-2 text-mediai-primary" />
              Examen physique
            </h3>
            <div className="space-y-4">
              {[
                { key: 'etat_general', label: 'État général' },
                { key: 'febrile', label: 'État fébrile' },
                { key: 'coloration_bulbaire', label: 'Coloration bulbaire' },
                { key: 'coloration_palpebrale', label: 'Coloration palpébrale' },
                { key: 'tegument', label: 'Tégument' },
                { key: 'tete', label: 'Tête' },
                { key: 'cou', label: 'Cou' },
                { key: 'paroi_thoracique', label: 'Paroi thoracique' },
                { key: 'poumons', label: 'Poumons' },
                { key: 'coeur', label: 'Cœur' },
                { key: 'epigastre_hypochondres', label: 'Épigastre et hypochondres' },
                { key: 'peri_ombilical_flancs', label: 'Péri-ombilical et flancs' },
                { key: 'hypogastre_fosses_iliaques', label: 'Hypogastre et fosses iliaques' },
                { key: 'membres', label: 'Membres' },
                { key: 'colonne_bassin', label: 'Colonne et bassin' },
                { key: 'examen_gynecologique', label: 'Examen gynécologique' }
              ].filter(item => consultation[item.key]).map(item => (
                <div key={item.key}>
                  <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">{item.label}</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-mediai-dark text-sm lg:text-base">{consultation[item.key]}</p>
                  </div>
                </div>
              ))}
              {![
                'etat_general', 'febrile', 'coloration_bulbaire', 'coloration_palpebrale', 'tegument',
                'tete', 'cou', 'paroi_thoracique', 'poumons', 'coeur', 'epigastre_hypochondres',
                'peri_ombilical_flancs', 'hypogastre_fosses_iliaques', 'membres', 'colonne_bassin', 'examen_gynecologique'
              ].some(key => consultation[key]) && (
                <div className="text-mediai-medium text-sm lg:text-base italic text-center py-8">
                  Aucun examen clinique enregistré
                </div>
              )}
            </div>
          </div>

        {/* Diagnostic et traitement (si complété) */}
        {consultation.diagnostic && (
          <>
            {/* Version mobile compacte */}
            <div className="lg:hidden">
              <div className="bg-white rounded-xl border border-border-light p-4">
                <h3 className="text-base font-bold text-mediai-dark font-heading mb-3 flex items-center">
                  <Icon icon={Icons.Check} size="w-4 h-4" className="mr-2" />
                  Diagnostic & Traitement
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-mediai-medium text-xs">Diagnostic:</span>
                    <div className="bg-light p-3 rounded-lg mt-1">
                      <p className="text-mediai-dark">{consultation.diagnostic}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-mediai-medium text-xs">Traitement:</span>
                    <div className="bg-light p-3 rounded-lg mt-1">
                      <p className="text-mediai-dark">{consultation.traitement}</p>
                    </div>
                  </div>
                  
                  {consultation.examen_complementaire && (
                    <div>
                      <span className="font-medium text-mediai-medium text-xs">Examens:</span>
                      <div className="bg-light p-3 rounded-lg mt-1">
                        <p className="text-mediai-dark">{consultation.examen_complementaire}</p>
                      </div>
                    </div>
                  )}
                  
                  {consultation.recommandations && (
                    <div>
                      <span className="font-medium text-mediai-medium text-xs">Recommandations:</span>
                      <div className="bg-light p-3 rounded-lg mt-1">
                        <p className="text-mediai-dark">{consultation.recommandations}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Version desktop avec cartes */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-border-light p-6">
              <h3 className="text-lg font-bold text-mediai-dark font-heading mb-6 flex items-center">
                <Icon icon={Icons.Check} size="w-5 h-5" className="mr-2" />
                Diagnostic et traitement
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-mediai-medium">Diagnostic</label>
                      {consultation.status === 'valide_medecin' && consultation.date_validation && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          Validé le {formatDate(consultation.date_validation)}
                        </span>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg mt-1 ${consultation.diagnostic ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <p className="text-mediai-dark font-body">
                        {consultation.diagnostic || 'Diagnostic non encore établi'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-mediai-medium">Traitement proposé</label>
                      {consultation.status === 'valide_medecin' && consultation.traitement && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          Prescrit
                        </span>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg mt-1 ${consultation.traitement ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                      <p className="text-mediai-dark font-body">
                        {consultation.traitement || 'Traitement non encore défini'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-mediai-medium">Examens complémentaires</label>
                      {consultation.examen_complementaire && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                          Prescrits
                        </span>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg mt-1 ${consultation.examen_complementaire ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                      <p className="text-mediai-dark font-body">
                        {consultation.examen_complementaire || 'Aucun examen complémentaire prescrit'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-mediai-medium">Recommandations médicales</label>
                      {consultation.recommandations && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          Conseils donnés
                        </span>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg mt-1 ${consultation.recommandations ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                      <p className="text-mediai-dark font-body">
                        {consultation.recommandations || 'Aucune recommandation spécifique'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section rejet si applicable */}
              {consultation.status === 'rejete_medecin' && consultation.commentaire_rejet && (
                <div className="mt-6 pt-6 border-t border-red-200">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-red-600">Motif de rejet</label>
                      {consultation.date_rejet && (
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                          Rejetée le {formatDate(consultation.date_rejet)}
                        </span>
                      )}
                    </div>
                    <p className="text-red-800 font-body">{consultation.commentaire_rejet}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    );
  };

  const renderConsultationForm = () => {
    if (!consultation) {
      return null;
    }

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const updatedConsultation = {
        ...consultation,
        ...formData,
        statut: 'termine',
        dateCompletee: new Date().toISOString()
      };
      saveConsultation(updatedConsultation);
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-border-light p-4 lg:p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onBack && onBack()}
              className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors"
            >
              <Icon icon={NavigationIcons.ArrowLeft} size="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg lg:text-2xl font-bold text-mediai-dark font-heading">
                Compléter la consultation
              </h2>
              <p className="text-sm lg:text-base text-mediai-medium font-body">
                {formatPatientName(consultation)}
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire de diagnostic */}
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-border-light p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-bold text-mediai-dark font-heading mb-4 lg:mb-6 flex items-center">
              <Icon icon={Icons.Document} size="w-4 h-4 lg:w-5 lg:h-5" className="mr-2" />
              Diagnostic et traitement médical
            </h3>
            
            <div className="space-y-4 lg:space-y-6">
              {/* Diagnostic */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Diagnostic <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.diagnostic}
                  onChange={(e) => handleInputChange('diagnostic', e.target.value)}
                  placeholder="Saisissez le diagnostic principal et différentiel..."
                  className="w-full p-3 lg:p-4 border border-border-light rounded-lg lg:rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none text-sm lg:text-base"
                  rows={3}
                  required
                />
              </div>

              {/* Recommandations médicales */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Recommandations médicales <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.recommandations}
                  onChange={(e) => handleInputChange('recommandations', e.target.value)}
                  placeholder="Recommandations générales pour le suivi du patient..."
                  className="w-full p-3 lg:p-4 border border-border-light rounded-lg lg:rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none text-sm lg:text-base"
                  rows={3}
                  required
                />
              </div>

              {/* Traitement proposé */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Traitement proposé <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.traitement}
                  onChange={(e) => handleInputChange('traitement', e.target.value)}
                  placeholder="Détaillez le plan de traitement : médicaments, posologie, durée..."
                  className="w-full p-3 lg:p-4 border border-border-light rounded-lg lg:rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none text-sm lg:text-base"
                  rows={4}
                  required
                />
              </div>

              {/* Examens complémentaires */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Examens complémentaires
                </label>
                <textarea
                  value={formData.examen_complementaire}
                  onChange={(e) => handleInputChange('examen_complementaire', e.target.value)}
                  placeholder="Examens de laboratoire, imagerie, consultations spécialisées..."
                  className="w-full p-3 lg:p-4 border border-border-light rounded-lg lg:rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none text-sm lg:text-base"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-border-light p-4 lg:p-6">
            <div className="flex flex-col space-y-4">
              {/* Boutons d'action */}
              <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
                <button
                  type="button"
                  onClick={() => onBack && onBack()}
                  className="w-full lg:w-auto px-4 lg:px-6 py-3 border border-border-light text-mediai-dark rounded-lg hover:bg-light transition-colors font-body text-sm lg:text-base"
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const tempConsultation = { ...consultation, ...formData };
                    onPrint && onPrint(tempConsultation);
                  }}
                  className="w-full lg:w-auto px-4 lg:px-6 py-3 bg-success text-white rounded-lg hover:bg-mediai-dark transition-colors font-body text-sm lg:text-base"
                >
                  Aperçu impression
                </button>
                
                <button
                  type="submit"
                  disabled={!formData.diagnostic || !formData.recommandations || !formData.traitement}
                  className="w-full lg:w-auto px-4 lg:px-6 py-3 gradient-mediai text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-body text-sm lg:text-base"
                >
                  Finaliser et sauvegarder
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };

export default ConsultationDetails;