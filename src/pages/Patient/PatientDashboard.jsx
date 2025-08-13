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
      description: 'Vue d\'ensemble de vos consultations',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'nouvelle-fiche',
      label: 'Nouvelle fiche',
      icon: MedicalIcons.Document,
      description: 'Créer une nouvelle fiche de consultation',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'mes-consultations',
      label: 'Mes consultations',
      icon: MedicalIcons.History,
      description: 'Historique et suivi de vos consultations',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'medecins',
      label: 'Médecins',
      icon: MedicalIcons.Doctor,
      description: 'Trouver et contacter des médecins',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  const recentConsultations = [
    {
      id: 1,
      date: '2025-08-10',
      medecin: 'Dr. Martin Dubois',
      specialite: 'Cardiologie',
      statut: 'En attente',
      motif: 'Consultation de routine',
      time: '14:30'
    },
    {
      id: 2,
      date: '2025-08-05',
      medecin: 'Dr. Sophie Laurent',
      specialite: 'Médecine générale',
      statut: 'Répondu',
      motif: 'Douleurs abdominales',
      time: '09:15'
    }
  ];

  const getStatusBadge = (statut) => {
    const baseClasses = "badge-medical px-3 py-1 rounded-full text-xs font-medium transition-all duration-200";
    switch (statut) {
      case 'En attente':
        return `${baseClasses} bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200 shadow-sm`;
      case 'Répondu':
        return `${baseClasses} bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm`;
      case 'En cours':
        return `${baseClasses} bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200 shadow-sm`;
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200 shadow-sm`;
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
            <div className="space-y-6 animate-fadeIn">
          {/* Résumé des consultations avec animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 lg:p-6 shadow-sm border border-mediai-primary hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <MedicalIcons.Appointment className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-medical-subtitle text-lg lg:text-xl font-bold text-mediai-dark">3</h3>
                  <p className="text-medical-caption text-sm text-mediai-primary">Consultations à venir</p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-green-50 rounded-2xl p-4 lg:p-6 shadow-sm border border-green-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <StatusIcons.Success className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-medical-subtitle text-lg lg:text-xl font-bold text-green-900">12</h3>
                  <p className="text-medical-caption text-sm text-green-700">Consultations terminées</p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-2xl p-4 lg:p-6 shadow-sm border border-orange-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <StatusIcons.Warning className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-medical-subtitle text-lg lg:text-xl font-bold text-orange-900">2</h3>
                  <p className="text-medical-caption text-sm text-orange-700">En attente de réponse</p>
                </div>
              </div>
            </div>
          </div>

      {/* Actions rapides avec design amélioré */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 font-bold text-gray-900">Actions rapides</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <Button
            onClick={() => setActiveView('nouvelle-fiche')}
            className="group flex items-center justify-center space-x-3 h-12 lg:h-16 text-sm lg:text-base gradient-primary hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <MedicalIcons.Document className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-12 transition-transform duration-300" />
            <span>Nouvelle fiche de consultation</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setActiveView('mes-consultations')}
            className="group flex items-center justify-center space-x-3 h-12 lg:h-16 text-sm lg:text-base border-2 border-mediai-secondary hover:border-mediai-primary hover:bg-mediai-light transform hover:scale-105 transition-all duration-300"
          >
            <MedicalIcons.History className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-12 transition-transform duration-300" />
            <span>Voir mes consultations</span>
          </Button>
        </div>
      </div>

      {/* Prochains rendez-vous avec design amélioré */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-medical-subtitle text-lg lg:text-xl font-bold text-gray-900">Prochains rendez-vous</h3>
                      <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView('mes-consultations')}
              className="w-full sm:w-auto bg-white hover:bg-mediai-light border-2 border-mediai-primary hover:border-mediai-secondary transition-all duration-300"
            >
              Voir tout
            </Button>
        </div>
        
        <div className="space-y-3 lg:space-y-4">
          {recentConsultations.map((rdv, index) => (
            <div 
              key={rdv.id} 
              className="group bg-white rounded-xl p-3 lg:p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <MedicalIcons.Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-mediai-dark text-sm lg:text-base group-hover:text-mediai-primary transition-colors duration-300">{rdv.medecin}</h4>
                    <p className="text-xs lg:text-sm text-mediai-medium">{rdv.specialite}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs lg:text-sm text-mediai-medium">
                        {new Date(rdv.date).toLocaleDateString('fr-FR')}
                      </p>
                      <span className="text-xs text-mediai-medium">•</span>
                      <p className="text-xs lg:text-sm font-medium text-mediai-primary">{rdv.time}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end sm:justify-start">
                  <span className={getStatusBadge(rdv.statut)}>
                    {rdv.statut}
                  </span>
                </div>
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
        photo: null,
        description: 'Médecin généraliste, consultations adultes et pédiatriques',
        horaires: 'Lun-Sam: 7h-19h',
        localisation: 'Centre Médical Central, Gombe',
        tarif: '30 USD',
        rating: 4.9,
        patientsCount: 2156
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
        tarif: '70 USD',
        rating: 4.7,
        patientsCount: 892
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
        tarif: '45 USD',
        rating: 4.6,
        patientsCount: 1567
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
        tarif: '35 USD',
        rating: 4.9,
        patientsCount: 1893
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
        tarif: '55 USD',
        rating: 4.8,
        patientsCount: 1342
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
      <div className="space-y-4 lg:space-y-6 animate-fadeIn">
        {/* Header avec recherche et filtres */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 lg:p-6 shadow-sm border border-mediai-primary hover:shadow-lg transition-all duration-300">
          <div className="mb-4 lg:mb-6">
            <h2 className="text-medical-subtitle text-lg sm:text-xl lg:text-2xl mb-2 font-bold text-mediai-dark">
              Médecins disponibles
            </h2>
            <p className="text-medical-body text-sm lg:text-base text-mediai-medium">
              Trouvez et prenez rendez-vous avec nos médecins spécialistes
            </p>
          </div>

          {/* Filtres */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Rechercher par nom, spécialité ou localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-white border-2 border-mediai-medium focus:border-mediai-primary focus:ring-2 focus:ring-blue-100 transition-all duration-300"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <select
                  value={specialiteFilter}
                  onChange={(e) => setSpecialiteFilter(e.target.value)}
                  className="w-full appearance-none bg-white px-4 py-3 pr-10 border-2 border-mediai-medium rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-xs lg:text-sm cursor-pointer hover:border-mediai-primary"
                >
                  <option value="all">Toutes les spécialités</option>
                  {specialites.map(specialite => (
                    <option key={specialite} value={specialite}>{specialite}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative flex-1">
                <select
                  value={disponibiliteFilter}
                  onChange={(e) => setDisponibiliteFilter(e.target.value)}
                  className="w-full appearance-none bg-white px-4 py-3 pr-10 border-2 border-mediai-medium rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-xs lg:text-sm cursor-pointer hover:border-mediai-primary"
                >
                  <option value="all">Tous les médecins</option>
                  <option value="disponible">Disponibles</option>
                  <option value="indisponible">Indisponibles</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="group bg-gradient-to-br from-white to-blue-50 rounded-xl p-3 lg:p-4 shadow-sm border border-mediai-primary hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="text-center">
              <div className="inline-flex items-center px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-bold gradient-primary text-white shadow-md">
                {medecins.length}
              </div>
              <p className="text-xs lg:text-sm text-mediai-primary mt-2 font-medium">Total médecins</p>
            </div>
          </div>
          <div className="group bg-gradient-to-br from-white to-green-50 rounded-xl p-3 lg:p-4 shadow-sm border border-green-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="text-center">
              <div className="inline-flex items-center px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
                {medecins.filter(m => m.disponible).length}
              </div>
              <p className="text-xs lg:text-sm text-green-700 mt-2 font-medium">Disponibles</p>
            </div>
          </div>
          <div className="group bg-gradient-to-br from-white to-purple-50 rounded-xl p-3 lg:p-4 shadow-sm border border-purple-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="text-center">
              <div className="inline-flex items-center px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md">
                {specialites.length}
              </div>
              <p className="text-xs lg:text-sm text-purple-700 mt-2 font-medium">Spécialités</p>
            </div>
          </div>
          <div className="group bg-gradient-to-br from-white to-orange-50 rounded-xl p-3 lg:p-4 shadow-sm border border-orange-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <div className="text-center">
              <div className="inline-flex items-center px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md">
                {medecins.filter(m => m.disponible).length}
              </div>
              <p className="text-xs lg:text-sm text-orange-700 mt-2 font-medium">RDV possibles</p>
            </div>
          </div>
        </div>

        {/* Liste des médecins */}
        <div className="space-y-3 lg:space-y-4">
          {filteredMedecins.length === 0 ? (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MedicalIcons.Doctor className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-medical-subtitle text-lg lg:text-xl mb-2 font-bold text-gray-900">Aucun médecin trouvé</h3>
              <p className="text-medical-body text-sm lg:text-base text-gray-600">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          ) : (
            filteredMedecins.map((medecin, index) => (
              <div 
                key={medecin.id} 
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col gap-4">
                  {/* Header du médecin */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start space-x-3 lg:space-x-4 flex-1">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 gradient-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <MedicalIcons.Doctor className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-medical-subtitle text-base lg:text-lg mb-1 font-bold text-mediai-dark group-hover:text-mediai-primary transition-colors duration-300">
                          {medecin.nom}
                        </h3>
                        <p className="text-mediai-primary text-sm lg:text-base font-semibold mb-1">
                          {medecin.specialite}
                        </p>
                        <div className="flex items-center space-x-3">
                          <p className="text-xs lg:text-sm text-gray-600">
                            {medecin.experience} d'expérience
                          </p>
                          <div className="flex items-center space-x-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < Math.floor(medecin.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">({medecin.rating})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col sm:items-end gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        medecin.disponible 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                          : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                      }`}>
                        {medecin.disponible ? 'Disponible' : 'Indisponible'}
                      </span>
                      <p className="text-xs lg:text-sm text-gray-600">
                        Prochain: {new Date(medecin.prochainCreneau).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-medical-body text-sm lg:text-base text-gray-700 leading-relaxed">
                      {medecin.description}
                    </p>
                  </div>

                  {/* Informations pratiques */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100">
                      <MedicalIcons.Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-xs lg:text-sm text-gray-700 font-medium">{medecin.horaires}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100">
                      <MedicalIcons.Location className="w-4 h-4 text-green-500" />
                      <span className="text-xs lg:text-sm text-gray-700 font-medium truncate">{medecin.localisation}</span>
                    </div>

                    <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100">
                      <MedicalIcons.Settings className="w-4 h-4 text-purple-500" />
                      <span className="text-xs lg:text-sm text-gray-700 font-bold">{medecin.tarif}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
                    <Button
                      onClick={() => handlePrendreRdv(medecin)}
                      disabled={!medecin.disponible}
                      className="group/btn flex items-center justify-center space-x-2 flex-1 text-xs lg:text-sm gradient-primary hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <MedicalIcons.Calendar className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                      <span>Prendre RDV</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="group/btn flex items-center justify-center space-x-2 flex-1 text-xs lg:text-sm border-2 border-mediai-medium hover:border-mediai-primary hover:bg-mediai-light transform hover:scale-105 transition-all duration-300"
                    >
                      <MedicalIcons.Message className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
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
      <header className="bg-gradient-to-r from-white to-blue-50 shadow-sm border-b border-mediai-primary">
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
                <h1 className="text-medical-title text-lg sm:text-xl font-bold text-gray-900">Espace Patient</h1>
                <p className="text-medical-caption text-xs sm:text-sm text-gray-600">Gestion de vos consultations médicales</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Menu mobile toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Desktop menu */}
              <div className="hidden lg:flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  <MedicalIcons.Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-300"
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-0 left-0 w-72 h-full bg-gradient-to-b from-white to-gray-50 shadow-2xl animate-slideIn" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Logo size="sm" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-sm">Espace Patient</span>
                    <p className="text-xs text-gray-600">Gestion médicale</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <nav className="p-4 space-y-3">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`group w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                        : 'text-gray-700 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-white bg-opacity-20' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-mediai-dark'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-mediai-medium'}`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-mediai-light space-y-3 bg-white">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                <MedicalIcons.Settings className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-sm border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-300"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <nav className="space-y-3">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`group w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-300 ${
                      isActive
                        ? 'gradient-primary text-white shadow-lg transform scale-105'
                        : 'text-mediai-dark hover:bg-white hover:shadow-md hover:scale-105 border border-transparent hover:border-mediai-light'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-white bg-opacity-20' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-mediai-dark'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-mediai-medium'}`}>
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
