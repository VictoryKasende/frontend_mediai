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
import { consultationService } from '../../services/api';

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

  useEffect(() => {
    if (activeView === 'dashboard') {
      loadDashboardData();
    }
  }, [activeView]);

  const loadDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      
      // Charger les consultations récentes
      const response = await consultationService.getConsultations({
        is_patient_distance: true
      });
      
      // Extraire le tableau des consultations depuis la réponse
      const consultations = response.results || [];
      
      // Prendre les 5 plus récentes
      const recent = consultations
        .sort((a, b) => new Date(b.date_creation || b.date_soumission) - new Date(a.date_creation || a.date_soumission))
        .slice(0, 5);
      
      setRecentConsultations(recent);
      
      // Calculer les statistiques
      const stats = {
        total: consultations.length,
        en_analyse: consultations.filter(c => c.status === 'en_analyse').length,
        analyse_terminee: consultations.filter(c => c.status === 'analyse_terminee').length,
        valide_medecin: consultations.filter(c => c.status === 'valide_medecin').length,
        rejete_medecin: consultations.filter(c => c.status === 'rejete_medecin').length
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
      description: 'Vue d\'ensemble de vos consultations',
      color: 'text-mediai-primary'
    },
    { 
      id: 'nouvelle-fiche', 
      label: 'Nouvelle fiche', 
      icon: MedicalIcons.Document, 
      description: 'Créer une nouvelle fiche de consultation',
      color: 'text-mediai-secondary'
    },
    { 
      id: 'mes-consultations', 
      label: 'Consultations', 
      icon: MedicalIcons.History, 
      description: 'Historique et suivi de vos consultations',
      color: 'text-mediai-primary'
    },
    { 
      id: 'medecins', 
      label: 'Médecins', 
      icon: MedicalIcons.Doctor, 
      description: 'Trouver et contacter des médecins',
      color: 'text-mediai-secondary'
    }
  ];

  const getStatusBadge = (statut) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide";
    switch (statut) {
      case 'en_analyse':
        return `${baseClasses} bg-blue-500 text-white`;
      case 'analyse_terminee':
        return `${baseClasses} bg-yellow-500 text-white`;
      case 'valide_medecin':
        return `${baseClasses} bg-green-500 text-white`;
      case 'rejete_medecin':
        return `${baseClasses} bg-red-500 text-white`;
      default:
        return `${baseClasses} bg-gray-500 text-white`;
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'en_analyse':
        return 'En analyse';
      case 'analyse_terminee':
        return 'Analyse terminée';
      case 'valide_medecin':
        return 'Validée';
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
    <div className="space-y-8">
      {/* Header professionnel similaire au dashboard médecin */}
      <div className="bg-mediai-dark shadow-2xl rounded-2xl overflow-hidden">
        <div className="px-8 py-10 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-mediai-primary rounded-xl flex items-center justify-center shadow-lg">
                  <MedicalIcon icon={MedicalIcons.User} size="w-8 h-8" className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight font-heading">
                    Espace Patient
                  </h1>
                  <p className="text-white/70 text-lg font-body-medium">
                    {user?.first_name} {user?.last_name} • Plateforme Mediai
                  </p>
                </div>
              </div>
              <p className="text-lg text-white/90 font-body leading-relaxed max-w-2xl">
                Gérez vos consultations médicales, suivez vos rendez-vous et échangez avec nos médecins spécialistes.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center">
                <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-12 h-12" className="text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* État de chargement */}
      {loadingDashboard && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-mediai-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mediai-medium">Chargement de vos données...</p>
        </div>
      )}

      {/* Statistiques avec les vraies données */}
      {!loadingDashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="gradient-primary overflow-hidden shadow-lg rounded-xl border border-border-light hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/20 shadow-md">
                      <MedicalIcon icon={MedicalIcons.Document} size="w-7 h-7" className="text-white" />
                    </div>
                  </div>
                  <div className="ml-6 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-white truncate font-medical tracking-wide uppercase">Total consultations</dt>
                      <dd className="text-3xl font-bold text-white font-mono tracking-tight">
                        <span className="tabular-nums">{dashboardStats.total}</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500 overflow-hidden shadow-lg rounded-xl border border-border-light hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/20 shadow-md">
                      <MedicalIcon icon={StatusIcons.Clock} size="w-7 h-7" className="text-white" />
                    </div>
                  </div>
                  <div className="ml-6 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-white truncate font-medical tracking-wide uppercase">En analyse IA</dt>
                      <dd className="text-3xl font-bold text-white font-mono tracking-tight">
                        <span className="tabular-nums">{dashboardStats.en_analyse}</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500 overflow-hidden shadow-lg rounded-xl border border-border-light hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/20 shadow-md">
                      <MedicalIcon icon={StatusIcons.Success} size="w-7 h-7" className="text-white" />
                    </div>
                  </div>
                  <div className="ml-6 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-white truncate font-medical tracking-wide uppercase">Validées médecin</dt>
                      <dd className="text-3xl font-bold text-white font-mono tracking-tight">
                        <span className="tabular-nums">{dashboardStats.valide_medecin}</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-500 overflow-hidden shadow-lg rounded-xl border border-border-light hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/20 shadow-md">
                      <MedicalIcon icon={StatusIcons.Error} size="w-7 h-7" className="text-white" />
                    </div>
                  </div>
                  <div className="ml-6 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-semibold text-white truncate font-medical tracking-wide uppercase">Rejetées</dt>
                      <dd className="text-3xl font-bold text-white font-mono tracking-tight">
                        <span className="tabular-nums">{dashboardStats.rejete_medecin}</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Button
              onClick={() => setActiveView('nouvelle-fiche')}
              className="gradient-primary text-white p-6 h-auto flex-col space-y-3 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <MedicalIcon icon={MedicalIcons.Document} size="w-8 h-8" />
              <div className="text-center">
                <h3 className="font-bold text-lg">Nouvelle fiche</h3>
                <p className="text-sm opacity-90">Créer une consultation</p>
              </div>
            </Button>
            
            <Button
              onClick={() => setActiveView('mes-consultations')}
              className="bg-blue-500 hover:bg-blue-600 text-white p-6 h-auto flex-col space-y-3 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <MedicalIcon icon={MedicalIcons.History} size="w-8 h-8" />
              <div className="text-center">
                <h3 className="font-bold text-lg">Mes consultations</h3>
                <p className="text-sm opacity-90">Voir l'historique</p>
              </div>
            </Button>
            
            <Button
              onClick={() => setActiveView('medecins')}
              className="bg-green-500 hover:bg-green-600 text-white p-6 h-auto flex-col space-y-3 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <MedicalIcon icon={MedicalIcons.Doctor} size="w-8 h-8" />
              <div className="text-center">
                <h3 className="font-bold text-lg">Nos médecins</h3>
                <p className="text-sm opacity-90">Découvrir l'équipe</p>
              </div>
            </Button>
          </div>

          {/* Consultations récentes */}
          {recentConsultations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-mediai-dark">Consultations récentes</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedConsultationId(consultation.id);
                      setActiveView('consultation-details');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-mediai-dark">
                          {consultation.medecin_nom || 'Médecin non assigné'}
                        </h4>
                        <p className="text-sm text-mediai-medium mt-1">
                          {consultation.motif_consultation || 'Aucun motif spécifié'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          CONS-{consultation.id} • {new Date(consultation.date_creation || consultation.date_soumission).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={getStatusBadge(consultation.status)}>
                          {getStatusLabel(consultation.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderMedecins = () => {
    // Liste des médecins disponibles
    const medecins = [
      {
        id: 1,
        nom: 'Dr. Martin Dubois',
        specialite: 'Cardiologie',
        experience: '15 ans',
        disponible: true,
        prochainCreneau: '2025-08-15',
        description: 'Spécialiste en cardiologie interventionnelle et échographie cardiaque',
        horaires: 'Lun-Ven: 8h-17h',
        localisation: 'Clinique du Cœur, Kinshasa',
        tarif: '50 USD',
        rating: 4.8,
        patientsCount: 1247
      },
      {
        id: 2,
        nom: 'Dr. Sophie Laurent',
        specialite: 'Médecine générale',
        experience: '12 ans',
        disponible: true,
        prochainCreneau: '2025-08-13',
        description: 'Médecin généraliste, consultations adultes et pédiatriques',
        horaires: 'Lun-Sam: 7h-19h',
        localisation: 'Centre Médical Central, Gombe',
        tarif: '30 USD',
        rating: 4.9,
        patientsCount: 2156
      }
    ];

    const specialites = [...new Set(medecins.map(m => m.specialite))];

    const filteredMedecins = medecins.filter(medecin => {
      const matchesSearch = medecin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medecin.localisation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialite = specialiteFilter === 'all' || medecin.specialite === specialiteFilter;
      const matchesDisponibilite = disponibiliteFilter === 'all' || 
                                   (disponibiliteFilter === 'disponible' && medecin.disponible) ||
                                   (disponibiliteFilter === 'indisponible' && !medecin.disponible);
      
      return matchesSearch && matchesSpecialite && matchesDisponibilite;
    });

    const handlePrendreRdv = (medecin) => {
      showInfo(`Prise de rendez-vous avec ${medecin.nom} - Fonctionnalité en développement`);
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
              <h2 className="text-xl font-bold text-mediai-dark font-heading">Médecins disponibles</h2>
              <p className="text-sm text-mediai-medium font-body">Trouvez et prenez rendez-vous avec nos médecins spécialistes</p>
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
          </div>
        </div>

        {/* Liste des médecins */}
        <div className="space-y-4">
          {filteredMedecins.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-border-light text-center">
              <div className="w-16 h-16 gradient-mediai rounded-full flex items-center justify-center mx-auto mb-4">
                <MedicalIcon icon={MedicalIcons.Doctor} size="w-8 h-8" className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-mediai-dark mb-2 font-heading">Aucun médecin trouvé</h3>
              <p className="text-sm text-mediai-medium font-body">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          ) : (
            filteredMedecins.map((medecin, index) => (
              <div 
                key={medecin.id} 
                className="group bg-white rounded-2xl shadow-lg p-6 border border-border-light hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col gap-4">
                  {/* Header du médecin */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 gradient-mediai rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <MedicalIcon icon={MedicalIcons.Doctor} size="w-8 h-8" className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-mediai-dark group-hover:text-mediai-primary transition-colors duration-300 font-heading">
                          {medecin.nom}
                        </h3>
                        <p className="text-mediai-primary text-base font-semibold mb-2 font-body">
                          {medecin.specialite}
                        </p>
                        <p className="text-sm text-mediai-medium font-body">
                          {medecin.experience} d'expérience
                        </p>
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      medecin.disponible 
                        ? 'bg-success/10 text-success border border-success/20' 
                        : 'bg-danger/10 text-danger border border-danger/20'
                    }`}>
                      {medecin.disponible ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="p-4 bg-light rounded-xl border border-border-light">
                    <p className="text-sm text-mediai-dark leading-relaxed font-body">
                      {medecin.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-light">
                    <Button
                      onClick={() => handlePrendreRdv(medecin)}
                      disabled={!medecin.disponible}
                      className={`group/btn flex items-center justify-center space-x-2 flex-1 text-sm transition-all duration-300 ${
                        medecin.disponible
                          ? 'gradient-mediai text-white hover:opacity-90 hover:scale-105 shadow-lg hover:shadow-xl'
                          : 'bg-medium text-mediai-medium cursor-not-allowed'
                      }`}
                    >
                      <MedicalIcon icon={MedicalIcons.Calendar} size="w-4 h-4" className="mr-2" />
                      <span>Prendre RDV</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="group/btn flex items-center justify-center space-x-2 flex-1 text-sm border-2 border-border-light hover:border-mediai-primary hover:bg-light transition-all duration-300"
                    >
                      <MedicalIcon icon={ActionIcons.Message} size="w-4 h-4" className="mr-2" />
                      <span>Contacter</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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