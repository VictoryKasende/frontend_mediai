import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useLogout } from '../../hooks/useLogout';
import { useSettingsModal } from '../../hooks/useSettingsModal';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import SettingsModal from '../../components/SettingsModal';
import FicheConsultationForm from './FicheConsultationForm';
import ConsultationsList from './ConsultationsList';
import ConsultationDetails from './ConsultationDetails';
import { consultationService, authService } from '../../services/api';

// Composants améliorés
const StatCard = React.memo(({ title, value, icon: IconComponent, color, bgColor, trend }) => (
  <div className={`${bgColor} overflow-hidden shadow-lg rounded-2xl border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer`}>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-white/70 text-xs">
              <span className="mr-1">↗</span>
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
            <MedicalIcon icon={IconComponent} size="w-7 h-7" className="text-white" />
          </div>
        </div>
      </div>
    </div>
  </div>
));

const ConsultationCard = React.memo(({ consultation, onViewDetails, getMedecinInfo, getStatusBadge, getStatusLabel }) => (
  <div
    className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden"
    onClick={() => onViewDetails(consultation.id)}
  >
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <MedicalIcon icon={MedicalIcons.Doctor} size="w-5 h-5" className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {getMedecinInfo(consultation)}
              </h4>
              <span className={getStatusBadge(consultation.status)}>
                {getStatusLabel(consultation.status)}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {consultation.motif_consultation || 'Aucun motif spécifié'}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <MedicalIcon icon={MedicalIcons.Document} size="w-3 h-3" />
              <span className="font-medium">CONS-{consultation.id}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MedicalIcon icon={StatusIcons.Calendar} size="w-3 h-3" />
              <span>{
                (() => {
                  const dateStr = consultation.date_creation || consultation.date_soumission || consultation.created_at || consultation.date_consultation;
                  if (!dateStr) return 'Date inconnue';
                  
                  const date = new Date(dateStr);
                  if (isNaN(date.getTime())) return 'Date invalide';
                  
                  return date.toLocaleDateString('fr-FR');
                })()
              }</span>
            </div>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors duration-300">
            <MedicalIcon 
              icon={NavigationIcons.ChevronRight} 
              size="w-4 h-4" 
              className="text-gray-400 group-hover:text-blue-500 transition-colors" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
));

const DoctorCard = React.memo(({ medecin, onPrendreRdv, onContacter }) => {
  const isAvailable = medecin.medecin_profile?.is_available;
  const specialty = medecin.medecin_profile?.specialty || 'Médecine générale';
  const address = medecin.medecin_profile?.address || 'Adresse non renseignée';
  const phone = medecin.medecin_profile?.phone_number || medecin.phone;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <MedicalIcon icon={MedicalIcons.Doctor} size="w-8 h-8" className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1">
                Dr. {medecin.first_name} {medecin.last_name}
              </h3>
              <p className="text-blue-600 text-base font-semibold mb-2">
                {specialty}
              </p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MedicalIcon icon={MedicalIcons.Location} size="w-4 h-4" />
                  <span className="truncate">{address}</span>
                </div>
                {phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MedicalIcon icon={MedicalIcons.Phone} size="w-4 h-4" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isAvailable 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {isAvailable ? 'Disponible' : 'Indisponible'}
          </span>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <span className="text-gray-500 font-medium">Email:</span>
              <div className="text-gray-900 font-medium truncate">{medecin.email}</div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => onPrendreRdv(medecin)}
            disabled={!isAvailable}
            className={`flex-1 ${
              isAvailable 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            } transition-colors duration-300`}
          >
            <MedicalIcon icon={StatusIcons.Calendar} size="w-4 h-4" className="mr-2" />
            Prendre RDV
          </Button>
          <Button
            onClick={() => onContacter(medecin)}
            variant="outline"
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
          >
            <MedicalIcon icon={MedicalIcons.Phone} size="w-4 h-4" className="mr-2" />
            Contacter
          </Button>
        </div>
      </div>
    </div>
  );
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-6 h-6" className="text-blue-600" />
      </div>
    </div>
  </div>
);

