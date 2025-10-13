import React, { useState, useEffect, useCallback } from 'react';
import { MedicalIcons, NavigationIcons, StatusIcons } from '../../components/Icons';
import Button from '../../components/Button';
import { authService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * Page d'affichage des médecins experts disponibles
 */
const MedecinsExperts = ({ onBack }) => {
  const [medecins, setMedecins] = useState([]);
  const [filteredMedecins, setFilteredMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const { showError } = useNotification();

  useEffect(() => {
    loadMedecins();
  }, [loadMedecins]);

  useEffect(() => {
    filterMedecins();
  }, [filterMedecins]);

  const loadMedecins = useCallback(async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les médecins (pas seulement disponibles)
      const response = await authService.getMedecins();
      const medecinsList = response.results || response;
      setMedecins(medecinsList);
      console.log('Médecins chargés:', medecinsList);
      
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      showError('Erreur', 'Impossible de charger la liste des médecins');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const filterMedecins = useCallback(() => {
    let filtered = [...medecins];

    // Filtre par recherche (nom ou spécialité)
    if (searchTerm) {
      filtered = filtered.filter(medecin =>
        `${medecin.first_name} ${medecin.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medecin.medecin_profile?.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par spécialité
    if (specialtyFilter) {
      filtered = filtered.filter(medecin =>
        medecin.medecin_profile?.specialty?.toLowerCase().includes(specialtyFilter.toLowerCase())
      );
    }

    // Filtre par disponibilité
    if (showAvailableOnly) {
      filtered = filtered.filter(medecin => medecin.medecin_profile?.is_available);
    }

    setFilteredMedecins(filtered);
  }, [medecins, searchTerm, specialtyFilter, showAvailableOnly]);

  // Obtenir la liste des spécialités uniques
  const specialties = [...new Set(medecins.map(m => m.medecin_profile?.specialty).filter(Boolean))];

  const resetFilters = () => {
    setSearchTerm('');
    setSpecialtyFilter('');
    setShowAvailableOnly(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mediai-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-medical-subtitle text-xl mb-2">Chargement...</h2>
          <p className="text-medical-body">Récupération de nos médecins experts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-light">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack}
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <NavigationIcons.Back className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-medical-title text-base sm:text-lg lg:text-xl truncate">Nos médecins experts</h1>
                <p className="text-medical-caption text-xs sm:text-sm truncate">
                  Découvrez notre équipe de professionnels de santé
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filteredMedecins.length} médecin{filteredMedecins.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-6">
        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 mb-4 lg:mb-6">
          <h3 className="text-medical-subtitle text-lg mb-4 flex items-center">
            <MedicalIcons.Search className="w-5 h-5 mr-2 text-mediai-primary" />
            Rechercher un médecin
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {/* Recherche */}
            <div className="relative sm:col-span-2">
              <input
                type="text"
                placeholder="Rechercher par nom ou spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-mediai-medium rounded-lg focus:border-mediai-primary focus:ring-1 focus:ring-mediai-primary transition-all duration-200 text-xs lg:text-sm"
              />
              <MedicalIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mediai-medium" />
            </div>

            {/* Filtre par spécialité */}
            <div className="relative">
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full appearance-none bg-white px-4 py-3 pr-10 border border-mediai-medium rounded-lg focus:border-mediai-primary focus:ring-1 focus:ring-mediai-primary transition-all duration-200 text-xs lg:text-sm text-mediai-dark cursor-pointer hover:border-mediai-primary"
              >
                <option value="">Toutes les spécialités</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-mediai-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Filtre disponibilité */}
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="w-4 h-4 text-mediai-primary border-mediai-medium focus:ring-mediai-primary focus:ring-2 rounded cursor-pointer"
                />
                <span className="ml-2 text-xs lg:text-sm text-mediai-dark">Disponibles uniquement</span>
              </label>
            </div>
          </div>

          {/* Actions de filtrage */}
          {(searchTerm || specialtyFilter || showAvailableOnly) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs lg:text-sm text-mediai-medium">
                {filteredMedecins.length} résultat{filteredMedecins.length > 1 ? 's' : ''} trouvé{filteredMedecins.length > 1 ? 's' : ''}
                {medecins.length !== filteredMedecins.length && ` sur ${medecins.length} total`}
              </p>
              <button
                onClick={resetFilters}
                className="text-xs lg:text-sm text-mediai-primary hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Liste des médecins */}
        {filteredMedecins.length === 0 ? (
          <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-200 text-center">
            <MedicalIcons.Doctor className="w-12 h-12 text-mediai-medium mx-auto mb-4" />
            <h3 className="text-medical-subtitle text-lg mb-2">
              {medecins.length === 0 
                ? 'Aucun médecin disponible' 
                : 'Aucun médecin trouvé'
              }
            </h3>
            <p className="text-medical-body text-sm lg:text-base mb-4">
              {medecins.length === 0
                ? 'Notre équipe médicale sera bientôt disponible.'
                : 'Aucun médecin ne correspond à vos critères de recherche.'
              }
            </p>
            {medecins.length === 0 ? (
              <Button onClick={loadMedecins}>
                Réessayer
              </Button>
            ) : (
              <Button variant="outline" onClick={resetFilters}>
                Voir tous les médecins
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filteredMedecins.map((medecin) => {
              const isAvailable = medecin.medecin_profile?.is_available;
              
              return (
                <div
                  key={medecin.id}
                  className={`bg-white rounded-xl p-4 lg:p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-md ${
                    isAvailable 
                      ? 'border-gray-200 hover:border-mediai-primary' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {/* Badge de disponibilité */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${
                      isAvailable ? 'bg-mediai-light text-mediai-primary' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <MedicalIcons.Doctor className="w-6 h-6 lg:w-8 lg:h-8" />
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isAvailable ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>

                  {/* Informations du médecin */}
                  <div className="mb-4">
                    <h3 className={`font-bold text-base lg:text-lg mb-1 ${
                      isAvailable ? 'text-mediai-dark' : 'text-gray-600'
                    }`}>
                      Dr. {medecin.first_name} {medecin.last_name}
                    </h3>
                    <p className={`text-sm lg:text-base font-medium mb-2 ${
                      isAvailable ? 'text-mediai-primary' : 'text-gray-500'
                    }`}>
                      {medecin.medecin_profile?.specialty || 'Médecine générale'}
                    </p>
                  </div>

                  {/* Informations de contact */}
                  <div className="space-y-2 mb-4">
                    {medecin.email && (
                      <div className="flex items-center space-x-2 text-xs lg:text-sm text-mediai-medium">
                        <MedicalIcons.Message className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{medecin.email}</span>
                      </div>
                    )}
                    {medecin.medecin_profile?.phone_number && (
                      <div className="flex items-center space-x-2 text-xs lg:text-sm text-mediai-medium">
                        <MedicalIcons.Phone className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{medecin.medecin_profile.phone_number}</span>
                      </div>
                    )}
                    {medecin.medecin_profile?.address && (
                      <div className="flex items-start space-x-2 text-xs lg:text-sm text-mediai-medium">
                        <MedicalIcons.Location className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-xs lg:text-sm leading-tight">
                          {medecin.medecin_profile.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    {isAvailable ? (
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full bg-mediai-primary hover:bg-mediai-primary/90 text-white"
                          onClick={() => {
                            // Rediriger vers le formulaire de consultation avec ce médecin pré-sélectionné
                            if (onBack) {
                              // On peut passer l'ID du médecin en paramètre
                              console.log('Consultation avec:', medecin);
                              onBack();
                            }
                          }}
                        >
                          <MedicalIcons.Calendar className="w-4 h-4 mr-2" />
                          Consulter
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-mediai-primary text-mediai-primary hover:bg-mediai-light"
                          onClick={() => {
                            // Ouvrir un modal avec plus d'infos ou rediriger vers le profil
                            console.log('Profil de:', medecin);
                          }}
                        >
                          <MedicalIcons.User className="w-4 h-4 mr-2" />
                          Voir profil
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-2">Actuellement indisponible</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled
                          className="w-full opacity-50 cursor-not-allowed"
                        >
                          Non disponible
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Statistiques en bas de page */}
        {filteredMedecins.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h4 className="text-medical-subtitle text-lg mb-4">Statistiques de notre équipe</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-600 mb-1">Total médecins</p>
                <p className="text-lg font-bold text-blue-700">{medecins.length}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs font-medium text-green-600 mb-1">Disponibles</p>
                <p className="text-lg font-bold text-green-700">
                  {medecins.filter(m => m.medecin_profile?.is_available).length}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs font-medium text-purple-600 mb-1">Spécialités</p>
                <p className="text-lg font-bold text-purple-700">{specialties.length}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-xs font-medium text-orange-600 mb-1">En ligne</p>
                <p className="text-lg font-bold text-orange-700">
                  {medecins.filter(m => m.medecin_profile?.is_available).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedecinsExperts;
