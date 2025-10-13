import React, { useState, useEffect } from 'react';
import { MedicalIcons, NavigationIcons, StatusIcons, ActionIcons } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService, authService, availabilityService } from '../../services/api';

/**
 * Interface simplifiée de gestion des rendez-vous
 * Version basique pour éviter les erreurs de page blanche
 */
const RendezVousSimple = ({ onBack }) => {
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  
  const [activeView, setActiveView] = useState('list');
  const [isLoading, setIsLoading] = useState(false);
  const [rdvs, setRdvs] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loadingMedecins, setLoadingMedecins] = useState(false);
  
  // États pour les créneaux disponibles
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [manualTime, setManualTime] = useState(''); // Pour saisie manuelle si pas de créneaux
  
  // États pour la modal de détails
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  
  // États pour la modal d'annulation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [formData, setFormData] = useState({
    medecin_id: '',
    date_rdv: '',
    motif: '',
    mode: 'presentiel',
    note_patient: ''
  });

  // Charger les rendez-vous existants
  const loadAppointments = async () => {
    // Éviter les appels multiples simultanés
    if (isLoading) {
      console.log('⏳ Chargement déjà en cours, ignorer...');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('📅 Chargement des rendez-vous...');
      
      // Essayer d'abord sans filtres
      let response = await appointmentService.getAppointments();
      console.log('📦 Réponse API sans filtres:', response);
      
      let appointments = response.results || response;
      
      // Si vide, essayer avec des filtres pour patients
      if ((!appointments || appointments.length === 0) && user?.id) {
        console.log('🔄 Tentative avec filtre patient_id:', user.id);
        try {
          response = await appointmentService.getAppointments({ patient: user.id });
          console.log('� Réponse API avec filtre patient:', response);
          appointments = response.results || response;
        } catch (filterError) {
          console.warn('⚠️ Filtre patient non supporté:', filterError);
        }
      }
      
      // Si toujours vide, essayer de récupérer tous les RDV (pour debug)
      if ((!appointments || appointments.length === 0)) {
        console.log('🔍 Tentative de récupération directe depuis /appointments/');
        console.log('� Structure complète réponse:', JSON.stringify(response, null, 2));
      }
      
      console.log('✅ Nombre total de rendez-vous:', appointments.length);
      
      // Afficher le détail de chaque rendez-vous
      if (appointments.length > 0) {
        console.log('📝 Détail des rendez-vous:');
        appointments.forEach((rdv, index) => {
          console.log(`  RDV ${index + 1}:`, {
            id: rdv.id,
            patient: rdv.patient,
            medecin: rdv.medecin,
            date: rdv.preferred_date || rdv.confirmed_date,
            status: rdv.status,
            type: rdv.type
          });
        });
      } else {
        console.warn('⚠️ Aucun rendez-vous trouvé. Vérifiez:');
        console.warn('  1. Que l\'endpoint backend retourne bien les RDV du patient');
        console.warn('  2. Le filtrage côté backend selon le rôle utilisateur');
        console.warn('  3. Que le rendez-vous existe dans la base de données');
      }
      
      setRdvs(Array.isArray(appointments) ? appointments : []);
    } catch (error) {
      console.error('❌ Erreur chargement rendez-vous:', error);
      console.error('Détails:', error.response?.data);
      
      // Gestion spécifique selon le type d'erreur
      if (error.status === 403 || error.response?.status === 403) {
        showError('Accès refusé. Veuillez vous reconnecter pour actualiser votre session.');
      } else if (error.status === 401 || error.response?.status === 401) {
        showError('Session expirée. Veuillez vous reconnecter.');
      } else {
        showError('Impossible de charger vos rendez-vous');
      }
      
      setRdvs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger la liste des médecins
  const loadMedecins = async () => {
    try {
      setLoadingMedecins(true);
      console.log('👨‍⚕️ Chargement des médecins...');
      
      const response = await authService.getMedecins();
      const medecinsList = response.results || response;
      setMedecins(medecinsList);
      
      console.log('✅ Médecins chargés:', medecinsList.length);
    } catch (error) {
      console.error('❌ Erreur chargement médecins:', error);
      showError('Erreur', 'Impossible de charger la liste des médecins');
    } finally {
      setLoadingMedecins(false);
    }
  };

  // Charger les créneaux disponibles quand médecin et date sont sélectionnés
  const loadAvailableSlots = async (medecinId, date) => {
    if (!medecinId || !date) {
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      console.log(`🕐 Chargement créneaux pour médecin ${medecinId} le ${date}...`);
      
      const response = await availabilityService.getAvailableSlots({ medecin: medecinId, date_start: date, date_end: date });
      const slots = response.results || response;
      setAvailableSlots(slots || []);
      
      console.log('✅ Créneaux disponibles:', slots.length);
      
      // Ne plus afficher de modal d'erreur - le mode libre est maintenant disponible
      // if (slots.length === 0) {
      //   showInfo('Aucun créneau', 'Aucun créneau disponible pour cette date. Essayez une autre date.');
      // }
    } catch (error) {
      console.error('❌ Erreur chargement créneaux:', error);
      showError('Erreur', 'Impossible de charger les créneaux disponibles');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initData = async () => {
      if (mounted) {
        await loadAppointments();
        await loadMedecins();
      }
    };
    
    initData();
    
    // Cleanup pour éviter les double-appels en React Strict Mode
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Charger une seule fois au montage

  // Charger créneaux quand médecin ou date change
  useEffect(() => {
    if (formData.medecin_id && formData.date_rdv) {
      loadAvailableSlots(formData.medecin_id, formData.date_rdv);
      setSelectedSlot(null); // Reset sélection
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.medecin_id, formData.date_rdv]); // Uniquement quand les données du formulaire changent

  // Obtenir le nom du médecin depuis l'ID ou le champ medecin_username
  const getMedecinName = (medecinIdOrUsername) => {
    // Si c'est un username, le retourner directement
    if (typeof medecinIdOrUsername === 'string' && medecinIdOrUsername.includes('dr')) {
      return medecinIdOrUsername;
    }
    
    // Sinon chercher dans la liste des médecins
    const medecinId = typeof medecinIdOrUsername === 'string' ? parseInt(medecinIdOrUsername) : medecinIdOrUsername;
    const medecin = medecins.find(m => m.id === medecinId);
    if (medecin) {
      return `Dr ${medecin.first_name} ${medecin.last_name}`;
    }
    return 'Médecin non trouvé';
  };

  // Formater la date/heure depuis ISO 8601
  const formatDateTime = (isoString) => {
    if (!isoString) return 'Date non définie';
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${dateStr} à ${timeStr}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'confirmed': { color: 'bg-green-100 text-green-800', label: 'Confirmé' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Annulé' },
      'completed': { color: 'bg-blue-100 text-blue-800', label: 'Terminé' },
      // Support anciens formats aussi
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'confirme': { color: 'bg-green-100 text-green-800', label: 'Confirmé' },
      'annule': { color: 'bg-red-100 text-red-800', label: 'Annulé' },
      'termine': { color: 'bg-blue-100 text-blue-800', label: 'Terminé' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getMedecinInfo = (medecinId) => {
    const medecin = medecins.find(m => m.id === medecinId);
    if (medecin) {
      return {
        nom: `Dr ${medecin.first_name} ${medecin.last_name}`,
        specialite: medecin.medecin_profile?.specialty || 'Médecine générale',
        photo: medecin.medecin_profile?.photo
      };
    }
    return { nom: 'Médecin non trouvé', specialite: '', photo: null };
  };

  // Ouvrir la modal de détails
  const handleShowDetails = (rdv) => {
    setSelectedRdv(rdv);
    setShowDetailsModal(true);
  };

  // Fermer la modal de détails
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedRdv(null);
  };

  // Ouvrir la modal d'annulation
  const handleOpenCancelModal = (rdv) => {
    setSelectedRdv(rdv);
    setShowCancelModal(true);
    setShowDetailsModal(false); // Fermer la modal de détails si ouverte
  };

  // Fermer la modal d'annulation
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason('');
  };

  // Annuler un rendez-vous
  const handleCancelAppointment = async () => {
    if (!selectedRdv) return;
    
    // Validation de la raison
    if (!cancelReason.trim()) {
      showError('Veuillez indiquer une raison pour l\'annulation');
      return;
    }

    try {
      setIsCancelling(true);
      console.log('🗑️ Annulation du RDV:', selectedRdv.id);
      
      await appointmentService.cancelAppointment(selectedRdv.id, cancelReason);
      
      showSuccess('Rendez-vous annulé avec succès');
      handleCloseCancelModal();
      setSelectedRdv(null);
      
      // Recharger la liste des rendez-vous
      await loadAppointments();
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation:', error);
      showError(error.message || 'Impossible d\'annuler le rendez-vous');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier qu'on a soit un créneau sélectionné, soit une heure manuelle
    const hasTimeSelection = selectedSlot || (availableSlots.length === 0 && manualTime);
    
    if (!formData.medecin_id || !formData.date_rdv || !hasTimeSelection || !formData.motif) {
      showError('Erreur', 'Veuillez remplir tous les champs obligatoires et indiquer une heure souhaitée');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📝 Création rendez-vous...');
      
      // Calculer les timestamps ISO 8601
      const startTime = selectedSlot ? selectedSlot.start_time : manualTime;
      
      // requested_start: Date + Heure de début
      const requestedStart = new Date(`${formData.date_rdv}T${startTime}:00`);
      
      // requested_end: Date + Heure + 30 minutes par défaut
      const requestedEnd = new Date(requestedStart);
      requestedEnd.setMinutes(requestedEnd.getMinutes() + 30);
      
      // Préparer les données pour l'API /appointments/
      const appointmentData = {
        medecin: parseInt(formData.medecin_id),
        requested_start: requestedStart.toISOString(),
        requested_end: requestedEnd.toISOString(),
        consultation_mode: formData.mode === 'distance' ? 'distanciel' : 'presentiel',
        message_patient: `Motif: ${formData.motif}${formData.note_patient ? `\n\nNotes: ${formData.note_patient}` : ''}`,
        location_note: formData.mode === 'distance' ? 'Consultation à distance' : ''
      };

      console.log('📅 Données rendez-vous:', appointmentData);
      console.log('🔍 Détails:', {
        medecin: appointmentData.medecin,
        date: formData.date_rdv,
        start: appointmentData.requested_start,
        end: appointmentData.requested_end,
        mode: appointmentData.consultation_mode
      });
      
      const newAppointment = await appointmentService.createAppointment(appointmentData);
      
      console.log('✅ Rendez-vous créé:', newAppointment);
      showSuccess('Rendez-vous créé', 'Votre demande de rendez-vous a été envoyée au médecin');
      
      // Recharger la liste
      await loadAppointments();
      
      // Retour à la liste
      setActiveView('list');
      
      // Reset form
      setFormData({
        medecin_id: '',
        date_rdv: '',
        motif: '',
        mode: 'presentiel',
        note_patient: ''
      });
      setSelectedSlot(null);
      setAvailableSlots([]);
      setManualTime('');
    } catch (error) {
      console.error('❌ Erreur création rendez-vous:', error);
      console.error('📊 Détails erreur:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Log JSON complet de l'erreur pour debug
      if (error.response?.data) {
        console.error('🔴 Erreur backend complète:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Extraire le message d'erreur détaillé
      let errorMessage = 'Impossible de créer le rendez-vous';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Essayer différents formats d'erreur
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else {
          // Afficher toutes les erreurs de champs
          const fieldErrors = Object.entries(data)
            .map(([field, errors]) => {
              const errorText = Array.isArray(errors) ? errors.join(', ') : errors;
              return `${field}: ${errorText}`;
            })
            .join(' | ');
          if (fieldErrors) errorMessage = fieldErrors;
        }
      }
      
      console.error('💬 Message erreur affiché:', errorMessage);
      showError('Erreur de création', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <NavigationIcons.ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Mes Rendez-vous
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            Gérez vos consultations et rendez-vous médicaux
          </p>
        </div>
      </div>
      
      {activeView === 'list' && (
        <div className="flex justify-end">
          <Button
            onClick={() => setActiveView('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ActionIcons.Plus className="w-4 h-4 mr-2" />
            Nouveau RDV
          </Button>
        </div>
      )}
    </div>
  );

  const renderRdvsList = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des rendez-vous...</p>
        </div>
      ) : rdvs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <MedicalIcons.Calendar className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun rendez-vous
          </h3>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore de rendez-vous programmé
          </p>
          <Button
            onClick={() => setActiveView('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Prendre un rendez-vous
          </Button>
        </div>
      ) : (
        rdvs.map(rdv => (
          <div key={rdv.id} className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rdv.medecin_username || getMedecinName(rdv.medecin)}
                  </h3>
                  {getStatusBadge(rdv.status)}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MedicalIcons.Calendar className="w-4 h-4" />
                    <span>{formatDateTime(rdv.confirmed_start || rdv.requested_start)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MedicalIcons.Document className="w-4 h-4" />
                    <span>{rdv.message_patient || rdv.notes || 'Pas de message'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {rdv.consultation_mode === 'distanciel' ? (
                      <MedicalIcons.Video className="w-4 h-4" />
                    ) : (
                      <MedicalIcons.Location className="w-4 h-4" />
                    )}
                    <span className="capitalize">
                      {rdv.consultation_mode_display || rdv.consultation_mode || 'Présentiel'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShowDetails(rdv)}
                >
                  Détails
                </Button>
                
                {rdv.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => handleOpenCancelModal(rdv)}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderCreateForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Nouveau rendez-vous
        </h2>
        
        <div className="space-y-6">
          {/* Sélection du médecin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Médecin * {loadingMedecins && <span className="text-xs text-gray-500">(Chargement...)</span>}
            </label>
            <select
              value={formData.medecin_id}
              onChange={(e) => setFormData(prev => ({ ...prev, medecin_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loadingMedecins}
            >
              <option value="">Sélectionnez un médecin</option>
              {medecins.map(medecin => (
                <option key={medecin.id} value={medecin.id}>
                  Dr {medecin.first_name} {medecin.last_name} - {medecin.medecin_profile?.specialty || 'Médecine générale'}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date */}
          <div>
            <Input
              label="Date du rendez-vous *"
              type="date"
              value={formData.date_rdv}
              onChange={(e) => setFormData(prev => ({ ...prev, date_rdv: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
              disabled={!formData.medecin_id}
            />
            {!formData.medecin_id && (
              <p className="text-xs text-gray-500 mt-1">Sélectionnez d'abord un médecin</p>
            )}
          </div>
          
          {/* Créneaux disponibles */}
          {formData.medecin_id && formData.date_rdv && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Créneaux disponibles * {loadingSlots && <span className="text-xs text-gray-500">(Chargement...)</span>}
              </label>
              
              {loadingSlots ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Chargement des créneaux...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <StatusIcons.Warning className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-yellow-800 font-medium">Aucun créneau prédéfini pour cette date</p>
                    <p className="text-xs text-yellow-600 mt-1">Le médecin n'a pas encore configuré ses disponibilités</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      💡 Proposez une heure souhaitée
                    </label>
                    <input
                      type="time"
                      value={manualTime}
                      onChange={(e) => setManualTime(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-xs text-blue-700 mt-2">
                      Le médecin pourra confirmer ou proposer un autre horaire
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSlot?.start_time === slot.start_time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <MedicalIcons.Clock className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {slot.start_time.slice(0, 5)}
                        </span>
                      </div>
                      <div className="text-xs text-center mt-1 opacity-75">
                        {slot.duration || 30} min
                      </div>
                      {selectedSlot?.start_time === slot.start_time && (
                        <div className="mt-1 flex justify-center">
                          <StatusIcons.Success className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {selectedSlot && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <StatusIcons.Success className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Créneau sélectionné: {selectedSlot.start_time.slice(0, 5)} - {selectedSlot.end_time.slice(0, 5)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Mode de consultation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de consultation *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, mode: 'presentiel' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.mode === 'presentiel'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <MedicalIcons.Location className="w-6 h-6" />
                  <span className="font-medium">Présentiel</span>
                  {formData.mode === 'presentiel' && (
                    <StatusIcons.Success className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, mode: 'distanciel' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.mode === 'distanciel'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <MedicalIcons.Video className="w-6 h-6" />
                  <span className="font-medium">Distanciel</span>
                  {formData.mode === 'distanciel' && (
                    <StatusIcons.Success className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </button>
            </div>
          </div>
          
          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de consultation *
            </label>
            <textarea
              value={formData.motif}
              onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
              placeholder="Décrivez brièvement le motif de votre consultation..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes supplémentaires
            </label>
            <textarea
              value={formData.note_patient}
              onChange={(e) => setFormData(prev => ({ ...prev, note_patient: e.target.value }))}
              placeholder="Informations supplémentaires que vous souhaitez communiquer..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setActiveView('list')}
          className="w-full lg:w-auto"
        >
          Annuler
        </Button>
        
        <Button
          type="submit"
          className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          Créer le RDV
        </Button>
      </div>
    </form>
  );

  // Afficher la modal de confirmation d'annulation
  const renderCancelModal = () => {
    if (!selectedRdv) return null;

    return (
      <Modal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        title="Confirmer l'annulation"
        size="md"
        type="warning"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <StatusIcons.Warning className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Êtes-vous sûr de vouloir annuler ce rendez-vous ?
                </p>
              </div>
            </div>
          </div>

          {/* Informations du RDV */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Rendez-vous avec :</h4>
            <p className="text-gray-700">{selectedRdv.medecin_username || getMedecinName(selectedRdv.medecin)}</p>
            <p className="text-gray-600 text-sm mt-1">{formatDateTime(selectedRdv.requested_start)}</p>
          </div>

          {/* Raison de l'annulation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison de l'annulation *
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Veuillez indiquer la raison de l'annulation..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={isCancelling}
            />
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            onClick={handleCloseCancelModal}
            disabled={isCancelling}
          >
            Non, conserver
          </Button>
          
          <Button
            variant="danger"
            onClick={handleCancelAppointment}
            disabled={isCancelling || !cancelReason.trim()}
          >
            {isCancelling ? 'Annulation...' : 'Oui, annuler'}
          </Button>
        </div>
      </Modal>
    );
  };

  // Afficher la modal de détails
  const renderDetailsModal = () => {
    if (!selectedRdv) return null;

    const medecinInfo = selectedRdv.medecin_username 
      ? { nom: selectedRdv.medecin_username, specialite: '', photo: null }
      : getMedecinInfo(selectedRdv.medecin);

    return (
      <Modal
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        title="Détails du Rendez-vous"
        size="lg"
      >
        <div className="space-y-6">
          {/* Informations Médecin */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              {medecinInfo.photo ? (
                <img 
                  src={medecinInfo.photo} 
                  alt={medecinInfo.nom}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
                  <MedicalIcons.Doctor className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{medecinInfo.nom}</h3>
                {medecinInfo.specialite && (
                  <p className="text-sm text-gray-600">{medecinInfo.specialite}</p>
                )}
                <div className="mt-2">{getStatusBadge(selectedRdv.status)}</div>
              </div>
            </div>
          </div>

          {/* Informations Date & Heure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MedicalIcons.Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Date demandée</span>
              </div>
              <p className="text-gray-900">{formatDateTime(selectedRdv.requested_start)}</p>
            </div>
            
            {selectedRdv.confirmed_start && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <StatusIcons.Success className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Date confirmée</span>
                </div>
                <p className="text-gray-900">{formatDateTime(selectedRdv.confirmed_start)}</p>
              </div>
            )}
          </div>

          {/* Mode de Consultation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              {selectedRdv.consultation_mode === 'distanciel' ? (
                <>
                  <MedicalIcons.Video className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Consultation à distance</span>
                </>
              ) : (
                <>
                  <MedicalIcons.Location className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Consultation en présentiel</span>
                </>
              )}
            </div>
            {selectedRdv.location_note && (
              <p className="text-gray-600 text-sm">{selectedRdv.location_note}</p>
            )}
          </div>

          {/* Message du Patient */}
          {selectedRdv.message_patient && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ActionIcons.Message className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Votre message</span>
              </div>
              <p className="text-gray-900 whitespace-pre-line">{selectedRdv.message_patient}</p>
            </div>
          )}

          {/* Réponse du Médecin */}
          {selectedRdv.doctor_message && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MedicalIcons.Doctor className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Réponse du médecin</span>
              </div>
              <p className="text-gray-900 whitespace-pre-line">{selectedRdv.doctor_message}</p>
            </div>
          )}

          {/* Informations Système */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Créé le :</span>
                <p className="text-gray-900 font-medium">
                  {new Date(selectedRdv.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {selectedRdv.updated_at && selectedRdv.updated_at !== selectedRdv.created_at && (
                <div>
                  <span className="text-gray-500">Modifié le :</span>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedRdv.updated_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            variant="outline"
            onClick={handleCloseDetails}
          >
            Fermer
          </Button>
          
          {selectedRdv.status === 'pending' && (
            <Button
              variant="danger"
              onClick={() => handleOpenCancelModal(selectedRdv)}
            >
              Annuler le RDV
            </Button>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeView === 'list' && renderRdvsList()}
        {activeView === 'create' && renderCreateForm()}
      </div>
      
      {/* Modal de détails */}
      {renderDetailsModal()}
      
      {/* Modal de confirmation d'annulation */}
      {renderCancelModal()}
    </div>
  );
};

export default RendezVousSimple;