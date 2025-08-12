import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MedicalIcons, NavigationIcons, StatusIcons } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import FicheConsultationForm from './FicheConsultationForm';
import ConsultationsList from './ConsultationsList';
import ConsultationDetails from './ConsultationDetails';

/**
 * Tableau de bord Patient - Point d'entrée pour les fonctionnalités patient
 */
const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // États pour la section médecins
  const [searchTerm, setSearchTerm] = useState('');
  const [specialiteFilter, setSpecialiteFilter] = useState('all');
  const [disponibiliteFilter, setDisponibiliteFilter] = useState('all');

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Accueil',
      icon: MedicalIcons.Dashboard,
      description: 'Vue d\'ensemble de vos consultations'
    },
    {
      id: 'nouvelle-fiche',
      label: 'Nouvelle fiche',
      icon: MedicalIcons.Document,
      description: 'Créer une nouvelle fiche de consultation'
    },
    {
      id: 'mes-consultations',
      label: 'Mes consultations',
      icon: MedicalIcons.History,
      description: 'Historique et suivi de vos consultations'
    },
    {
      id: 'medecins',
      label: 'Médecins',
      icon: MedicalIcons.Doctor,
      description: 'Trouver et contacter des médecins'
    }
  ];

  const recentConsultations = [
    {
      id: 1,
      date: '2025-08-10',
      medecin: 'Dr. Martin Dubois',
      specialite: 'Cardiologie',
      statut: 'En attente',
      motif: 'Consultation de routine'
    },
    {
      id: 2,
      date: '2025-08-05',
      medecin: 'Dr. Sophie Laurent',
      specialite: 'Médecine générale',
      statut: 'Répondu',
      motif: 'Douleurs abdominales'
    }
  ];

  const getStatusBadge = (statut) => {
    const baseClasses = "badge-medical px-3 py-1 rounded-full text-xs font-medium";
    switch (statut) {
      case 'En attente':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Répondu':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'En cours':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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
            onViewDetails={(consultation) => {
              setSelectedConsultation(consultation);
              setActiveView('consultation-details');
            }}
          />
        );
      case 'consultation-details':
        return (
          <ConsultationDetails
            consultation={selectedConsultation}
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
    <div className="space-y-6">
      {/* Résumé des consultations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MedicalIcons.Appointment className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-medical-subtitle text-lg lg:text-xl">3</h3>
              <p className="text-medical-caption text-sm">Consultations à venir</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <StatusIcons.Success className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-medical-subtitle text-lg lg:text-xl">12</h3>
              <p className="text-medical-caption text-sm">Consultations terminées</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light sm:col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <StatusIcons.Warning className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-medical-subtitle text-lg lg:text-xl">2</h3>
              <p className="text-medical-caption text-sm">En attente de réponse</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <Button
            onClick={() => setActiveView('nouvelle-fiche')}
            className="flex items-center justify-center space-x-3 h-12 lg:h-16 text-sm lg:text-base"
          >
            <MedicalIcons.Document className="w-5 h-5 lg:w-6 lg:h-6" />
            <span>Nouvelle fiche de consultation</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setActiveView('mes-consultations')}
            className="flex items-center justify-center space-x-3 h-12 lg:h-16 text-sm lg:text-base"
          >
            <MedicalIcons.History className="w-5 h-5 lg:w-6 lg:h-6" />
            <span>Voir mes consultations</span>
          </Button>
        </div>
      </div>

      {/* Prochains rendez-vous */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-medical-subtitle text-lg lg:text-xl">Prochains rendez-vous</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView('mes-consultations')}
            className="w-full sm:w-auto"
          >
            Voir tout
          </Button>
        </div>
        
        <div className="space-y-3 lg:space-y-4">
          {recentConsultations.map((rdv) => (
            <div key={rdv.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 border border-light rounded-lg hover:bg-light transition-colors space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MedicalIcons.Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-dark text-sm lg:text-base">{rdv.medecin}</h4>
                  <p className="text-xs lg:text-sm text-medium">{rdv.specialite}</p>
                  <p className="text-xs lg:text-sm text-medium">
                    {new Date(rdv.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex justify-end sm:justify-start">
                <span className={getStatusBadge(rdv.statut)}>
                  {rdv.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
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
        photo: null,
        description: 'Spécialiste en cardiologie interventionnelle et échographie cardiaque',
        horaires: 'Lun-Ven: 8h-17h',
        localisation: 'Clinique du Cœur, Kinshasa',
        tarif: '50 USD'
      },
      {
        id: 2,
        nom: 'Dr. Sophie Laurent',
        specialite: 'Médecine générale',
        experience: '12 ans',
        disponible: true,
        prochainCreneau: '2025-08-13',
        photo: null,
        description: 'Médecin généraliste, consultations adultes et pédiatriques',
        horaires: 'Lun-Sam: 7h-19h',
        localisation: 'Centre Médical Central, Gombe',
        tarif: '30 USD'
      },
      {
        id: 3,
        nom: 'Dr. Jean Moreau',
        specialite: 'Neurologie',
        experience: '20 ans',
        disponible: false,
        prochainCreneau: '2025-08-20',
        photo: null,
        description: 'Neurologue spécialisé en troubles neurologiques et migraines',
        horaires: 'Mar-Jeu: 9h-16h',
        localisation: 'Hôpital Neurologique, Lingwala',
        tarif: '70 USD'
      },
      {
        id: 4,
        nom: 'Dr. Marie Durand',
        specialite: 'Dermatologie',
        experience: '8 ans',
        disponible: true,
        prochainCreneau: '2025-08-14',
        photo: null,
        description: 'Dermatologue, traitement des affections cutanées et esthétique',
        horaires: 'Lun-Ven: 9h-18h',
        localisation: 'Cabinet Derma Plus, Bandalungwa',
        tarif: '45 USD'
      },
      {
        id: 5,
        nom: 'Dr. Pierre Martin',
        specialite: 'Pédiatrie',
        experience: '18 ans',
        disponible: true,
        prochainCreneau: '2025-08-13',
        photo: null,
        description: 'Pédiatre spécialisé en soins infantiles et vaccination',
        horaires: 'Lun-Sam: 8h-17h',
        localisation: 'Clinique Pédiatrique, Kalamu',
        tarif: '35 USD'
      },
      {
        id: 6,
        nom: 'Dr. Claire Bernard',
        specialite: 'Gynécologie',
        experience: '14 ans',
        disponible: true,
        prochainCreneau: '2025-08-16',
        photo: null,
        description: 'Gynécologue-obstétricienne, suivi de grossesse et santé féminine',
        horaires: 'Mar-Sam: 8h-16h',
        localisation: 'Maternité Sainte-Marie, Ngaliema',
        tarif: '55 USD'
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
      alert(`Rendez-vous avec ${medecin.nom} - Fonctionnalité en développement`);
    };

    return (
      <div className="space-y-4 lg:space-y-6">
        {/* Header avec recherche et filtres */}
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
          <div className="mb-4 lg:mb-6">
            <h2 className="text-medical-subtitle text-lg sm:text-xl lg:text-2xl mb-2">
              Médecins disponibles
            </h2>
            <p className="text-medical-body text-sm lg:text-base text-medium">
              Trouvez et prenez rendez-vous avec nos médecins spécialistes
            </p>
          </div>

          {/* Filtres */}
          <div className="space-y-4">
            <Input
              placeholder="Rechercher par nom, spécialité ou localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <select
                  value={specialiteFilter}
                  onChange={(e) => setSpecialiteFilter(e.target.value)}
                  className="w-full appearance-none bg-white px-4 py-3 pr-10 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-xs lg:text-sm cursor-pointer hover:border-primary"
                >
                  <option value="all">Toutes les spécialités</option>
                  {specialites.map(specialite => (
                    <option key={specialite} value={specialite}>{specialite}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative flex-1">
                <select
                  value={disponibiliteFilter}
                  onChange={(e) => setDisponibiliteFilter(e.target.value)}
                  className="w-full appearance-none bg-white px-4 py-3 pr-10 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-xs lg:text-sm cursor-pointer hover:border-primary"
                >
                  <option value="all">Tous les médecins</option>
                  <option value="disponible">Disponibles</option>
                  <option value="indisponible">Indisponibles</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="bg-white rounded-lg p-3 lg:p-4 shadow-sm border border-light">
            <div className="text-center">
              <div className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-blue-100 text-blue-800">
                {medecins.length}
              </div>
              <p className="text-xs lg:text-sm text-medium mt-1">Total médecins</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-4 shadow-sm border border-light">
            <div className="text-center">
              <div className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-green-100 text-green-800">
                {medecins.filter(m => m.disponible).length}
              </div>
              <p className="text-xs lg:text-sm text-medium mt-1">Disponibles</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-4 shadow-sm border border-light">
            <div className="text-center">
              <div className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-purple-100 text-purple-800">
                {specialites.length}
              </div>
              <p className="text-xs lg:text-sm text-medium mt-1">Spécialités</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-4 shadow-sm border border-light">
            <div className="text-center">
              <div className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-orange-100 text-orange-800">
                {medecins.filter(m => m.disponible).length}
              </div>
              <p className="text-xs lg:text-sm text-medium mt-1">RDV possibles</p>
            </div>
          </div>
        </div>

        {/* Liste des médecins */}
        <div className="space-y-3 lg:space-y-4">
          {filteredMedecins.length === 0 ? (
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-light text-center">
              <MedicalIcons.Doctor className="w-10 h-10 lg:w-12 lg:h-12 text-medium mx-auto mb-3 lg:mb-4" />
              <h3 className="text-medical-subtitle text-lg lg:text-xl mb-2">Aucun médecin trouvé</h3>
              <p className="text-medical-body text-sm lg:text-base">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          ) : (
            filteredMedecins.map((medecin) => (
              <div key={medecin.id} className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4">
                  {/* Header du médecin */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start space-x-3 lg:space-x-4 flex-1">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MedicalIcons.Doctor className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-medical-subtitle text-base lg:text-lg mb-1">
                          {medecin.nom}
                        </h3>
                        <p className="text-primary text-sm lg:text-base font-medium mb-1">
                          {medecin.specialite}
                        </p>
                        <p className="text-xs lg:text-sm text-medium">
                          {medecin.experience} d'expérience
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col sm:items-end gap-2">
                      <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                        medecin.disponible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {medecin.disponible ? 'Disponible' : 'Indisponible'}
                      </span>
                      <p className="text-xs lg:text-sm text-medium">
                        Prochain: {new Date(medecin.prochainCreneau).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-medical-body text-sm lg:text-base">
                      {medecin.description}
                    </p>
                  </div>

                  {/* Informations pratiques */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    <div className="flex items-center space-x-2">
                      <MedicalIcons.Clock className="w-4 h-4 text-medium" />
                      <span className="text-xs lg:text-sm text-dark">{medecin.horaires}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MedicalIcons.Location className="w-4 h-4 text-medium" />
                      <span className="text-xs lg:text-sm text-dark truncate">{medecin.localisation}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MedicalIcons.Settings className="w-4 h-4 text-medium" />
                      <span className="text-xs lg:text-sm text-dark font-medium">{medecin.tarif}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-light">
                    <Button
                      onClick={() => handlePrendreRdv(medecin)}
                      disabled={!medecin.disponible}
                      className="flex items-center justify-center space-x-2 flex-1 text-xs lg:text-sm"
                    >
                      <MedicalIcons.Calendar className="w-4 h-4" />
                      <span>Prendre RDV</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="flex items-center justify-center space-x-2 flex-1 text-xs lg:text-sm"
                    >
                      <MedicalIcons.Message className="w-4 h-4" />
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-light">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Logo responsive */}
              <div className="sm:hidden">
                <Logo size="sm" />
              </div>
              <div className="hidden sm:block">
                <Logo size="md" />
              </div>
              
              <div className="hidden sm:block">
                <h1 className="text-medical-title text-lg sm:text-xl">Espace Patient</h1>
                <p className="text-medical-caption text-xs sm:text-sm">Gestion de vos consultations médicales</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Menu mobile toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-light"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Desktop menu */}
              <div className="hidden lg:flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <MedicalIcons.Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
                <Button variant="outline" size="sm">
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Logo size="sm" />
                  <span className="font-medium text-dark">Espace Patient</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-light"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <nav className="p-4 space-y-2">
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
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-dark hover:bg-light'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-medium'}`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-light space-y-2">
              <Button variant="outline" size="sm" className="w-full text-sm">
                <MedicalIcons.Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="outline" size="sm" className="w-full text-sm">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:w-56 flex-shrink-0">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-dark hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-medium'}`}>
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
