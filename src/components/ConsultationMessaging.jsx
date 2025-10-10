import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { ficheMessagingService } from '../services/api';
import { ActionIcons } from './Icons';
import Button from './Button';

/**
 * Composant de messagerie pour les fiches de consultation
 * Permet la communication entre patients et médecins sur une fiche spécifique
 */
const ConsultationMessaging = ({ ficheId, isOpen, onClose }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Charger les messages au montage et quand la modal s'ouvre
  useEffect(() => {
    if (isOpen && ficheId) {
      loadMessages();
    }
  }, [isOpen, ficheId]);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Charger tous les messages de la fiche
   */
  const loadMessages = async () => {
    setLoading(true);
    try {
      const messagesData = await ficheMessagingService.getMessages(ficheId);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      
      // Gestion spécifique des erreurs
      if (error.response?.status === 403) {
        showError('Accès refusé', 'La consultation doit être validée pour accéder aux messages');
      } else if (error.response?.status === 404) {
        showError('Erreur', 'Consultation non trouvée');
      } else {
        showError('Erreur', error.message || 'Impossible de charger les messages');
      }
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Envoyer un nouveau message
   */
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    if (newMessage.length > 2000) {
      showError('Erreur', 'Le message ne peut dépasser 2000 caractères');
      return;
    }

    if (!ficheId) {
      showError('Erreur', 'ID de fiche manquant');
      return;
    }

    setSending(true);
    try {
      const messageData = await ficheMessagingService.addMessage(ficheId, newMessage.trim());
      
      // Ajouter le nouveau message à la liste
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      showSuccess('Succès', 'Message envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Gestion spécifique des erreurs
      let errorMsg = 'Erreur lors de l\'envoi du message';
      
      if (error.response?.status === 403) {
        errorMsg = 'Accès refusé. La consultation doit être validée pour envoyer des messages';
      } else if (error.response?.status === 404) {
        errorMsg = 'Consultation non trouvée';
      } else if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.content && Array.isArray(errorData.content)) {
          errorMsg = errorData.content[0];
        } else if (errorData.fiche && Array.isArray(errorData.fiche)) {
          errorMsg = `Erreur de fiche: ${errorData.fiche[0]}`;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      showError('Erreur', errorMsg);
    } finally {
      setSending(false);
    }
  };

  /**
   * Gérer l'envoi avec la touche Entrée
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * Faire défiler vers le bas de la conversation
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Formater la date d'un message
   */
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  /**
   * Obtenir la couleur selon le rôle de l'utilisateur
   */
  const getRoleColor = (role) => {
    switch (role) {
      case 'medecin':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'patient':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'administrator':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'profil':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'service':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  /**
   * Obtenir le libellé du rôle
   */
  const getRoleLabel = (role) => {
    switch (role) {
      case 'medecin':
        return 'Médecin';
      case 'patient':
        return 'Patient';
      case 'administrator':
        return 'Administrateur';
      case 'profil':
        return 'Professionnel';
      case 'service':
        return 'Service';
      default:
        return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Utilisateur';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-5/6 flex flex-col overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <ActionIcons.Message className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Messages de consultation
              </h3>
              <p className="text-sm text-gray-600">
                Fiche #{ficheId} • Communication médecin-patient
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full p-2"
          >
            <ActionIcons.Close className="w-6 h-6" />
          </Button>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 font-medium">Chargement des messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ActionIcons.Message className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">Aucun message</h4>
              <p className="text-sm">Soyez le premier à démarrer la conversation</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = (message.author === user.id) || (message.author?.id === user.id);
              const authorName = message.author?.first_name && message.author?.last_name 
                ? `${message.author.first_name} ${message.author.last_name}`
                : (message.author_username || 'Utilisateur');
              const authorRole = message.author?.role || 'utilisateur';
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    {!isOwnMessage ? (
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(authorRole)}`}>
                          {getRoleLabel(authorRole)}
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-800">
                          {authorName}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center mb-2 justify-end">
                        <span className="text-xs text-blue-100 font-medium">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatMessageDate(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={sending}
              />
              <div className="flex items-center justify-between mt-3">
                <span className={`text-sm ${
                  newMessage.length > 1800 ? 'text-red-500 font-medium' : 'text-gray-500'
                }`}>
                  {newMessage.length}/2000 caractères
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition-all duration-200"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <ActionIcons.Send className="w-5 h-5 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationMessaging;