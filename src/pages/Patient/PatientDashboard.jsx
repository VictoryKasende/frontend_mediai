import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useLogout } from '../../hooks/useLogout';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import FicheConsultationForm from './FicheConsultationForm';
import ConsultationsList from './ConsultationsList';
import ConsultationDetails from './ConsultationDetails';
import { consultationService, authService } from '../../services/api';

/**
 * Tableau de bord Patient - Point d'entrée pour les fonctionnalités patient
 */
const PatientDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo, notifications, removeNotification } = useNotification();
  const { handleLogout } = useLogout();
  
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    en_analyse: 0,
    analyse_terminee: 0,
    valide_medecin: 0,
    rejete_medecin: 0
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  
  // États pour la section médecins
  const [searchTerm, setSearchTerm] = useState('');
  const [specialiteFilter, setSpecialiteFilter] = useState('all');
  const [disponibiliteFilter, setDisponibiliteFilter] = useState('all');
  const [medecins, setMedecins] = useState([]);
  const [loadingMedecins, setLoadingMedecins] = useState(false);

  useEffect(() => {
    if (activeView === 'dashboard') {
      loadDashboardData();
    } else if (activeView === 'medecins') {
      loadMedecinsData();
    }
  }, [activeView]);

  // Fonction pour obtenir les informations du médecin assigné
  const getMedecinInfo = (consultation) => {
    console.log('PatientDashboard - getMedecinInfo pour consultation:', consultation.id);
    
    // Vérifier d'abord si les données du médecin sont directement disponibles
    if (consultation.medecin_prenom && consultation.medecin_nom) {
      console.log('Dashboard - Utilisation medecin_prenom + medecin_nom');
      return `Dr ${consultation.medecin_prenom} ${consultation.medecin_nom}`;
    }
    
    if (consultation.medecin_nom) {
      console.log('Dashboard - Utilisation medecin_nom uniquement');
      return consultation.medecin_nom;
    }
    
    // Vérifier les IDs de médecin assigné
    const medecinId = consultation.assigned_medecin || consultation.medecin_id || consultation.medecin;
    if (medecinId && medecins.length > 0) {
      const medecin = medecins.find(m => m.id === medecinId);
      console.log('Dashboard - Médecin trouvé par ID:', medecin);
      if (medecin) {
        return `Dr ${medecin.first_name} ${medecin.last_name}`;
      }
    }
    
    console.log('Dashboard - Aucun médecin trouvé');
    return 'Médecin non assigné';
  };

  const loadMedecinsData = async () => {
    try {
      setLoadingMedecins(true);
      const response = await authService.getMedecins();
      const medecinsList = response.results || response;
      setMedecins(medecinsList);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      // Fallback avec données statiques
      setMedecins([
        {
          id: 1,
          first_name: 'Jean',
          last_name: 'Mukendi',
          email: 'j.mukendi@mediai.com',
          phone: '+243123456789',
          medecin_profile: {
            specialty: 'Médecine générale',
            phone_number: '+243123456789',
            address: 'Cabinet Médical, Av. Kabasele, Kinshasa',
            is_available: true
          }
        },
        {
          id: 2,
          first_name: 'Marie',
          last_name: 'Kalala',
          email: 'm.kalala@mediai.com',
          phone: '+243987654321',
          medecin_profile: {
            specialty: 'Cardiologie',
            phone_number: '+243987654321',
            address: 'Clinique Cardiologique, Bd. Lumumba, Kinshasa',
            is_available: true
          }
        },
        {
          id: 3,
          first_name: 'Paul',
          last_name: 'Tshimanga',
          email: 'p.tshimanga@mediai.com',
          phone: '+243555123456',
          medecin_profile: {
            specialty: 'Pédiatrie',
            phone_number: '+243555123456',
            address: 'Clinique Pédiatrique, Av. Binza, Kinshasa',
            is_available: false
          }
        },
        {
          id: 4,
          first_name: 'Grace',
          last_name: 'Mbuyi',
          email: 'g.mbuyi@mediai.com',
          phone: '+243777888999',
          medecin_profile: {
            specialty: 'Gynécologie',
            phone_number: '+243777888999',
            address: 'Centre Gynécologique, Av. Kimbangu, Kinshasa',
            is_available: true
          }
        },
        {
          id: 5,
          first_name: 'Joseph',
          last_name: 'Lubaki',
          email: 'j.lubaki@mediai.com',
          phone: '+243444555666',
          medecin_profile: {
            specialty: 'Dermatologie',
            phone_number: '+243444555666',
            address: 'Cabinet Dermatologique, Av. Kasavubu, Kinshasa',
            is_available: true
          }
        },
        {
          id: 6,
          first_name: 'Sylvie',
          last_name: 'Mumbere',
          email: 's.mumbere@mediai.com',
          phone: '+243333444555',
          medecin_profile: {
            specialty: 'Psychiatrie',
            phone_number: '+243333444555',
            address: 'Centre de Santé Mentale, Av. Tabora, Kinshasa',
            is_available: true
          }
        }
      ]);
      showError('Erreur', 'Impossible de charger la liste des médecins, affichage des données locales');
    } finally {
      setLoadingMedecins(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      
      // Charger toutes les consultations récentes
      const response = await consultationService.getConsultations({
        is_patient_distance: true
      });
      
      // Extraire le tableau des consultations depuis la réponse
      const allConsultations = response.results || [];
      
      // Filtrer les consultations pour ne garder que celles de l'utilisateur connecté
      // On peut filtrer par user.id s'il existe, sinon par nom/prénom de l'utilisateur
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
      
      // Prendre les 5 plus récentes de l'utilisateur
      let recent = userConsultations
        .sort((a, b) => new Date(b.created_at || b.date_consultation) - new Date(a.created_at || a.date_consultation))
        .slice(0, 5);
      
      // Enrichir chaque consultation avec les détails complets pour avoir les infos du médecin
      const enrichedConsultations = await Promise.all(
        recent.map(async (consultation) => {
          try {
            const detailedConsultation = await consultationService.getConsultation(consultation.id);
            console.log('Dashboard - Consultation enrichie:', consultation.id, detailedConsultation);
            return detailedConsultation;
          } catch (error) {
            console.error('Dashboard - Erreur lors de l\'enrichissement de la consultation:', consultation.id, error);
            return consultation; // Retourner la consultation originale en cas d'erreur
          }
        })
      );
      
      setRecentConsultations(enrichedConsultations);
      
      // Calculer les statistiques pour l'utilisateur connecté
      const stats = {
        total: userConsultations.length,
        en_analyse: userConsultations.filter(c => c.status === 'en_analyse').length,
        analyse_terminee: userConsultations.filter(c => c.status === 'analyse_terminee').length,
        valide_medecin: userConsultations.filter(c => c.status === 'valide_medecin').length,
        rejete_medecin: userConsultations.filter(c => c.status === 'rejete_medecin').length
      };
      
      setDashboardStats(stats);
      
      console.log('Dashboard chargé pour l\'utilisateur:', user);
      console.log('Toutes les consultations récupérées:', allConsultations);
      console.log('Consultations filtrées pour l\'utilisateur:', userConsultations);
      console.log('Consultations enrichies récentes:', enrichedConsultations);
      console.log('Statistiques:', stats);
      
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      showError('Erreur lors du chargement des données');
    } finally {
      setLoadingDashboard(false);
    }
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Aperçu', 
      icon: NavigationIcons.Dashboard, 
      description: 'Vue d\'ensemble de vos fiches',
      color: 'text-mediai-primary'
    },
    { 
      id: 'nouvelle-fiche', 
      label: 'Envoyer fiche', 
      icon: MedicalIcons.Document, 
      description: 'Envoyer une fiche à distance',
      color: 'text-mediai-secondary'
    },
    { 
      id: 'mes-consultations', 
      label: 'Mes fiches', 
      icon: MedicalIcons.History, 
      description: 'Historique de vos envois',
      color: 'text-blue-600'
    },
    { 
      id: 'medecins', 
      label: 'Médecins', 
      icon: MedicalIcons.Doctor, 
      description: 'Voir nos médecins experts',
      color: 'text-green-600'
    }
  ];

  const getStatusBadge = (statut) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (statut) {
      case 'en_analyse':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'analyse_terminee':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'valide_medecin':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejete_medecin':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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
        return 'Rejetée';
      default:
        return statut || 'En attente';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'nouvelle-fiche':
        return <FicheConsultationForm onBack={() => setActiveView('dashboard')} />;
      case 'mes-consultations':
        return (
          <ConsultationsList
            onBack={() => setActiveView('dashboard')}
            onViewDetails={(consultationId) => {
              setSelectedConsultationId(consultationId);
              setActiveView('consultation-details');
            }}
          />
        );
      case 'consultation-details':
        return (
          <ConsultationDetails
            consultationId={selectedConsultationId}
            onBack={() => setActiveView('mes-consultations')}
          />
        );
      case 'medecins':
        return renderMedecins();
      default:
        return renderDashboardOverview();
    }
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Header moderne avec informations patient */}
      <div className="gradient-mediai shadow-2xl rounded-2xl overflow-hidden">
        <div className="px-6 lg:px-8 py-8 lg:py-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <MedicalIcon icon={MedicalIcons.User} size="w-7 h-7 lg:w-8 lg:h-8" className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight font-heading">
                    Bonjour {user?.first_name || 'Patient'}
                  </h1>
                  <p className="text-white/80 text-xs lg:text-sm font-body-medium">
                    Consultation à distance • Mediai
                  </p>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-white/90 font-body leading-relaxed max-w-2xl">
                Envoyez vos fiches de consultation à distance et suivez leur analyse par nos médecins experts.
              </p>
            </div>
            <div className="hidden lg:flex flex-col items-center space-y-3 mt-6 lg:mt-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-10 h-10 lg:w-12 lg:h-12" className="text-white/80" />
              </div>
              <p className="text-xs text-white/70 text-center font-medium">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* État de chargement */}
      {loadingDashboard && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-mediai-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mediai-medium font-medium">Chargement de vos données...</p>
        </div>
      )}

      {/* Statistiques avec les vraies données */}
      {!loadingDashboard && (
        <>
          {/* Statistiques principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="gradient-primary overflow-hidden shadow-lg rounded-xl border border-border-light hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center bg-white/20 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <MedicalIcon icon={MedicalIcons.Document} size="w-6 h-6 lg:w-7 lg:h-7" className="text-white" />
                    </div>
                  </div>
                  <div className="ml-4 lg:ml-6 w-0 flex-1">
                    <dl>
                      <dt className="text-xs lg:text-sm font-semibold text-white truncate font-medical tracking-wide uppercase">Total</dt>
                      <dd className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
                        <span className="tabular-nums">{dashboardStats.total}</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500 overflow-hidden shadow-lg rounded-xl border border-border-light hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center bg-white/20 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <MedicalIcon icon={StatusIcons.Clock} size="w-6 h-6 lg:w-7 lg:h-7" className="text-white" />
                    </div>
                  </div>
                  <div className="ml-4 lg:ml-6 w-0 flex-1">
                    <dl>
                      <dt className="text-xs lg:text-sm font-semibold text-white truncate font-medical tracking-wide uppercase">En analyse</dt>
                      <dd className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
                        <span className="tabular-nums">{dashboardStats.en_analyse}</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500 overflow-hidden shadow-lg rounded-xl border border-border-light hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center bg-white/20 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <MedicalIcon icon={StatusIcons.Success} size="w-6 h-6 lg:w-7 lg:h-7" className="text-white" />
                    </div>
                  </div>
                  <div className="ml-4 lg:ml-6 w-0 flex-1">
                    <dl>
                      <dt className="text-xs lg:text-sm font-semibold text-white truncate font-medical tracking-wide uppercase">Validées</dt>
                      <dd className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
                        <span className="tabular-nums">{dashboardStats.valide_medecin}</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-500 overflow-hidden shadow-lg rounded-xl border border-border-light hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center bg-white/20 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <MedicalIcon icon={StatusIcons.Error} size="w-6 h-6 lg:w-7 lg:h-7" className="text-white" />
                    </div>
                  </div>
                  <div className="ml-4 lg:ml-6 w-0 flex-1">
                    <dl>
                      <dt className="text-xs lg:text-sm font-semibold text-white truncate font-medical tracking-wide uppercase">Rejetées</dt>
                      <dd className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight">
                        <span className="tabular-nums">{dashboardStats.rejete_medecin}</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consultations récentes avec design amélioré */}
          {recentConsultations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-mediai-primary rounded-lg flex items-center justify-center">
                      <MedicalIcon icon={MedicalIcons.History} size="w-4 h-4" className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-mediai-dark">Fiches récentes</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveView('mes-consultations')}
                    className="text-mediai-primary border-mediai-primary hover:bg-mediai-primary hover:text-white"
                  >
                    Voir toutes →
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                    onClick={() => {
                      setSelectedConsultationId(consultation.id);
                      setActiveView('consultation-details');
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-mediai-dark group-hover:text-mediai-primary transition-colors">
                            {getMedecinInfo(consultation)}
                          </h4>
                          <span className={getStatusBadge(consultation.status)}>
                            {getStatusLabel(consultation.status)}
                          </span>
                        </div>
                        <p className="text-sm text-mediai-medium mb-2 line-clamp-2">
                          {consultation.motif_consultation || 'Aucun motif spécifié'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <MedicalIcon icon={MedicalIcons.Document} size="w-3 h-3" />
                            <span>CONS-{consultation.id}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MedicalIcon icon={StatusIcons.Calendar} size="w-3 h-3" />
                            <span>{new Date(consultation.date_creation || consultation.date_soumission).toLocaleDateString('fr-FR')}</span>
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <MedicalIcon 
                          icon={NavigationIcons.ChevronRight} 
                          size="w-5 h-5" 
                          className="text-gray-400 group-hover:text-mediai-primary transition-colors" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message si aucune consultation */}
          {!loadingDashboard && recentConsultations.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MedicalIcon icon={MedicalIcons.Document} size="w-8 h-8" className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune fiche envoyée</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                Vous n'avez pas encore envoyé de fiche de consultation à distance. 
                Créez votre première fiche pour bénéficier de nos services médicaux.
              </p>
              <Button
                onClick={() => setActiveView('nouvelle-fiche')}
                className="gradient-primary text-white"
              >
                Envoyer ma première fiche
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderMedecins = () => {
    // Obtenir les spécialités uniques
    const specialites = [...new Set(medecins.map(m => m.medecin_profile?.specialty).filter(Boolean))];

    // Filtrer les médecins
    const filteredMedecins = medecins.filter(medecin => {
      const fullName = `${medecin.first_name} ${medecin.last_name}`;
      const specialty = medecin.medecin_profile?.specialty || '';
      const address = medecin.medecin_profile?.address || '';
      
      const matchesSearch = searchTerm === '' ||
                           fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialite = specialiteFilter === 'all' || 
                               specialty === specialiteFilter;
      
      const isAvailable = medecin.medecin_profile?.is_available;
      const matchesDisponibilite = disponibiliteFilter === 'all' || 
                                   (disponibiliteFilter === 'disponible' && isAvailable) ||
                                   (disponibiliteFilter === 'indisponible' && !isAvailable);
      
      return matchesSearch && matchesSpecialite && matchesDisponibilite;
    });

    const handlePrendreRdv = (medecin) => {
      showInfo(`Prise de rendez-vous avec Dr. ${medecin.first_name} ${medecin.last_name} - Fonctionnalité en développement`);
    };

    const handleContacter = (medecin) => {
      showInfo(`Contact avec Dr. ${medecin.first_name} ${medecin.last_name} - Fonctionnalité en développement`);
    };

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header avec style Mediai */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-border-light">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 gradient-mediai rounded-xl flex items-center justify-center">
              <MedicalIcon icon={MedicalIcons.Doctor} size="w-6 h-6" className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-mediai-dark font-heading">Nos médecins experts</h2>
              <p className="text-sm text-mediai-medium font-body">
                Découvrez notre équipe de médecins spécialisés et prenez rendez-vous
              </p>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-700">{medecins.length}</div>
              <div className="text-xs text-blue-600">Total médecins</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-700">
                {medecins.filter(m => m.medecin_profile?.is_available).length}
              </div>
              <div className="text-xs text-green-600">Disponibles</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-700">{specialites.length}</div>
              <div className="text-xs text-purple-600">Spécialités</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-orange-700">24/7</div>
              <div className="text-xs text-orange-600">Support</div>
            </div>
          </div>

          {/* Filtres avec style Mediai */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Rechercher par nom, spécialité ou localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-light border-2 border-border-light focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary/20 transition-all duration-300"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MedicalIcon icon={ActionIcons.Search} size="w-5 h-5" className="text-mediai-medium" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <select
                  value={specialiteFilter}
                  onChange={(e) => setSpecialiteFilter(e.target.value)}
                  className="w-full appearance-none bg-light px-4 py-3 pr-10 border-2 border-border-light rounded-xl focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary/20 transition-all duration-300 text-sm cursor-pointer hover:border-mediai-primary font-body"
                >
                  <option value="all">Toutes les spécialités</option>
                  {specialites.map(specialite => (
                    <option key={specialite} value={specialite}>{specialite}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-mediai-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative flex-1">
                <select
                  value={disponibiliteFilter}
                  onChange={(e) => setDisponibiliteFilter(e.target.value)}
                  className="w-full appearance-none bg-light px-4 py-3 pr-10 border-2 border-border-light rounded-xl focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary/20 transition-all duration-300 text-sm cursor-pointer hover:border-mediai-primary font-body"
                >
                  <option value="all">Tous les médecins</option>
                  <option value="disponible">Disponibles</option>
                  <option value="indisponible">Indisponibles</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-mediai-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Résultats de recherche */}
            {!loadingMedecins && (
              <div className="text-sm text-mediai-medium">
                {filteredMedecins.length} médecin{filteredMedecins.length > 1 ? 's' : ''} trouvé{filteredMedecins.length > 1 ? 's' : ''}
                {medecins.length !== filteredMedecins.length && ` sur ${medecins.length} total`}
              </div>
            )}
          </div>
        </div>

        {/* État de chargement */}
        {loadingMedecins && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-border-light text-center">
            <div className="w-8 h-8 border-4 border-mediai-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-mediai-medium">Chargement des médecins experts...</p>
          </div>
        )}

        {/* Liste des médecins */}
        {!loadingMedecins && (
          <div className="space-y-4">
            {filteredMedecins.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-border-light text-center">
                <div className="w-16 h-16 gradient-mediai rounded-full flex items-center justify-center mx-auto mb-4">
                  <MedicalIcon icon={MedicalIcons.Doctor} size="w-8 h-8" className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-mediai-dark mb-2 font-heading">Aucun médecin trouvé</h3>
                <p className="text-sm text-mediai-medium font-body mb-4">
                  {medecins.length === 0 
                    ? 'Aucun médecin disponible pour le moment.'
                    : 'Aucun médecin ne correspond à vos critères de recherche.'
                  }
                </p>
                {filteredMedecins.length === 0 && medecins.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSpecialiteFilter('all');
                      setDisponibiliteFilter('all');
                    }}
                    className="text-mediai-primary hover:underline text-sm"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMedecins.map((medecin) => {
                  const isAvailable = medecin.medecin_profile?.is_available;
                  const specialty = medecin.medecin_profile?.specialty || 'Médecine générale';
                  const address = medecin.medecin_profile?.address || 'Adresse non renseignée';
                  const phone = medecin.medecin_profile?.phone_number || medecin.phone;
                  
                  return (
                    <div 
                      key={medecin.id} 
                      className="group bg-white rounded-2xl shadow-lg p-6 border border-border-light hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header du médecin */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-16 h-16 gradient-mediai rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                              <MedicalIcon icon={MedicalIcons.Doctor} size="w-8 h-8" className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-mediai-dark group-hover:text-mediai-primary transition-colors duration-300 font-heading">
                                Dr. {medecin.first_name} {medecin.last_name}
                              </h3>
                              <p className="text-mediai-primary text-base font-semibold mb-1 font-body">
                                {specialty}
                              </p>
                              <div className="flex items-center space-x-1 text-xs text-mediai-medium">
                                <MedicalIcon icon={MedicalIcons.Location} size="w-3 h-3" />
                                <span className="truncate">{address}</span>
                              </div>
                              {phone && (
                                <div className="flex items-center space-x-1 text-xs text-mediai-medium mt-1">
                                  <MedicalIcon icon={MedicalIcons.Phone} size="w-3 h-3" />
                                  <span>{phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            isAvailable 
                              ? 'bg-success/10 text-success border border-success/20' 
                              : 'bg-danger/10 text-danger border border-danger/20'
                          }`}>
                            {isAvailable ? 'Disponible' : 'Indisponible'}
                          </span>
                        </div>

                        {/* Informations supplémentaires */}
                        <div className="p-4 bg-light rounded-xl border border-border-light">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-mediai-medium">Email:</span>
                              <div className="text-mediai-dark font-medium truncate">{medecin.email}</div>
                            </div>
                            <div>
                              <span className="text-mediai-medium">Statut:</span>
                              <div className={`font-medium ${isAvailable ? 'text-success' : 'text-danger'}`}>
                                {isAvailable ? 'Consultations ouvertes' : 'Consultations fermées'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-light">
                          <Button
                            onClick={() => handlePrendreRdv(medecin)}
                            disabled={!isAvailable}
                            className={`group/btn flex items-center justify-center space-x-2 flex-1 text-sm transition-all duration-300 ${
                              isAvailable
                                ? 'gradient-mediai text-white hover:opacity-90 hover:scale-105 shadow-lg hover:shadow-xl'
                                : 'bg-medium text-mediai-medium cursor-not-allowed'
                            }`}
                          >
                            <MedicalIcon icon={MedicalIcons.Calendar} size="w-4 h-4" className="mr-2" />
                            <span>Prendre RDV</span>
                          </Button>
                          
                          <Button
                            onClick={() => handleContacter(medecin)}
                            variant="outline"
                            className="group/btn flex items-center justify-center space-x-2 flex-1 text-sm border-2 border-border-light hover:border-mediai-primary hover:bg-light transition-all duration-300"
                          >
                            <MedicalIcon icon={ActionIcons.Message} size="w-4 h-4" className="mr-2" />
                            <span>Contacter</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Pour les vues full-screen (formulaire et détails)
  if (activeView === 'nouvelle-fiche' || activeView === 'consultation-details') {
    return renderContent();
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header avec style Mediai */}
      <header className="gradient-mediai shadow-lg">
        <div className="max-w-full mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold text-white font-heading">Espace Patient</h1>
                <p className="text-sm text-white/80 font-body">Gestion de vos consultations médicales</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Menu mobile toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors duration-200 text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Desktop menu */}
              <div className="hidden lg:flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-white/30 hover:border-white hover:bg-white/20 text-white hover:text-white transition-all duration-300"
                >
                  <MedicalIcon icon={ActionIcons.Settings} size="w-4 h-4" className="mr-2" />
                  Paramètres
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="border-2 border-white/30 hover:border-white hover:bg-white/20 text-white hover:text-white transition-all duration-300"
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay avec style Mediai */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-0 left-0 w-80 h-full bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border-light gradient-mediai">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Logo size="sm" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-lg font-heading">Espace Patient</span>
                    <p className="text-sm text-white/80 font-body">Gestion médicale</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <nav className="p-6 space-y-3 flex-1 overflow-y-auto">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'gradient-mediai text-white shadow-lg'
                        : 'text-mediai-dark hover:bg-light hover:shadow-md border border-transparent hover:border-border-light'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-light group-hover:bg-medium'
                    }`}>
                      <MedicalIcon icon={IconComponent} size="w-6 h-6" className={isActive ? 'text-white' : item.color} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-mediai-dark'} font-heading`}>
                        {item.label}
                      </div>
                      <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-mediai-medium'} font-body`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
            
            <div className="p-6 border-t border-border-light space-y-3 bg-light">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-sm border-2 border-mediai-medium hover:border-mediai-primary hover:bg-white transition-all duration-300"
              >
                <MedicalIcon icon={ActionIcons.Settings} size="w-4 h-4" className="mr-2" />
                Paramètres
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="w-full text-sm border-2 border-medium hover:border-mediai-dark hover:bg-medium text-mediai-dark hover:text-white transition-all duration-300"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Desktop Sidebar Navigation avec style Mediai */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <nav className="space-y-3">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'gradient-mediai text-white shadow-lg'
                        : 'text-mediai-dark hover:bg-white hover:shadow-md border border-transparent hover:border-border-light'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20' 
                        : 'bg-light group-hover:bg-medium'
                    }`}>
                      <MedicalIcon icon={IconComponent} size="w-6 h-6" className={isActive ? 'text-white' : item.color} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-mediai-dark'} font-heading`}>
                        {item.label}
                      </div>
                      <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-mediai-medium'} font-body`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;