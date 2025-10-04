import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { MedicalIcons, NavigationIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { exportToPDF, printConsultation } from '../../services/MedicalPDFService';
import { consultationService, ficheMessagingService, ficheAIService, whatsappService } from '../../services/api';
import ConsultationMessaging from '../../components/ConsultationMessaging';
import AIAnalysisModal from '../../components/AIAnalysisModal';
import WhatsAppModal from '../../components/WhatsAppModal';

/**
 * Gestion des consultations médicales - Interface docteur
 * Système complet de gestion des fiches de consultation avec diagnostic, traitement et export PDF
 */
const DoctorConsultations = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [activeView, setActiveView] = useState('list'); // 'list', 'detail', 'form'
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState('');
  
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
        const consultationUpdated = {
          ...response,
          diagnostic: formData.diagnostic,
          traitement: formData.traitement,
          examen_complementaire: formData.examen_complementaire,
          recommandations: formData.recommandations,
          signature_medecin: signature,
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
    setSignature('');
  };

  // ==================== NOUVELLES FONCTIONNALITÉS ====================

  /**
   * Ouvrir la messagerie pour une fiche
   */
  const handleOpenMessages = (fiche) => {
    setSelectedFicheForAction(fiche);
    setShowMessagesModal(true);
  };

  /**
   * Ouvrir la modal de relance IA
   */
  const handleOpenAIAnalysis = (fiche) => {
    setSelectedFicheForAction(fiche);
    setShowAIAnalysisModal(true);
  };

  /**
   * Ouvrir la modal WhatsApp
   */
  const handleOpenWhatsApp = (fiche) => {
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
    // Ne pas réinitialiser selectedConsultation car on en a besoin pour l'affichage
    // setSelectedConsultation(null);
  };

  // Fonctions pour la messagerie des consultations
  const loadConsultationMessages = async (consultationId) => {
    setLoadingMessages(true);
    try {
      const messages = await consultationService.getConsultationMessages(consultationId);
      setConsultationMessages(messages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      showError('Erreur', 'Impossible de charger les messages de la consultation');
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
    setSelectedFicheForAction(consultation);
    setShowMessagesModal(true);
    console.log('Modal should now be open with ficheId:', consultation.id);
    loadConsultationMessages(consultation.id);
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
          
          console.log('Sauvegarde des données de validation rapide avec PUT:', updateData);
          await consultationService.updateConsultation(selectedConsultation.id, updateData);
          console.log('Données sauvegardées avec succès (validation rapide)');
        } catch (updateError) {
          console.error('Erreur lors de la sauvegarde des données (validation rapide):', updateError);
          // Ne pas bloquer le flux, juste logger l'erreur
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
      showError('Erreur', 'Impossible de valider la consultation');
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
            // D'abord intégrer le motif de rejet
            commentaire_rejet: quickRejectReason,
            // Puis les données de réponse (sans écraser le commentaire)
            ...response,
            // Enfin forcer les statuts et date
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
      showError('Erreur', 'Impossible de rejeter la consultation');
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

  // Gestion de la signature numérique
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    setSignature(signatureData);
    setShowSignatureModal(false);
  };

  // Export PDF
  const handleExportToPDF = async (consultation) => {
    try {
      // Ajouter la signature si elle existe
      const consultationWithSignature = {
        ...consultation,
        signature: signature || null,
        medecin: {
          nom: user?.name || 'Dr. Jean Dupont',
          specialite: 'Médecine Générale'
        }
      };
      
      const result = await exportToPDF(consultationWithSignature);
      if (result.success) {
        console.log('PDF généré avec succès:', result.fileName);
      } else {
        console.error('Erreur lors de la génération du PDF:', result.error);
        alert('Erreur lors de la génération du PDF');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  // Print consultation
  const handlePrintConsultation = (consultation) => {
    try {
      // Ajouter la signature si elle existe
      const consultationWithSignature = {
        ...consultation,
        signature: signature || null,
        medecin: {
          nom: user?.name || 'Dr. Jean Dupont',
          specialite: 'Médecine Générale'
        }
      };
      
      printConsultation(consultationWithSignature);
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de l\'impression');
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

  // Modal pour l'envoi WhatsApp
  const renderWhatsAppModal = () => (
    showWhatsAppModal && (
      <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-border-light">
          <div className="bg-green-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold font-heading flex items-center">
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Envoyer via WhatsApp
              </h3>
              {selectedConsultation && (
                <p className="text-white/80 text-sm mt-2">
                  Patient: {formatPatientName(selectedConsultation)} • {selectedConsultation.telephone}
                </p>
              )}
            </div>
            <button 
              onClick={() => setShowWhatsAppModal(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-mediai-dark mb-2">
                Modèle de message
              </label>
              <select
                value={whatsappData.message_template}
                onChange={(e) => setWhatsappData(prev => ({ ...prev, message_template: e.target.value }))}
                className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light"
              >
                <option value="default">Message standard</option>
                <option value="custom">Message personnalisé</option>
                <option value="results">Résultats de consultation</option>
                <option value="prescription">Prescription médicale</option>
                <option value="follow_up">Suivi médical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-mediai-dark mb-2">
                Informations supplémentaires (optionnel)
              </label>
              <textarea
                value={whatsappData.additional_info}
                onChange={(e) => setWhatsappData(prev => ({ ...prev, additional_info: e.target.value }))}
                placeholder="Ajoutez des informations complémentaires à envoyer..."
                rows="4"
                className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light resize-none"
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2">Informations qui seront envoyées :</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Résultats de la consultation</li>
                <li>• Diagnostic médical</li>
                <li>• Recommandations et traitement</li>
                <li>• Coordonnées du médecin</li>
                {whatsappData.additional_info && <li>• Informations supplémentaires</li>}
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border-light">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="px-6 py-2 border border-border-light text-mediai-medium rounded-lg hover:bg-light transition-colors"
                disabled={sendingWhatsApp}
              >
                Annuler
              </button>
              <button
                onClick={() => selectedConsultation && sendWhatsAppMessage(selectedConsultation.id)}
                disabled={sendingWhatsApp}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
              >
                {sendingWhatsApp ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span>Envoyer WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Modal pour validation rapide
  const renderQuickValidateModal = () => (
    showQuickValidateModal && (
      <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-border-light">
          <div className="bg-green-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold font-heading flex items-center">
                <Icon icon={MedicalIcons.Check} size="w-6 h-6" className="mr-3" />
                Validation Rapide
              </h3>
              {selectedConsultation && (
                <p className="text-white/80 text-sm mt-2">
                  Patient: {formatPatientName(selectedConsultation)} • Consultation #{selectedConsultation.id}
                </p>
              )}
            </div>
            <button 
              onClick={() => setShowQuickValidateModal(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2">Validation rapide de consultation</h4>
              <p className="text-sm text-green-700">
                Complétez les champs essentiels pour valider cette consultation. Cette action changera le statut en "Validée par médecin".
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Diagnostic <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={quickValidationData.diagnostic}
                  onChange={(e) => setQuickValidationData(prev => ({ ...prev, diagnostic: e.target.value }))}
                  placeholder="Diagnostic principal et différentiel..."
                  rows="3"
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Traitement <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={quickValidationData.traitement}
                  onChange={(e) => setQuickValidationData(prev => ({ ...prev, traitement: e.target.value }))}
                  placeholder="Plan de traitement: médicaments, posologie, durée..."
                  rows="4"
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Recommandations
                </label>
                <textarea
                  value={quickValidationData.recommandations}
                  onChange={(e) => setQuickValidationData(prev => ({ ...prev, recommandations: e.target.value }))}
                  placeholder="Recommandations générales pour le suivi..."
                  rows="3"
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Examens complémentaires
                </label>
                <textarea
                  value={quickValidationData.examen_complementaire}
                  onChange={(e) => setQuickValidationData(prev => ({ ...prev, examen_complementaire: e.target.value }))}
                  placeholder="Examens de laboratoire, imagerie, consultations spécialisées..."
                  rows="2"
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-light resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border-light">
              <button
                onClick={() => setShowQuickValidateModal(false)}
                className="px-6 py-2 border border-border-light text-mediai-medium rounded-lg hover:bg-light transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleQuickValidate}
                disabled={!quickValidationData.diagnostic.trim() || !quickValidationData.traitement.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
              >
                <Icon icon={MedicalIcons.Check} size="w-4 h-4" />
                <span>Valider consultation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Modal pour rejet rapide
  const renderQuickRejectModal = () => (
    showQuickRejectModal && (
      <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-border-light">
          <div className="bg-red-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold font-heading flex items-center">
                <Icon icon={StatusIcons.Error} size="w-6 h-6" className="mr-3" />
                Rejet de Consultation
              </h3>
              {selectedConsultation && (
                <p className="text-white/80 text-sm mt-2">
                  Patient: {formatPatientName(selectedConsultation)} • Consultation #{selectedConsultation.id}
                </p>
              )}
            </div>
            <button 
              onClick={() => setShowQuickRejectModal(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Attention - Rejet de consultation</h4>
              <p className="text-sm text-red-700">
                Cette action rejettera définitivement la consultation. Veuillez spécifier un motif détaillé pour informer l'équipe et le patient.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-mediai-dark mb-2">
                Motif de rejet <span className="text-red-500">*</span>
              </label>
              <textarea
                value={quickRejectReason}
                onChange={(e) => setQuickRejectReason(e.target.value)}
                placeholder="Ex: Informations insuffisantes, symptômes non clairs, nécessite consultation physique..."
                rows="5"
                className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-light resize-none"
              />
              <p className="text-xs text-mediai-medium mt-1">
                Minimum 20 caractères requis pour un motif valide
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border-light">
              <button
                onClick={() => setShowQuickRejectModal(false)}
                className="px-6 py-2 border border-border-light text-mediai-medium rounded-lg hover:bg-light transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleQuickReject}
                disabled={quickRejectReason.trim().length < 20}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
              >
                <Icon icon={StatusIcons.Error} size="w-4 h-4" />
                <span>Rejeter consultation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const renderConsultationsList = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="bg-white rounded-2xl shadow-xl border border-border-light p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-mediai-dark font-heading">Gestion des consultations</h2>
            <p className="text-mediai-medium font-body mt-1 text-sm sm:text-base">
              {filteredConsultations.length} consultation(s) • Dr. {user?.name}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-border-light rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body w-full sm:w-80 text-sm sm:text-base"
              />
              <Icon icon={NavigationIcons.Search} size="w-4 h-4 sm:w-5 sm:h-5" className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-mediai-medium" />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-border-light rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark font-body text-sm sm:text-base"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="reporte">Reporté</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des consultations */}
      <div className="bg-white rounded-2xl shadow-xl border border-border-light overflow-hidden">
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 sm:h-24 bg-medium rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-light rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <MedicalIcon icon={MedicalIcons.Document} size="w-8 h-8 sm:w-10 sm:h-10" className="text-mediai-medium" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-mediai-dark mb-2 font-heading">Aucune consultation trouvée</h3>
              <p className="text-mediai-medium font-body text-sm sm:text-base">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucune consultation ne correspond à vos critères de recherche.'
                  : 'Aucune consultation disponible pour le moment.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredConsultations.map((consultation) => (
                <div 
                  key={consultation.id}
                  className="border border-border-light rounded-xl p-4 lg:p-6 hover:bg-light transition-all duration-300 hover-lift cursor-pointer"
                  onClick={() => handleConsultationClick(consultation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 lg:space-x-6">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-mediai-primary rounded-xl flex items-center justify-center flex-shrink-0">
                        <MedicalIcon icon={MedicalIcons.Profile} size="w-6 h-6 lg:w-8 lg:h-8" className="text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-2">
                          <h3 className="text-base lg:text-lg font-bold text-mediai-dark font-heading truncate">
                            {formatPatientName(consultation)}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1 lg:mt-0">
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatutColor(consultation.status)}`}>
                              {getStatutLabel(consultation.status)}
                            </span>
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getUrgenceColor(consultation.urgence)}`}>
                              {consultation.urgence || 'Normal'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm lg:text-base text-mediai-dark font-body-medium mb-2">
                          <strong>Motif:</strong> {consultation.motif_consultation || 'Non spécifié'}
                        </p>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-xs lg:text-sm text-mediai-medium font-body">
                          <div>
                            <span className="font-medium">Âge:</span> {consultation.age || 'N/A'} ans
                          </div>
                          <div>
                            <span className="font-medium">Sexe:</span> {consultation.sexe || 'N/A'}
                          </div>
                          <div className="col-span-2 lg:col-span-1">
                            <span className="font-medium">Tél:</span> {consultation.telephone || 'N/A'}
                          </div>
                          <div className="col-span-2 lg:col-span-1">
                            <span className="font-medium">Date:</span> {formatDate(getConsultationDate(consultation), 'Non programmée')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditConsultation(consultation);
                        }}
                        className="p-2 text-mediai-primary hover:text-mediai-secondary hover:bg-light rounded-lg transition-colors"
                        title="Éditer la consultation"
                      >
                        <Icon icon={ActionIcons.Edit} size="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>

                      {/* Actions rapides pour analyse_terminee */}
                      {consultation.status === 'analyse_terminee' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuickValidateModal(consultation);
                            }}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Validation rapide"
                          >
                            <Icon icon={MedicalIcons.Check} size="w-4 h-4 lg:w-5 lg:h-5" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuickRejectModal(consultation);
                            }}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rejet rapide"
                          >
                            <Icon icon={StatusIcons.Error} size="w-4 h-4 lg:w-5 lg:h-5" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMessages(consultation);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Messages de consultation"
                      >
                        <Icon icon={ActionIcons.Message} size="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenWhatsApp(consultation);
                        }}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                        title="Envoyer via WhatsApp"
                      >
                        <Icon icon={ActionIcons.Phone} size="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAIAnalysis(consultation);
                        }}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Relancer l'analyse IA"
                      >
                        <Icon icon={MedicalIcons.Brain} size="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportToPDF(consultation);
                        }}
                        className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors"
                        title="Exporter en PDF"
                      >
                        <Icon icon={ActionIcons.Download} size="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderConsultationDetails = () => {
    if (!selectedConsultation) return null;
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-border-light p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveView('list')}
                className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors"
              >
                <Icon icon={NavigationIcons.ArrowLeft} size="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg lg:text-2xl font-bold text-mediai-dark font-heading">
                  Consultation #{selectedConsultation.id}
                </h2>
                <p className="text-sm lg:text-base text-mediai-medium font-body">
                  {formatPatientName(selectedConsultation)}
                </p>
              </div>
            </div>
            
            {/* Actions desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <button
                onClick={() => handleEditConsultation(selectedConsultation)}
                className="px-4 py-2 bg-mediai-primary text-white rounded-lg hover:bg-mediai-secondary transition-colors font-body"
              >
                Compléter
              </button>
              <button
                onClick={() => openMessagesModal(selectedConsultation)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-body flex items-center space-x-2"
              >
                <Icon icon={NavigationIcons.Chat} size="w-4 h-4" />
                <span>Messages</span>
              </button>
              <button
                onClick={() => handleOpenWhatsApp(selectedConsultation)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-body flex items-center space-x-2"
                disabled={!selectedConsultation.telephone}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>WhatsApp</span>
              </button>
              {selectedConsultation.status === 'en_analyse' && (
                <button
                  onClick={() => relancerAnalyseIA(selectedConsultation.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-body flex items-center space-x-2"
                >
                  <Icon icon={MedicalIcons.AI} size="w-4 h-4" />
                  <span>Relancer IA</span>
                </button>
              )}
              <button
                onClick={() => handlePrintConsultation(selectedConsultation)}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-mediai-dark transition-colors font-body"
              >
                Imprimer
              </button>
              <button
                onClick={() => handleExportToPDF(selectedConsultation)}
                className="px-4 py-2 bg-medium text-white rounded-lg hover:bg-mediai-dark transition-colors font-body"
              >
                Export PDF
              </button>
            </div>

            {/* Actions mobile */}
            <div className="lg:hidden space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditConsultation(selectedConsultation)}
                  className="flex-1 px-3 py-2 bg-mediai-primary text-white rounded-lg text-sm font-body"
                >
                  Compléter
                </button>
                <button
                  onClick={() => openMessagesModal(selectedConsultation)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-body flex items-center justify-center space-x-1"
                >
                  <Icon icon={NavigationIcons.Chat} size="w-4 h-4" />
                  <span>Messages</span>
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenWhatsApp(selectedConsultation)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-body flex items-center justify-center space-x-1"
                  disabled={!selectedConsultation.telephone}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handlePrintConsultation(selectedConsultation)}
                  className="flex-1 px-3 py-2 bg-success text-white rounded-lg text-sm font-body"
                >
                  Imprimer
                </button>
                <button
                  onClick={() => handleExportToPDF(selectedConsultation)}
                  className="flex-1 px-3 py-2 bg-medium text-white rounded-lg text-sm font-body"
                >
                  PDF
                </button>
              </div>
              {selectedConsultation.status === 'en_analyse' && (
                <button
                  onClick={() => relancerAnalyseIA(selectedConsultation.id)}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-body flex items-center justify-center space-x-2"
                >
                  <Icon icon={MedicalIcons.AI} size="w-4 h-4" />
                  <span>Relancer l'analyse IA</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Détails de la consultation - Layout unifié comme ConsultationDetails */}
        <div className="space-y-4 lg:space-y-6">{/* START_CONSULTATION_DETAILS */}
          
          {/* Informations patient */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={MedicalIcons.Profile} size="w-5 h-5" className="mr-2 text-mediai-primary" />
              Informations patient
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Nom complet</label>
                <p className="text-mediai-dark text-sm lg:text-base font-medium">{formatPatientName(selectedConsultation)}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Âge</label>
                <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.age || 'N/A'} ans</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Sexe</label>
                <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.sexe || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Téléphone</label>
                <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.telephone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">État civil</label>
                <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.etat_civil || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Occupation</label>
                <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.occupation || 'N/A'}</p>
              </div>
            </div>
            {(selectedConsultation.avenue || selectedConsultation.quartier || selectedConsultation.commune) && (
              <div className="mt-4">
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Adresse</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {[selectedConsultation.avenue, selectedConsultation.quartier, selectedConsultation.commune]
                    .filter(Boolean).join(', ') || 'Non renseignée'}
                </p>
              </div>
            )}
          </div>

          {/* Contact d'urgence */}
          {(selectedConsultation.contact_nom || selectedConsultation.contact_telephone || selectedConsultation.contact_adresse) && (
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
                <MedicalIcon icon={MedicalIcons.Phone} size="w-5 h-5" className="mr-2 text-orange-500" />
                Contact d'urgence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Nom</label>
                  <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.contact_nom || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Téléphone</label>
                  <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.contact_telephone || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Adresse</label>
                  <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.contact_adresse || 'Non renseignée'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Informations de consultation */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={MedicalIcons.Calendar} size="w-5 h-5" className="mr-2 text-mediai-primary" />
              Informations de consultation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Numéro de dossier</label>
                <p className="text-mediai-dark text-sm lg:text-base font-mono">{selectedConsultation.numero_dossier || `CONS-${selectedConsultation.id}`}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Date de consultation</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {formatDate(getConsultationDate(selectedConsultation), 'Non programmée')}
                </p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Heure</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {selectedConsultation.heure_debut && selectedConsultation.heure_fin 
                    ? `${selectedConsultation.heure_debut} - ${selectedConsultation.heure_fin}`
                    : selectedConsultation.heure_debut || 'Non programmée'
                  }
                </p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Status</label>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatutColor(selectedConsultation.status)}`}>
                    {getStatutLabel(selectedConsultation.status)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Urgence</label>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getUrgenceColor(selectedConsultation.urgence)}`}>
                  {selectedConsultation.urgence || 'Normal'}
                </span>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Date de création</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {formatDate(selectedConsultation.created_at, 'Non disponible')}
                </p>
              </div>
            </div>
          </div>

          {/* Signes vitaux */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={MedicalIcons.Heart} size="w-5 h-5" className="mr-2 text-red-500" />
              Signes vitaux
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <label className="block text-xs font-medium text-red-600 mb-1">Température</label>
                <p className="text-lg font-bold text-red-700">{selectedConsultation.temperature || '-'}°C</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <label className="block text-xs font-medium text-blue-600 mb-1">SpO2</label>
                <p className="text-lg font-bold text-blue-700">{selectedConsultation.spo2 || '-'}%</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <label className="block text-xs font-medium text-green-600 mb-1">Poids</label>
                <p className="text-lg font-bold text-green-700">{selectedConsultation.poids || '-'} kg</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <label className="block text-xs font-medium text-purple-600 mb-1">Tension</label>
                <p className="text-lg font-bold text-purple-700">{selectedConsultation.tension_arterielle || '-'}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <label className="block text-xs font-medium text-orange-600 mb-1">Pouls</label>
                <p className="text-lg font-bold text-orange-700">{selectedConsultation.pouls || '-'} bpm</p>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-lg">
                <label className="block text-xs font-medium text-cyan-600 mb-1">Fréq. resp.</label>
                <p className="text-lg font-bold text-cyan-700">{selectedConsultation.frequence_respiratoire || '-'}/min</p>
              </div>
            </div>
            </div>

          {/* Motif et histoire */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={MedicalIcons.Document} size="w-5 h-5" className="mr-2 text-mediai-primary" />
              Motif et anamnèse
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Motif de consultation</label>
                <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.motif_consultation || 'Non spécifié'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Histoire de la maladie</label>
                <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.histoire_maladie || 'Non spécifiée'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Antécédents médicaux</label>
                <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.autres_antecedents || 'Aucun antécédent spécifié'}</p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Allergies médicamenteuses</label>
                <p className="text-mediai-dark text-sm lg:text-base">
                  {selectedConsultation.allergie_medicamenteuse ? 
                    (selectedConsultation.medicament_allergique || 'Allergie confirmée') : 
                    'Aucune allergie connue'
                  }
                </p>
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Médicaments actuels</label>
                <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation.details_medicaments || 'Aucun médicament spécifié'}</p>
              </div>
            </div>
          </div>

          {/* Examen clinique */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg lg:text-xl font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-5 h-5" className="mr-2 text-mediai-primary" />
              Examen physique
            </h3>
            <div className="space-y-4">
              {[
                { key: 'etat_general', label: 'État général' },
                { key: 'febrile', label: 'État fébrile' },
                { key: 'coloration_bulbaire', label: 'Coloration bulbaire' },
                { key: 'coloration_palpebrale', label: 'Coloration palpébrale' },
                { key: 'tegument', label: 'Tégument' },
                { key: 'tete', label: 'Tête' },
                { key: 'cou', label: 'Cou' },
                { key: 'paroi_thoracique', label: 'Paroi thoracique' },
                { key: 'poumons', label: 'Poumons' },
                { key: 'coeur', label: 'Cœur' },
                { key: 'epigastre_hypochondres', label: 'Épigastre et hypochondres' },
                { key: 'peri_ombilical_flancs', label: 'Péri-ombilical et flancs' },
                { key: 'hypogastre_fosses_iliaques', label: 'Hypogastre et fosses iliaques' },
                { key: 'membres', label: 'Membres' },
                { key: 'colonne_bassin', label: 'Colonne et bassin' },
                { key: 'examen_gynecologique', label: 'Examen gynécologique' }
              ].filter(item => selectedConsultation[item.key]).map(item => (
                <div key={item.key}>
                  <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">{item.label}</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-mediai-dark text-sm lg:text-base">{selectedConsultation[item.key]}</p>
                  </div>
                </div>
              ))}
              {![
                'etat_general', 'febrile', 'coloration_bulbaire', 'coloration_palpebrale', 'tegument',
                'tete', 'cou', 'paroi_thoracique', 'poumons', 'coeur', 'epigastre_hypochondres',
                'peri_ombilical_flancs', 'hypogastre_fosses_iliaques', 'membres', 'colonne_bassin', 'examen_gynecologique'
              ].some(key => selectedConsultation[key]) && (
                <div className="text-mediai-medium text-sm lg:text-base italic text-center py-8">
                  Aucun examen clinique enregistré
                </div>
              )}
            </div>
          </div>

        {/* Diagnostic et traitement (si complété) */}
        {selectedConsultation.diagnostic && (
          <>
            {/* Version mobile compacte */}
            <div className="lg:hidden">
              <div className="bg-white rounded-xl border border-border-light p-4">
                <h3 className="text-base font-bold text-mediai-dark font-heading mb-3 flex items-center">
                  <MedicalIcon icon={MedicalIcons.Check} size="w-4 h-4" className="mr-2" />
                  Diagnostic & Traitement
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-mediai-medium text-xs">Diagnostic:</span>
                    <div className="bg-light p-3 rounded-lg mt-1">
                      <p className="text-mediai-dark">{selectedConsultation.diagnostic}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-mediai-medium text-xs">Traitement:</span>
                    <div className="bg-light p-3 rounded-lg mt-1">
                      <p className="text-mediai-dark">{selectedConsultation.traitement}</p>
                    </div>
                  </div>
                  
                  {selectedConsultation.examen_complementaire && (
                    <div>
                      <span className="font-medium text-mediai-medium text-xs">Examens:</span>
                      <div className="bg-light p-3 rounded-lg mt-1">
                        <p className="text-mediai-dark">{selectedConsultation.examen_complementaire}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedConsultation.recommandations && (
                    <div>
                      <span className="font-medium text-mediai-medium text-xs">Recommandations:</span>
                      <div className="bg-light p-3 rounded-lg mt-1">
                        <p className="text-mediai-dark">{selectedConsultation.recommandations}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Version desktop avec cartes */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-border-light p-6">
              <h3 className="text-lg font-bold text-mediai-dark font-heading mb-6 flex items-center">
                <MedicalIcon icon={MedicalIcons.Check} size="w-5 h-5" className="mr-2" />
                Diagnostic et traitement
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-mediai-medium">Diagnostic</label>
                      {selectedConsultation.status === 'valide_medecin' && selectedConsultation.date_validation && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          Validé le {formatDate(selectedConsultation.date_validation)}
                        </span>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg mt-1 ${selectedConsultation.diagnostic ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <p className="text-mediai-dark font-body">
                        {selectedConsultation.diagnostic || 'Diagnostic non encore établi'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-mediai-medium">Traitement proposé</label>
                      {selectedConsultation.status === 'valide_medecin' && selectedConsultation.traitement && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          Prescrit
                        </span>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg mt-1 ${selectedConsultation.traitement ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                      <p className="text-mediai-dark font-body">
                        {selectedConsultation.traitement || 'Traitement non encore défini'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-mediai-medium">Examens complémentaires</label>
                      {selectedConsultation.examen_complementaire && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                          Prescrits
                        </span>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg mt-1 ${selectedConsultation.examen_complementaire ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                      <p className="text-mediai-dark font-body">
                        {selectedConsultation.examen_complementaire || 'Aucun examen complémentaire prescrit'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-mediai-medium">Recommandations médicales</label>
                      {selectedConsultation.recommandations && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          Conseils donnés
                        </span>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg mt-1 ${selectedConsultation.recommandations ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                      <p className="text-mediai-dark font-body">
                        {selectedConsultation.recommandations || 'Aucune recommandation spécifique'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section signature médecin si présente */}
              {selectedConsultation.signature_medecin && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-mediai-medium">Signature du médecin</label>
                      <p className="text-xs text-gray-600 mt-1">Consultation validée avec signature électronique</p>
                    </div>
                    <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                      ✓ Signée
                    </span>
                  </div>
                </div>
              )}

              {/* Section rejet si applicable */}
              {selectedConsultation.status === 'rejete_medecin' && selectedConsultation.commentaire_rejet && (
                <div className="mt-6 pt-6 border-t border-red-200">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-red-600">Motif de rejet</label>
                      {selectedConsultation.date_rejet && (
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                          Rejetée le {formatDate(selectedConsultation.date_rejet)}
                        </span>
                      )}
                    </div>
                    <p className="text-red-800 font-body">{selectedConsultation.commentaire_rejet}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    );
  };

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
              {/* Signature */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(true)}
                  className="flex items-center space-x-2 px-3 lg:px-4 py-2 bg-mediai-secondary text-white rounded-lg hover:bg-mediai-dark transition-colors font-body text-sm lg:text-base"
                >
                  <MedicalIcon icon={ActionIcons.Edit} size="w-4 h-4" />
                  <span>Signature numérique</span>
                </button>
                
                {signature && (
                  <div className="flex items-center space-x-2 text-success">
                    <MedicalIcon icon={MedicalIcons.Check} size="w-4 h-4" />
                    <span className="text-sm font-body">Signé</span>
                  </div>
                )}
              </div>
              
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

  // Modal de signature numérique
  const renderSignatureModal = () => (
    showSignatureModal && (
      <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-border-light">
          <div className="bg-mediai-dark text-white p-6 rounded-t-2xl flex justify-between items-center">
            <h3 className="text-xl font-bold font-heading">Signature numérique</h3>
            <button 
              onClick={() => setShowSignatureModal(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-mediai-medium font-body mb-4">
              Dessinez votre signature dans l'espace ci-dessous :
            </p>
            
            <div className="border-2 border-dashed border-border-light rounded-xl p-4 bg-light">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                className="w-full border border-border-light rounded-lg bg-white cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={clearSignature}
                className="px-4 py-2 border border-border-light text-mediai-dark rounded-lg hover:bg-light transition-colors font-body"
                type="button"
              >
                Effacer
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-6 py-2 border border-border-light text-mediai-dark rounded-lg hover:bg-light transition-colors font-body"
                  type="button"
                >
                  Annuler
                </button>
                <button
                  onClick={saveSignature}
                  className="px-6 py-2 gradient-mediai text-white rounded-lg hover:shadow-lg transition-all duration-300 font-body"
                  type="button"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {activeView === 'list' && renderConsultationsList()}
      {activeView === 'detail' && renderConsultationDetails()}
      {activeView === 'form' && renderConsultationForm()}
      {renderSignatureModal()}
      {renderQuickValidateModal()}
      {renderQuickRejectModal()}

      {/* Nouvelles modals avec les composants dédiés */}
      <ConsultationMessaging
        ficheId={selectedFicheForAction?.id || selectedConsultation?.id || null}
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