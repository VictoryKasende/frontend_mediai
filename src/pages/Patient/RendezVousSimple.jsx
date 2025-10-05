import React, { useState, useEffect, useMemo } from 'react';
import { MedicalIcons, NavigationIcons, StatusIcons, ActionIcons } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * Interface simplifiée de gestion des rendez-vous
 * Version basique pour éviter les erreurs de page blanche
 */
const RendezVousSimple = ({ onBack }) => {
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [activeView, setActiveView] = useState('list');
  const [isLoading, setIsLoading] = useState(false);
  const [rdvs, setRdvs] = useState([]);
  const [formData, setFormData] = useState({
    medecin_id: '',
    date_rdv: '',
    heure_rdv: '',
    motif: '',
    type_consultation: 'presentiel',
    notes_patient: '',
    priorite: 'normale'
  });

  // Données de test pour éviter les erreurs API
  const medecinsTest = [
    { id: 1, prenom: 'Jean', nom: 'Dupont', specialite: 'Médecine générale' },
    { id: 2, prenom: 'Marie', nom: 'Martin', specialite: 'Cardiologie' },
    { id: 3, prenom: 'Pierre', nom: 'Bernard', specialite: 'Pédiatrie' }
  ];

  const rdvsTest = useMemo(() => [
    {
      id: 1,
      medecin_id: 1,
      date_rdv: '2025-10-10',
      heure_rdv: '09:00',
      motif: 'Consultation de routine',
      statut: 'en_attente',
      priorite: 'normale',
      type_consultation: 'presentiel',
      date_creation: '2025-10-05'
    }
  ], []);

  useEffect(() => {
    // Simuler le chargement des données
    setIsLoading(true);
    setTimeout(() => {
      setRdvs(rdvsTest);
      setIsLoading(false);
    }, 500);
  }, [rdvsTest]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'confirme': { color: 'bg-green-100 text-green-800', label: 'Confirmé' },
      'annule': { color: 'bg-red-100 text-red-800', label: 'Annulé' },
      'termine': { color: 'bg-blue-100 text-blue-800', label: 'Terminé' }
    };
    
    const config = statusConfig[status] || statusConfig['en_attente'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getMedecinName = (medecinId) => {
    const medecin = medecinsTest.find(m => m.id === medecinId);
    return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Médecin non trouvé';
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
      
      return time ? `${dateStr} à ${time}` : dateStr;
    } catch (errorFormat) {
      console.error('Erreur de formatage de date:', errorFormat);
      return 'Date invalide';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.medecin_id || !formData.date_rdv || !formData.heure_rdv || !formData.motif) {
      showError('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Simuler la création du RDV
    const newRdv = {
      id: Date.now(),
      ...formData,
      statut: 'en_attente',
      date_creation: new Date().toISOString()
    };

    setRdvs(prev => [newRdv, ...prev]);
    showSuccess('Rendez-vous créé', 'Votre demande a été envoyée au médecin');
    setActiveView('list');
    
    // Reset form
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
                    {getMedecinName(rdv.medecin_id)}
                  </h3>
                  {getStatusBadge(rdv.statut)}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
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
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => showInfo('Détails', 'Fonctionnalité en développement')}
                >
                  Détails
                </Button>
                
                {rdv.statut === 'en_attente' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => {
                      setRdvs(prev => prev.map(r => 
                        r.id === rdv.id ? { ...r, statut: 'annule' } : r
                      ));
                      showSuccess('Rendez-vous annulé', 'Le rendez-vous a été annulé');
                    }}
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Sélection du médecin */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Médecin *
            </label>
            <select
              value={formData.medecin_id}
              onChange={(e) => setFormData(prev => ({ ...prev, medecin_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionnez un médecin</option>
              {medecinsTest.map(medecin => (
                <option key={medecin.id} value={medecin.id}>
                  Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}
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
            />
          </div>
          
          {/* Heure */}
          <div>
            <Input
              label="Heure du rendez-vous *"
              type="time"
              value={formData.heure_rdv}
              onChange={(e) => setFormData(prev => ({ ...prev, heure_rdv: e.target.value }))}
              required
            />
          </div>
          
          {/* Type de consultation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de consultation
            </label>
            <select
              value={formData.type_consultation}
              onChange={(e) => setFormData(prev => ({ ...prev, type_consultation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="presentiel">Présentiel</option>
              <option value="teleconsultation">Téléconsultation</option>
              <option value="urgence">Urgence</option>
            </select>
          </div>
          
          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              value={formData.priorite}
              onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="faible">Faible</option>
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          
          {/* Motif */}
          <div className="lg:col-span-2">
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
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes supplémentaires
            </label>
            <textarea
              value={formData.notes_patient}
              onChange={(e) => setFormData(prev => ({ ...prev, notes_patient: e.target.value }))}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeView === 'list' && renderRdvsList()}
        {activeView === 'create' && renderCreateForm()}
      </div>
    </div>
  );
};

export default RendezVousSimple;