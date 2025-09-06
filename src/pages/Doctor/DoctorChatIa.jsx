import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import api, { iaService } from '../../services/api';

/**
 * Page Chat IA Médecin - Interface similaire à ChatGPT avec API réelle
 */
const DoctorChatIa = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingConversation, setEditingConversation] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Pour forcer la mise à jour
  
  // États pour les modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedConversationForAction, setSelectedConversationForAction] = useState(null);
  const [tempEditName, setTempEditName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Fonction helper pour les notifications
  const showNotification = (message, type = 'info') => {
    switch (type) {
      case 'success':
        return showSuccess(message);
      case 'error':
        return showError(message);
      case 'warning':
        return showWarning(message);
      case 'info':
      default:
        return showInfo(message);
    }
  };

  // Charger les conversations au montage du composant
  useEffect(() => {
    loadConversations();
  }, []);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize de la textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Reset la hauteur pour recalculer correctement
      textarea.style.height = 'auto';
      // Applique la nouvelle hauteur basée sur le contenu
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = newHeight + 'px';
      
      // Gère le scroll si le contenu dépasse
      if (textarea.scrollHeight > 200) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [newMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Charger les conversations depuis l'API
  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await api.get('/conversations/');
      
      // Gérer les réponses paginées et directes
      const conversationsData = response.data.results || response.data;
      
      if (Array.isArray(conversationsData)) {
        // Utiliser les vraies données de l'API
        const enrichedConversations = await Promise.all(
          conversationsData.map(async (conversation) => {
            // Charger les messages pour calculer le bon comptage
            let visibleMessagesCount = 0;
            try {
              const messagesResponse = await api.get(`/conversations/${conversation.id}/messages/`);
              const messages = messagesResponse.data.results || messagesResponse.data;
              
              if (Array.isArray(messages)) {
                // Compter seulement les messages user et synthese
                visibleMessagesCount = messages.filter(msg => 
                  msg.role === 'user' || msg.role === 'synthese'
                ).length;
              }
            } catch (error) {
              console.error(`Erreur lors du chargement des messages pour la conversation ${conversation.id}:`, error);
            }
            
            return {
              ...conversation,
              title: conversation.titre || `Conversation du ${new Date(conversation.created_at).toLocaleDateString('fr-FR')}`,
              last_message: conversation.first_message || 'Aucun message',
              updated_at: conversation.updated_at || conversation.created_at,
              visibleMessagesCount // Ajouter le comptage filtré
            };
          })
        );
        
        setConversations(enrichedConversations);
        
        // Sélectionner la première conversation si disponible
        if (enrichedConversations.length > 0) {
          setSelectedConversation(enrichedConversations[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      showNotification('Erreur lors du chargement des conversations', 'error');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Fonction utilitaire pour générer un titre par défaut
  const generateConversationTitle = (conversation) => {
    const date = new Date(conversation.created_at);
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `Conversation ${dateStr} ${timeStr}`;
  };

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages/`);
      
      // Gérer les réponses paginées et directes
      const messagesData = response.data.results || response.data;
      
      if (Array.isArray(messagesData) && messagesData.length > 0) {
        // Transformer les messages pour correspondre au format UI
        const formattedMessages = messagesData.map(message => ({
          id: message.id,
          sender: message.role === 'user' ? 'user' : 'assistant',
          content: message.content || '',
          timestamp: new Date(message.timestamp),
          type: 'text',
          role: message.role // Garder le rôle original pour le filtrage
        }));
        
        // Filtrer pour ne garder que les messages utilisateur et les messages de synthèse
        const filteredMessages = formattedMessages.filter(message => 
          message.role === 'user' || message.role === 'synthese'
        );
        
        // Supprimer les doublons basés sur l'ID et le contenu
        const uniqueMessages = filteredMessages.filter((message, index, self) =>
          index === self.findIndex(m => m.id === message.id || 
            (m.content === message.content && m.sender === message.sender))
        );
        
        // Trier par timestamp pour garantir l'ordre chronologique
        uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        setMessages(uniqueMessages);
      } else {
        // Aucun message dans la conversation
        setMessages([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      
      // En cas d'erreur de chargement, ne pas afficher de message d'accueil
      // L'utilisateur verra "Aucun message" qui est plus approprié
      setMessages([]);
    }
  };

  // Créer une nouvelle conversation
  const createNewConversation = async () => {
    try {
      showNotification('Création d\'une nouvelle conversation...', 'info');
      
      const response = await api.post('/conversations/', {
        fiche: null // Optionnel, pas de fiche de consultation liée
      });
      
      const newConversation = {
        ...response.data,
        title: generateConversationTitle(response.data),
        last_message: 'Aucun message'
      };
      
      // Mettre à jour la liste des conversations
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      
      // Créer le message d'accueil initial
      const welcomeMessage = {
        id: Date.now(),
        sender: 'assistant',
        content: 'Bonjour ! Je suis votre assistant médical IA. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages([welcomeMessage]);
      
      showNotification('Nouvelle conversation créée avec succès', 'success');
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      showNotification('Erreur lors de la création de la conversation', 'error');
      
      // Fallback en cas d'erreur
      const newConversation = {
        id: Date.now(),
        title: 'Nouvelle conversation',
        user: user?.id,
        fiche: null,
        created_at: new Date().toISOString(),
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setMessages([{
        id: 1,
        sender: 'assistant',
        content: 'Bonjour ! Je suis votre assistant médical IA. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date(),
        type: 'text'
      }]);
      
      showNotification('Conversation créée en mode hors-ligne', 'warning');
    }
  };

  // Sélectionner une conversation
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Charger immédiatement les messages de la conversation sélectionnée
    loadMessages(conversation.id);
  };

  // Supprimer une conversation
  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    
    const conversation = conversations.find(conv => conv.id === conversationId);
    setSelectedConversationForAction(conversation);
    setShowDeleteModal(true);
  };

  const confirmDeleteConversation = async () => {
    const conversationId = selectedConversationForAction?.id;
    const conversationName = selectedConversationForAction?.titre || selectedConversationForAction?.nom || 'Sans nom';
    
    try {
      // Fermer la modale immédiatement
      setShowDeleteModal(false);
      
      // Toast de chargement
      showNotification('Suppression en cours...', 'info');
      
      await api.delete(`/conversations/${conversationId}/`);
      
      // Mettre à jour l'état local
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (selectedConversation?.id === conversationId) {
        const remaining = conversations.filter(conv => conv.id !== conversationId);
        if (remaining.length > 0) {
          selectConversation(remaining[0]);
        } else {
          setSelectedConversation(null);
          setMessages([]);
        }
      }
      
      // Toast de succès avec le nom de la conversation
      showNotification(`Conversation "${conversationName}" supprimée avec succès`, 'success');
      
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      showNotification('Erreur lors de la suppression de la conversation', 'error');
      
      // Rouvrir la modale en cas d'erreur
      setShowDeleteModal(true);
    } finally {
      setSelectedConversationForAction(null);
    }
  };

  // Éditer le nom d'une conversation
  const startEditingConversationName = (conversation, e) => {
    e.stopPropagation();
    setSelectedConversationForAction(conversation);
    setTempEditName(conversation.nom || '');
    setShowEditModal(true);
  };

  const confirmEditConversationName = async () => {
    const conversationId = selectedConversationForAction?.id;
    
    if (!conversationId) {
      showNotification('Aucune conversation sélectionnée', 'error');
      return;
    }
    
    if (!tempEditName.trim()) {
      showNotification('Le nom ne peut pas être vide', 'error');
      return;
    }

    const newName = tempEditName.trim();
    
    try {
      // Fermer la modale immédiatement pour un feedback rapide
      setShowEditModal(false);
      
      // Afficher un toast de chargement
      showNotification('Modification en cours...', 'info');
      
      const response = await api.patch(`/conversations/${conversationId}/`, { 
        nom: newName 
      });
      
      const updatedNom = response.data.nom || newName;
      
      // Mise à jour immédiate et forcée de l'état
      setConversations(prevConversations => {
        const updated = prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              nom: updatedNom,
              titre: updatedNom, // Assurer que titre est aussi mis à jour
              title: updatedNom   // Pour l'affichage local
            };
          }
          return conv;
        });
        return updated;
      });
      
      // Mettre à jour aussi la conversation sélectionnée si c'est la même
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => ({
          ...prev,
          nom: updatedNom,
          titre: updatedNom, // Assurer que titre est aussi mis à jour
          title: updatedNom   // Pour l'affichage local
        }));
      }
      
      // Force un refresh complet de l'interface avec une nouvelle clé
      setRefreshKey(prev => prev + 1);
      
      // Forcer un re-render immédiat de la liste des conversations
      setTimeout(() => {
        setConversations(prevConversations => [...prevConversations]);
      }, 100);
      
      // Toast de succès
      showNotification('Nom de la conversation modifié avec succès', 'success');
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du nom:', error);
      showNotification('Erreur lors de la modification du nom', 'error');
      
      // Rouvrir la modale en cas d'erreur
      setShowEditModal(true);
    } finally {
      // Nettoyer les états
      setSelectedConversationForAction(null);
      setTempEditName('');
    }
  };

  // Partager une conversation
  const shareConversation = (conversation, e) => {
    e.stopPropagation();
    setSelectedConversationForAction(conversation);
    setShowShareModal(true);
  };

  const confirmShareConversation = async () => {
    const conversation = selectedConversationForAction;
    const conversationName = conversation?.titre || conversation?.nom || 'Conversation médicale';
    
    try {
      // Fermer la modale immédiatement
      setShowShareModal(false);
      
      if (navigator.share) {
        await navigator.share({
          title: `Conversation: ${conversationName}`,
          text: `Partage de la conversation médicale: ${conversationName}`,
          url: window.location.href
        });
        showNotification(`Conversation "${conversationName}" partagée avec succès`, 'success');
      } else {
        // Fallback: copier le lien dans le presse-papiers
        await navigator.clipboard.writeText(window.location.href);
        showNotification('Lien de la conversation copié dans le presse-papiers !', 'success');
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      if (error.name !== 'AbortError') { // L'utilisateur a annulé le partage
        showNotification('Impossible de partager la conversation', 'error');
        // Rouvrir la modale en cas d'erreur (sauf si annulation)
        setShowShareModal(true);
      } else {
        // L'utilisateur a annulé le partage
        showNotification('Partage annulé', 'info');
      }
    } finally {
      if (!showShareModal) { // Ne nettoyer que si la modale est fermée
        setSelectedConversationForAction(null);
      }
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    // Ajouter le message utilisateur immédiatement
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    try {
      // 1. Ajouter le message utilisateur à la conversation
      await api.post(`/conversations/${selectedConversation.id}/messages/`, {
        content: messageToSend
      });

      // 2. Démarrer l'analyse IA
      const analyseResponse = await iaService.startAnalyse({
        symptomes: messageToSend,
        conversation_id: selectedConversation.id
      });
      
      // 3. Vérifier si déjà en cache ou obtenir le cache_key
      if (analyseResponse.already_cached && analyseResponse.status === 'done') {
        // Résultat déjà disponible
        const assistantResponse = {
          id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sender: 'assistant',
          content: analyseResponse.response,
          timestamp: new Date(),
          type: 'text',
          role: 'synthese' // Marquer comme message de synthèse
        };

        addUniqueMessage(assistantResponse);
        
        // Mettre à jour la conversation dans la liste
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { 
                  ...conv, 
                  last_message: assistantResponse.content.substring(0, 100),
                  updated_at: assistantResponse.timestamp.toISOString()
                }
              : conv
          )
        );
        
        // Mettre à jour la conversation dans la liste
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { 
                  ...conv, 
                  last_message: assistantResponse.content.substring(0, 100),
                  updated_at: assistantResponse.timestamp.toISOString()
                }
              : conv
          )
        );
      } else {
        // 4. Attendre et récupérer le résultat
        const cacheKey = analyseResponse.cache_key;
        const taskId = analyseResponse.task_id;
        
        // Polling pour vérifier le statut si on a un task_id
        if (taskId) {
          await pollTaskStatus(taskId, cacheKey);
        } else {
          // Polling direct sur le résultat avec cache_key
          await pollAnalysisResult(cacheKey);
        }
      }
      
      // Mettre à jour le titre de la conversation si c'est le premier message
      if ((selectedConversation.title === 'Nouvelle conversation' || !selectedConversation.title) && messages.length <= 1) {
        const newTitle = messageToSend.length > 50 
          ? messageToSend.substring(0, 50) + '...'
          : messageToSend;
        
        // Mise à jour locale du titre (l'API ne supporte pas cette fonctionnalité)
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, title: newTitle }
              : conv
          )
        );
        
        setSelectedConversation(prev => ({ ...prev, title: newTitle }));
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Message d'erreur adapté selon le type d'erreur
      let errorContent = 'Désolé, une erreur s\'est produite lors de l\'analyse. Veuillez réessayer.';
      
      if (error.message && error.message.includes('Délai d\'attente dépassé')) {
        errorContent = '⏳ L\'analyse prend plus de temps que prévu. Votre demande est en cours de traitement, veuillez actualiser la page dans quelques instants pour voir le résultat.';
      } else if (error.message && error.message.includes('Impossible de récupérer')) {
        errorContent = '⏳ L\'analyse est en cours de traitement. Veuillez actualiser la page dans quelques instants pour voir le résultat.';
      }
      
      const errorMessage = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        type: 'text'
      };

      addUniqueMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour éviter les doublons de messages
  const addUniqueMessage = (newMessage) => {
    setMessages(prev => {
      // Vérifier si un message similaire existe déjà
      const messageExists = prev.some(msg => 
        (msg.id === newMessage.id) || 
        (msg.content === newMessage.content && msg.sender === newMessage.sender && 
         Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 5000) // 5 secondes de tolérance
      );
      
      if (messageExists) {
        return prev;
      }
      
      return [...prev, newMessage];
    });
  };

  // Fonction pour surveiller le statut d'une tâche Celery
  const pollTaskStatus = async (taskId, cacheKey, maxAttempts = 60) => { // Augmenté à 60 tentatives (4 minutes)
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const statusResponse = await iaService.getTaskStatus(taskId);
        
        if (statusResponse.state === 'SUCCESS') {
          // Tâche terminée, récupérer le résultat directement
          const resultResponse = await iaService.getAnalyseResult(cacheKey);
          
          if (resultResponse.status === 'done' && resultResponse.response) {
            
            // Ajouter uniquement le message final
            const assistantResponse = {
              id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              sender: 'assistant',
              content: resultResponse.response,
              timestamp: new Date(),
              type: 'text',
              role: 'synthese' // Marquer comme message de synthèse
            };

            addUniqueMessage(assistantResponse);
            
            // Mettre à jour la conversation dans la liste
            setConversations(prev => 
              prev.map(conv => 
                conv.id === selectedConversation.id 
                  ? { 
                      ...conv, 
                      last_message: assistantResponse.content.substring(0, 100),
                      updated_at: assistantResponse.timestamp.toISOString()
                    }
                  : conv
              )
            );
          }
          return;
        } else if (statusResponse.state === 'FAILURE') {
          console.error('❌ Échec de l\'analyse IA');
          throw new Error('Échec de l\'analyse IA');
        } else if (statusResponse.state === 'PENDING' || statusResponse.state === 'PROGRESS') {
          // Analyse en cours, continuer le polling
        }
        
        // Attendre 4 secondes avant la prochaine vérification (augmenté)
        await new Promise(resolve => setTimeout(resolve, 4000));
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        
        // Ne pas abandonner immédiatement en cas d'erreur réseau
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        break;
      }
    }
    
    // Timeout ou erreur
    console.error('❌ Délai d\'attente dépassé pour l\'analyse IA');
    throw new Error('Délai d\'attente dépassé pour l\'analyse IA. L\'analyse peut prendre plus de temps que prévu, veuillez actualiser la page dans quelques instants.');
  };

  // Fonction pour récupérer le résultat d'analyse (polling direct)
  const pollAnalysisResult = async (cacheKey, maxAttempts = 30) => { // Augmenté à 30 tentatives (2.5 minutes)
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const resultResponse = await iaService.getAnalyseResult(cacheKey);
        
        if (resultResponse.status === 'done' && resultResponse.response) {
          // Résultat disponible - ajouter le message de l'assistant
          const assistantResponse = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender: 'assistant',
            content: resultResponse.response,
            timestamp: new Date(),
            type: 'text',
            role: 'synthese' // Marquer comme message de synthèse
          };

          addUniqueMessage(assistantResponse);
          
          // Mettre à jour la conversation dans la liste
          setConversations(prev => 
            prev.map(conv => 
              conv.id === selectedConversation.id 
                ? { 
                    ...conv, 
                    last_message: assistantResponse.content.substring(0, 100),
                    updated_at: assistantResponse.timestamp.toISOString()
                  }
                : conv
            )
          );
          
          return;
        } else if (resultResponse.status === 'processing') {
          // Analyse encore en cours
        } else if (resultResponse.status === 'error') {
          console.error('❌ Erreur lors de l\'analyse IA');
          throw new Error('Erreur lors de l\'analyse IA');
        }
        
        // Attendre 5 secondes avant la prochaine vérification (augmenté)
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Erreur lors de la récupération du résultat:', error);
        
        // Ne pas abandonner immédiatement en cas d'erreur réseau
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 6000));
          continue;
        }
        break;
      }
    }
    
    // Timeout ou erreur
    console.error('❌ Impossible de récupérer le résultat de l\'analyse IA');
    throw new Error('Impossible de récupérer le résultat de l\'analyse IA. L\'analyse peut prendre plus de temps que prévu, veuillez actualiser la page dans quelques instants.');
  };

  // Formater l'heure pour les messages
  const formatMessageTime = (timestamp) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  // Formater la date pour les conversations
  const formatConversationTime = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return formatMessageTime(date);
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  // Obtenir l'icône selon le type de conversation
  const getConversationIcon = (conversation) => {
    if (conversation.fiche) {
      return MedicalIcons.Report; // Conversation liée à une fiche
    }
    return NavigationIcons.Chat; // Conversation libre
  };

  // Filtrer les conversations selon la recherche
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      conversation.title?.toLowerCase().includes(query) ||
      conversation.last_message?.toLowerCase().includes(query) ||
      conversation.user?.toString().includes(query)
    );
  });

  // Ouvrir le modal pour importer des photos
  const openPhotoModal = () => {
    setShowPhotoModal(true);
  };

  // Gérer la sélection de fichiers
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      showNotification('Seules les images sont acceptées', 'warning');
    }
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  // Supprimer un fichier sélectionné
  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Confirmer l'envoi des photos
  const confirmSendPhotos = () => {
    if (selectedFiles.length === 0) {
      showNotification('Veuillez sélectionner au moins une image', 'warning');
      return;
    }

    // TODO: Implémenter l'envoi des photos à l'API
    // Pour l'instant, on simule l'envoi
    const photoMessage = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      content: `${selectedFiles.length} image(s) envoyée(s)`,
      timestamp: new Date(),
      type: 'photos',
      files: selectedFiles
    };

    setMessages(prev => [...prev, photoMessage]);
    setSelectedFiles([]);
    setShowPhotoModal(false);
    
    showNotification(`${selectedFiles.length} image(s) envoyée(s) avec succès`, 'success');
  };

  // Copier le contenu d'un message
  const copyMessageContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      showNotification('Message copié dans le presse-papiers !', 'success');
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      showNotification('Impossible de copier le message', 'error');
    }
  };

  // Composant Message
  const Message = ({ message }) => {
    const isUser = message.sender === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center mr-3 flex-shrink-0">
            <Icon icon={MedicalIcons.AI} size="w-4 h-4" className="text-white" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? 'ml-auto' : ''}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-mediai-primary text-white rounded-br-md' 
              : 'bg-surface-background text-content-primary rounded-bl-md border border-border-primary'
          }`}>
            {isUser ? (
              <p className="text-base font-body leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <div className="relative group">
                <MarkdownRenderer 
                  content={message.content} 
                  className="text-base font-body leading-relaxed"
                />
                {/* Icône de copie pour les messages de l'assistant */}
                <button
                  onClick={() => copyMessageContent(message.content)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 bg-white/90 hover:bg-white border border-border-primary rounded-md shadow-sm"
                  title="Copier le message"
                >
                  <Icon icon={ActionIcons.Copy} size="w-3.5 h-3.5" className="text-content-secondary hover:text-mediai-primary transition-colors" />
                </button>
              </div>
            )}
          </div>
          
          <p className={`text-xs mt-2 font-body-medium ${
            isUser ? 'text-right text-content-secondary' : 'text-left text-content-tertiary'
          }`}>
            {formatMessageTime(message.timestamp)}
          </p>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-mediai-primary/10 flex items-center justify-center ml-3 flex-shrink-0">
            <span className="text-sm font-medium text-mediai-primary">
              {user?.nom?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-surface-background font-body">
      {/* Sidebar - Historique des conversations */}
      <div className={`${sidebarCollapsed ? 'w-12 sm:w-16' : 'w-56 sm:w-64'} bg-white border-r border-border-primary flex flex-col transition-all duration-300 ${sidebarCollapsed ? '' : 'hidden sm:flex'}`}>
        {/* Header de la sidebar */}
        <div className="p-2 sm:p-3 border-b border-border-primary">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-base sm:text-lg font-heading font-semibold text-content-primary">
                Conversations
              </h1>
            )}
            
            <div className={`flex items-center space-x-2 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              {!sidebarCollapsed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={createNewConversation}
                  className="flex items-center justify-center"
                  title="Nouvelle conversation"
                >
                  <Icon icon={ActionIcons.Add} size="w-4 h-4" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? 'Développer' : 'Réduire'}
                className="flex-shrink-0"
              >
                <Icon icon={sidebarCollapsed ? NavigationIcons.ChevronRight : NavigationIcons.ChevronLeft} size="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Barre de recherche */}
        {!sidebarCollapsed && (
          <div className="p-3 border-b border-border-primary">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-4 py-1.5 text-sm border border-border-primary rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-transparent font-body text-content-primary placeholder-content-tertiary bg-white"
              />
              <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                <Icon icon={ActionIcons.Search} size="w-3.5 h-3.5" className="text-content-tertiary" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-content-tertiary hover:text-content-primary"
                  title="Effacer la recherche"
                >
                  <Icon icon={ActionIcons.Close} size="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {sidebarCollapsed && (
            <div className="p-2 border-b border-border-primary">
              <Button
                size="sm"
                variant="outline"
                onClick={createNewConversation}
                className="w-full flex items-center justify-center"
                title="Nouvelle conversation"
              >
                <Icon icon={ActionIcons.Add} size="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {isLoadingConversations ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-mediai-primary border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-content-secondary font-body">
                Chargement des conversations...
              </p>
            </div>
          ) : filteredConversations.length === 0 && searchQuery ? (
            <div className="p-6 text-center">
              <Icon icon={ActionIcons.Search} size="w-8 h-8" className="text-content-tertiary mx-auto mb-3" />
              <p className="text-sm text-content-secondary font-body">
                Aucune conversation trouvée pour "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-mediai-primary hover:text-mediai-primary/80 font-body-medium"
              >
                Effacer la recherche
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center">
              <Icon icon={NavigationIcons.Chat} size="w-8 h-8" className="text-content-tertiary mx-auto mb-3" />
              <p className="text-sm text-content-secondary font-body mb-4">
                Aucune conversation pour le moment
              </p>
              <Button
                size="sm"
                onClick={createNewConversation}
                className="w-full"
              >
                <Icon icon={ActionIcons.Add} size="w-4 h-4 mr-2" />
                Créer une conversation
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
            <div
              key={`conv-${conversation.id}-${refreshKey}-${conversation.nom || ''}`}
              onClick={() => selectConversation(conversation)}
              className={`p-3 cursor-pointer border-b border-border-primary hover:bg-surface-muted transition-all duration-200 group relative ${
                selectedConversation?.id === conversation.id 
                  ? 'bg-mediai-primary/10 border-r-4 border-r-mediai-primary shadow-sm' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  selectedConversation?.id === conversation.id 
                    ? 'bg-mediai-primary text-white shadow-sm' 
                    : 'bg-mediai-primary/10 text-mediai-primary'
                }`}>
                  <Icon icon={getConversationIcon(conversation)} size="w-3.5 h-3.5" className={
                    selectedConversation?.id === conversation.id 
                      ? 'text-white' 
                      : 'text-mediai-primary'
                  } />
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 pr-6"> {/* Espace réservé pour les boutons - minimal */}
                    <div className="w-full">
                      <h3 className={`text-sm font-medium font-heading transition-colors duration-200 truncate ${
                        selectedConversation?.id === conversation.id 
                          ? 'text-mediai-primary font-semibold' 
                          : 'text-content-primary'
                      }`} title={conversation.nom || conversation.titre || generateConversationTitle(conversation)}>
                        {/* Priorité : nom modifié, puis titre, puis titre généré */}
                        {conversation.nom || conversation.titre || generateConversationTitle(conversation)}
                      </h3>
                    </div>
                    
                    <p className="text-xs text-content-secondary truncate mt-1 font-body" title={conversation.first_message || conversation.last_message || 'Aucun message'}>
                      {conversation.first_message || conversation.last_message || 'Aucun message'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-content-tertiary font-body-medium">
                        {formatConversationTime(conversation.updated_at || conversation.created_at)}
                      </span>
                      
                      {(() => {
                        // Utiliser le comptage pré-calculé ou calculer à la volée
                        const visibleMessagesCount = conversation.visibleMessagesCount || 
                          conversation.messages?.filter(msg => 
                            msg.role === 'user' || msg.role === 'synthese'
                          ).length || 0;
                        
                        return visibleMessagesCount > 0 && (
                          <span className="text-xs bg-mediai-primary/10 text-mediai-primary px-2 py-0.5 rounded-full font-body-medium">
                            {visibleMessagesCount}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Boutons d'actions en position absolue pour éviter le scroll horizontal */}
              <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 rounded-lg p-1 shadow-sm">
                <button
                  onClick={(e) => startEditingConversationName(conversation, e)}
                  className="text-content-tertiary hover:text-mediai-primary transition-all p-1.5 rounded-md hover:bg-white"
                  title="Éditer le nom"
                >
                  <Icon icon={ActionIcons.Edit} size="w-3.5 h-3.5" />
                </button>
                
                <button
                  onClick={(e) => shareConversation(conversation, e)}
                  className="text-content-tertiary hover:text-mediai-primary transition-all p-1.5 rounded-md hover:bg-white"
                  title="Partager la conversation"
                >
                  <Icon icon={ActionIcons.Share} size="w-3.5 h-3.5" />
                </button>
                
                <button
                  onClick={(e) => deleteConversation(conversation.id, e)}
                  className="text-content-tertiary hover:text-danger transition-all p-1.5 rounded-md hover:bg-white"
                  title="Supprimer la conversation"
                >
                  <Icon icon={ActionIcons.Delete} size="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
          )}
        </div>
        
        {/* User info en bas */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-border-primary bg-surface-muted">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-mediai-primary flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-content-primary truncate font-body">
                  {user?.first_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-content-secondary font-body">
                  {user?.role || 'Patient'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header du chat */}
            <div className="p-2 sm:p-3 border-b border-border-primary bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* Bouton pour afficher sidebar sur mobile */}
                  <button 
                    className="sm:hidden p-1.5 text-content-secondary hover:text-content-primary transition-colors"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    <Icon icon={NavigationIcons.Menu} size="w-4 h-4" />
                  </button>
                  
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Icon icon={MedicalIcons.AI} size="w-3 h-3 sm:w-3.5 sm:h-3.5" className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-heading font-semibold text-content-primary">
                      Assistant Médical IA
                    </h2>
                    <p className="text-xs text-success font-body-medium flex items-center">
                      <span className="w-1 h-1 bg-success rounded-full mr-1"></span>
                      En ligne
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-surface-background">
              <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                {messages.length === 0 ? (
                  /* État vide - Aucun message avec suggestions */
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary/10 flex items-center justify-center mb-4">
                      <Icon icon={MedicalIcons.AI} size="w-8 h-8" className="text-mediai-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-content-primary mb-2">
                      Conversation vide
                    </h3>
                    <p className="text-base text-content-secondary font-body max-w-sm mb-6">
                      Commencez la conversation en tapant votre message ci-dessous ou en sélectionnant une suggestion.
                    </p>
                    
                    {/* Suggestions de démarrage */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                      {[
                        {
                          icon: MedicalIcons.Stethoscope,
                          title: "Analyse de symptômes",
                          description: "J'ai des symptômes que j'aimerais analyser",
                          message: "J'ai des symptômes que j'aimerais analyser. Pouvez-vous m'aider ?"
                        },
                        {
                          icon: MedicalIcons.Report,
                          title: "Interprétation d'examens",
                          description: "Aide pour interpréter des résultats médicaux",
                          message: "J'ai des résultats d'examens médicaux que j'aimerais comprendre"
                        },
                        {
                          icon: MedicalIcons.Pills,
                          title: "Information sur médicaments",
                          description: "Questions sur les traitements",
                          message: "J'ai des questions concernant un traitement médical"
                        },
                        {
                          icon: MedicalIcons.Heart,
                          title: "Conseil médical général",
                          description: "Demande de conseil de santé",
                          message: "J'aimerais avoir un conseil médical général"
                        }
                      ].map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setNewMessage(suggestion.message)}
                          className="p-4 text-left border border-border-primary rounded-xl hover:border-mediai-primary hover:bg-mediai-primary/5 transition-all group"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-mediai-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-mediai-primary/20 transition-colors">
                              <Icon icon={suggestion.icon} size="w-4 h-4" className="text-mediai-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-heading font-medium text-content-primary mb-1">
                                {suggestion.title}
                              </h4>
                              <p className="text-xs text-content-secondary font-body leading-relaxed">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Messages existants */
                  messages.map((message) => (
                    <Message key={message.id} message={message} />
                  ))
                )}
                
                {/* Indicateur de frappe */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <Icon icon={MedicalIcons.AI} size="w-3 h-3 sm:w-4 sm:h-4" className="text-white" />
                    </div>
                    <div className="bg-white border border-border-primary rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center space-x-3">
                        {/* Animation des trois points qui nagent */}
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-mediai-primary rounded-full loading-dot-1"></div>
                          <div className="w-2 h-2 bg-mediai-primary rounded-full loading-dot-2"></div>
                          <div className="w-2 h-2 bg-mediai-primary rounded-full loading-dot-3"></div>
                        </div>
                        <span className="text-sm text-mediai-primary font-body-medium">
                          Analyse médicale en cours
                        </span>
                      </div>
                      
                      {/* Barre de progression animée */}
                      <div className="mt-2 w-full bg-surface-muted rounded-full h-1">
                        <div className="bg-gradient-to-r from-mediai-primary to-mediai-primary/70 h-1 rounded-full loading-bar"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-border-primary bg-white">
              <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSendMessage} className="relative">
                  <div className="flex items-end bg-surface-background border border-border-primary rounded-2xl p-2 focus-within:border-mediai-primary transition-colors">
                    {/* Icône plus à gauche */}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={openPhotoModal}
                      title="Importer des images"
                      className="text-content-tertiary hover:text-mediai-primary p-2 mr-2 flex-shrink-0"
                    >
                      <Icon icon={ActionIcons.Add} size="w-5 h-5" />
                    </Button>
                    
                    {/* Zone de texte qui s'agrandit automatiquement */}
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          // Auto-resize immédiat
                          const textarea = e.target;
                          textarea.style.height = 'auto';
                          textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Message Assistant Médical IA..."
                        disabled={isLoading}
                        rows={1}
                        className="w-full py-3 px-0 border-none resize-none focus:ring-0 focus:outline-none font-body text-content-primary placeholder-content-tertiary bg-transparent text-base leading-6"
                        style={{ 
                          minHeight: '24px',
                          maxHeight: '200px'
                        }}
                      />
                    </div>
                    
                    {/* Icône d'envoi à droite */}
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || isLoading}
                      size="sm"
                      className={`ml-2 p-2 rounded-lg flex-shrink-0 transition-all ${
                        newMessage.trim() && !isLoading
                          ? 'bg-mediai-primary hover:bg-mediai-primary/90 text-white' 
                          : 'bg-surface-muted text-content-tertiary cursor-not-allowed'
                      }`}
                      title="Envoyer le message"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Icon icon={ActionIcons.Send} size="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Texte d'information en bas */}
                  <p className="text-xs text-content-tertiary text-center mt-2">
                    L'IA peut commettre des erreurs. Vérifiez les informations importantes.
                  </p>
                </form>
              </div>
            </div>
          </>
        ) : (
          /* État vide - Aucune conversation sélectionnée */
          <div className="flex-1 flex items-center justify-center bg-surface-background">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                <Icon icon={MedicalIcons.AI} size="w-8 h-8" className="text-white" />
              </div>
              
              <h2 className="text-xl font-heading font-semibold text-content-primary mb-3">
                Assistant Médical IA
              </h2>
              
              <p className="text-sm text-content-secondary font-body mb-4 leading-relaxed">
                Bienvenue ! Je suis votre assistant médical personnel. 
                Créez une nouvelle conversation pour commencer à discuter de vos questions de santé.
              </p>
              
              <Button onClick={createNewConversation} className="w-full">
                <Icon icon={ActionIcons.Add} size="w-5 h-5" className="mr-2" />
                Commencer une conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modales de confirmation */}
      {/* Modale de suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedConversationForAction(null);
        }}
        onConfirm={confirmDeleteConversation}
        title="Supprimer la conversation"
        message={`Êtes-vous sûr de vouloir supprimer la conversation "${selectedConversationForAction?.titre || selectedConversationForAction?.nom || 'Sans nom'}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      {/* Modale d'édition */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedConversationForAction(null);
          setTempEditName('');
        }}
        title="Modifier le nom de la conversation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-content-primary mb-2">
              Nouveau nom de la conversation
            </label>
            <Input
              value={tempEditName}
              onChange={(e) => setTempEditName(e.target.value)}
              placeholder="Entrez le nouveau nom..."
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedConversationForAction(null);
                setTempEditName('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmEditConversationName}
              disabled={!tempEditName.trim()}
            >
              Modifier
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modale de partage */}
      <ConfirmModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedConversationForAction(null);
        }}
        onConfirm={confirmShareConversation}
        title="Partager la conversation"
        message={`Voulez-vous partager la conversation "${selectedConversationForAction?.titre || selectedConversationForAction?.nom || 'Sans nom'}" ?`}
        confirmText="Partager"
        cancelText="Annuler"
        variant="primary"
      />

      {/* Modale d'import d'images */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => {
          setShowPhotoModal(false);
          setSelectedFiles([]);
        }}
        title="Importer des images"
      >
        <div className="space-y-4">
          {/* Zone de glisser-déposer */}
          <div className="border-2 border-dashed border-border-primary rounded-lg p-6 text-center hover:border-mediai-primary transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer block"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-mediai-primary/10 rounded-full flex items-center justify-center">
                <Icon icon={ActionIcons.Upload} size="w-6 h-6" className="text-mediai-primary" />
              </div>
              <p className="text-base font-medium text-content-primary mb-2">
                Cliquez pour sélectionner des images
              </p>
              <p className="text-sm text-content-secondary">
                ou glissez-déposez vos fichiers ici
              </p>
              <p className="text-xs text-content-tertiary mt-2">
                Formats acceptés : JPG, PNG, GIF (max 10MB par image)
              </p>
            </label>
          </div>

          {/* Liste des fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-content-primary">
                Images sélectionnées ({selectedFiles.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-surface-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-mediai-primary/10 rounded-lg flex items-center justify-center">
                        <Icon icon={ActionIcons.Upload} size="w-5 h-5" className="text-mediai-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-content-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-content-secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="text-content-tertiary hover:text-danger transition-colors p-1"
                      title="Supprimer"
                    >
                      <Icon icon={ActionIcons.Close} size="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border-primary">
            <Button
              variant="outline"
              onClick={() => {
                setShowPhotoModal(false);
                setSelectedFiles([]);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmSendPhotos}
              disabled={selectedFiles.length === 0}
              className="flex items-center space-x-2"
            >
              <Icon icon={ActionIcons.Send} size="w-4 h-4" />
              <span>Envoyer {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorChatIa;