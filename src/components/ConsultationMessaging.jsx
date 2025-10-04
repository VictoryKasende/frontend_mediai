import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { ficheMessagingService } from '../services/api';
import { ActionIcons, StatusIcons, MedicalIcons } from './Icons';
import Button from './Button';

/**
 * Composant de messagerie avancé pour les fiches de consultation
 * Permet la communication en temps réel entre patients et médecins
 * Avec auto-refresh, notifications, et indicateurs de statut
 */
const ConsultationMessaging = ({ ficheId, isOpen, onClose, autoRefresh = true, refreshInterval = 10000 }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Charger les messages au montage et quand la modal s'ouvre
  useEffect(() => {
    if (isOpen && ficheId) {
      loadMessages();
      setLastSeen(new Date());
      
      // Démarrer l'auto-refresh si activé
      if (autoRefresh) {
        startAutoRefresh();
      }
    }
    
    return () => {
      stopAutoRefresh();
    };
  }, [isOpen, ficheId, autoRefresh]);

  // Gestion du statut en ligne
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isOpen && ficheId && autoRefresh) {
        loadMessages();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      stopAutoRefresh();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOpen, ficheId, autoRefresh]);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
    
    // Compter les messages non lus
    const newUnreadCount = messages.filter(msg => 
      new Date(msg.created_at) > lastSeen && 
      msg.author?.id !== user.id
    ).length;
    setUnreadCount(newUnreadCount);
  }, [messages, lastSeen, user.id]);

  /**
   * Charger tous les messages de la fiche
   */
  const loadMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const messagesData = await ficheMessagingService.getMessages(ficheId);
      const newMessages = Array.isArray(messagesData) ? messagesData : [];
      
      // Vérifier s'il y a de nouveaux messages
      if (messages.length > 0 && newMessages.length > messages.length) {
        const newCount = newMessages.length - messages.length;
        showInfo('Nouveaux messages', `${newCount} nouveau${newCount > 1 ? 'x' : ''} message${newCount > 1 ? 's' : ''}`);
      }
      
      setMessages(newMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      if (!silent) {
        showError('Erreur', 'Impossible de charger les messages');
      }
      setMessages([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [ficheId, messages.length, showError, showInfo]);

  /**
   * Démarrer l'auto-refresh
   */
  const startAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      if (isOnline && document.visibilityState === 'visible') {
        loadMessages(true); // Refresh silencieux
      }
    }, refreshInterval);
  }, [isOnline, refreshInterval, loadMessages]);

  /**
   * Arrêter l'auto-refresh
   */
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  /**
   * Gérer l'indicateur de frappe
   */
  const handleTyping = useCallback((value) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
    }
    
    // Reset du timeout de frappe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, [isTyping]);

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

    if (!isOnline) {
      showError('Hors ligne', 'Impossible d\'envoyer le message sans connexion internet');
      return;
    }

    setSending(true);
    setIsTyping(false);
    
    const tempMessage = {
      id: 'temp-' + Date.now(),
      content: newMessage.trim(),
      author: user,
      created_at: new Date().toISOString(),
      status: 'sending'
    };
    
    // Ajouter le message temporaire pour un feedback immédiat
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    try {
      const messageData = await ficheMessagingService.addMessage(ficheId, newMessage.trim());
      
      // Remplacer le message temporaire par le vrai
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? { ...messageData, status: 'sent' } : msg
      ));
      
      showSuccess('Succès', 'Message envoyé avec succès');
      setLastSeen(new Date());
    } catch (error) {
      // Supprimer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(tempMessage.content); // Restaurer le texte
      
      console.error('Erreur lors de l\'envoi du message:', error);
      let errorMsg = 'Erreur lors de l\'envoi du message';
      
      if (error.response?.data) {
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
   * Marquer les messages comme lus
   */
  const markAsRead = useCallback(() => {
    setLastSeen(new Date());
    setUnreadCount(0);
  }, []);

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
            <div className="relative w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <ActionIcons.Message className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-gray-900">
                  Messages de consultation
                </h3>
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <StatusIcons.Success className="w-4 h-4" />
                      <span className="text-xs font-medium">En ligne</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <StatusIcons.Error className="w-4 h-4" />
                      <span className="text-xs font-medium">Hors ligne</span>
                    </div>
                  )}
                  {autoRefresh && isOnline && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">Auto-actualisation</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Fiche #{ficheId} • Communication médecin-patient
                {messages.length > 0 && (
                  <span className="ml-2">• {messages.length} message{messages.length > 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMessages()}
              disabled={loading}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <ActionIcons.Refresh className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full p-2"
            >
              <ActionIcons.Close className="w-6 h-6" />
            </Button>
          </div>
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
              const isNewMessage = new Date(message.created_at) > lastSeen;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isNewMessage ? 'animate-fadeIn' : ''}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm relative ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    } ${isNewMessage && !isOwnMessage ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
                  >
                    {!isOwnMessage ? (
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(authorRole)}`}>
                          {getRoleLabel(authorRole)}
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-800">
                          {authorName}
                        </span>
                        {isNewMessage && (
                          <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center mb-2 justify-end">
                        <span className="text-xs text-blue-100 font-medium">
                          {user.first_name} {user.last_name}
                        </span>
                        {message.status === 'sending' && (
                          <div className="ml-2 w-4 h-4 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatMessageDate(message.created_at)}
                      </p>
                      {isOwnMessage && message.status && (
                        <div className="flex items-center ml-2">
                          {message.status === 'sending' && (
                            <StatusIcons.Clock className="w-3 h-3 text-blue-200" />
                          )}
                          {message.status === 'sent' && (
                            <StatusIcons.Success className="w-3 h-3 text-blue-200" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="border-t border-gray-200 p-6 bg-white">
          {/* Indicateur de frappe */}
          {isTyping && (
            <div className="flex items-center space-x-2 mb-3 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              <span>Vous écrivez...</span>
            </div>
          )}
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={markAsRead}
                placeholder={isOnline ? "Tapez votre message... (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)" : "Hors ligne - Impossible d'envoyer des messages"}
                rows={3}
                maxLength={2000}
                className={`w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  isOnline 
                    ? 'border-gray-300 focus:ring-blue-500' 
                    : 'border-red-300 bg-red-50 cursor-not-allowed'
                }`}
                disabled={sending || !isOnline}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${
                    newMessage.length > 1800 ? 'text-red-500 font-medium' : 'text-gray-500'
                  }`}>
                    {newMessage.length}/2000 caractères
                  </span>
                  {!isOnline && (
                    <div className="flex items-center space-x-2 text-red-500">
                      <StatusIcons.Warning className="w-4 h-4" />
                      <span className="text-sm font-medium">Aucune connexion</span>
                    </div>
                  )}
                </div>
                {autoRefresh && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs">Actualisation auto toutes les {refreshInterval/1000}s</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending || !isOnline}
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