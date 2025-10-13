import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { MedicalIcons, NavigationIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { exportToPDF, printConsultation } from '../../services/MedicalPDFService';
import { consultationService } from '../../services/api';
import ConsultationMessaging from '../../components/ConsultationMessaging';
import AIAnalysisModal from '../../components/AIAnalysisModal';
import WhatsAppModal from '../../components/WhatsAppModal';
import QuickValidateModal from './components/QuickValidateModal';
import QuickRejectModal from './components/QuickRejectModal';
import ConsultationsList from './components/ConsultationsList';
import ConsultationDetails from './components/ConsultationDetails';
import ConsultationForm from './components/ConsultationForm';

/**
 * Gestion des consultations médicales - Interface docteur
 * Système complet de gestion des fiches de consultation avec diagnostic, traitement et export PDF
 */
const DoctorConsultations = ({ onNewConsultation }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [activeView, setActiveView] = useState('list'); // 'list', 'detail', 'form'
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // État pour le formulaire de consultation
  const [formData, setFormData] = useState({
    diagnostic: '',
    recommandations: '',
    traitement: '',
    examen_complementaire: '',
    commentaire_rejet: ''
  });

  // États pour les nouvelles fonctionnalités
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedFicheForAction, setSelectedFicheForAction] = useState(null);
  const [messagingFicheId, setMessagingFicheId] = useState(null); // ID dédié pour la messagerie

  // États pour la messagerie des consultations (legacy - conservés pour compatibilité)
  const [consultationMessages, setConsultationMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);

  // États pour validation/rejet rapide
  const [showQuickValidateModal, setShowQuickValidateModal] = useState(false);
  const [showQuickRejectModal, setShowQuickRejectModal] = useState(false);
  const [quickValidationData, setQuickValidationData] = useState({
    diagnostic: '',
    traitement: '',
    examen_complementaire: '',
    recommandations: ''
  });
  const [quickRejectReason, setQuickRejectReason] = useState('');

  // Chargement des consultations assignées au médecin
  useEffect(() => {
    const loadConsultations = async () => {
      setIsLoading(true);
      try {
        console.log('Chargement des consultations assignées au médecin...');
        
        // Récupérer les consultations avec filtres pour le médecin connecté
        const response = await consultationService.getConsultations({
          // Pas de filtre ici, on filtre côté client car l'API ne supporte pas encore assigned_medecin dans les params
        });
        
        if (response && response.results && Array.isArray(response.results)) {
          // Filtrer uniquement les consultations assignées au médecin connecté
          const assignedConsultations = response.results.filter(consultation => 
            consultation.assigned_medecin && 
            consultation.assigned_medecin.toString() === user.id.toString()
          );
          
          console.log('Consultations assignées détails:', assignedConsultations);
          assignedConsultations.forEach((consultation, index) => {
            console.log(`Consultation ${index}:`, {
              id: consultation.id,
              patient_name: consultation.nom,
              assigned_medecin: consultation.assigned_medecin,
              keys: Object.keys(consultation)
            });
          });
          
          console.log(`${assignedConsultations.length} consultations assignées trouvées`);
          setConsultations(assignedConsultations);
        } else {
          console.warn('Aucune consultation trouvée');
          setConsultations([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des consultations:', error);
        showError('Erreur', 'Impossible de charger les consultations');
        setConsultations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.id) {
      loadConsultations();
    }
  }, [user, showError]);

  // Filtrage des consultations
  const filteredConsultations = consultations.filter(consultation => {
    const patientName = `${consultation.nom || ''} ${consultation.postnom || ''} ${consultation.prenom || ''}`.toLowerCase();
    const motif = (consultation.motif_consultation || '').toLowerCase();
    
    const matchesSearch = searchTerm === '' || 
      patientName.includes(searchTerm.toLowerCase()) ||
      motif.includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || consultation.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Fonction helper pour formater le nom du patient de manière sécurisée
  const formatPatientName = (consultation) => {
    if (!consultation) return 'Patient non défini';
    // Les données patient sont directement dans l'objet consultation selon l'API
    const nom = consultation.nom || '';
    const postnom = consultation.postnom || '';
    const prenom = consultation.prenom || '';
    return `${nom} ${postnom} ${prenom}`.trim() || 'Nom non défini';
  };

  // Fonction helper pour formater les dates de manière sécurisée
  const formatDate = (dateString, fallback = 'Date non disponible') => {
    if (!dateString) return fallback;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return fallback;
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      console.warn('Erreur lors du formatage de la date:', dateString, error);
      return fallback;
    }
  };

  // Fonction pour vérifier si une consultation est validée
  const isConsultationValidated = (consultation) => {
    if (!consultation) return false;
    return consultation.status === 'valide_medecin' || consultation.status === 'validee';
  };

  // Fonction pour vérifier si une consultation est complète (avec diagnostic et traitement)
  const isConsultationComplete = (consultation) => {
    if (!consultation) return false;
    return !!(
      consultation.diagnostic && 
      consultation.diagnostic.trim() !== '' &&
      consultation.traitement && 
      consultation.traitement.trim() !== ''
    );
  };

  // Fonction pour vérifier si une action est autorisée
  const isActionAllowed = (consultation, action) => {
    if (!consultation) return false;
    
    const validated = isConsultationValidated(consultation);
    const complete = isConsultationComplete(consultation);
    
    switch (action) {
      case 'export_pdf':
      case 'print':
      case 'whatsapp':
        // Ces actions nécessitent validation ET données complètes
        return validated && complete;
      
      case 'messages':
      case 'ai_analysis':
        // Ces actions nécessitent seulement la validation
        return validated;
      
      case 'edit':
      case 'delete':
      case 'validate':
      case 'reject':
        // Ces actions sont toujours autorisées
        return true;
      
      default:
        return false;
    }
  };

  // Fonction helper pour obtenir la date de consultation
  const getConsultationDate = (consultation) => {
    // Essayer différents champs de date en ordre de priorité
    return consultation.date_consultation || 
           consultation.dateConsultation || 
           consultation.created_at || 
           null;
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'en_analyse': return 'bg-mediai-primary text-white';
      case 'analyse_terminee': return 'bg-success text-white';
      case 'valide_medecin': return 'bg-mediai-secondary text-white';
      case 'rejete_medecin': return 'bg-danger text-white';
      case 'en_attente': return 'bg-warning text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case 'en_analyse': return 'En analyse';
      case 'analyse_terminee': return 'Analyse terminée';
      case 'valide_medecin': return 'Validée';
      case 'rejete_medecin': return 'Rejetée';
      case 'en_attente': return 'En attente';
      default: return statut;
    }
  };

  // Gestion de la validation d'une consultation
  // eslint-disable-next-line no-unused-vars
  const handleValidateConsultation = async (consultationId) => {
    if (!formData.diagnostic.trim()) {
      showError('Erreur', 'Le diagnostic est obligatoire pour valider une consultation');
      return;
    }

    try {
      // Utiliser l'endpoint spécial /validate/ selon la documentation API
      const validationData = {
        diagnostic: formData.diagnostic,
        traitement: formData.traitement,
        examen_complementaire: formData.examen_complementaire,
        recommandations: formData.recommandations
      };

      const response = await consultationService.validateConsultation(consultationId, validationData);
      
      if (response) {
        showSuccess('Succès', 'Consultation validée avec succès');
        
        // Après validation réussie, sauvegarder les données avec un PUT
        try {
          const updateData = {
            diagnostic: formData.diagnostic,
            traitement: formData.traitement,
            examen_complementaire: formData.examen_complementaire,
            recommandations: formData.recommandations
          };
          
          console.log('Sauvegarde des données de validation avec PUT:', updateData);
          await consultationService.updateConsultation(consultationId, updateData);
          console.log('Données sauvegardées avec succès');
        } catch (updateError) {
          console.error('Erreur lors de la sauvegarde des données:', updateError);
          // Ne pas bloquer le flux, juste logger l'erreur
        }
        
        // Mise à jour locale avec les données du formulaire
        const updatedConsultation = {
          ...response,
          diagnostic: formData.diagnostic,
          traitement: formData.traitement,
          examen_complementaire: formData.examen_complementaire,
          recommandations: formData.recommandations,
          status: 'valide_medecin',
          status_display: 'Validée par médecin',
          date_validation: response.date_validation || new Date().toISOString()
        };
        
        // Mettre à jour la consultation dans la liste locale
        const updatedConsultations = consultations.map(c => 
          c.id === consultationId ? { 
            ...c, 
            ...consultationUpdated
          } : c
        );
        setConsultations(updatedConsultations);
        
        // Mettre à jour aussi la consultation sélectionnée si on reste sur la page
        if (selectedConsultation && selectedConsultation.id === consultationId) {
          const updatedSelected = updatedConsultations.find(c => c.id === consultationId);
          setSelectedConsultation(updatedSelected);
        }
        
        setActiveView('list');
        setSelectedConsultation(null);
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      showError('Erreur', 'Impossible de valider la consultation');
    }
  };

  // Gestion du rejet d'une consultation
  // eslint-disable-next-line no-unused-vars
  const handleRejectConsultation = async (consultationId) => {
    if (!formData.commentaire_rejet.trim()) {
      showError('Erreur', 'Veuillez spécifier un motif de rejet');
      return;
    }

    try {
      // Utiliser l'endpoint spécial /reject/ selon la documentation API
      const response = await consultationService.rejectConsultation(consultationId, formData.commentaire_rejet);
      
      if (response) {
        showSuccess('Succès', 'Consultation rejetée');
        
        // Mettre à jour la consultation dans la liste locale avec le motif de rejet
        const updatedConsultations = consultations.map(c => 
          c.id === consultationId ? { 
            ...c, 
            // D'abord intégrer le motif de rejet
            commentaire_rejet: formData.commentaire_rejet,
            // Puis les données de réponse (sans écraser le commentaire)
            ...response,
            // Enfin forcer les statuts et date
            status: 'rejete_medecin',
            status_display: 'Rejetée par médecin',
            date_rejet: new Date().toISOString()
          } : c
        );
        setConsultations(updatedConsultations);
        
        // Mettre à jour aussi la consultation sélectionnée si on reste sur la page
        if (selectedConsultation && selectedConsultation.id === consultationId) {
          const updatedSelected = updatedConsultations.find(c => c.id === consultationId);
          setSelectedConsultation(updatedSelected);
        }
        
        setActiveView('list');
        setSelectedConsultation(null);
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      showError('Erreur', 'Impossible de rejeter la consultation');
    }
  };

  // Fonction helper pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      diagnostic: '',
      recommandations: '',
      traitement: '',
      examen_complementaire: '',
      commentaire_rejet: ''
    });
  };

  // ==================== NOUVELLES FONCTIONNALITÉS ====================

  /**
   * Ouvrir la messagerie pour une fiche
   */
  const handleOpenMessages = (fiche) => {
    // Vérifier les permissions
    if (!isActionAllowed(fiche, 'messages')) {
      showError('Action non autorisée', 'La consultation doit être validée avant d\'accéder aux messages');
      return;
    }
    
    setSelectedFicheForAction(fiche);
    setMessagingFicheId(fiche?.id);
    setShowMessagesModal(true);
  };

  /**
   * Ouvrir la modal de relance IA
   */
  const handleOpenAIAnalysis = (fiche) => {
    // Vérifier les permissions
    if (!isActionAllowed(fiche, 'ai_analysis')) {
      showError('Action non autorisée', 'La consultation doit être validée avant de relancer l\'analyse IA');
      return;
    }
    setSelectedFicheForAction(fiche);
    setShowAIAnalysisModal(true);
  };

  /**
   * Ouvrir la modal WhatsApp
   */
  const handleOpenWhatsApp = (fiche) => {
    // Vérifier les permissions
    if (!isActionAllowed(fiche, 'whatsapp')) {
      if (!isConsultationValidated(fiche)) {
        showError('Action non autorisée', 'La consultation doit être validée avant d\'envoyer sur WhatsApp');
      } else if (!isConsultationComplete(fiche)) {
        showError('Données incomplètes', 'La consultation doit contenir un diagnostic et un traitement avant l\'envoi WhatsApp');
      }
      return;
    }
    setSelectedFicheForAction(fiche);
    setShowWhatsAppModal(true);
  };

  /**
   * Callback quand l'analyse IA est démarrée
   */
  const handleAnalysisStarted = (result) => {
    console.log('Analyse IA démarrée:', result);
    // Optionnel: mettre à jour l'état de la fiche pour indiquer qu'une analyse est en cours
    if (selectedFicheForAction) {
      const updatedConsultations = consultations.map(c => 
        c.id === selectedFicheForAction.id 
          ? { ...c, analysis_in_progress: true, analysis_task_id: result.task_id }
          : c
      );
      setConsultations(updatedConsultations);
    }
  };

  /**
   * Callback quand un message WhatsApp est envoyé
   */
  const handleWhatsAppSent = (result) => {
    console.log('WhatsApp envoyé:', result);
    // Optionnel: marquer la fiche comme ayant reçu un WhatsApp
    if (selectedFicheForAction) {
      const updatedConsultations = consultations.map(c => 
        c.id === selectedFicheForAction.id 
          ? { ...c, last_whatsapp_sent: result.sent_at }
          : c
      );
      setConsultations(updatedConsultations);
    }
  };

  /**
   * Fermer toutes les modals
   */
  const closeAllModals = () => {
    console.log('Fermeture de toutes les modals');
    setShowMessagesModal(false);
    setShowAIAnalysisModal(false);
    setShowWhatsAppModal(false);
    setSelectedFicheForAction(null);
    setMessagingFicheId(null);
  };

  // Fonctions pour la messagerie des consultations
  const loadConsultationMessages = async (consultationId) => {
    setLoadingMessages(true);
    try {
      const messages = await consultationService.getConsultationMessages(consultationId);
      setConsultationMessages(messages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      
      // Gestion spécifique des erreurs 403
      if (error.response?.status === 403) {
        showError('Accès refusé', 'La consultation doit être validée pour accéder aux messages');
      } else if (error.response?.status === 404) {
        showError('Erreur', 'Consultation non trouvée');
      } else {
        showError('Erreur', error.message || 'Impossible de charger les messages de la consultation');
      }
      setConsultationMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendConsultationMessage = async (consultationId) => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage.trim()
      };
      
      const sentMessage = await consultationService.addConsultationMessage(consultationId, messageData);
      setConsultationMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      showSuccess('Message envoyé', 'Votre message a été ajouté à la consultation');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      showError('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const openMessagesModal = (consultation) => {
    console.log('Opening messages modal for consultation:', consultation);
    console.log('Consultation ID:', consultation?.id);
    console.log('Consultation object keys:', Object.keys(consultation || {}));
    
    if (!consultation || !consultation.id) {
      console.error('Consultation invalide ou sans ID:', consultation);
      showError('Erreur', 'Consultation invalide pour ouvrir la messagerie');
      return;
    }
    
    console.log('Setting selectedConsultation and selectedFicheForAction to:', consultation);
    setSelectedConsultation(consultation);
    setMessagingFicheId(consultation?.id);
    setShowMessagesModal(true);
    console.log('Modal should now be open with ficheId:', consultation.id);
    loadConsultationMessages(consultation.id);
  };

  // Fonctions pour WhatsApp
  const openWhatsAppModal = (consultation) => {
    setSelectedFicheForAction(consultation);
    setShowWhatsAppModal(true);
    setWhatsappData({
      message_template: 'default',
      additional_info: ''
    });
  };

  const sendWhatsAppMessage = async (consultationId) => {
    setSendingWhatsApp(true);
    try {
      const response = await consultationService.sendWhatsApp(consultationId, whatsappData);
      showSuccess('WhatsApp envoyé', 'Les résultats ont été envoyés via WhatsApp');
      setShowWhatsAppModal(false);
      setWhatsappData({ message_template: 'default', additional_info: '' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi WhatsApp:', error);
      showError('Erreur', 'Impossible d\'envoyer le message WhatsApp');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // Fonction pour relancer l'analyse IA
  const relancerAnalyseIA = async (consultationId) => {
    try {
      await consultationService.relancerAnalyse(consultationId);
      showSuccess('Analyse relancée', 'L\'analyse IA a été relancée avec succès');
      
      // Recharger les consultations pour voir le nouveau statut
      const response = await consultationService.getConsultations();
      if (response && response.results) {
        const assignedConsultations = response.results.filter(consultation => 
          consultation.assigned_medecin && 
          consultation.assigned_medecin.toString() === user.id.toString()
        );
        setConsultations(assignedConsultations);
      }
    } catch (error) {
      console.error('Erreur lors de la relance de l\'analyse:', error);
      showError('Erreur', 'Impossible de relancer l\'analyse IA');
    }
  };

  // Actions rapides pour validation/rejet
  const openQuickValidateModal = (consultation) => {
    setSelectedConsultation(consultation);
    setQuickValidationData({
      diagnostic: '',
      traitement: '',
      examen_complementaire: '',
      recommandations: ''
    });
    setShowQuickValidateModal(true);
  };

  const openQuickRejectModal = (consultation) => {
    setSelectedConsultation(consultation);
    setQuickRejectReason('');
    setShowQuickRejectModal(true);
  };

  const handleQuickValidate = async () => {
    if (!quickValidationData.diagnostic.trim()) {
      showError('Erreur', 'Le diagnostic est obligatoire pour valider une consultation');
      return;
    }

    try {
      const validationData = {
        diagnostic: quickValidationData.diagnostic,
        traitement: quickValidationData.traitement,
        examen_complementaire: quickValidationData.examen_complementaire,
        recommandations: quickValidationData.recommandations
      };

      const response = await consultationService.validateConsultation(selectedConsultation.id, validationData);
      
      if (response) {
        showSuccess('Succès', 'Consultation validée avec succès');
        
        // Après validation réussie, sauvegarder les données avec un PUT
        try {
          const updateData = {
            diagnostic: quickValidationData.diagnostic,
            traitement: quickValidationData.traitement,
            examen_complementaire: quickValidationData.examen_complementaire,
            recommandations: quickValidationData.recommandations
          };
          
          await consultationService.updateConsultation(selectedConsultation.id, updateData);
        } catch (updateError) {
          console.error('Erreur lors de la sauvegarde des données:', updateError);
        }
        
        // Mise à jour locale avec les données saisies
        const updatedConsultations = consultations.map(c => 
          c.id === selectedConsultation.id ? { 
            ...c, 
            diagnostic: quickValidationData.diagnostic,
            traitement: quickValidationData.traitement,
            examen_complementaire: quickValidationData.examen_complementaire,
            recommandations: quickValidationData.recommandations,
            ...response,
            status: 'valide_medecin',
            status_display: 'Validée par médecin',
            date_validation: response.date_validation || new Date().toISOString()
          } : c
        );
        
        setConsultations(updatedConsultations);
        
        // Mettre à jour la consultation sélectionnée avec les nouvelles données
        const updatedSelected = updatedConsultations.find(c => c.id === selectedConsultation.id);
        setSelectedConsultation(updatedSelected);
        
        setShowQuickValidateModal(false);
        setSelectedConsultation(null);
      }
    } catch (error) {
      console.error('Erreur lors de la validation rapide:', error);
      showError('Erreur', error.message || 'Impossible de valider la consultation');
    }
  };

  const handleQuickReject = async () => {
    if (!quickRejectReason.trim()) {
      showError('Erreur', 'Veuillez spécifier un motif de rejet');
      return;
    }

    try {
      const response = await consultationService.rejectConsultation(selectedConsultation.id, quickRejectReason);
      
      if (response) {
        showSuccess('Succès', 'Consultation rejetée');
        
        // Mettre à jour la consultation dans la liste locale avec le motif de rejet
        const updatedConsultations = consultations.map(c => 
          c.id === selectedConsultation.id ? { 
            ...c, 
            commentaire_rejet: quickRejectReason,
            ...response,
            status: 'rejete_medecin',
            status_display: 'Rejetée par médecin',
            date_rejet: new Date().toISOString()
          } : c
        );
        
        setConsultations(updatedConsultations);
        
        // Mettre à jour la consultation sélectionnée avec les nouvelles données
        const updatedSelected = updatedConsultations.find(c => c.id === selectedConsultation.id);
        setSelectedConsultation(updatedSelected);
        
        setShowQuickRejectModal(false);
        setSelectedConsultation(null);
      }
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      showError('Erreur', error.message || 'Impossible de rejeter la consultation');
    }
  };

  const getUrgenceColor = (urgence) => {
    switch(urgence) {
      case 'haute': return 'bg-danger text-white';
      case 'moyenne': return 'bg-warning text-white';
      case 'faible': return 'bg-success text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleConsultationClick = (consultation) => {
    setSelectedConsultation(consultation);
    // Pré-remplir le formData avec les données existantes
    setFormData({
      diagnostic: consultation.diagnostic || '',
      recommandations: consultation.recommandations || '',
      traitement: consultation.traitement || '',
      examen_complementaire: consultation.examen_complementaire || '',
      commentaire_rejet: consultation.commentaire_rejet || ''
    });
    setActiveView('detail');
  };

  const handleEditConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    // Initialiser le formData avec les données existantes
    setFormData({
      diagnostic: consultation.diagnostic || '',
      recommandations: consultation.recommandations || '',
      traitement: consultation.traitement || '',
      examen_complementaire: consultation.examen_complementaire || '',
      commentaire_rejet: consultation.commentaire_rejet || ''
    });
    setActiveView('form');
  };

  const handleDeleteConsultation = async (consultation) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      try {
        // Ici vous pouvez ajouter l'appel API pour supprimer la consultation
        console.log('Suppression de la consultation:', consultation.id);
        
        // Retourner à la liste après suppression
        setActiveView('list');
        setSelectedConsultation(null);
        
        // Optionnel: Recharger les données ou supprimer de l'état local
        // await fetchConsultations();
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la consultation');
      }
    }
  };

  // Export PDF
  const handleExportToPDF = async (consultation) => {
    // Vérifier les permissions
    if (!isActionAllowed(consultation, 'export_pdf')) {
      if (!isConsultationValidated(consultation)) {
        showError('Action non autorisée', 'La consultation doit être validée avant d\'exporter en PDF');
      } else if (!isConsultationComplete(consultation)) {
        showError('Données incomplètes', 'La consultation doit contenir un diagnostic et un traitement avant l\'export PDF');
      }
      return;
    }

    try {
      // Formater le nom complet du patient
      const nomComplet = [consultation.nom, consultation.postnom, consultation.prenom]
        .filter(Boolean)
        .join(' ') || 'Non renseigné';
      
      // Formater la date de consultation
      const dateConsultation = consultation.date_consultation || consultation.date_creation || consultation.created_at;
      
      const consultationData = {
        ...consultation,
        patient: {
          nom: nomComplet,
          age: consultation.age || 'Non renseigné',
          telephone: consultation.telephone || 'Non renseigné'
        },
        date_consultation: dateConsultation,
        medecin: {
          nom: user?.name || user?.username || 'Dr. Jean Dupont',
          specialite: 'Médecine Générale'
        }
      };
      
      const result = await exportToPDF(consultationData);
      if (result.success) {
        console.log('PDF généré avec succès:', result.fileName);
        showSuccess('Succès', 'PDF généré avec succès');
      } else {
        console.error('Erreur lors de la génération du PDF:', result.error);
        showError('Erreur', 'Erreur lors de la génération du PDF');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showError('Erreur', 'Erreur lors de l\'export PDF');
    }
  };

  // Print consultation
  const handlePrintConsultation = (consultation) => {
    // Vérifier les permissions
    if (!isActionAllowed(consultation, 'print')) {
      if (!isConsultationValidated(consultation)) {
        showError('Action non autorisée', 'La consultation doit être validée avant l\'impression');
      } else if (!isConsultationComplete(consultation)) {
        showError('Données incomplètes', 'La consultation doit contenir un diagnostic et un traitement avant l\'impression');
      }
      return;
    }

    try {
      // Formater le nom complet du patient
      const nomComplet = [consultation.nom, consultation.postnom, consultation.prenom]
        .filter(Boolean)
        .join(' ') || 'Non renseigné';
      
      // Formater la date de consultation
      const dateConsultation = consultation.date_consultation || consultation.date_creation || consultation.created_at;
      
      const consultationData = {
        ...consultation,
        patient: {
          nom: nomComplet,
          age: consultation.age || 'Non renseigné',
          telephone: consultation.telephone || 'Non renseigné'
        },
        date_consultation: dateConsultation,
        medecin: {
          nom: user?.name || user?.username || 'Dr. Jean Dupont',
          specialite: 'Médecine Générale'
        }
      };
      
      printConsultation(consultationData);
      showSuccess('Impression', 'Document envoyé à l\'imprimante');
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      showError('Erreur', 'Erreur lors de l\'impression');
    }
  };

  // Sauvegarde de la consultation
  const saveConsultation = (consultationData) => {
    const updatedConsultations = consultations.map(c => 
      c.id === consultationData.id ? { 
        ...c, 
        // S'assurer que toutes les données du formulaire sont sauvegardées
        diagnostic: consultationData.diagnostic || c.diagnostic,
        traitement: consultationData.traitement || c.traitement,
        examen_complementaire: consultationData.examen_complementaire || c.examen_complementaire,
        recommandations: consultationData.recommandations || c.recommandations,
        commentaire_rejet: consultationData.commentaire_rejet || c.commentaire_rejet,
        // Mettre à jour les autres données
        ...consultationData, 
        statut: 'termine',
        date_modification: new Date().toISOString()
      } : c
    );
    setConsultations(updatedConsultations);
    
    // Réinitialiser le formData
    setFormData({
      diagnostic: '',
      recommandations: '',
      traitement: '',
      examen_complementaire: '',
      commentaire_rejet: ''
    });
    
    // Afficher une confirmation avec options d'export
    const confirmExport = window.confirm(
      `Consultation finalisée avec succès !\n\nVoulez-vous exporter la fiche de consultation en PDF pour l'envoyer au patient ?`
    );
    
    if (confirmExport) {
      handleExportToPDF(consultationData);
    }
    
    setActiveView('list');
  };

  // Modal pour la messagerie des consultations
  // eslint-disable-next-line no-unused-vars
  const renderMessagesModal = () => (
    showMessagesModal && (
      <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-border-light">
          <div className="gradient-mediai text-white p-6 rounded-t-2xl flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold font-heading flex items-center">
                <MedicalIcon icon={NavigationIcons.Chat} size="w-6 h-6" className="mr-3" />
                Messages de consultation
              </h3>
              {selectedConsultation && (
                <p className="text-white/80 text-sm mt-2">
                  Patient: {formatPatientName(selectedConsultation)} • Consultation #{selectedConsultation.id}
                </p>
              )}
            </div>
            <button 
              onClick={() => setShowMessagesModal(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-light">
            {loadingMessages ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-mediai-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-mediai-medium">Chargement des messages...</p>
              </div>
            ) : consultationMessages.length === 0 ? (
              <div className="text-center py-12">
                <MedicalIcon icon={NavigationIcons.Chat} size="w-16 h-16" className="text-mediai-medium mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-mediai-dark mb-2">Aucun message</h4>
                <p className="text-mediai-medium">Commencez la conversation avec le patient</p>
              </div>
            ) : (
              consultationMessages.map((message, index) => (
                <div key={message.id || index} className={`flex mb-4 ${
                  message.author?.role === 'medecin' ? 'justify-end' : 'justify-start'
                }`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-md ${
                    message.author?.role === 'medecin' 
                      ? 'gradient-mediai text-white' 
                      : 'bg-blue-50 text-blue-900 border border-blue-200'
                  }`}>
                    <div className="text-xs opacity-75 mb-2 font-body-medium">
                      {message.author?.role === 'medecin' ? '👨‍⚕️ Dr. ' + (message.author?.username || 'Médecin') : '👤 Patient'}
                    </div>
                    <div className="text-sm leading-relaxed font-body">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-75 mt-2">
                      {new Date(message.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t border-border-light p-6 bg-white rounded-b-2xl">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && selectedConsultation && sendConsultationMessage(selectedConsultation.id)}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body"
              />
              <button
                onClick={() => selectedConsultation && sendConsultationMessage(selectedConsultation.id)}
                disabled={!newMessage.trim()}
                className="px-6 py-3 gradient-mediai text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-body-medium"
              >
                <MedicalIcon icon={ActionIcons.Send} size="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );



  // Modal pour validation rapide
  const renderQuickValidateModal = () => (
    <QuickValidateModal
      isOpen={showQuickValidateModal}
      consultation={selectedConsultation}
      validationData={quickValidationData}
      setValidationData={setQuickValidationData}
      onValidate={handleQuickValidate}
      formatPatientName={formatPatientName}
      onClose={() => setShowQuickValidateModal(false)}
    />
  );

  // Modal pour rejet rapide
  const renderQuickRejectModal = () => (
    <QuickRejectModal
      isOpen={showQuickRejectModal}
      consultation={selectedConsultation}
      rejectReason={quickRejectReason}
      setRejectReason={setQuickRejectReason}
      onReject={handleQuickReject}
      formatPatientName={formatPatientName}
      onClose={() => setShowQuickRejectModal(false)}
    />
  );




  const renderConsultationForm = () => {
    if (!selectedConsultation) {
      return null;
    }

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const updatedConsultation = {
        ...selectedConsultation,
        ...formData,
        statut: 'termine',
        dateCompletee: new Date().toISOString()
      };
      saveConsultation(updatedConsultation);
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-border-light p-4 lg:p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveView('detail')}
              className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors"
            >
              <Icon icon={NavigationIcons.ArrowLeft} size="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg lg:text-2xl font-bold text-mediai-dark font-heading">
                Compléter la consultation
              </h2>
              <p className="text-sm lg:text-base text-mediai-medium font-body">
                {formatPatientName(selectedConsultation)}
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire de diagnostic */}
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-border-light p-4 lg:p-6">
            <h3 className="text-base lg:text-lg font-bold text-mediai-dark font-heading mb-4 lg:mb-6 flex items-center">
              <MedicalIcon icon={MedicalIcons.Document} size="w-4 h-4 lg:w-5 lg:h-5" className="mr-2" />
              Diagnostic et traitement médical
            </h3>
            
            <div className="space-y-4 lg:space-y-6">
              {/* Diagnostic */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Diagnostic <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.diagnostic}
                  onChange={(e) => handleInputChange('diagnostic', e.target.value)}
                  placeholder="Saisissez le diagnostic principal et différentiel..."
                  className="w-full p-3 lg:p-4 border border-border-light rounded-lg lg:rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none text-sm lg:text-base"
                  rows={3}
                  required
                />
              </div>

              {/* Recommandations médicales */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Recommandations médicales <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.recommandations}
                  onChange={(e) => handleInputChange('recommandations', e.target.value)}
                  placeholder="Recommandations générales pour le suivi du patient..."
                  className="w-full p-3 lg:p-4 border border-border-light rounded-lg lg:rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none text-sm lg:text-base"
                  rows={3}
                  required
                />
              </div>

              {/* Traitement proposé */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Traitement proposé <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.traitement}
                  onChange={(e) => handleInputChange('traitement', e.target.value)}
                  placeholder="Détaillez le plan de traitement : médicaments, posologie, durée..."
                  className="w-full p-3 lg:p-4 border border-border-light rounded-lg lg:rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none text-sm lg:text-base"
                  rows={4}
                  required
                />
              </div>

              {/* Examens complémentaires */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Examens complémentaires
                </label>
                <textarea
                  value={formData.examen_complementaire}
                  onChange={(e) => handleInputChange('examen_complementaire', e.target.value)}
                  placeholder="Examens de laboratoire, imagerie, consultations spécialisées..."
                  className="w-full p-3 lg:p-4 border border-border-light rounded-lg lg:rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none text-sm lg:text-base"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-border-light p-4 lg:p-6">
            <div className="flex flex-col space-y-4">
              {/* Boutons d'action */}
              <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveView('detail')}
                  className="w-full lg:w-auto px-4 lg:px-6 py-3 border border-border-light text-mediai-dark rounded-lg hover:bg-light transition-colors font-body text-sm lg:text-base"
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const tempConsultation = { ...selectedConsultation, ...formData };
                    handlePrintConsultation(tempConsultation);
                  }}
                  className="w-full lg:w-auto px-4 lg:px-6 py-3 bg-success text-white rounded-lg hover:bg-mediai-dark transition-colors font-body text-sm lg:text-base"
                >
                  Aperçu impression
                </button>
                
                <button
                  type="submit"
                  disabled={!formData.diagnostic || !formData.recommandations || !formData.traitement}
                  className="w-full lg:w-auto px-4 lg:px-6 py-3 gradient-mediai text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-body text-sm lg:text-base"
                >
                  Finaliser et sauvegarder
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {activeView === 'list' && (
        <ConsultationsList
          consultations={filteredConsultations}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          onConsultationClick={handleConsultationClick}
          onEdit={handleEditConsultation}
          onValidate={openQuickValidateModal}
          onReject={openQuickRejectModal}
          onOpenMessages={handleOpenMessages}
          onOpenWhatsApp={handleOpenWhatsApp}
          onOpenAIAnalysis={handleOpenAIAnalysis}
          onExportToPDF={handleExportToPDF}
          onNewConsultation={onNewConsultation}
          user={user}
          selectedConsultation={selectedConsultation}
        />
      )}
      {activeView === 'detail' && selectedConsultation && (
        <ConsultationDetails
          consultation={selectedConsultation}
          onBack={() => setActiveView('list')}
          onEdit={() => setActiveView('form')}
          onDelete={handleDeleteConsultation}
          onValidate={() => {
            setConsultationToValidate(selectedConsultation);
            setShowQuickValidateModal(true);
          }}
          onReject={() => {
            setConsultationToReject(selectedConsultation);
            setShowQuickRejectModal(true);
          }}
          onWhatsApp={openWhatsAppModal}
          onMessages={openMessagesModal}
          onPrint={handlePrintConsultation}
          onExportPDF={handleExportToPDF}
          onAnalyzeWithIA={relancerAnalyseIA}
        />
      )}
      {activeView === 'form' && renderConsultationForm()}
      {renderQuickValidateModal()}
      {renderQuickRejectModal()}

      {/* Nouvelles modals avec les composants dédiés */}
      <ConsultationMessaging
        ficheId={messagingFicheId}
        isOpen={showMessagesModal}
        onClose={closeAllModals}
      />
      
      <AIAnalysisModal
        ficheId={selectedFicheForAction?.id}
        isOpen={showAIAnalysisModal}
        onClose={closeAllModals}
        onAnalysisStarted={handleAnalysisStarted}
      />
      
      <WhatsAppModal
        fiche={selectedFicheForAction}
        isOpen={showWhatsAppModal}
        onClose={closeAllModals}
        onMessageSent={handleWhatsAppSent}
      />
    </div>
  );
};

export default DoctorConsultations;