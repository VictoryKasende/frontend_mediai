import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import { consultationService, authService } from '../../services/api';

/**
 * Interface complète de gestion des rendez-vous pour les médecins
 * Permet aux médecins de gérer les demandes de RDV des patients
 */
const DoctorRendezVous = ({ onBack }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  
  // États principaux
  const [activeView, setActiveView] = useState('list'); // 'list', 'details', 'planning'
  const [rdvs, setRdvs] = useState([]);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // États pour les modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Filtres et recherche
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Planning
  const [planningDate, setPlanningDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadRendezVous(),
        loadPatients()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Erreur', 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRendezVous = async () => {
    try {
      const data = await consultationService.getDoctorRendezVous();
      setRdvs(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des RDV:', error);
      setRdvs([]);
    }
  };

  const loadPatients = async () => {
    try {
      const data = await authService.getPatients();
      setPatients(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
      setPatients([]);
    }
  };

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
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      return `${patient.prenom} ${patient.nom}`;
    }
    return 'Patient non trouvé';
  };

  // Filtrage des RDV
  const filteredRdvs = rdvs.filter(rdv => {
    const matchesStatus = filterStatus === 'all' || rdv.statut === filterStatus;
    const matchesSearch = !searchTerm || 
      getPatientName(rdv.patient_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      rdv.motif?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const rdvDate = new Date(rdv.date_rdv);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      switch (filterDate) {
        case 'today':
          matchesDate = rdvDate.toDateString() === today.toDateString();
          break;
        case 'tomorrow':
          matchesDate = rdvDate.toDateString() === tomorrow.toDateString();
          break;
        case 'week':
          matchesDate = rdvDate >= today && rdvDate <= nextWeek;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  // Actions CRUD
  const handleConfirmRdv = async (rdv) => {
    setIsUpdating(true);
    try {
      await consultationService.confirmRendezVous(rdv.id);
      
      setRdvs(prev => prev.map(r => 
        r.id === rdv.id ? { ...r, statut: 'confirme' } : r
      ));
      
      showSuccess('Rendez-vous confirmé', 'Le patient sera notifié de la confirmation');
      
    } catch (error) {
      console.error('Erreur lors de la confirmation du RDV:', error);
      showError('Erreur', 'Impossible de confirmer le rendez-vous');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectRdv = async (rdv) => {
    setIsUpdating(true);
    try {
      await consultationService.cancelRendezVous(rdv.id);
      
      setRdvs(prev => prev.map(r => 
        r.id === rdv.id ? { ...r, statut: 'annule' } : r
      ));
      
      showSuccess('Rendez-vous annulé', 'Le patient sera notifié de l\'annulation');
      
    } catch (error) {
      console.error('Erreur lors de l\'annulation du RDV:', error);
      showError('Erreur', 'Impossible d\'annuler le rendez-vous');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteRdv = async (rdv) => {
    setIsUpdating(true);
    try {
      await consultationService.updateRendezVous(rdv.id, { statut: 'termine' });
      
      setRdvs(prev => prev.map(r => 
        r.id === rdv.id ? { ...r, statut: 'termine' } : r
      ));
      
      showSuccess('Consultation terminée', 'Le rendez-vous a été marqué comme terminé');
      
    } catch (error) {
      console.error('Erreur lors de la finalisation du RDV:', error);
      showError('Erreur', 'Impossible de finaliser le rendez-vous');
    } finally {
      setIsUpdating(false);
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
        case 'confirm':
          handleConfirmRdv(rdv);
          break;
        case 'reject':
          handleRejectRdv(rdv);
          break;
        case 'complete':
          handleCompleteRdv(rdv);
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
            Gestion des Rendez-vous
          </h1>
          <p className="text-sm lg:text-base text-mediai-medium font-body">
            Gérez les demandes de rendez-vous de vos patients
          </p>
        </div>
      </div>
      
      {activeView === 'list' && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
            {/* Recherche */}
            <div className="relative">
              <MedicalIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mediai-medium" />
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
            
            {/* Filtre par date */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="tomorrow">Demain</option>
              <option value="week">Cette semaine</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => setActiveView('planning')}
              variant="outline"
              icon={MedicalIcons.Calendar}
            >
              Planning
            </Button>
          </div>
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
              {getPatientName(rdv.patient_id)}
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
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => handleConfirmAction('confirm', rdv)}
                disabled={isUpdating}
              >
                Confirmer
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleConfirmAction('reject', rdv)}
                disabled={isUpdating}
              >
                Rejeter
              </Button>
            </>
          )}
          
          {rdv.statut === 'confirme' && (
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleConfirmAction('complete', rdv)}
              disabled={isUpdating}
            >
              Terminer
            </Button>
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
          <MedicalIcons.Calendar className="w-16 h-16 text-mediai-medium mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mediai-dark mb-2">
            {searchTerm || filterStatus !== 'all' || filterDate !== 'all' ? 'Aucun rendez-vous trouvé' : 'Aucun rendez-vous'}
          </h3>
          <p className="text-mediai-medium">
            {searchTerm || filterStatus !== 'all' || filterDate !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Aucune demande de rendez-vous pour le moment'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-yellow-800 font-semibold text-lg">
                {rdvs.filter(r => r.statut === 'en_attente').length}
              </div>
              <div className="text-yellow-600 text-sm">En attente</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-800 font-semibold text-lg">
                {rdvs.filter(r => r.statut === 'confirme').length}
              </div>
              <div className="text-green-600 text-sm">Confirmés</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 font-semibold text-lg">
                {rdvs.filter(r => r.statut === 'termine').length}
              </div>
              <div className="text-blue-600 text-sm">Terminés</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-gray-800 font-semibold text-lg">
                {rdvs.length}
              </div>
              <div className="text-gray-600 text-sm">Total</div>
            </div>
          </div>
          
          {filteredRdvs.map(renderRdvCard)}
        </div>
      )}
    </div>
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
                  Patient
                </label>
                <p className="text-mediai-dark font-medium">
                  {getPatientName(selectedRdv.patient_id)}
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
                    Demande créée le
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
                    Notes du patient
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
                className="w-full lg:w-auto bg-green-600 text-white hover:bg-green-700"
                onClick={() => handleConfirmAction('confirm', selectedRdv)}
                disabled={isUpdating}
              >
                Confirmer le RDV
              </Button>
              
              <Button
                variant="outline"
                className="w-full lg:w-auto text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleConfirmAction('reject', selectedRdv)}
                disabled={isUpdating}
              >
                Rejeter le RDV
              </Button>
            </>
          )}
          
          {selectedRdv.statut === 'confirme' && (
            <Button
              className="w-full lg:w-auto bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleConfirmAction('complete', selectedRdv)}
              disabled={isUpdating}
            >
              Marquer comme terminé
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderPlanning = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-border-light">
        <h2 className="text-lg font-semibold text-mediai-dark mb-4">
          Planning des rendez-vous
        </h2>
        
        <div className="mb-4">
          <Input
            label="Date"
            type="date"
            value={planningDate}
            onChange={(e) => setPlanningDate(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Planning de la journée */}
          <div>
            <h3 className="font-medium text-mediai-dark mb-4">RDV du jour</h3>
            <div className="space-y-2">
              {rdvs
                .filter(rdv => rdv.date_rdv === planningDate && rdv.statut !== 'annule')
                .sort((a, b) => a.heure_rdv.localeCompare(b.heure_rdv))
                .map(rdv => (
                  <div key={rdv.id} className="flex items-center justify-between p-3 bg-light rounded-lg">
                    <div>
                      <div className="font-medium">{rdv.heure_rdv}</div>
                      <div className="text-sm text-mediai-medium">{getPatientName(rdv.patient_id)}</div>
                    </div>
                    {getStatusBadge(rdv.statut)}
                  </div>
                ))}
            </div>
          </div>
          
          {/* Créneaux disponibles */}
          <div>
            <h3 className="font-medium text-mediai-dark mb-4">Créneaux disponibles</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
                '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
                '16:00', '16:30', '17:00', '17:30'
              ].map(time => {
                const isBooked = rdvs.some(rdv => 
                  rdv.date_rdv === planningDate && 
                  rdv.heure_rdv === time && 
                  rdv.statut !== 'annule'
                );
                
                return (
                  <div
                    key={time}
                    className={`p-2 text-center rounded-lg text-sm ${
                      isBooked 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {time}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setActiveView('list')}
        >
          Retour à la liste
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light animate-fadeIn">
      {renderHeader()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeView === 'list' && renderRdvsList()}
        {activeView === 'details' && renderRdvDetails()}
        {activeView === 'planning' && renderPlanning()}
      </div>
      
      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeConfirmAction}
        title="Confirmer l'action"
        message={
          confirmAction?.action === 'confirm' 
            ? 'Êtes-vous sûr de vouloir confirmer ce rendez-vous ? Le patient sera notifié.'
            : confirmAction?.action === 'reject'
            ? 'Êtes-vous sûr de vouloir rejeter ce rendez-vous ? Le patient sera notifié.'
            : confirmAction?.action === 'complete'
            ? 'Êtes-vous sûr de vouloir marquer ce rendez-vous comme terminé ?'
            : 'Êtes-vous sûr de vouloir effectuer cette action ?'
        }
        confirmText={
          confirmAction?.action === 'confirm' ? 'Confirmer' :
          confirmAction?.action === 'reject' ? 'Rejeter' :
          confirmAction?.action === 'complete' ? 'Terminer' :
          'Confirmer'
        }
        confirmButtonClass={
          confirmAction?.action === 'confirm' ? 'bg-green-600 hover:bg-green-700' :
          confirmAction?.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
          confirmAction?.action === 'complete' ? 'bg-blue-600 hover:bg-blue-700' :
          ''
        }
      />
    </div>
  );
};

export default DoctorRendezVous;