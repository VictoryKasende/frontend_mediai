import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MedicalIcons, NavigationIcons, StatusIcons } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
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

  const renderMedecins = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-light">
        <h2 className="text-medical-subtitle text-2xl mb-6">Médecins disponibles</h2>
        <p className="text-medical-body">
          Fonctionnalité en cours de développement...
        </p>
      </div>
    </div>
  );

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
              <Logo size="sm" className="sm:hidden" />
              <Logo size="md" className="hidden sm:block" />
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

          {/* Mobile Navigation Tabs */}
          <div className="lg:hidden">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex-shrink-0 flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-dark hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
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
