import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Logo from '../../components/Logo';
import DoctorConsultations from './DoctorConsultations';
import DoctorAppointments from './DoctorAppointments';
import DoctorChatIa from './DoctorChatIa';

/**
 * Tableau de bord Médecin - Gestion complète des consultations et patients
 * Affichage des statistiques et suivi de l'activité médicale
 */
const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    consultationsEnCours: 0,
    consultationsAujourdhui: 0,
    patientsTotal: 0,
    rendezVousEnAttente: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // Simulation du chargement des données médicales
  useEffect(() => {
    const loadDoctorData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données factices pour le médecin
        const mockStats = {
          consultationsEnCours: 5,
          consultationsAujourdhui: 8,
          patientsTotal: 156,
          rendezVousEnAttente: 12
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctorData();
  }, [user]);

  const menuItems = [
    { id: 'overview', label: 'Aperçu', icon: NavigationIcons.Dashboard, description: 'Vue générale de votre activité', color: 'text-mediai-primary' },
    { id: 'consultations', label: 'Consultations', icon: MedicalIcons.Stethoscope, description: 'Gestion des consultations médicales', color: 'text-mediai-secondary' },
    { id: 'rendez-vous', label: 'Rendez-vous', icon: MedicalIcons.Appointment, description: 'Planning et rendez-vous', color: 'text-mediai-primary' },
    { id: 'chat-ia', label: 'Chat IA', icon: NavigationIcons.Chat, description: 'Interface ChatGPT médical', color: 'text-mediai-primary' },
    { id: 'patients', label: 'Patients', icon: StatusIcons.Star, description: 'Gestion des dossiers patients', color: 'text-mediai-secondary' }
  ];

  const StatCard = ({ title, value, icon, variant = 'primary' }) => {
    const getVariantStyles = (variant) => {
      switch(variant) {
        case 'primary': return { 
          bg: 'gradient-primary', 
          iconBg: 'bg-mediai-primary', 
          iconColor: 'text-white', 
          valueColor: 'text-white',
          textColor: 'text-white'
        };
        case 'success': return { 
          bg: 'bg-success', 
          iconBg: 'bg-white/20', 
          iconColor: 'text-white', 
          valueColor: 'text-white',
          textColor: 'text-white'
        };
        case 'warning': return { 
          bg: 'bg-warning', 
          iconBg: 'bg-white/20', 
          iconColor: 'text-white', 
          valueColor: 'text-white',
          textColor: 'text-white'
        };
        case 'medical': return { 
          bg: 'bg-mediai-dark', 
          iconBg: 'bg-white/20', 
          iconColor: 'text-white', 
          valueColor: 'text-white',
          textColor: 'text-white'
        };
        default: return { 
          bg: 'bg-light', 
          iconBg: 'bg-medium', 
          iconColor: 'text-white', 
          valueColor: 'text-mediai-dark',
          textColor: 'text-mediai-medium'
        };
      }
    };
    
    const styles = getVariantStyles(variant);
    
    return (
      <div className={`${styles.bg} overflow-hidden shadow-lg rounded-xl border border-border-light hover:shadow-xl transition-all duration-300 hover-lift`}>
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center ${styles.iconBg} shadow-md`}>
                <MedicalIcon icon={icon} size="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" className={styles.iconColor} />
              </div>
            </div>
            <div className="ml-3 sm:ml-4 lg:ml-5 w-0 flex-1 min-w-0">
              <dl>
                <dt className={`text-[10px] sm:text-[11px] lg:text-[10px] xl:text-[11px] font-semibold ${styles.textColor} font-medical tracking-wide uppercase leading-tight`}>
                  <span className="block" title={title}>{title}</span>
                </dt>
                <dd className={`text-xl sm:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-bold ${styles.valueColor} font-mono tracking-tight mt-1`}>
                  {isLoading ? (
                    <div className="animate-pulse h-6 sm:h-8 lg:h-7 xl:h-8 2xl:h-9 bg-white/20 rounded-lg w-12 sm:w-16 lg:w-14 xl:w-16 2xl:w-20"></div>
                  ) : (
                    <span className="tabular-nums">{value}</span>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Activités récentes médicales
  const recentActivities = [
    {
      id: 1,
      type: 'consultation',
      message: 'Consultation avec Jean Kabila terminée',
      time: 'Il y a 1 heure',
      icon: MedicalIcons.Stethoscope,
      variant: 'primary'
    },
    {
      id: 2,
      type: 'chat',
      message: 'Nouvelle analyse IA pour Marie Luamba',
      time: 'Il y a 2 heures',
      icon: NavigationIcons.Chat,
      variant: 'success'
    },
    {
      id: 3,
      type: 'appointment',
      message: 'Nouveau rendez-vous confirmé à 14h30',
      time: 'Il y a 3 heures',
      icon: MedicalIcons.Appointment,
      variant: 'warning'
    }
  ];
  // Données des consultations organisées par statut (simplifiées pour l'overview)
  const consultationsData = useMemo(() => ({
    // Consultations en cours d'analyse IA
    enAnalyse: [
      { 
        id: 'CONS-001', 
        patient: 'Jean Kabila', 
        age: 45,
        dateConsultation: '2025-08-26T10:30:00',
        motif: 'Douleurs thoraciques récurrentes',
        urgence: 'haute',
        statut: 'en_analyse',
        tempsRestant: '2 min',
        chatId: 'chat-001'
      },
      { 
        id: 'CONS-002', 
        patient: 'Marie Luamba', 
        age: 32,
        dateConsultation: '2025-08-26T11:15:00',
        motif: 'Éruption cutanée persistante',
        urgence: 'moyenne',
        statut: 'analyse_terminee',
        chatId: 'chat-002'
      }
    ],

    // Consultations en attente de validation
    enAttente: [
      {
        id: 'CONS-003',
        patient: 'Chantal Bokele',
        age: 28,
        dateConsultation: '2025-08-26T09:45:00',
        motif: 'Toux sèche persistante',
        diagnostic: 'Probable infection respiratoire haute',
        urgence: 'moyenne',
        chatId: 'chat-003'
      }
    ],

    // Consultations terminées
    terminees: [
      {
        id: 'CONS-005',
        patient: 'Sarah Kiala',
        age: 29,
        dateConsultation: '2025-08-25T10:00:00',
        dateTerminee: '2025-08-25T17:30:00',
        motif: 'Suivi post-opératoire',
        diagnostic: 'Cicatrisation normale',
        chatId: 'chat-005'
      }
    ]
  }), []);

  const todayConsultations = [
    { id: 1, patient: 'Jean K.', heure: '09:00', motif: 'Douleurs thoraciques', statut: 'confirmé', chatId: 'chat-001' },
    { id: 2, patient: 'Marie D.', heure: '10:30', motif: 'Éruption cutanée', statut: 'en_cours', chatId: 'chat-002' },
    { id: 3, patient: 'Patrick M.', heure: '14:00', motif: 'Céphalées', statut: 'terminé', chatId: 'chat-004' }
  ];

  const rendezVous = [
    { id: 1, patient: 'David N.', date: '2025-08-27', heure: '09:00', type: 'Consultation', statut: 'confirmé' },
    { id: 2, patient: 'Anne M.', date: '2025-08-27', heure: '10:30', type: 'Suivi', statut: 'confirmé' },
    { id: 3, patient: 'Paul K.', date: 'Tomorrow', heure: '14:00', type: 'Urgence', statut: 'en_attente' },
    { id: 4, patient: 'Julie B.', date: '2025-08-28', heure: '11:00', type: 'Consultation', statut: 'confirmé' }
  ];

  // États du chat IA médical
  const [chatMessages, setChatMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // Simulation messages chat pour demo
  const chatData = {
    'chat-001': [
      { id: 1, sender: 'system', message: 'Consultation de Jean Kabila analysée par IA', timestamp: '10:30' },
      { id: 2, sender: 'ia', message: 'Analyse des symptômes : Douleurs thoraciques récurrentes chez homme 45 ans. Recommandations : ECG, bilan lipidique, consultation cardiologique.', timestamp: '10:31' },
      { id: 3, sender: 'doctor', message: 'Diagnostic confirmé, prescription ajoutée', timestamp: '10:35' }
    ],
    'chat-002': [
      { id: 1, sender: 'system', message: 'Nouvelle consultation de Marie Luamba', timestamp: '11:15' },
      { id: 2, sender: 'ia', message: 'Éruption cutanée persistante : Probable dermatite de contact ou eczéma. Traitement topique recommandé.', timestamp: '11:16' }
    ]
  };

  const openChat = (chatId, consultation) => {
    setCurrentChatId(chatId);
    setChatMessages(chatData[chatId] || []);
    setSelectedConsultation(consultation);
    setShowChat(true);
  };

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: 'doctor',
        message: chatInput,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');
    }
  };

  const getUrgenceColor = (urgence) => {
    switch(urgence) {
      case 'haute': return 'bg-red-100 text-red-800 border-red-200';
      case 'moyenne': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'faible': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'en_analyse': return 'bg-blue-100 text-blue-800';
      case 'analyse_terminee': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderChatModal = () => (
    <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-border-light">
        <div className="gradient-mediai text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center font-medical">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <Icon icon={NavigationIcons.Chat} size="w-5 h-5" />
              </div>
              Chat IA Médical
            </h3>
            {selectedConsultation && (
              <p className="text-white/80 text-sm mt-2 font-body-medium">
                Patient: {selectedConsultation.patient} • {selectedConsultation.motif}
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowChat(false)}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-light">
          {chatMessages.length === 0 ? (
            <div className="text-center text-mediai-medium py-16">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MedicalIcon icon={NavigationIcons.Chat} size="w-8 h-8" className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-mediai-dark mb-2 font-heading">Chat IA Médical</h4>
              <p className="text-medical-body-secondary">Consultation envoyée au système d'intelligence artificielle...</p>
            </div>
          ) : (
            chatMessages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-lg px-6 py-4 rounded-2xl shadow-md transition-all ${
                  message.sender === 'doctor' 
                    ? 'gradient-mediai text-white' 
                    : message.sender === 'ia'
                    ? 'bg-success text-white'
                    : 'bg-light text-mediai-dark border border-border-light'
                }`}>
                  <div className="text-xs opacity-75 mb-2 font-body-medium">
                    {message.sender === 'doctor' ? '👨‍⚕️ Vous' : message.sender === 'ia' ? '🤖 IA Médicale' : '🏥 Système'}
                  </div>
                  <p className="text-sm leading-relaxed font-body">{message.message}</p>
                  <div className="text-xs opacity-75 mt-2 font-medium">{message.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="border-t border-border-light p-6 bg-white rounded-b-2xl">
          <div className="flex space-x-4">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder="Tapez votre message..."
              className="flex-1 px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body"
            />
            <button
              onClick={sendChatMessage}
              disabled={!chatInput.trim()}
              className="px-6 py-3 gradient-mediai text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold">
              <Icon icon={ActionIcons.Send} size="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConsultations = () => (
    <DoctorConsultations />
  );

  const renderRendezVous = () => (
    <DoctorAppointments />
  );

  const renderChatIA = () => (
    <DoctorChatIa />
  );

  const renderPatients = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-border-light">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 gradient-mediai rounded-xl flex items-center justify-center">
            <MedicalIcon icon={StatusIcons.Star} size="w-6 h-6" className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-mediai-dark font-heading">Gestion des patients</h2>
            <p className="text-sm text-mediai-medium font-body">Suivez et gérez vos patients</p>
          </div>
        </div>

        {/* Statistiques des patients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-light p-4 rounded-xl border border-border-light">
            <div className="flex items-center">
              <MedicalIcon icon={StatusIcons.Success} size="w-8 h-8" className="text-success mr-3" />
              <div>
                <p className="text-2xl font-bold text-mediai-dark">{stats.patientsTotal}</p>
                <p className="text-sm text-mediai-medium">Patients total</p>
              </div>
            </div>
          </div>
          <div className="bg-light p-4 rounded-xl border border-border-light">
            <div className="flex items-center">
              <MedicalIcon icon={MedicalIcons.Appointment} size="w-8 h-8" className="text-warning mr-3" />
              <div>
                <p className="text-2xl font-bold text-mediai-dark">12</p>
                <p className="text-sm text-mediai-medium">Nouveaux cette semaine</p>
              </div>
            </div>
          </div>
          <div className="bg-light p-4 rounded-xl border border-border-light">
            <div className="flex items-center">
              <MedicalIcon icon={StatusIcons.Warning} size="w-8 h-8" className="text-mediai-primary mr-3" />
              <div>
                <p className="text-2xl font-bold text-mediai-dark">3</p>
                <p className="text-sm text-mediai-medium">Suivi prioritaire</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des patients récents */}
      <div className="bg-white rounded-2xl shadow-lg border border-border-light overflow-hidden">
        <div className="bg-light px-6 py-4 border-b border-border-light">
          <h3 className="text-lg font-bold text-mediai-dark font-heading">Patients récents</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { id: 1, nom: "Marie Dupont", age: 34, derniere: "2025-08-28", statut: "Suivi", motif: "Hypertension" },
              { id: 2, nom: "Jean Martin", age: 45, derniere: "2025-08-27", statut: "Traitement", motif: "Diabète type 2" },
              { id: 3, nom: "Sarah Johnson", age: 28, derniere: "2025-08-26", statut: "Guéri", motif: "Infection respiratoire" }
            ].map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 border border-border-light rounded-xl hover:bg-light transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-mediai-primary rounded-xl flex items-center justify-center">
                    <MedicalIcon icon={MedicalIcons.User} size="w-6 h-6" className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-mediai-dark">{patient.nom}</p>
                    <p className="text-sm text-mediai-medium">{patient.age} ans • {patient.motif}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-mediai-dark">Dernière consultation</p>
                    <p className="text-xs text-mediai-medium">{patient.derniere}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    patient.statut === 'Suivi' ? 'bg-warning/10 text-warning' :
                    patient.statut === 'Traitement' ? 'bg-mediai-primary/10 text-mediai-primary' :
                    'bg-success/10 text-success'
                  }`}>
                    {patient.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="bg-mediai-primary hover:bg-mediai-secondary text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300">
              Voir tous les patients
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Header professionnel responsive */}
      <div className="bg-mediai-dark shadow-2xl rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-mediai-primary rounded-xl flex items-center justify-center shadow-lg">
                  <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-heading">
                    Espace Médecin
                  </h1>
                  <p className="text-white/70 text-sm sm:text-base lg:text-lg font-body-medium">
                    Dr. {user?.name || 'Médecin'} • Plateforme Mediai
                  </p>
                </div>
              </div>
              <p className="text-white/60 max-w-2xl leading-relaxed font-body text-sm sm:text-base">
                Gérez vos consultations, rendez-vous et interactions avec l'IA médicale en toute simplicité. 
                Votre hub professionnel pour une médecine moderne et efficace.
              </p>
            </div>
            <div className="flex sm:hidden lg:flex items-center justify-center sm:justify-end space-x-4">
              <div className="text-center sm:text-right">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-mediai-primary">{new Date().toLocaleDateString('fr-FR')}</p>
                <p className="text-white/70 font-body text-sm">Aujourd'hui</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques avec design moderne responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Consultations en cours"
          value={stats.consultationsEnCours}
          icon={MedicalIcons.Stethoscope}
          variant="primary"
        />
        <StatCard
          title="Consultations aujourd'hui"
          value={stats.consultationsAujourdhui}
          icon={MedicalIcons.Appointment}
          variant="success"
        />
        <StatCard
          title="Patients total"
          value={stats.patientsTotal}
          icon={StatusIcons.Star}
          variant="warning"
        />
        <StatCard
          title="Rendez-vous en attente"
          value={stats.rendezVousEnAttente}
          icon={NavigationIcons.Calendar}
          variant="medical"
        />
      </div>

      {/* Contenu principal avec design amélioré et responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Activités récentes */}
        <div className="bg-white shadow-xl rounded-2xl border border-border-light overflow-hidden">
          <div className="bg-light px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border-light">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-mediai-primary rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <Icon icon={MedicalIcons.Activity} size="w-4 h-4 sm:w-5 sm:h-5" className="text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-mediai-dark font-heading">Activités récentes</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="rounded-xl bg-medium h-12 w-12"></div>
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-medium rounded w-3/4"></div>
                      <div className="h-3 bg-medium rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-4 sm:space-y-6">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="flex space-x-3 sm:space-x-4 items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md ${
                        activity.variant === 'primary' ? 'bg-mediai-primary' :
                        activity.variant === 'success' ? 'bg-success' :
                        activity.variant === 'warning' ? 'bg-warning' : 'bg-mediai-secondary'
                      }`}>
                        <MedicalIcon icon={activity.icon} size="w-5 h-5 sm:w-6 sm:h-6" className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-mediai-dark leading-relaxed font-body">
                        {activity.message}
                      </p>
                      <p className="text-xs text-mediai-medium font-medium mt-1 font-body">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Actions rapides médicales avec design moderne */}
        <div className="bg-white shadow-xl rounded-2xl border border-border-light overflow-hidden">
          <div className="bg-light px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border-light">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-mediai-secondary rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <Icon icon={ActionIcons.Settings} size="w-4 h-4 sm:w-5 sm:h-5" className="text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-mediai-dark font-heading">Actions rapides</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button 
                onClick={() => setActiveView('consultations')}
                className="group flex flex-col items-center p-4 sm:p-6 text-center border-2 border-dashed border-border-light rounded-xl hover:border-mediai-primary hover:bg-light transition-all duration-300 hover-lift">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-mediai-primary rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-5 h-5 sm:w-6 sm:h-6" className="text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-mediai-dark group-hover:text-mediai-primary font-body">Consultations</span>
              </button>
              <button 
                onClick={() => setActiveView('rendez-vous')}
                className="group flex flex-col items-center p-4 sm:p-6 text-center border-2 border-dashed border-border-light rounded-xl hover:border-mediai-secondary hover:bg-light transition-all duration-300 hover-lift">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-mediai-secondary rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MedicalIcon icon={MedicalIcons.Appointment} size="w-5 h-5 sm:w-6 sm:h-6" className="text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-mediai-dark group-hover:text-mediai-secondary font-body">Rendez-vous</span>
              </button>
              <button 
                onClick={() => setActiveView('chat-ia')}
                className="group flex flex-col items-center p-4 sm:p-6 text-center border-2 border-dashed border-border-light rounded-xl hover:border-mediai-primary hover:bg-light transition-all duration-300 hover-lift">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-mediai-primary rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MedicalIcon icon={NavigationIcons.Chat} size="w-5 h-5 sm:w-6 sm:h-6" className="text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-mediai-dark group-hover:text-mediai-primary font-body">Chat IA</span>
              </button>
              <button 
                onClick={() => setActiveView('patients')}
                className="group flex flex-col items-center p-4 sm:p-6 text-center border-2 border-dashed border-border-light rounded-xl hover:border-mediai-secondary hover:bg-light transition-all duration-300 hover-lift">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-mediai-secondary rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MedicalIcon icon={StatusIcons.Star} size="w-5 h-5 sm:w-6 sm:h-6" className="text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-mediai-dark group-hover:text-mediai-secondary font-body">Patients</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consultations du jour avec design amélioré */}
      <div className="bg-white shadow-xl rounded-2xl border border-border-light overflow-hidden">
        <div className="bg-light px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-mediai-dark rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <Icon icon={MedicalIcons.Appointment} size="w-4 h-4 sm:w-5 sm:h-5" className="text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-mediai-dark font-heading">Consultations du jour</h2>
            </div>
            <button className="text-xs sm:text-sm font-semibold text-mediai-primary hover:text-mediai-secondary transition-colors font-body">
              Voir toutes →
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-medium rounded-xl w-full"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {todayConsultations.map((consultation) => (
                <div key={consultation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border border-border-light rounded-xl hover:bg-light transition-all duration-300 hover-lift space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-mediai-primary rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                      <MedicalIcon icon={StatusIcons.Star} size="w-5 h-5 sm:w-6 sm:h-6" className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-mediai-dark text-base sm:text-lg font-heading truncate">{consultation.patient}</p>
                      <p className="text-xs sm:text-sm text-mediai-medium font-body line-clamp-2 sm:line-clamp-1">{consultation.motif}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                    <span className="text-base sm:text-lg font-bold text-mediai-primary font-mono">{consultation.heure}</span>
                    <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                      consultation.statut === 'confirmé' ? 'bg-success text-white' :
                      consultation.statut === 'en_cours' ? 'bg-mediai-primary text-white' :
                      consultation.statut === 'terminé' ? 'bg-medium text-white' :
                      'bg-warning text-white'
                    }`}>
                      {consultation.statut}
                    </span>
                    <button 
                      onClick={() => openChat(consultation.chatId, consultation)}
                      className="px-3 py-1 sm:px-4 sm:py-2 gradient-mediai text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
                      Chat IA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light">
      {/* Navbar professionnelle */}
      <nav className="bg-white shadow-lg border-b border-border-light sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Logo size="sm" className="h-8 sm:h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-mediai-dark font-heading">Mediai</h1>
                <p className="text-xs text-mediai-medium font-body">Espace Médecin</p>
              </div>
            </div>

            {/* Navigation principale - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 font-body ${
                      isActive
                        ? 'gradient-mediai text-white shadow-lg transform scale-105'
                        : `text-mediai-medium hover:text-mediai-dark hover:bg-light ${item.color}`
                    }`}
                  >
                    <MedicalIcon 
                      icon={IconComponent} 
                      size="w-4 h-4" 
                      className={isActive ? 'text-white' : item.color}
                    />
                    <span className="hidden xl:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-mediai-dark font-heading">Dr. {user?.name || 'Médecin'}</p>
                  <p className="text-xs text-mediai-medium font-body">Médecin</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-mediai rounded-xl flex items-center justify-center shadow-lg">
                  <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-4 h-4 sm:w-5 sm:h-5" className="text-white" />
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={() => navigate('/settings')}
                  className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors">
                  <Icon icon={ActionIcons.Settings} size="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={logout}
                  className="px-4 py-2 bg-danger text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-300 font-body">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 lg:pb-8">
        {activeView === 'overview' ? (
          renderOverview()
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Header de section */}
            <div className="bg-white shadow-xl rounded-2xl border border-border-light overflow-hidden">
              <div className="bg-mediai-dark px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {(() => {
                    const activeItem = menuItems.find(item => item.id === activeView);
                    return (
                      <>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <MedicalIcon icon={activeItem?.icon} size="w-5 h-5 sm:w-6 sm:h-6" className="text-white" />
                        </div>
                        <div>
                          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold font-heading">{activeItem?.label}</h1>
                          <p className="text-white/70 font-body text-sm sm:text-base">{activeItem?.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Contenu de la section */}
            <div className="bg-white shadow-xl rounded-2xl border border-border-light overflow-hidden">
              <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {activeView === 'consultations' && renderConsultations()}
                {activeView === 'rendez-vous' && renderRendezVous()}
                {activeView === 'chat-ia' && renderChatIA()}
                {activeView === 'patients' && renderPatients()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation mobile en bas */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-light shadow-2xl z-50">
        <div className="grid grid-cols-5 gap-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 transition-all duration-300 ${
                  isActive
                    ? 'bg-mediai-primary text-white'
                    : 'text-mediai-medium hover:text-mediai-dark hover:bg-light'
                }`}
              >
                <MedicalIcon 
                  icon={IconComponent} 
                  size="w-4 h-4 sm:w-5 sm:h-5" 
                  className={isActive ? 'text-white' : item.color}
                />
                <span className="text-[9px] sm:text-xs font-medium mt-0.5 truncate leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Modal avec design amélioré */}
      {showChat && renderChatModal()}
    </div>
  );
};

export default DoctorDashboard;