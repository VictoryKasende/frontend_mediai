import React, { useState, useEffect, useCallback } from 'react';
import { MedicalIcons, NavigationIcons, StatusIcons, ActionIcons } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { consultationService, authService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Interface complète de gestion des rendez-vous
 * Permet aux patients de créer, consulter, modifier et annuler leurs RDV
 */
const RendezVous = ({ onBack }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  // États principaux
  const [activeView, setActiveView] = useState('list'); // 'list', 'create', 'edit', 'details'
  const [rdvs, setRdvs] = useState([]);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [medecins, setMedecins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États pour les modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Filtres et recherche
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulaire de RDV
  const [formData, setFormData] = useState({
    medecin_id: '',
    date_rdv: '',
    heure_rdv: '',
    motif: '',
    type_consultation: 'presentiel',
    notes_patient: '',
    priorite: 'normale'
  });

  useEffect(() => {
    loadData();
  }, [loadData]);  const loadData = useCallback(async () => {
    console.log('Chargement des données RDV...');
    setIsLoading(true);
    try {
      await Promise.all([
        loadRendezVous(),
        loadMedecins()
      ]);
      console.log('Données RDV chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Erreur', 'Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  }, [loadRendezVous, loadMedecins, showError]);

  const loadRendezVous = useCallback(async () => {
    try {
      const data = await consultationService.getPatientRendezVous();
      setRdvs(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des RDV:', error);
      setRdvs([]);
    }
  }, []);

  const loadMedecins = useCallback(async () => {
    try {
      const data = await authService.getMedecins();
      setMedecins(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      setMedecins([]);
    }
  }, []);

  // Fonctions utilitaires
  const getStatusBadge = (status) => {
    const statusConfig = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', icon: StatusIcons.Pending, label: 'En attente' },
      'confirme': { color: 'bg-green-100 text-green-800', icon: StatusIcons.Confirmed, label: 'Confirmé' },
      'annule': { color: 'bg-red-100 text-red-800', icon: StatusIcons.Cancelled, label: 'Annulé' },
      'termine': { color: 'bg-blue-100 text-blue-800', icon: StatusIcons.Completed, label: 'Terminé' },
      'reporte': { color: 'bg-purple-100 text-purple-800', icon: StatusIcons.Pending, label: 'Reporté' }
    };
    
    const config = statusConfig[status] || statusConfig['en_attente'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'urgente': { color: 'bg-red-100 text-red-800', label: 'Urgente' },
      'haute': { color: 'bg-orange-100 text-orange-800', label: 'Haute' },
      'normale': { color: 'bg-blue-100 text-blue-800', label: 'Normale' },
      'faible': { color: 'bg-gray-100 text-gray-800', label: 'Faible' }
    };
    
    const config = priorityConfig[priority] || priorityConfig['normale'];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'Date non définie';
    
    try {
      const dateObj = new Date(date);
      const dateStr = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (time) {
        return `${dateStr} à ${time}`;
      }
      return dateStr;
    } catch (errorDate) {
      console.error('Erreur de formatage de date:', errorDate);
      return 'Date invalide';
    }
  };

  const getMedecinName = (medecinId) => {
    const medecin = medecins.find(m => m.id === medecinId);
    if (medecin) {
      return `Dr. ${medecin.prenom} ${medecin.nom}`;
    }
    return 'Médecin non trouvé';
  };

  // Filtrage des RDV
  const filteredRdvs = rdvs.filter(rdv => {
    const matchesStatus = filterStatus === 'all' || rdv.statut === filterStatus;
    const matchesSearch = !searchTerm || 
      getMedecinName(rdv.medecin_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      rdv.motif?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Gestion du formulaire
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      medecin_id: '',
      date_rdv: '',
      heure_rdv: '',
      motif: '',
      type_consultation: 'presentiel',
      notes_patient: '',
      priorite: 'normale'
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.medecin_id) errors.push('Médecin');
    if (!formData.date_rdv) errors.push('Date du rendez-vous');
    if (!formData.heure_rdv) errors.push('Heure du rendez-vous');
    if (!formData.motif?.trim()) errors.push('Motif de consultation');
    
    // Validation de la date (ne peut pas être dans le passé)
    if (formData.date_rdv) {
      const rdvDate = new Date(formData.date_rdv + 'T' + formData.heure_rdv);
      const now = new Date();
      
      if (rdvDate <= now) {
        errors.push('La date et l\'heure doivent être dans le futur');
      }
    }
    
    if (errors.length > 0) {
      showError(
        'Champs obligatoires manquants',
        `Veuillez remplir: ${errors.join(', ')}`
      );
      return false;
    }
    
    return true;
  };

  // Actions CRUD
  const handleCreateRdv = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const rdvData = {
        ...formData,
        patient_id: user.id,
        statut: 'en_attente',
        date_creation: new Date().toISOString()
      };
      
      const newRdv = await consultationService.createRendezVous(rdvData);
      
      setRdvs(prev => [newRdv, ...prev]);
      showSuccess('Rendez-vous créé', 'Votre demande de rendez-vous a été envoyée au médecin');
      resetForm();
      setActiveView('list');
      
    } catch (error) {
      console.error('Erreur lors de la création du RDV:', error);
      showError('Erreur', 'Impossible de créer le rendez-vous');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRdv = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const updatedRdv = await consultationService.updateRendezVous(selectedRdv.id, formData);
      
      setRdvs(prev => prev.map(rdv => 
        rdv.id === selectedRdv.id ? { ...rdv, ...updatedRdv } : rdv
      ));
      
      showSuccess('Rendez-vous modifié', 'Les modifications ont été enregistrées');
      setActiveView('list');
      setSelectedRdv(null);
      
    } catch (error) {
      console.error('Erreur lors de la modification du RDV:', error);
      showError('Erreur', 'Impossible de modifier le rendez-vous');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRdv = async (rdv) => {
    try {
      await consultationService.cancelRendezVous(rdv.id);
      
      setRdvs(prev => prev.map(r => 
        r.id === rdv.id ? { ...r, statut: 'annule' } : r
      ));
      
      showSuccess('Rendez-vous annulé', 'Le rendez-vous a été annulé avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'annulation du RDV:', error);
      showError('Erreur', 'Impossible d\'annuler le rendez-vous');
    }
  };

  const handleConfirmAction = (action, rdv) => {
    setConfirmAction({ action, rdv });
    setShowConfirmModal(true);
  };

  const executeConfirmAction = () => {
    if (confirmAction) {
      const { action, rdv } = confirmAction;
      
      switch (action) {
        case 'cancel':
          handleCancelRdv(rdv);
          break;
        default:
          break;
      }
    }
    
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // Composants de rendu
  const renderHeader = () => (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-border-light mb-6">
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={onBack}
          className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors"
        >
          <NavigationIcons.ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-mediai-dark font-heading">
            Mes Rendez-vous
          </h1>
          <p className="text-sm lg:text-base text-mediai-medium font-body">
            Gérez vos consultations et rendez-vous médicaux
          </p>
        </div>
      </div>
      
      {activeView === 'list' && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
            {/* Recherche */}
            <div className="relative">
              <ActionIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mediai-medium" />
              <input
                type="text"
                placeholder="Rechercher un RDV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary"
              />
            </div>
            
            {/* Filtre par statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirme">Confirmé</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
              <option value="reporte">Reporté</option>
            </select>
          </div>
          
          <Button
            onClick={() => setActiveView('create')}
            className="bg-mediai-primary hover:bg-mediai-secondary text-white"
            icon={ActionIcons.Plus}
          >
            Nouveau RDV
          </Button>
        </div>
      )}
    </div>
  );

  const renderRdvCard = (rdv) => (
    <div key={rdv.id} className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-border-light hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-mediai-dark">
              {getMedecinName(rdv.medecin_id)}
            </h3>
            {getStatusBadge(rdv.statut)}
            {getPriorityBadge(rdv.priorite)}
          </div>
          
          <div className="space-y-2 text-sm text-mediai-medium">
            <div className="flex items-center space-x-2">
              <MedicalIcons.Calendar className="w-4 h-4" />
              <span>{formatDateTime(rdv.date_rdv, rdv.heure_rdv)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MedicalIcons.Document className="w-4 h-4" />
              <span>{rdv.motif}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MedicalIcons.Location className="w-4 h-4" />
              <span className="capitalize">{rdv.type_consultation}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedRdv(rdv);
              setActiveView('details');
            }}
          >
            Détails
          </Button>
          
          {rdv.statut === 'en_attente' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedRdv(rdv);
                  setFormData({ ...rdv });
                  setActiveView('edit');
                }}
              >
                Modifier
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleConfirmAction('cancel', rdv)}
              >
                Annuler
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderRdvsList = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mediai-primary mx-auto"></div>
          <p className="text-mediai-medium mt-4">Chargement des rendez-vous...</p>
        </div>
      ) : filteredRdvs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-mediai-medium">
            <MedicalIcons.Calendar className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-mediai-dark mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Aucun rendez-vous trouvé' : 'Aucun rendez-vous'}
          </h3>
          <p className="text-mediai-medium mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Vous n\'avez pas encore de rendez-vous programmé'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Button
              onClick={() => setActiveView('create')}
              className="bg-mediai-primary hover:bg-mediai-secondary text-white"
            >
              Prendre un rendez-vous
            </Button>
          )}
        </div>
      ) : (
        filteredRdvs.map(renderRdvCard)
      )}
    </div>
  );

  const renderRdvForm = () => (
    <form onSubmit={activeView === 'create' ? handleCreateRdv : handleUpdateRdv} className="space-y-6">
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-border-light">
        <h2 className="text-lg font-semibold text-mediai-dark mb-4">
          {activeView === 'create' ? 'Nouveau rendez-vous' : 'Modifier le rendez-vous'}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Sélection du médecin */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Médecin *
            </label>
            <select
              value={formData.medecin_id}
              onChange={(e) => handleInputChange('medecin_id', e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary"
              required
            >
              <option value="">Sélectionnez un médecin</option>
              {medecins.map(medecin => (
                <option key={medecin.id} value={medecin.id}>
                  Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite || 'Médecine générale'}
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
              onChange={(e) => handleInputChange('date_rdv', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          {/* Heure */}
          <div>
            <Input
              label="Heure du rendez-vous *"
              type="time"
              value={formData.heure_rdv}
              onChange={(e) => handleInputChange('heure_rdv', e.target.value)}
              required
            />
          </div>
          
          {/* Type de consultation */}
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Type de consultation
            </label>
            <select
              value={formData.type_consultation}
              onChange={(e) => handleInputChange('type_consultation', e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary"
            >
              <option value="presentiel">Présentiel</option>
              <option value="teleconsultation">Téléconsultation</option>
              <option value="urgence">Urgence</option>
            </select>
          </div>
          
          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Priorité
            </label>
            <select
              value={formData.priorite}
              onChange={(e) => handleInputChange('priorite', e.target.value)}
              className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary"
            >
              <option value="faible">Faible</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          
          {/* Motif */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Motif de consultation *
            </label>
            <textarea
              value={formData.motif}
              onChange={(e) => handleInputChange('motif', e.target.value)}
              placeholder="Décrivez brièvement le motif de votre consultation..."
              rows={3}
              className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary resize-none"
              required
            />
          </div>
          
          {/* Notes */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Notes supplémentaires
            </label>
            <textarea
              value={formData.notes_patient}
              onChange={(e) => handleInputChange('notes_patient', e.target.value)}
              placeholder="Informations supplémentaires que vous souhaitez communiquer..."
              rows={3}
              className="w-full px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary resize-none"
            />
          </div>
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setActiveView('list');
            setSelectedRdv(null);
          }}
          className="w-full lg:w-auto"
        >
          Annuler
        </Button>
        
        <Button
          type="submit"
          className="w-full lg:w-auto bg-mediai-primary hover:bg-mediai-secondary text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {activeView === 'create' ? 'Création...' : 'Modification...'}
            </>
          ) : (
            activeView === 'create' ? 'Créer le RDV' : 'Modifier le RDV'
          )}
        </Button>
      </div>
    </form>
  );

  const renderRdvDetails = () => {
    if (!selectedRdv) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-border-light">
          <h2 className="text-lg font-semibold text-mediai-dark mb-4">
            Détails du rendez-vous
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mediai-medium mb-1">
                  Médecin
                </label>
                <p className="text-mediai-dark font-medium">
                  {getMedecinName(selectedRdv.medecin_id)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mediai-medium mb-1">
                  Date et heure
                </label>
                <p className="text-mediai-dark font-medium">
                  {formatDateTime(selectedRdv.date_rdv, selectedRdv.heure_rdv)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mediai-medium mb-1">
                  Type de consultation
                </label>
                <p className="text-mediai-dark font-medium capitalize">
                  {selectedRdv.type_consultation}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-mediai-medium mb-1">
                  Statut
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedRdv.statut)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mediai-medium mb-1">
                  Priorité
                </label>
                <div className="mt-1">
                  {getPriorityBadge(selectedRdv.priorite)}
                </div>
              </div>
              
              {selectedRdv.date_creation && (
                <div>
                  <label className="block text-sm font-medium text-mediai-medium mb-1">
                    Créé le
                  </label>
                  <p className="text-mediai-dark">
                    {new Date(selectedRdv.date_creation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-mediai-medium mb-1">
                  Motif de consultation
                </label>
                <p className="text-mediai-dark bg-light p-3 rounded-lg">
                  {selectedRdv.motif}
                </p>
              </div>
              
              {selectedRdv.notes_patient && (
                <div>
                  <label className="block text-sm font-medium text-mediai-medium mb-1">
                    Notes supplémentaires
                  </label>
                  <p className="text-mediai-dark bg-light p-3 rounded-lg">
                    {selectedRdv.notes_patient}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
          <Button
            variant="outline"
            onClick={() => setActiveView('list')}
            className="w-full lg:w-auto"
          >
            Retour à la liste
          </Button>
          
          {selectedRdv.statut === 'en_attente' && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({ ...selectedRdv });
                  setActiveView('edit');
                }}
                className="w-full lg:w-auto"
              >
                Modifier
              </Button>
              
              <Button
                variant="outline"
                className="w-full lg:w-auto text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleConfirmAction('cancel', selectedRdv)}
              >
                Annuler le RDV
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light animate-fadeIn">
      {renderHeader()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeView === 'list' && renderRdvsList()}
        {(activeView === 'create' || activeView === 'edit') && renderRdvForm()}
        {activeView === 'details' && renderRdvDetails()}
      </div>
      
      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeConfirmAction}
        title="Confirmer l'action"
        message={
          confirmAction?.action === 'cancel' 
            ? 'Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.'
            : 'Êtes-vous sûr de vouloir effectuer cette action ?'
        }
        confirmText={confirmAction?.action === 'cancel' ? 'Annuler le RDV' : 'Confirmer'}
        confirmButtonClass={confirmAction?.action === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''}
      />
    </div>
  );
};

export default RendezVous;