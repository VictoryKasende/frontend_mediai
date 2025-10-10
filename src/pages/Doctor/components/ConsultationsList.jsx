import React, { useState, useEffect } from 'react';
import { Icon, StatusIcons, ActionIcons, NavigationIcons, MedicalIcons, MedicalIcon, WhatsAppIcon } from '../../../components/Icons';

// Fonctions utilitaires
const formatPatientName = (consultation) => {
  const nom = consultation.nom || '';
  const prenom = consultation.prenom || '';
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

const getStatutColor = (status) => {
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

const getStatutLabel = (status) => {
  switch (status) {
    case 'en_attente':
      return 'En attente';
    case 'en_cours':
      return 'En cours';
    case 'termine':
    case 'terminee':
      return 'Terminé';
    case 'validee_medecin':
      return 'Validée';
    case 'analyse_terminee':
      return 'Analyse terminée';
    case 'rejetee':
      return 'Rejetée';
    case 'reporte':
      return 'Reporté';
    default:
      return status || 'Statut inconnu';
  }
};

const getUrgenceColor = (urgence) => {
  switch (urgence?.toLowerCase()) {
    case 'urgent':
    case 'critique':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'modere':
    case 'moyen':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'faible':
    case 'normal':
    default:
      return 'bg-green-100 text-green-800 border-green-200';
  }
};

const getConsultationDate = (consultation) => {
  return consultation.date_consultation || consultation.date_creation || consultation.created_at;
};

/**
 * Composant de liste des consultations avec filtres et recherche
 */
export default function ConsultationsList({ 
  consultations = [], 
  isLoading,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onConsultationClick,
  onEdit,
  onValidate,
  onReject,
  onOpenMessages,
  onOpenWhatsApp,
  onOpenAIAnalysis,
  onExportToPDF,
  onNewConsultation,
  user,
  children,
  selectedConsultation
}) {
  // Configuration des filtres de statut
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts', count: consultations?.length || 0 },
    { value: 'en_attente', label: 'En attente', count: consultations?.filter(c => c.status === 'en_attente').length || 0 },
    { value: 'en_analyse', label: 'En analyse IA', count: consultations?.filter(c => c.status === 'en_analyse').length || 0 },
    { value: 'analyse_terminee', label: 'Analyse terminée', count: consultations?.filter(c => c.status === 'analyse_terminee').length || 0 },
    { value: 'valide_medecin', label: 'Validée', count: consultations?.filter(c => c.status === 'valide_medecin' || c.status === 'validee').length || 0 },
    { value: 'rejete_medecin', label: 'Rejetée', count: consultations?.filter(c => c.status === 'rejete_medecin').length || 0 }
  ];

  // Options de tri
  const sortOptions = [
    { value: 'date_desc', label: 'Plus récentes' },
    { value: 'date_asc', label: 'Plus anciennes' },
    { value: 'urgence_desc', label: 'Urgence décroissante' },
    { value: 'urgence_asc', label: 'Urgence croissante' },
    { value: 'patient_asc', label: 'Patient A-Z' },
    { value: 'patient_desc', label: 'Patient Z-A' }
  ];

  return (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-2xl p-6 shadow-custom border border-border-light">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recherche */}
          <div className="relative">
            <label className="block text-sm font-semibold text-mediai-dark mb-2">
              Rechercher
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nom, téléphone, symptômes..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary bg-light"
              />
              <Icon
                icon={StatusIcons.Search}
                size="w-5 h-5"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mediai-medium"
              />
            </div>
          </div>

          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-semibold text-mediai-dark mb-2">
              Filtrer par statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary bg-light"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>


        </div>
      </div>

      {/* Liste des consultations */}
      <div className="bg-white rounded-2xl shadow-custom border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light flex items-center justify-between">
          <h3 className="text-xl font-bold text-mediai-dark">
            Consultations ({consultations?.length || 0}) • Dr. {user?.username || 'Médecin'}
          </h3>
          {onNewConsultation && (
            <button
              onClick={onNewConsultation}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ActionIcons.Plus className="w-5 h-5" />
              <span className="font-medium">Nouvelle consultation</span>
            </button>
          )}
        </div>

        {!consultations || consultations.length === 0 ? (
          <div className="p-12 text-center">
            <Icon icon={StatusIcons.Search} size="w-16 h-16" className="mx-auto text-mediai-light mb-4" />
            <h4 className="text-lg font-semibold text-mediai-medium mb-2">
              Aucune consultation trouvée
            </h4>
            <p className="text-mediai-medium">
              Aucune consultation ne correspond à vos critères de recherche.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-light rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className={`p-6 hover:bg-light transition-all duration-300 cursor-pointer ${
                  selectedConsultation?.id === consultation.id ? 'bg-mediai-primary/5 border-l-4 border-mediai-primary' : ''
                }`}
                onClick={() => onConsultationClick(consultation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="font-bold text-mediai-dark text-lg">
                        {formatPatientName(consultation)}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatutColor(consultation.status)}`}>
                        {getStatutLabel(consultation.status)}
                      </span>
                      {consultation.urgence && (
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getUrgenceColor(consultation.urgence)}`}>
                          {consultation.urgence}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center text-mediai-medium">
                          <Icon icon={ActionIcons.Phone} size="w-4 h-4" className="mr-2" />
                          {consultation.telephone || 'Non renseigné'}
                        </div>
                        {consultation.age && (
                          <div className="flex items-center text-mediai-medium">
                            <Icon icon={StatusIcons.Star} size="w-4 h-4" className="mr-2" />
                            {consultation.age} ans
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-mediai-medium">
                          <MedicalIcon icon={MedicalIcons.Calendar} size="w-4 h-4" className="mr-2" />
                          {formatDate(getConsultationDate(consultation))}
                        </div>
                        {consultation.motif_consultation && (
                          <div className="flex items-start text-mediai-medium">
                            <MedicalIcon icon={MedicalIcons.Document} size="w-4 h-4" className="mr-2 mt-0.5" />
                            <span className="line-clamp-2">{consultation.motif_consultation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Barre d'actions avec animations et badges */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Actions rapides pour analyse_terminee */}
                    {consultation.status === 'analyse_terminee' && (
                      <>
                        {/* Valider - Avec animation de succès */}
                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onValidate(consultation);
                            }}
                            className="p-2 text-green-600 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-green-200"
                            title="Validation rapide"
                          >
                            <MedicalIcon icon={MedicalIcons.Check} size="w-5 h-5" className="animate-pulse" />
                          </button>
                          <div className="absolute invisible group-hover:visible bg-green-600 text-white text-xs rounded py-1 px-2 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                            ✅ Valider la consultation
                          </div>
                        </div>
                        
                        {/* Rejeter - Avec animation d'alerte */}
                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReject(consultation);
                            }}
                            className="p-2 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-red-200 hover:rotate-12"
                            title="Rejet rapide"
                          >
                            <Icon icon={StatusIcons.Error} size="w-5 h-5" className="animate-bounce" />
                          </button>
                          <div className="absolute invisible group-hover:visible bg-red-600 text-white text-xs rounded py-1 px-2 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                            ❌ Rejeter la consultation
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Messages - Avec compteur toujours visible */}
                    {isConsultationValidated(consultation) && (
                      <div className="relative group">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMessages(consultation);
                          }}
                          className="relative p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                        >
                          <Icon icon={ActionIcons.Message} size="w-5 h-5" />
                          {/* Compteur de messages toujours visible */}
                          <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 bg-blue-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-md">
                            {consultation.unread_messages || 0}
                          </span>
                        </button>
                        <div className="absolute invisible group-hover:visible bg-blue-600 text-white text-xs rounded py-1 px-2 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                          💬 {consultation.unread_messages > 0 ? `${consultation.unread_messages} nouveau(x) message(s)` : 'Messagerie'}
                        </div>
                      </div>
                    )}

                    {/* WhatsApp - Avec vraie icône WhatsApp */}
                    {isConsultationValidated(consultation) && isConsultationComplete(consultation) && (
                      <div className="relative group">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenWhatsApp(consultation);
                          }}
                          className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg animate-pulse hover:animate-none"
                        >
                          <WhatsAppIcon size="w-5 h-5" />
                        </button>
                        <div className="absolute invisible group-hover:visible bg-green-600 text-white text-xs rounded py-1 px-2 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                          📱 Envoyer sur WhatsApp
                        </div>
                      </div>
                    )}

                    {/* Analyse IA - Avec effet brillant */}
                    {isConsultationValidated(consultation) && (
                      <div className="relative group">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAIAnalysis(consultation);
                          }}
                          className="relative p-2 text-purple-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          <MedicalIcon icon={MedicalIcons.Brain} size="w-5 h-5" className="relative z-10" />
                        </button>
                        <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                          🧠 Analyse IA
                        </div>
                      </div>
                    )}
                    
                    {/* Export PDF - Avec effet de téléchargement */}
                    {isConsultationValidated(consultation) && isConsultationComplete(consultation) && (
                      <div className="relative group">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportToPDF(consultation);
                          }}
                          className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:rotate-12"
                        >
                          <Icon icon={ActionIcons.Download} size="w-5 h-5" />
                        </button>
                        <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                          📄 Exporter en PDF
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals et actions supplémentaires */}
      {children}
    </div>
  );
}