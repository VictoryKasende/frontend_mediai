import React, { useState, useEffect } from 'react';
import { MedicalIcons, NavigationIcons, StatusIcons } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { consultationService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * Liste des consultations du patient avec filtres et recherche
 */
const ConsultationsList = ({ onBack, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError } = useNotification();

  // Charger les consultations depuis l'API
  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les consultations avec vue simplifiée pour patients
      const response = await consultationService.getConsultations({
        is_patient_distance: true
      });
      
      // Extraire le tableau des consultations depuis la réponse
      const consultationsData = response.results || [];
      setConsultations(consultationsData);
      console.log('Consultations chargées:', consultationsData);
      
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error);
      setError('Impossible de charger les consultations');
      showError('Erreur de chargement', 'Impossible de charger les consultations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm";
    switch (statut) {
      case 'en_analyse':
        return `${baseClasses} bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200`;
      case 'analyse_terminee':
        return `${baseClasses} bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200`;
      case 'valide_medecin':
        return `${baseClasses} bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200`;
      case 'rejete_medecin':
        return `${baseClasses} bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200`;
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'en_analyse':
        return 'En analyse IA';
      case 'analyse_terminee':
        return 'Analyse terminée';
      case 'valide_medecin':
        return 'Validée par médecin';
      case 'rejete_medecin':
        return 'Rejetée par médecin';
      default:
        return statut || 'En attente';
    }
  };

  const getUrgenceColor = (urgence) => {
    switch (urgence) {
      case 'elevee':
        return 'text-red-600';
      case 'moyenne':
        return 'text-orange-600';
      case 'normale':
        return 'text-mediai-primary';
      case 'faible':
        return 'text-green-600';
      default:
        return 'text-mediai-medium';
    }
  };

  const filteredConsultations = consultations
    .filter(consultation => {
      const matchesSearch = (consultation.medecin_nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (consultation.motif_consultation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (consultation.id ? `CONS-${consultation.id}` : '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.date_creation || b.date_soumission) - new Date(a.date_creation || a.date_soumission);
        case 'date_asc':
          return new Date(a.date_creation || a.date_soumission) - new Date(b.date_creation || b.date_soumission);
        case 'medecin':
          return (a.medecin_nom || '').localeCompare(b.medecin_nom || '');
        case 'statut':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-light animate-fadeIn">
      {/* Header intentionally removed; this view is embedded within the patient shell */}

      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-8">
        {/* Filtres et recherche */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 lg:p-6 shadow-sm border border-mediai-primary hover:shadow-lg transition-all duration-300 mb-4 lg:mb-6">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="relative">
                <Input
                  placeholder="Rechercher par médecin, motif ou numéro de dossier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 bg-white border-2 border-mediai-medium focus:border-mediai-primary focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-mediai-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-white px-4 py-3 pr-10 border-2 border-mediai-medium rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-xs lg:text-sm cursor-pointer hover:border-mediai-primary"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en_analyse">En analyse IA</option>
                  <option value="analyse_terminee">Analyse terminée</option>
                  <option value="valide_medecin">Validée par médecin</option>
                  <option value="rejete_medecin">Rejetée par médecin</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-mediai-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-white px-4 py-3 pr-10 border-2 border-mediai-medium rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-xs lg:text-sm cursor-pointer hover:border-mediai-primary"
                >
                  <option value="date_desc">Plus récent</option>
                  <option value="date_asc">Plus ancien</option>
                  <option value="medecin">Par médecin</option>
                  <option value="statut">Par statut</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-mediai-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          {[
            { 
              label: 'En analyse', 
              value: consultations.filter(c => c.status === 'en_analyse').length,
              color: 'bg-gradient-to-r from-blue-500 to-blue-600',
              textColor: 'text-blue-700'
            },
            { 
              label: 'Analyse terminée', 
              value: consultations.filter(c => c.status === 'analyse_terminee').length,
              color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
              textColor: 'text-yellow-700'
            },
            { 
              label: 'Validées', 
              value: consultations.filter(c => c.status === 'valide_medecin').length,
              color: 'bg-gradient-to-r from-green-500 to-green-600',
              textColor: 'text-green-700'
            },
            { 
              label: 'Rejetées', 
              value: consultations.filter(c => c.status === 'rejete_medecin').length,
              color: 'bg-gradient-to-r from-red-500 to-red-600',
              textColor: 'text-red-700'
            }
          ].map((stat, index) => (
            <div key={index} className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 lg:p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-bold ${stat.color} text-white shadow-md`}>
                  {stat.value}
                </div>
                <p className={`text-xs lg:text-sm mt-2 font-medium ${stat.textColor}`}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 border-4 border-mediai-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-mediai-dark mb-2">Chargement des consultations...</h3>
            <p className="text-mediai-medium">Veuillez patienter</p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 shadow-sm border border-red-200 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <StatusIcons.Error className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={loadConsultations}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Liste des consultations */}
        {!loading && !error && (
          <div className="space-y-3 lg:space-y-4">{filteredConsultations.length === 0 ? (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MedicalIcons.Files className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-medical-subtitle text-lg lg:text-xl mb-2 font-bold text-mediai-dark">Aucune consultation trouvée</h3>
              <p className="text-medical-body text-sm lg:text-base text-mediai-medium">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Vous n\'avez pas encore créé de fiche de consultation.'
                }
              </p>
            </div>
          ) : (
            filteredConsultations.map((consultation, index) => (
              <div 
                key={consultation.id} 
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col gap-4">
                  {/* Header de la consultation */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-medical-subtitle text-base lg:text-lg mb-1 font-bold text-mediai-dark group-hover:text-mediai-primary transition-colors duration-300">
                        {consultation.medecin_nom || 'Médecin non assigné'}
                      </h3>
                      <p className="text-mediai-primary text-sm font-semibold mb-1">
                        {consultation.medecin_specialite || 'Médecine générale'}
                      </p>
                      <p className="text-xs lg:text-sm text-mediai-medium">
                        Dossier: CONS-{consultation.id}
                      </p>
                    </div>
                    
                    <div className="flex sm:flex-col sm:items-end gap-2">
                      <span className={getStatusColor(consultation.status)}>
                        {getStatusLabel(consultation.status)}
                      </span>
                      <p className="text-xs lg:text-sm text-mediai-medium">
                        Soumis le {new Date(consultation.date_creation || consultation.date_soumission).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Motif de consultation */}
                  <div>
                    <h4 className="font-semibold text-mediai-dark mb-2 text-sm lg:text-base">Motif de consultation</h4>
                    <p className="text-medical-body text-sm lg:text-base line-clamp-2 text-gray-700 leading-relaxed">
                      {consultation.motif_consultation || 'Aucun motif spécifié'}
                    </p>
                  </div>

                  {/* Informations de RDV et actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                      <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100">
                        <MedicalIcons.Calendar className="w-4 h-4 text-mediai-primary" />
                        <span className="text-xs lg:text-sm text-gray-700 font-medium">
                          {new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100">
                        <MedicalIcons.Clock className="w-4 h-4 text-green-500" />
                        <span className="text-xs lg:text-sm text-gray-700 font-medium">
                          {consultation.heure_debut}
                        </span>
                      </div>

                      <div className={`flex items-center space-x-1 p-2 bg-white rounded-lg border border-gray-100 ${getUrgenceColor(consultation.urgence)}`}>
                        <StatusIcons.Info className="w-4 h-4" />
                        <span className="text-xs lg:text-sm capitalize font-medium">
                          {consultation.urgence}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(consultation.id)}
                      className="group/btn flex items-center justify-center space-x-2 w-full sm:w-auto justify-center text-xs lg:text-sm border-2 border-mediai-medium hover:border-mediai-primary hover:bg-mediai-light transform hover:scale-105 transition-all duration-300"
                    >
                      <MedicalIcons.Eye className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                      <span>Voir détails</span>
                    </Button>
                  </div>

                  {/* Statut de la réponse médecin */}
                  {consultation.reponse_medecin && (
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <StatusIcons.Success className="w-4 h-4 text-green-600" />
                          <span className="text-xs lg:text-sm text-green-800 font-medium">
                            Réponse du médecin disponible
                          </span>
                        </div>
                        <span className="text-xs text-green-600">
                          ({new Date(consultation.reponse_medecin.date).toLocaleDateString('fr-FR')})
                        </span>
                      </div>
                    </div>
                  )}

                  {consultation.statut === 'annulee' && consultation.reponse_medecin?.nouveau_rdv && (
                    <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <StatusIcons.Warning className="w-4 h-4 text-orange-600" />
                          <span className="text-xs lg:text-sm text-orange-800 font-medium">
                            Nouveau RDV proposé
                          </span>
                        </div>
                        <span className="text-xs text-orange-600">
                          {new Date(consultation.reponse_medecin.nouveau_rdv).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationsList;
