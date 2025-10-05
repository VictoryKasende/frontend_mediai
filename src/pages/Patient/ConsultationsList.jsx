import React, { useState, useEffect, useCallback } from 'react';
import { MedicalIcons, NavigationIcons, StatusIcons } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { consultationService, authService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Liste des consultations du patient avec filtres et recherche
 */
const ConsultationsList = ({ onViewDetails }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [consultations, setConsultations] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError } = useNotification();

  // Charger les médecins et consultations depuis l'API
  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Charger les médecins en premier
      await loadMedecins();
      // Puis charger les consultations
      await loadConsultations();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  }, [loadMedecins, loadConsultations]);

  const loadMedecins = useCallback(async () => {
    try {
      const response = await authService.getMedecins();
      const medecinsList = response.results || response;
      setMedecins(medecinsList);
      console.log('Médecins chargés pour consultations:', medecinsList);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      setMedecins([]);
    }
  }, []);

  // Fonction pour obtenir les informations du médecin assigné
  const getMedecinInfo = (consultation) => {
    // Essayer plusieurs champs possibles pour l'ID du médecin
    const possibleMedecinIds = [
      consultation.assigned_medecin,
      consultation.medecin_assigned, 
      consultation.medecin_id,
      consultation.medecin,
      consultation.doctor_id,
      consultation.doctor,
      consultation.medecin_responsable
    ];
    
    for (const medecinId of possibleMedecinIds) {
      if (medecinId !== undefined && medecinId !== null) {
        const medecin = medecins.find(m => m.id === medecinId);
        if (medecin) {
          console.log(`Médecin trouvé pour consultation ${consultation.id}:`, medecin);
          return `Dr ${medecin.first_name} ${medecin.last_name}`;
        }
      }
    }
    
    // Fallback sur les données de la consultation
    if (consultation.medecin_nom && consultation.medecin_prenom) {
      return `Dr ${consultation.medecin_prenom} ${consultation.medecin_nom}`;
    }
    
    if (consultation.medecin_nom) {
      return consultation.medecin_nom;
    }
    
    return 'Médecin non assigné';
  };

  const loadConsultations = useCallback(async () => {
    try {
      setError(null);
      
      // Récupérer toutes les consultations avec vue simplifiée pour patients
      const response = await consultationService.getConsultations({
        is_patient_distance: true
      });
      
      // Extraire le tableau des consultations depuis la réponse
      const allConsultations = response.results || [];
      
      // Filtrer les consultations pour ne garder que celles de l'utilisateur connecté
      const userConsultations = allConsultations.filter(consultation => {
        // Si la consultation a un champ user qui correspond à l'ID utilisateur
        if (consultation.user && user?.id) {
          return consultation.user === user.id;
        }
        
        // Sinon, filtrer par nom et prénom si disponibles
        if (user?.nom && user?.prenom) {
          return consultation.nom === user.nom && consultation.prenom === user.prenom;
        }
        
        // Si pas de critères de filtrage clairs, inclure toutes les consultations pour éviter les erreurs
        return true;
      });

      // Enrichir chaque consultation avec les détails complets (incluant médecin assigné)
      console.log('Enrichissement des consultations avec les détails complets...');
      const enrichedConsultations = await Promise.all(
        userConsultations.map(async (consultation) => {
          try {
            const detailedConsultation = await consultationService.getConsultation(consultation.id);
            console.log(`Consultation ${consultation.id} enrichie:`, detailedConsultation);
            return detailedConsultation;
          } catch (error) {
            console.error(`Erreur lors de l'enrichissement de la consultation ${consultation.id}:`, error);
            // En cas d'erreur, garder la consultation originale
            return consultation;
          }
        })
      );
      
      setConsultations(enrichedConsultations);
      console.log('Consultations enrichies chargées:', enrichedConsultations);
      console.log('Utilisateur connecté:', user);
      
      // Debug des consultations pour voir les données de médecin
      enrichedConsultations.forEach((consultation, index) => {
        console.log(`Consultation enrichie ${index + 1} - CHAMPS MÉDECIN:`, {
          id: consultation.id,
          assigned_medecin: consultation.assigned_medecin,
          medecin_assigned: consultation.medecin_assigned,
          medecin_id: consultation.medecin_id,
          medecin: consultation.medecin,
          medecin_nom: consultation.medecin_nom,
          medecin_prenom: consultation.medecin_prenom,
          doctor_id: consultation.doctor_id,
          doctor: consultation.doctor,
          medecin_responsable: consultation.medecin_responsable,
          motif: consultation.motif_consultation
        });
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error);
      setError('Impossible de charger les consultations');
      showError('Erreur', 'Impossible de charger les consultations');
      setConsultations([]);
    }
  }, [user?.id, user, showError]);

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
      const searchText = searchTerm.toLowerCase();
      const medecinName = getMedecinInfo(consultation).toLowerCase();
      const matchesSearch = 
        medecinName.includes(searchText) ||
        (consultation.medecin_specialite || '').toLowerCase().includes(searchText) ||
        (consultation.motif_consultation || '').toLowerCase().includes(searchText) ||
        (consultation.symptomes || '').toLowerCase().includes(searchText) ||
        (consultation.numero_ordre || '').toLowerCase().includes(searchText) ||
        `CONS-${consultation.id}`.toLowerCase().includes(searchText);
      
      const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': {
          // Fonction utilitaire pour obtenir une date valide
          const getValidDate = (consultation) => {
            const possibleDates = [
              consultation.date_creation,
              consultation.date_soumission,
              consultation.created_at,
              consultation.date_consultation,
              consultation.updated_at
            ];
            
            for (const dateStr of possibleDates) {
              if (dateStr) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                  return date;
                }
              }
            }
            return new Date(0); // Date par défaut très ancienne
          };
          
          return getValidDate(b) - getValidDate(a);
        }
        case 'date_asc': {
          const getValidDateAsc = (consultation) => {
            const possibleDates = [
              consultation.date_creation,
              consultation.date_soumission,
              consultation.created_at,
              consultation.date_consultation,
              consultation.updated_at
            ];
            
            for (const dateStr of possibleDates) {
              if (dateStr) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                  return date;
                }
              }
            }
            return new Date(0); // Date par défaut très ancienne
          };
          
          return getValidDateAsc(a) - getValidDateAsc(b);
        }
        case 'medecin': {
          const nameA = getMedecinInfo(a);
          const nameB = getMedecinInfo(b);
          return nameA.localeCompare(nameB);
        }
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
                  placeholder="Rechercher par médecin, spécialité, motif, symptômes ou numéro de dossier..."
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
                        {getMedecinInfo(consultation)}
                      </h3>
                      <p className="text-mediai-primary text-sm font-semibold mb-1">
                        {consultation.medecin_specialite || 'Médecine générale'}
                      </p>
                      <div className="flex items-center gap-2 text-xs lg:text-sm text-mediai-medium">
                        <span>Dossier: CONS-{consultation.id}</span>
                        {consultation.numero_ordre && (
                          <>
                            <span>•</span>
                            <span>N° ordre: {consultation.numero_ordre}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col sm:items-end gap-2">
                      <span className={getStatusColor(consultation.status)}>
                        {getStatusLabel(consultation.status)}
                      </span>
                      <p className="text-xs lg:text-sm text-mediai-medium">
                        Soumis le {(() => {
                          // Essayer plusieurs champs de date possibles
                          const possibleDates = [
                            consultation.date_creation,
                            consultation.date_soumission,
                            consultation.created_at,
                            consultation.date_consultation,
                            consultation.updated_at
                          ];
                          
                          for (const dateStr of possibleDates) {
                            if (dateStr) {
                              const date = new Date(dateStr);
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('fr-FR');
                              }
                            }
                          }
                          
                          return 'Date non disponible';
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Motif et symptômes */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-mediai-dark mb-2 text-sm lg:text-base">Motif de consultation</h4>
                      <p className="text-medical-body text-sm lg:text-base line-clamp-2 text-gray-700 leading-relaxed">
                        {consultation.motif_consultation || 'Aucun motif spécifié'}
                      </p>
                    </div>
                    
                    {consultation.symptomes && (
                      <div>
                        <h4 className="font-semibold text-mediai-dark mb-2 text-sm lg:text-base">Symptômes décrits</h4>
                        <p className="text-medical-body text-sm lg:text-base line-clamp-2 text-gray-700 leading-relaxed">
                          {consultation.symptomes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Informations de RDV et actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                      {consultation.date_consultation && (
                        <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100">
                          <MedicalIcons.Calendar className="w-4 h-4 text-mediai-primary" />
                          <span className="text-xs lg:text-sm text-gray-700 font-medium">
                            {(() => {
                              const date = new Date(consultation.date_consultation);
                              return !isNaN(date.getTime()) ? date.toLocaleDateString('fr-FR') : 'Date invalide';
                            })()}
                          </span>
                        </div>
                      )}
                      
                      {consultation.heure_debut && (
                        <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100">
                          <MedicalIcons.Clock className="w-4 h-4 text-green-500" />
                          <span className="text-xs lg:text-sm text-gray-700 font-medium">
                            {consultation.heure_debut}
                          </span>
                        </div>
                      )}

                      {consultation.urgence && (
                        <div className={`flex items-center space-x-1 p-2 bg-white rounded-lg border border-gray-100 ${getUrgenceColor(consultation.urgence)}`}>
                          <StatusIcons.Info className="w-4 h-4" />
                          <span className="text-xs lg:text-sm capitalize font-medium">
                            {consultation.urgence}
                          </span>
                        </div>
                      )}

                      {consultation.is_patient_distance && (
                        <div className="flex items-center space-x-1 p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h8.25a1.125 1.125 0 001.125-1.125V8.625a1.125 1.125 0 00-1.125-1.125H13.5m0 6.75v2.25a1.125 1.125 0 001.125 1.125H16.5a1.125 1.125 0 001.125-1.125v-2.25m-8.25-6.75h2.25A1.125 1.125 0 007.5 4.875v2.25m8.25 0V4.875c0-.621-.504-1.125-1.125-1.125H13.5m0 0V2.625c0-.621.504-1.125 1.125-1.125h1.875c.621 0 1.125.504 1.125 1.125v8.25" />
                          </svg>
                          <span className="text-xs lg:text-sm font-medium">
                            À distance
                          </span>
                        </div>
                      )}
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
                          ({(() => {
                            const date = new Date(consultation.reponse_medecin.date);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString('fr-FR') : 'Date invalide';
                          })()})
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
                          {(() => {
                            const date = new Date(consultation.reponse_medecin.nouveau_rdv);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString('fr-FR') : 'Date invalide';
                          })()}
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
