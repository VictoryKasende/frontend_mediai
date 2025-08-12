import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';

/**
 * Page Consultation - Gestion des rendez-vous et des fiches médicales
 */
const ConsultationPage = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showNewConsultationModal, setShowNewConsultationModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Onglets disponibles
  const tabs = [
    { id: 'upcoming', label: 'À venir', icon: MedicalIcons.Appointment },
    { id: 'history', label: 'Historique', icon: MedicalIcons.Document },
    { id: 'files', label: 'Dossiers médicaux', icon: MedicalIcons.Files }
  ];

  // Données factices de consultations
  const mockConsultations = {
    upcoming: [
      {
        id: 1,
        date: '2025-08-15',
        time: '14:30',
        doctor: 'Dr. Martin Dubois',
        specialty: 'Cardiologie',
        type: 'Consultation de suivi',
        status: 'confirmee',
        location: 'Cabinet - 123 Rue de la Santé, Paris',
        notes: 'Apporter les derniers résultats d\'analyse'
      },
      {
        id: 2,
        date: '2025-08-20',
        time: '10:00',
        doctor: 'Dr. Sophie Laurent',
        specialty: 'Dermatologie',
        type: 'Première consultation',
        status: 'en_attente',
        location: 'Téléconsultation',
        notes: ''
      }
    ],
    history: [
      {
        id: 3,
        date: '2025-07-28',
        time: '16:00',
        doctor: 'Dr. Jean Dupont',
        specialty: 'Médecine générale',
        type: 'Consultation générale',
        status: 'terminee',
        location: 'Cabinet médical',
        diagnosis: 'Rhume commun',
        prescription: 'Paracétamol 1g - 3x/jour pendant 5 jours'
      }
    ]
  };

  // Charger les données
  useEffect(() => {
    const loadConsultations = async () => {
      setIsLoading(true);
      try {
        // Simulation du chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConsultations(mockConsultations);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsultations();
  }, []);

  // Statuts des consultations
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmee: { color: 'bg-green-100 text-green-800', text: 'Confirmée', icon: StatusIcons.Check, variant: 'success' },
      en_attente: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: StatusIcons.Clock, variant: 'warning' },
      terminee: { color: 'bg-blue-100 text-blue-800', text: 'Terminée', icon: StatusIcons.Check, variant: 'primary' },
      annulee: { color: 'bg-red-100 text-red-800', text: 'Annulée', icon: StatusIcons.X, variant: 'danger' }
    };

    const config = statusConfig[status] || statusConfig.en_attente;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <MedicalIcon icon={config.icon} size="w-3 h-3" variant={config.variant} className="mr-1" />
        {config.text}
      </span>
    );
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  // Composant Carte de consultation
  const ConsultationCard = ({ consultation }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {consultation.doctor}
            </h3>
            {getStatusBadge(consultation.status)}
          </div>
          <p className="text-sm text-gray-600">{consultation.specialty}</p>
          <p className="text-sm text-gray-600">{consultation.type}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatDate(consultation.date)}
          </p>
          <p className="text-sm text-gray-600">{consultation.time}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📍</span>
          {consultation.location}
        </div>
        {consultation.notes && (
          <div className="flex items-start text-sm text-gray-600">
            <span className="mr-2">📝</span>
            {consultation.notes}
          </div>
        )}
        {consultation.diagnosis && (
          <div className="flex items-start text-sm text-gray-600 font-body">
            <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-4 h-4" variant="primary" className="mr-2 mt-0.5" />
            <span><strong>Diagnostic :</strong> {consultation.diagnosis}</span>
          </div>
        )}
        {consultation.prescription && (
          <div className="flex items-start text-sm text-gray-600 font-body">
            <MedicalIcon icon={MedicalIcons.Pill} size="w-4 h-4" variant="warning" className="mr-2 mt-0.5" />
            <span><strong>Prescription :</strong> {consultation.prescription}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {consultation.status === 'confirmee' && (
          <>
            <Button size="sm" variant="outline">Modifier</Button>
            <Button size="sm" variant="danger">Annuler</Button>
          </>
        )}
        {consultation.status === 'terminee' && (
          <>
            <Button size="sm" variant="outline">Voir détails</Button>
            <Button size="sm" variant="outline">Télécharger</Button>
          </>
        )}
        <Button 
          size="sm"
          onClick={() => setSelectedConsultation(consultation)}
        >
          Voir plus
        </Button>
      </div>
    </div>
  );

  // Formulaire de nouvelle consultation
  const NewConsultationForm = () => {
    const [formData, setFormData] = useState({
      specialty: '',
      type: 'consultation',
      preferredDate: '',
      preferredTime: '',
      reason: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // TODO: Logique de création de consultation
      console.log('Nouvelle consultation:', formData);
      setShowNewConsultationModal(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spécialité <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.specialty}
            onChange={(e) => setFormData({...formData, specialty: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner une spécialité</option>
            <option value="medecine_generale">Médecine générale</option>
            <option value="cardiologie">Cardiologie</option>
            <option value="dermatologie">Dermatologie</option>
            <option value="pediatrie">Pédiatrie</option>
            <option value="gynecologie">Gynécologie</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de consultation
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="consultation">Consultation classique</option>
            <option value="teleconsultation">Téléconsultation</option>
            <option value="urgence">Consultation d'urgence</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date souhaitée"
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
            required
          />
          <Input
            label="Heure souhaitée"
            type="time"
            value={formData.preferredTime}
            onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motif de consultation
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Décrivez brièvement le motif de votre consultation..."
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="flex-1">
            Demander un rendez-vous
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowNewConsultationModal(false)}
          >
            Annuler
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6 font-medical">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Consultations
            </h1>
            <p className="text-medical-body mt-1">
              Gestion de vos rendez-vous et dossiers médicaux
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowNewConsultationModal(true)}>
              <Icon icon={ActionIcons.Plus} size="w-4 h-4" className="mr-2" />
              Nouveau rendez-vous
            </Button>
            <MedicalIcon 
              icon={MedicalIcons.Stethoscope} 
              size="w-8 h-8" 
              variant="medical"
            />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <MedicalIcon 
                    icon={tab.icon} 
                    size="w-4 h-4" 
                    variant={activeTab === tab.id ? 'primary' : 'secondary'} 
                    className="mr-2" 
                  />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6 font-medical">
              {activeTab === 'upcoming' && (
                <div>
                  <h2 className="text-lg font-heading font-medium text-gray-900 mb-4">
                    Prochains rendez-vous
                  </h2>
                  {consultations.upcoming?.length > 0 ? (
                    <div className="space-y-4">
                      {consultations.upcoming.map((consultation) => (
                        <ConsultationCard key={consultation.id} consultation={consultation} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MedicalIcon icon={MedicalIcons.Appointment} size="w-8 h-8" variant="secondary" />
                      </div>
                      <p className="text-medical-body">Aucun rendez-vous prévu</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Historique des consultations
                  </h2>
                  {consultations.history?.length > 0 ? (
                    <div className="space-y-4">
                      {consultations.history.map((consultation) => (
                        <ConsultationCard key={consultation.id} consultation={consultation} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-4 block">📋</span>
                      <p className="text-gray-500">Aucune consultation dans l'historique</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'files' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Dossiers médicaux
                  </h2>
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📁</span>
                    <p className="text-gray-500">Fonctionnalité en développement</p>
                    <p className="text-sm text-gray-400">
                      Bientôt disponible pour gérer vos documents médicaux
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal nouvelle consultation */}
      <Modal
        isOpen={showNewConsultationModal}
        onClose={() => setShowNewConsultationModal(false)}
        title="Demander un nouveau rendez-vous"
        size="md"
      >
        <NewConsultationForm />
      </Modal>

      {/* Modal détails consultation */}
      <Modal
        isOpen={!!selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
        title="Détails de la consultation"
        size="lg"
      >
        {selectedConsultation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Médecin</h3>
                <p className="text-gray-600">{selectedConsultation.doctor}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Spécialité</h3>
                <p className="text-gray-600">{selectedConsultation.specialty}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Date et heure</h3>
                <p className="text-gray-600">
                  {formatDate(selectedConsultation.date)} à {selectedConsultation.time}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Statut</h3>
                {getStatusBadge(selectedConsultation.status)}
              </div>
            </div>
            {selectedConsultation.diagnosis && (
              <div>
                <h3 className="font-medium text-gray-900">Diagnostic</h3>
                <p className="text-gray-600">{selectedConsultation.diagnosis}</p>
              </div>
            )}
            {selectedConsultation.prescription && (
              <div>
                <h3 className="font-medium text-gray-900">Prescription</h3>
                <p className="text-gray-600">{selectedConsultation.prescription}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsultationPage;
