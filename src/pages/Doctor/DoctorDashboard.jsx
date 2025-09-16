import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useLogout } from '../../hooks/useLogout';
import { useNavigate } from 'react-router-dom';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Logo from '../../components/Logo';
import DoctorConsultations from './DoctorConsultations';
import DoctorAppointments from './DoctorAppointments';
import DoctorChatIa from './DoctorChatIa';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import api, { dashboardService, consultationService } from '../../services/api';

/**
 * Tableau de bord Médecin - Gestion complète des consultations et patients
 * Affichage des statistiques et suivi de l'activité médicale
 */
const DoctorDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { handleLogout } = useLogout();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    consultationsEnCours: 0,
    consultationsAujourdhui: 0,
    consultationsValidees: 0,
    consultationsEnAttente: 0,
    totalConsultations: 0,
    patientsUniques: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [recentConsultations, setRecentConsultations] = useState([]);
  
  // États pour la gestion des patients
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);

  // Chargement des données médicales réelles
  useEffect(() => {
    const loadDoctorData = async () => {
      setIsLoading(true);
      try {
        console.log('Chargement des statistiques du médecin...');
        
        // Charger les statistiques
        const statsResponse = await dashboardService.getDoctorStats();
        if (statsResponse.success) {
          console.log('Statistiques reçues:', statsResponse.data);
          setStats(statsResponse.data);
        }
        
        // Charger les consultations récentes
        const consultationsResponse = await consultationService.getConsultations();
        if (consultationsResponse && consultationsResponse.results && Array.isArray(consultationsResponse.results)) {
          // Trier par date de création décroissante et prendre les 5 dernières
          const sorted = consultationsResponse.results
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          setRecentConsultations(sorted);
          console.log('Consultations récentes:', sorted);
        }
        
        // Notification de succès uniquement en cas de premier chargement ou refresh
        // showSuccess('Données chargées', 'Tableau de bord mis à jour avec succès');
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showError('Erreur', 'Erreur lors du chargement des données');
        
        // Fallback vers des données par défaut
        setStats({
          consultationsEnCours: 0,
          consultationsAujourdhui: 0,
          consultationsValidees: 0,
          consultationsEnAttente: 0,
          totalConsultations: 0,
          patientsUniques: 0
        });
        setRecentConsultations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'medecin') {
      loadDoctorData();
    }
  }, [user, showSuccess, showError]);

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

  // Helper pour formater les activités récentes à partir des consultations
  const getRecentActivities = () => {
    return recentConsultations.map((consultation, index) => {
      const getStatusInfo = (status) => {
        switch(status) {
          case 'en_analyse':
            return {
              message: `Consultation de ${consultation.nom || 'Patient'} ${consultation.prenom || ''} en analyse IA`,
              icon: MedicalIcons.AI,
              variant: 'primary'
            };
          case 'analyse_terminee':
            return {
              message: `Analyse IA terminée pour ${consultation.nom || 'Patient'} ${consultation.prenom || ''}`,
              icon: MedicalIcons.Check,
              variant: 'success'
            };
          case 'valide_medecin':
            return {
              message: `Consultation de ${consultation.nom || 'Patient'} ${consultation.prenom || ''} validée`,
              icon: MedicalIcons.Doctor,
              variant: 'success'
            };
          case 'rejete_medecin':
            return {
              message: `Consultation de ${consultation.nom || 'Patient'} ${consultation.prenom || ''} rejetée`,
              icon: StatusIcons.Error,
              variant: 'warning'
            };
          default:
            return {
              message: `Nouvelle consultation de ${consultation.nom || 'Patient'} ${consultation.prenom || ''}`,
              icon: MedicalIcons.Stethoscope,
              variant: 'primary'
            };
        }
      };

      const statusInfo = getStatusInfo(consultation.status);
      const timeAgo = getTimeAgo(consultation.created_at);

      return {
        id: consultation.id,
        type: 'consultation',
        message: statusInfo.message,
        time: timeAgo,
        icon: statusInfo.icon,
        variant: statusInfo.variant,
        consultation: consultation
      };
    });
  };

  // Helper pour calculer le temps écoulé
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  // Helper pour obtenir les consultations du jour réelles
  const getTodayConsultations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return recentConsultations.filter(consultation => {
      const consultationDate = new Date(consultation.created_at);
      return consultationDate >= today && consultationDate < tomorrow;
    }).map(consultation => {
      const date = new Date(consultation.created_at);
      const heure = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      const getStatutFromStatus = (status) => {
        switch(status) {
          case 'en_analyse': return 'en_cours';
          case 'analyse_terminee': return 'confirmé';
          case 'valide_medecin': return 'terminé';
          case 'rejete_medecin': return 'annulé';
          default: return 'confirmé';
        }
      };

      return {
        id: consultation.id,
        patient: `${consultation.nom || 'Patient'} ${consultation.prenom || ''}`.trim() || 'Patient',
        heure: heure,
        motif: consultation.symptomes || consultation.description || 'Consultation générale',
        statut: getStatutFromStatus(consultation.status),
        chatId: `chat-${consultation.id}`,
        consultation: consultation
      };
    }).slice(0, 5); // Limiter à 5 consultations max
  };

  // États du chat IA médical
  const [chatMessages, setChatMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // Fonction pour charger les messages du chat depuis l'API
  const loadChatMessages = async (consultationId) => {
    try {
      console.log('Chargement des messages pour la consultation:', consultationId);
      
      // D'abord chercher la conversation liée à cette consultation
      const conversationsResponse = await api.get('/conversations/');
      const conversationsData = conversationsResponse.data.results || conversationsResponse.data;
      
      if (Array.isArray(conversationsData)) {
        // Trouver la conversation liée à cette consultation
        const linkedConversation = conversationsData.find(conv => 
          conv.fiche && conv.fiche.toString() === consultationId.toString()
        );
        
        if (linkedConversation) {
          // Charger les messages de la conversation trouvée
          const response = await api.get(`/conversations/${linkedConversation.id}/messages/`);
          
          // Gérer les réponses paginées et directes
          const messagesData = response.data.results || response.data;
          
          if (Array.isArray(messagesData) && messagesData.length > 0) {
            // Transformer les messages pour correspondre au format UI
            const formattedMessages = messagesData.map(message => ({
              id: message.id,
              sender: message.role === 'user' ? 'patient' : message.role === 'synthese' ? 'ia' : 'system',
              message: message.content || '',
              timestamp: new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              role: message.role
            }));
            
            // Filtrer pour ne garder que les messages patient et les messages de synthèse IA
            const filteredMessages = formattedMessages.filter(message => 
              message.role === 'user' || message.role === 'synthese'
            );
            
            // Supprimer les doublons
            const uniqueMessages = filteredMessages.filter((message, index, self) =>
              index === self.findIndex(m => m.id === message.id || 
                (m.message === message.message && m.sender === message.sender))
            );
            
            // Trier par timestamp
            uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            setChatMessages(uniqueMessages);
            console.log('Messages chargés:', uniqueMessages);
          } else {
            // Aucun message trouvé dans la conversation
            const infoMessage = {
              id: Date.now(),
              sender: 'system',
              message: `Aucun message trouvé dans la conversation liée à cette consultation`,
              timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages([infoMessage]);
          }
        } else {
          // Pas de conversation trouvée pour cette consultation
          const infoMessage = {
            id: Date.now(),
            sender: 'system',
            message: `Aucune conversation liée à cette consultation. La conversation pourrait être en cours de création.`,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages([infoMessage]);
        }
      } else {
        // Erreur lors de la récupération des conversations
        const errorMessage = {
          id: Date.now(),
          sender: 'system',
          message: `Impossible de récupérer les conversations`,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([errorMessage]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      
      // En cas d'erreur, afficher un message d'erreur informatif
      const errorMessage = {
        id: Date.now(),
        sender: 'system',
        message: error.response?.status === 404 
          ? `Conversations non trouvées`
          : `Erreur lors du chargement: ${error.message || 'Erreur inconnue'}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([errorMessage]);
    }
  };

  const openChat = (chatId, consultation) => {
    setCurrentChatId(chatId);
    setSelectedConsultation(consultation);
    setShowChat(true);
    
    // Charger les messages du chat
    if (consultation && consultation.id) {
      loadChatMessages(consultation.id);
    } else {
      setChatMessages([]);
    }
  };

  const sendChatMessage = async () => {
    if (chatInput.trim() && selectedConsultation) {
      const newMessage = {
        id: Date.now(),
        sender: 'doctor',
        message: chatInput,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      // Ajouter le message localement immédiatement
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');

      try {
        // TODO: Envoyer le message à l'API
        // await chatService.sendMessage(selectedConsultation.id, chatInput);
        
        console.log('Message envoyé pour consultation:', selectedConsultation.id, chatInput);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        showError('Erreur', 'Impossible d\'envoyer le message');
      }
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
            <h3 className="text-xl font-bold flex items-center font-heading">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <MedicalIcon icon={NavigationIcons.Chat} size="w-5 h-5" />
              </div>
              Chat IA Médical
            </h3>
            {selectedConsultation && (
              <p className="text-white/80 text-sm mt-2 font-body-medium">
                Patient: {selectedConsultation.nom && selectedConsultation.prenom 
                  ? `${selectedConsultation.nom} ${selectedConsultation.prenom}` 
                  : selectedConsultation.patient || 'Patient'} • {selectedConsultation.symptomes || selectedConsultation.motif || 'Consultation'}
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
              <p className="text-mediai-medium font-body">Chargement des messages de la consultation...</p>
            </div>
          ) : (
            chatMessages.map((message) => (
              <div key={message.id} className={`flex mb-4 ${
                message.sender === 'ia' ? 'justify-end' : 
                message.sender === 'patient' ? 'justify-start' : 
                message.sender === 'doctor' ? 'justify-end' : 
                'justify-center'
              }`}>
                <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-md transition-all ${
                  message.sender === 'doctor' 
                    ? 'gradient-mediai text-white' 
                    : message.sender === 'ia'
                    ? 'bg-blue-50 text-blue-900 border border-blue-200'
                    : message.sender === 'patient'
                    ? 'bg-blue-50 text-blue-900 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  <div className="text-xs opacity-75 mb-2 font-body-medium">
                    {message.sender === 'doctor' ? '👨‍⚕️ Vous' : 
                     message.sender === 'ia' ? '🤖 IA Médicale' : 
                     message.sender === 'patient' ? '👤 Patient' : 
                     '🏥 Système'}
                  </div>
                  <div className="text-sm leading-relaxed font-body">
                    {message.sender === 'ia' ? (
                      <MarkdownRenderer content={message.message} />
                    ) : (
                      <p>{message.message}</p>
                    )}
                  </div>
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
              className="px-6 py-3 gradient-mediai text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-body-medium">
              <MedicalIcon icon={ActionIcons.Send} size="w-5 h-5" />
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

  const renderPatients = () => {
    // Données complètes des patients (maintenant sans hooks)
    const allPatients = [
      { 
        id: 1, 
        nom: "Marie Dupont", 
        prenom: "Marie",
        age: 34, 
        dateNaissance: "1991-03-15",
        telephone: "+243 85 123 4567",
        email: "marie.dupont@email.com",
        adresse: "123 Avenue Lumumba, Kinshasa",
        derniere: "2025-08-28", 
        statut: "Suivi", 
        motif: "Hypertension",
        medicaments: ["Lisinopril 10mg", "Hydrochlorothiazide 25mg"],
        allergies: ["Pénicilline"],
        antecedents: ["Diabète familial"],
        assurance: "SONAS",
        consultations: 8
      },
      { 
        id: 2, 
        nom: "Jean Martin", 
        prenom: "Jean",
        age: 45, 
        dateNaissance: "1980-07-22",
        telephone: "+243 81 987 6543",
        email: "jean.martin@email.com",
        adresse: "456 Boulevard du 30 Juin, Kinshasa",
        derniere: "2025-08-27", 
        statut: "Traitement", 
        motif: "Diabète type 2",
        medicaments: ["Metformine 500mg", "Insuline"],
        allergies: ["Aucune connue"],
        antecedents: ["Hypertension", "Obésité"],
        assurance: "CNSS",
        consultations: 15
      },
      { 
        id: 3, 
        nom: "Sarah Johnson", 
        prenom: "Sarah",
        age: 28, 
        dateNaissance: "1997-11-08",
        telephone: "+243 99 456 7890",
        email: "sarah.johnson@email.com",
        adresse: "789 Rue de la Paix, Kinshasa",
        derniere: "2025-08-26", 
        statut: "Guéri", 
        motif: "Infection respiratoire",
        medicaments: ["Amoxicilline"],
        allergies: ["Aspirine"],
        antecedents: ["Asthme léger"],
        assurance: "Privée",
        consultations: 3
      },
      { 
        id: 4, 
        nom: "Paul Mukendi", 
        prenom: "Paul",
        age: 52, 
        dateNaissance: "1973-01-30",
        telephone: "+243 82 321 6547",
        email: "paul.mukendi@email.com",
        adresse: "321 Avenue Kasavubu, Kinshasa",
        derniere: "2025-08-25", 
        statut: "Urgence", 
        motif: "Douleurs cardiaques",
        medicaments: ["Aspirine", "Atorvastatine"],
        allergies: ["Iode"],
        antecedents: ["Infarctus 2020", "Cholestérol"],
        assurance: "SONAS",
        consultations: 12
      },
      { 
        id: 5, 
        nom: "Anne Kabongo", 
        prenom: "Anne",
        age: 39, 
        dateNaissance: "1986-05-14",
        telephone: "+243 84 654 3210",
        email: "anne.kabongo@email.com",
        adresse: "654 Rue Lumière, Kinshasa",
        derniere: "2025-08-24", 
        statut: "Suivi", 
        motif: "Grossesse - 3e trimestre",
        medicaments: ["Vitamines prénatales", "Fer"],
        allergies: ["Latex"],
        antecedents: ["2 grossesses normales"],
        assurance: "CNSS",
        consultations: 6
      }
    ];

    // Filtrage des patients
    const filteredPatients = allPatients.filter(patient => {
      const matchesSearch = patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.motif.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'tous' || patient.statut.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });

  const getStatutBadge = (statut) => {
    switch(statut) {
      case 'Suivi': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Traitement': return 'bg-warning/10 text-warning border-warning/20';
      case 'Guéri': return 'bg-success/10 text-success border-success/20';
      case 'Urgence': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-mediai-light text-mediai-medium border-border-light';
    }
  };

    const openPatientDetail = (patient) => {
      setSelectedPatient(patient);
      setShowPatientDetail(true);
    };

    const renderPatientDetailModal = () => (
      <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border-light">
          <div className="gradient-mediai text-white p-6 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MedicalIcon icon={StatusIcons.Star} size="w-6 h-6" className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading">
                  {selectedPatient?.prenom} {selectedPatient?.nom}
                </h3>
                <p className="text-white/80 text-sm">Dossier médical - {selectedPatient?.age} ans</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPatientDetail(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Informations personnelles */}
            <div className="bg-light rounded-xl p-6 border border-border-light">
              <h4 className="text-lg font-bold text-mediai-dark mb-4 font-heading flex items-center">
                <MedicalIcon icon={MedicalIcons.User} size="w-5 h-5" className="text-mediai-primary mr-2" />
                Informations personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-mediai-medium font-subheading">Date de naissance</p>
                  <p className="text-mediai-dark">{selectedPatient?.dateNaissance}</p>
                </div>
                <div>
                  <p className="text-sm text-mediai-medium font-subheading">Téléphone</p>
                  <p className="text-mediai-dark">{selectedPatient?.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-mediai-medium font-subheading">Email</p>
                  <p className="text-mediai-dark">{selectedPatient?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-mediai-medium font-subheading">Assurance</p>
                  <p className="text-mediai-dark">{selectedPatient?.assurance}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-mediai-medium font-subheading">Adresse</p>
                  <p className="text-mediai-dark">{selectedPatient?.adresse}</p>
                </div>
              </div>
            </div>

            {/* Statut médical actuel */}
            <div className="bg-light rounded-xl p-6 border border-border-light">
              <h4 className="text-lg font-bold text-mediai-dark mb-4 font-heading flex items-center">
                <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-5 h-5" className="text-mediai-primary mr-2" />
                Statut médical actuel
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-mediai-medium font-subheading">Motif de suivi</p>
                  <p className="text-mediai-dark">{selectedPatient?.motif}</p>
                </div>
                <div>
                  <p className="text-sm text-mediai-medium font-subheading">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatutBadge(selectedPatient?.statut)}`}>
                    {selectedPatient?.statut}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-mediai-medium font-subheading">Dernière consultation</p>
                  <p className="text-mediai-dark">{selectedPatient?.derniere}</p>
                </div>
                <div>
                  <p className="text-sm text-mediai-medium font-subheading">Nombre de consultations</p>
                  <p className="text-mediai-dark">{selectedPatient?.consultations}</p>
                </div>
              </div>
            </div>

            {/* Médicaments actuels */}
            <div className="bg-light rounded-xl p-6 border border-border-light">
              <h4 className="text-lg font-bold text-mediai-dark mb-4 font-heading flex items-center">
                <MedicalIcon icon={MedicalIcons.Prescription} size="w-5 h-5" className="text-mediai-primary mr-2" />
                Médicaments actuels
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedPatient?.medicaments.map((med, index) => (
                  <span key={index} className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                    {med}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergies et antécédents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-light rounded-xl p-6 border border-border-light">
                <h4 className="text-lg font-bold text-mediai-dark mb-4 font-heading flex items-center">
                  <MedicalIcon icon={StatusIcons.Warning} size="w-5 h-5" className="text-warning mr-2" />
                  Allergies
                </h4>
                <div className="space-y-2">
                  {selectedPatient?.allergies.map((allergie, index) => (
                    <span key={index} className="block bg-warning/10 text-warning px-3 py-2 rounded-lg text-sm font-medium">
                      ⚠️ {allergie}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-light rounded-xl p-6 border border-border-light">
                <h4 className="text-lg font-bold text-mediai-dark mb-4 font-heading flex items-center">
                  <MedicalIcon icon={MedicalIcons.History} size="w-5 h-5" className="text-mediai-secondary mr-2" />
                  Antécédents
                </h4>
                <div className="space-y-2">
                  {selectedPatient?.antecedents.map((antecedent, index) => (
                    <span key={index} className="block bg-mediai-secondary/10 text-mediai-secondary px-3 py-2 rounded-lg text-sm font-medium">
                      📋 {antecedent}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border-light">
              <button className="flex items-center space-x-2 bg-mediai-primary text-white px-4 py-2 rounded-lg hover:bg-mediai-secondary transition-colors">
                <MedicalIcon icon={MedicalIcons.Appointment} size="w-4 h-4" />
                <span>Nouvelle consultation</span>
              </button>
              <button className="flex items-center space-x-2 bg-success text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                <MedicalIcon icon={MedicalIcons.Prescription} size="w-4 h-4" />
                <span>Prescrire</span>
              </button>
              <button className="flex items-center space-x-2 bg-mediai-secondary text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                <MedicalIcon icon={MedicalIcons.History} size="w-4 h-4" />
                <span>Historique</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                <MedicalIcon icon={ActionIcons.Edit} size="w-4 h-4" />
                <span>Modifier</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    const renderAddPatientModal = () => (
      <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border-light">
          <div className="gradient-mediai text-white p-6 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MedicalIcon icon={ActionIcons.Add} size="w-5 h-5" className="text-white" />
              </div>
              <h3 className="text-xl font-bold font-heading">Nouveau patient</h3>
            </div>
            <button 
              onClick={() => setShowAddModal(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-subheading text-mediai-dark mb-2">Prénom *</label>
                  <input type="text" className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-mediai-primary" />
                </div>
                <div>
                  <label className="block text-sm font-subheading text-mediai-dark mb-2">Nom *</label>
                  <input type="text" className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-mediai-primary" />
                </div>
                <div>
                  <label className="block text-sm font-subheading text-mediai-dark mb-2">Date de naissance *</label>
                  <input type="date" className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-mediai-primary" />
                </div>
                <div>
                  <label className="block text-sm font-subheading text-mediai-dark mb-2">Téléphone *</label>
                  <input type="tel" className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-mediai-primary" />
                </div>
                <div>
                  <label className="block text-sm font-subheading text-mediai-dark mb-2">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-mediai-primary" />
                </div>
                <div>
                  <label className="block text-sm font-subheading text-mediai-dark mb-2">Assurance</label>
                  <select className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-mediai-primary">
                    <option value="">Sélectionner...</option>
                    <option value="SONAS">SONAS</option>
                    <option value="CNSS">CNSS</option>
                    <option value="Privée">Assurance privée</option>
                    <option value="Aucune">Aucune</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-subheading text-mediai-dark mb-2">Adresse</label>
                <textarea rows="2" className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-mediai-primary"></textarea>
              </div>

              <div>
                <label className="block text-sm font-subheading text-mediai-dark mb-2">Motif de consultation</label>
                <textarea rows="3" className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-mediai-primary" placeholder="Décrivez le motif de la première consultation..."></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border-light">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-border-light text-mediai-medium rounded-lg hover:bg-light transition-colors">
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 gradient-mediai text-white rounded-lg hover:shadow-lg transition-all">
                  Ajouter le patient
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header avec actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-border-light">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 gradient-mediai rounded-xl flex items-center justify-center">
                <MedicalIcon icon={StatusIcons.Star} size="w-6 h-6" className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-mediai-dark font-heading">Gestion des patients</h2>
                <p className="text-sm text-mediai-medium font-body">
                  {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} • Total: {allPatients.length}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center space-x-2 bg-mediai-primary text-white px-4 py-2 rounded-lg hover:bg-mediai-secondary transition-colors font-body-medium">
                <MedicalIcon icon={ActionIcons.Add} size="w-4 h-4" />
                <span>Nouveau patient</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-success text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-body-medium">
                <MedicalIcon icon={ActionIcons.Export} size="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="mt-6 flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un patient (nom, prénom, motif)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary bg-light"
                />
                <MedicalIcon icon={ActionIcons.Search} size="w-5 h-5" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mediai-medium" />
              </div>
            </div>
            <div className="lg:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary bg-light">
                <option value="tous">Tous les statuts</option>
                <option value="suivi">En suivi</option>
                <option value="traitement">En traitement</option>
                <option value="guéri">Guéri</option>
                <option value="urgence">Urgence</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques des patients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
            <div className="flex items-center">
              <MedicalIcon icon={StatusIcons.Success} size="w-8 h-8" className="text-success mr-3" />
              <div>
                <p className="text-2xl font-bold text-mediai-dark">{allPatients.length}</p>
                <p className="text-sm text-mediai-medium">Patients total</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
            <div className="flex items-center">
              <MedicalIcon icon={MedicalIcons.Appointment} size="w-8 h-8" className="text-warning mr-3" />
              <div>
                <p className="text-2xl font-bold text-mediai-dark">{allPatients.filter(p => p.statut === 'Suivi').length}</p>
                <p className="text-sm text-mediai-medium">En suivi</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
            <div className="flex items-center">
              <MedicalIcon icon={StatusIcons.Warning} size="w-8 h-8" className="text-mediai-primary mr-3" />
              <div>
                <p className="text-2xl font-bold text-mediai-dark">{allPatients.filter(p => p.statut === 'Traitement').length}</p>
                <p className="text-sm text-mediai-medium">En traitement</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm">
            <div className="flex items-center">
              <MedicalIcon icon={StatusIcons.Error} size="w-8 h-8" className="text-danger mr-3" />
              <div>
                <p className="text-2xl font-bold text-mediai-dark">{allPatients.filter(p => p.statut === 'Urgence').length}</p>
                <p className="text-sm text-mediai-medium">Urgences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des patients */}
        <div className="bg-white rounded-2xl shadow-lg border border-border-light overflow-hidden">
          <div className="bg-light px-6 py-4 border-b border-border-light">
            <h3 className="text-lg font-bold text-mediai-dark font-heading">
              Liste des patients ({filteredPatients.length})
            </h3>
          </div>
          <div className="p-6">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <MedicalIcon icon={StatusIcons.Info} size="w-12 h-12" className="text-mediai-medium mx-auto mb-4" />
                <p className="text-mediai-medium">Aucun patient trouvé</p>
                <p className="text-sm text-mediai-medium mt-2">Modifiez vos critères de recherche ou ajoutez un nouveau patient</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-border-light rounded-xl hover:bg-light transition-all duration-300 hover-lift space-y-3 lg:space-y-0">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-mediai-primary rounded-xl flex items-center justify-center flex-shrink-0">
                        <MedicalIcon icon={StatusIcons.Star} size="w-6 h-6" className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-bold text-mediai-dark text-lg font-heading truncate">
                            {patient.prenom} {patient.nom}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatutBadge(patient.statut)}`}>
                            {patient.statut}
                          </span>
                        </div>
                        <p className="text-sm text-mediai-medium font-body">{patient.age} ans • {patient.motif}</p>
                        <p className="text-xs text-mediai-medium font-body mt-1">
                          📞 {patient.telephone} • 🏥 {patient.assurance}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between lg:justify-end space-x-3 lg:space-x-4">
                      <div className="text-right hidden lg:block">
                        <p className="text-sm font-medium text-mediai-dark">Dernière consultation</p>
                        <p className="text-xs text-mediai-medium">{patient.derniere}</p>
                        <p className="text-xs text-mediai-medium">{patient.consultations} consultation{patient.consultations > 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openPatientDetail(patient)}
                          className="px-3 py-2 bg-mediai-primary text-white text-sm font-semibold rounded-lg hover:bg-mediai-secondary transition-colors">
                          Voir détails
                        </button>
                        <button className="px-3 py-2 bg-success text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors">
                          Consulter
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showPatientDetail && renderPatientDetailModal()}
        {showAddModal && renderAddPatientModal()}
      </div>
    );
  };

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
                    Dr. {user?.username || 'Médecin'} • Plateforme Mediai
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
          title="Consultations validées"
          value={stats.consultationsValidees}
          icon={MedicalIcons.Check}
          variant="warning"
        />
        <StatCard
          title="En attente de diagnostic"
          value={stats.consultationsEnAttente}
          icon={MedicalIcons.Clock}
          variant="medical"
        />
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total consultations</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalConsultations}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <MedicalIcon icon={MedicalIcons.Document} size="w-6 h-6" className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Patients uniques</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.patientsUniques}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <MedicalIcon icon={MedicalIcons.User} size="w-6 h-6" className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Taux de validation</p>
              <p className="text-2xl sm:text-3xl font-bold">
                {stats.totalConsultations > 0 
                  ? Math.round((stats.consultationsValidees / stats.totalConsultations) * 100)
                  : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <MedicalIcon icon={StatusIcons.Success} size="w-6 h-6" className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec design amélioré et responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Activités récentes */}
        <div className="bg-white shadow-xl rounded-2xl border border-border-light overflow-hidden">
          <div className="bg-light px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border-light">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-mediai-primary rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <MedicalIcon icon={MedicalIcons.Activity} size="w-4 h-4 sm:w-5 sm:h-5" className="text-white" />
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
            ) : recentConsultations.length === 0 ? (
              <div className="text-center py-8">
                <MedicalIcon icon={MedicalIcons.Document} size="w-12 h-12" className="text-mediai-medium mx-auto mb-3" />
                <p className="text-mediai-medium">Aucune consultation récente</p>
                <p className="text-sm text-mediai-light mt-1">Les nouvelles consultations apparaîtront ici</p>
              </div>
            ) : (
              <ul className="space-y-4 sm:space-y-6">
                {getRecentActivities().map((activity) => (
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
                      {activity.consultation && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.consultation.status === 'valide_medecin' ? 'bg-green-100 text-green-800' :
                            activity.consultation.status === 'analyse_terminee' ? 'bg-blue-100 text-blue-800' :
                            activity.consultation.status === 'en_analyse' ? 'bg-yellow-100 text-yellow-800' :
                            activity.consultation.status === 'rejete_medecin' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {activity.consultation.status === 'valide_medecin' ? 'Validée' :
                             activity.consultation.status === 'analyse_terminee' ? 'Analyse terminée' :
                             activity.consultation.status === 'en_analyse' ? 'En analyse' :
                             activity.consultation.status === 'rejete_medecin' ? 'Rejetée' : 'En cours'}
                          </span>
                        </div>
                      )}
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
                <MedicalIcon icon={ActionIcons.Settings} size="w-4 h-4 sm:w-5 sm:h-5" className="text-white" />
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
                <MedicalIcon icon={MedicalIcons.Appointment} size="w-4 h-4 sm:w-5 sm:h-5" className="text-white" />
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
          ) : getTodayConsultations().length === 0 ? (
            <div className="text-center py-8">
              <MedicalIcon icon={MedicalIcons.Appointment} size="w-12 h-12" className="text-mediai-medium mx-auto mb-3" />
              <p className="text-mediai-medium">Aucune consultation aujourd'hui</p>
              <p className="text-sm text-mediai-light mt-1">Les consultations du jour apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {getTodayConsultations().map((consultation) => (
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
                      consultation.statut === 'en_analyse' ? 'bg-mediai-primary text-white' :
                      consultation.statut === 'analyse_terminee' ? 'bg-success text-white' :
                      consultation.statut === 'valide_medecin' ? 'bg-mediai-secondary text-white' :
                      consultation.statut === 'rejete_medecin' ? 'bg-danger text-white' :
                      consultation.statut === 'en_attente' ? 'bg-warning text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {consultation.statut === 'en_analyse' ? 'EN ANALYSE' :
                       consultation.statut === 'analyse_terminee' ? 'TERMINÉE' :
                       consultation.statut === 'valide_medecin' ? 'VALIDÉE' :
                       consultation.statut === 'rejete_medecin' ? 'REJETÉE' :
                       consultation.statut === 'en_attente' ? 'EN ATTENTE' :
                       consultation.statut}
                    </span>
                    <button 
                      onClick={() => openChat(consultation.chatId, consultation.consultation)}
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
                  <p className="text-sm font-bold text-mediai-dark font-heading">Dr. {user?.username || 'Médecin'}</p>
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
                  <MedicalIcon icon={ActionIcons.Settings} size="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={handleLogout}
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
        <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 transition-all duration-300 ${
                  isActive
                    ? 'bg-mediai-primary text-white'
                    : 'text-mediai-medium hover:text-mediai-dark hover:bg-light'
                }`}
              >
                <MedicalIcon 
                  icon={IconComponent} 
                  size="w-4 h-4" 
                  className={isActive ? 'text-white' : item.color}
                />
                <span className="text-[8px] sm:text-[9px] md:text-xs font-medium mt-0.5 truncate leading-tight font-body">{item.label}</span>
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