const EmptyState = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <MedicalIcon icon={icon} size="w-10 h-10" className="text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
      {description}
    </p>
    {actionLabel && onAction && (
      <Button
        onClick={onAction}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-300"
      >
        {actionLabel}
      </Button>
    )}
  </div>
);

/**
 * Tableau de bord Patient modernisé - Interface professionnelle et intuitive
 */
const PatientDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo, notifications, removeNotification } = useNotification();
  const { handleLogout } = useLogout();
  const { isOpen: isSettingsOpen, openModal: openSettings, closeModal: closeSettings } = useSettingsModal();
  
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

  // Mémorisation des fonctions utilitaires
  const getMedecinInfo = useCallback((consultation) => {
    console.log('PatientDashboard - getMedecinInfo pour consultation:', consultation.id);
    console.log('Consultation complète:', consultation);
    
    // Vérifier tous les champs possibles pour le médecin
    if (consultation.medecin_prenom && consultation.medecin_nom) {
      return `Dr ${consultation.medecin_prenom} ${consultation.medecin_nom}`;
    }
    
    if (consultation.medecin_nom) {
      return consultation.medecin_nom;
    }
    
    // Vérifier les champs d'assignation du médecin
    const medecinId = consultation.assigned_medecin || consultation.medecin_id || consultation.medecin;
    console.log('Medecin ID trouvé:', medecinId);
    console.log('Liste des medecins disponibles:', medecins);
    
    if (medecinId && medecins.length > 0) {
      const medecin = medecins.find(m => m.id === medecinId);
      console.log('Medecin trouvé:', medecin);
      if (medecin) {
        return `Dr ${medecin.first_name} ${medecin.last_name}`;
      }
    }
    
    // Fallback : vérifier si un médecin est mentionné dans les infos additionnelles
    if (consultation.medecin_info || consultation.assigned_medecin_info) {
      const info = consultation.medecin_info || consultation.assigned_medecin_info;
      if (info.first_name && info.last_name) {
        return `Dr ${info.first_name} ${info.last_name}`;
      }
    }
    
    return 'Médecin non assigné';
  }, [medecins]);

  const getStatusBadge = useCallback((statut) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    
    switch (statut) {
      case 'en_analyse':
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
      case 'analyse_terminee':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case 'valide_medecin':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case 'rejete_medecin':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  }, []);

  const getStatusLabel = useCallback((statut) => {
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
  }, []);

  // Médecins filtrés mémorisés
  const filteredMedecins = useMemo(() => {
    return medecins.filter(medecin => {
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
  }, [medecins, searchTerm, specialiteFilter, disponibiliteFilter]);

  // Spécialités uniques mémorisées
  const specialites = useMemo(() => {
    return [...new Set(medecins.map(m => m.medecin_profile?.specialty).filter(Boolean))];
  }, [medecins]);

  useEffect(() => {
    if (activeView === 'dashboard') {
      loadDashboardData();
    } else if (activeView === 'medecins') {
      loadMedecinsData();
    }
  }, [activeView]);

  const loadMedecinsData = async () => {
    try {
      setLoadingMedecins(true);
      const response = await authService.getMedecins();
      const medecinsList = response.results || response;
      setMedecins(medecinsList);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      // Fallback avec données statiques améliorées
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
      
      // Charger les médecins en parallèle pour la résolution des noms
      if (medecins.length === 0) {
        try {
          await loadMedecinsData();
        } catch (error) {
          console.warn('Impossible de charger les médecins pour le dashboard:', error);
        }
      }
      
      const response = await consultationService.getConsultations({
        is_patient_distance: true
      });
      
      const allConsultations = response.results || [];
      
      const userConsultations = allConsultations.filter(consultation => {
        if (consultation.user && user?.id) {
          return consultation.user === user.id;
        }
        
        if (user?.nom && user?.prenom) {
          return consultation.nom === user.nom && consultation.prenom === user.prenom;
        }
        
        return true;
      });
      
      let recent = userConsultations
        .sort((a, b) => new Date(b.created_at || b.date_consultation) - new Date(a.created_at || a.date_consultation))
        .slice(0, 5);
      
      const enrichedConsultations = await Promise.all(
        recent.map(async (consultation) => {
          try {
            const detailedConsultation = await consultationService.getConsultation(consultation.id);
            console.log('Dashboard - Consultation enrichie:', detailedConsultation);
            return detailedConsultation;
          } catch (error) {
            console.error('Dashboard - Erreur lors de l\'enrichissement de la consultation:', consultation.id, error);
            console.log('Dashboard - Consultation originale (fallback):', consultation);
            return consultation;
          }
        })
      );
      
      console.log('Dashboard - Consultations finales pour affichage:', enrichedConsultations);
      
      setRecentConsultations(enrichedConsultations);
      
      const stats = {
        total: userConsultations.length,
        en_analyse: userConsultations.filter(c => c.status === 'en_analyse').length,
        analyse_terminee: userConsultations.filter(c => c.status === 'analyse_terminee').length,
        valide_medecin: userConsultations.filter(c => c.status === 'valide_medecin').length,
        rejete_medecin: userConsultations.filter(c => c.status === 'rejete_medecin').length
      };
      
      setDashboardStats(stats);
      
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      id: 'nouvelle-fiche', 
      label: 'Envoyer fiche', 
      icon: MedicalIcons.Document, 
      description: 'Envoyer une fiche à distance',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      id: 'mes-consultations', 
      label: 'Mes fiches', 
      icon: MedicalIcons.History, 
      description: 'Historique de vos envois',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      id: 'medecins', 
      label: 'Médecins', 
      icon: MedicalIcons.Doctor, 
      description: 'Voir nos médecins experts',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const handlePrendreRdv = useCallback((medecin) => {
    showInfo(`Prise de rendez-vous avec Dr. ${medecin.first_name} ${medecin.last_name} - Fonctionnalité en développement`);
  }, [showInfo]);

  const handleContacter = useCallback((medecin) => {
    showInfo(`Contact avec Dr. ${medecin.first_name} ${medecin.last_name} - Fonctionnalité en développement`);
  }, [showInfo]);

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
    <div className="space-y-8 animate-fadeIn">
      {/* Header moderne avec informations patient */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 shadow-2xl rounded-3xl overflow-hidden">
        <div className="px-8 py-10 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <MedicalIcon icon={MedicalIcons.User} size="w-8 h-8" className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                    Bonjour {user?.first_name || 'Patient'}
                  </h1>
                  <p className="text-white/80 text-sm font-medium">
                    Consultation à distance • Mediai
                  </p>
                </div>
              </div>
              <p className="text-white/90 leading-relaxed max-w-2xl">
                Envoyez vos fiches de consultation à distance et suivez leur analyse par nos médecins experts. 
                Une approche moderne pour votre suivi médical.
              </p>
            </div>
            <div className="hidden lg:flex flex-col items-center space-y-4 mt-6 lg:mt-0">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-12 h-12" className="text-white/80" />
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

      {/* État de chargement amélioré */}
      {loadingDashboard && (
        <div className="text-center py-16">
          <LoadingSpinner />
          <p className="text-gray-600 font-medium mt-4">Chargement de vos données...</p>
        </div>
      )}

      {/* Statistiques avec design moderne */}
      {!loadingDashboard && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total"
              value={dashboardStats.total}
              icon={MedicalIcons.Document}
              color="text-white"
              bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
              trend="+12% ce mois"
            />
            <StatCard
              title="En analyse"
              value={dashboardStats.en_analyse}
              icon={StatusIcons.Clock}
              color="text-white"
              bgColor="bg-gradient-to-br from-yellow-500 to-yellow-600"
            />
            <StatCard
              title="Terminées"
              value={dashboardStats.analyse_terminee}
              icon={StatusIcons.CheckCircle}
              color="text-white"
              bgColor="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatCard
              title="Validées"
              value={dashboardStats.valide_medecin}
              icon={MedicalIcons.Shield}
              color="text-white"
              bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>

          {/* Consultations récentes avec design amélioré */}
          {recentConsultations.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Consultations récentes</h2>
                    <p className="text-gray-600">Vos dernières fiches envoyées</p>
                  </div>
                  <Button
                    onClick={() => setActiveView('mes-consultations')}
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Voir tout
                    <MedicalIcon icon={NavigationIcons.ChevronRight} size="w-4 h-4" className="ml-2" />
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentConsultations.map((consultation) => (
                  <ConsultationCard
                    key={consultation.id}
                    consultation={consultation}
                    onViewDetails={(id) => {
                      setSelectedConsultationId(id);
                      setActiveView('consultation-details');
                    }}
                    getMedecinInfo={getMedecinInfo}
                    getStatusBadge={getStatusBadge}
                    getStatusLabel={getStatusLabel}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Message si aucune consultation */}
          {recentConsultations.length === 0 && (
            <EmptyState
              icon={MedicalIcons.Document}
              title="Aucune fiche envoyée"
              description="Vous n'avez pas encore envoyé de fiche de consultation à distance. Créez votre première fiche pour bénéficier de nos services médicaux."
              actionLabel="Envoyer ma première fiche"
              onAction={() => setActiveView('nouvelle-fiche')}
            />
          )}
        </>
      )}
    </div>
  );

  const renderMedecins = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Header avec style moderne */}
      <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MedicalIcon icon={MedicalIcons.Doctor} size="w-8 h-8" className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Nos médecins experts</h2>
            <p className="text-gray-600">
              Découvrez notre équipe de médecins spécialisés et prenez rendez-vous
            </p>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700 mb-1">{medecins.length}</div>
            <div className="text-sm text-blue-600 font-medium">Total médecins</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {medecins.filter(m => m.medecin_profile?.is_available).length}
            </div>
            <div className="text-sm text-green-600 font-medium">Disponibles</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-700 mb-1">{specialites.length}</div>
            <div className="text-sm text-purple-600 font-medium">Spécialités</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-700 mb-1">24/7</div>
            <div className="text-sm text-orange-600 font-medium">Support</div>
          </div>
        </div>

        {/* Filtres modernisés */}
        <div className="space-y-6">
          <div className="relative">
            <Input
              placeholder="Rechercher par nom, spécialité ou localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-2xl text-base"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MedicalIcon icon={ActionIcons.Search} size="w-5 h-5" className="text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <select
                value={specialiteFilter}
                onChange={(e) => setSpecialiteFilter(e.target.value)}
                className="w-full appearance-none bg-gray-50 px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base cursor-pointer hover:border-blue-300"
              >
                <option value="all">Toutes les spécialités</option>
                {specialites.map(specialite => (
                  <option key={specialite} value={specialite}>{specialite}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative flex-1">
              <select
                value={disponibiliteFilter}
                onChange={(e) => setDisponibiliteFilter(e.target.value)}
                className="w-full appearance-none bg-gray-50 px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-base cursor-pointer hover:border-blue-300"
              >
                <option value="all">Tous les médecins</option>
                <option value="disponible">Disponibles</option>
                <option value="indisponible">Indisponibles</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Résultats de recherche */}
          {!loadingMedecins && (
            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
              <span className="font-semibold">{filteredMedecins.length}</span> médecin{filteredMedecins.length > 1 ? 's' : ''} trouvé{filteredMedecins.length > 1 ? 's' : ''}
              {medecins.length !== filteredMedecins.length && ` sur ${medecins.length} total`}
            </div>
          )}
        </div>
      </div>

      {/* État de chargement */}
      {loadingMedecins && (
        <div className="bg-white rounded-3xl shadow-lg p-12 border border-gray-100 text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Chargement des médecins experts...</p>
        </div>
      )}

      {/* Liste des médecins */}
      {!loadingMedecins && (
        <div className="space-y-6">
          {filteredMedecins.length === 0 ? (
            <EmptyState
              icon={MedicalIcons.Doctor}
              title="Aucun médecin trouvé"
              description={
                medecins.length === 0 
                  ? 'Aucun médecin disponible pour le moment.'
                  : 'Aucun médecin ne correspond à vos critères de recherche.'
              }
              actionLabel={filteredMedecins.length === 0 && medecins.length > 0 ? "Réinitialiser les filtres" : null}
              onAction={filteredMedecins.length === 0 && medecins.length > 0 ? () => {
                setSearchTerm('');
                setSpecialiteFilter('all');
                setDisponibiliteFilter('all');
              } : null}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMedecins.map((medecin) => (
                <DoctorCard
                  key={medecin.id}
                  medecin={medecin}
                  onPrendreRdv={handlePrendreRdv}
                  onContacter={handleContacter}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications améliorées */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm w-full bg-white shadow-lg rounded-2xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ${
              notification.type === 'success' ? 'border-l-4 border-green-500' :
              notification.type === 'error' ? 'border-l-4 border-red-500' :
              notification.type === 'warning' ? 'border-l-4 border-yellow-500' :
              'border-l-4 border-blue-500'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    notification.type === 'success' ? 'bg-green-100' :
                    notification.type === 'error' ? 'bg-red-100' :
                    notification.type === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <MedicalIcon 
                      icon={
                        notification.type === 'success' ? StatusIcons.CheckCircle :
                        notification.type === 'error' ? StatusIcons.XCircle :
                        notification.type === 'warning' ? StatusIcons.ExclamationTriangle :
                        StatusIcons.InformationCircle
                      } 
                      size="w-4 h-4" 
                      className={
                        notification.type === 'success' ? 'text-green-600' :
                        notification.type === 'error' ? 'text-red-600' :
                        notification.type === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }
                    />
                  </div>
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <span className="sr-only">Fermer</span>
                    <MedicalIcon icon={StatusIcons.X} size="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header mobile */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo className="h-8 w-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mediai</h1>
              <p className="text-xs text-gray-500">Patient Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={openSettings}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <MedicalIcon icon={ActionIcons.Settings} size="w-5 h-5" className="text-gray-600" />
            </Button>
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <MedicalIcon icon={isMobileMenuOpen ? StatusIcons.X : NavigationIcons.Menu} size="w-5 h-5" className="text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Menu mobile overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <Logo className="h-8 w-auto" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Mediai</h1>
                  <p className="text-xs text-gray-500">Patient Dashboard</p>
                </div>
              </div>
              <nav className="space-y-2">
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
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20' 
                          : item.bgColor
                      }`}>
                        <MedicalIcon icon={IconComponent} size="w-5 h-5" className={isActive ? 'text-white' : item.color} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                          {item.label}
                        </div>
                        <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <MedicalIcon icon={ActionIcons.Logout} size="w-4 h-4" className="mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Layout principal */}
      <div className="lg:flex">
        {/* Sidebar desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-80 bg-white shadow-xl border-r border-gray-200">
            {/* Header sidebar */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Logo className="h-8 w-auto" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Mediai</h1>
                  <p className="text-sm text-gray-500">Patient Dashboard</p>
                </div>
              </div>
              <Button
                onClick={openSettings}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100"
              >
                <MedicalIcon icon={ActionIcons.Settings} size="w-5 h-5" className="text-gray-600" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-6 space-y-3">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                        : 'text-gray-700 hover:bg-gray-50 hover:scale-102'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20' 
                        : `${item.bgColor} group-hover:scale-110`
                    }`}>
                      <MedicalIcon icon={IconComponent} size="w-6 h-6" className={isActive ? 'text-white' : item.color} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold text-base ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className={`text-sm mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
            
            {/* Footer sidebar */}
            <div className="px-6 py-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MedicalIcon icon={MedicalIcons.User} size="w-5 h-5" className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <MedicalIcon icon={ActionIcons.Logout} size="w-4 h-4" className="mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 bg-gray-50">
          <div className="p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Modal de paramètres */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={closeSettings} 
      />

      {/* Styles CSS personnalisés */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
};

export default PatientDashboard;