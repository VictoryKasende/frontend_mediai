import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';

/**
 * Page Chat IA Médecin - Interface similaire à ChatGPT avec historique des conversations
 */
const DoctorChatIa = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingConversation, setEditingConversation] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Conversations initiales factices
  const initialConversations = [
    {
      id: 1,
      title: 'Consultation symptômes grippaux',
      lastMessage: 'Merci pour ces conseils docteur',
      timestamp: new Date(Date.now() - 3600000),
      messageCount: 12,
      type: 'medical'
    },
    {
      id: 2,
      title: 'Questions sur traitement',
      lastMessage: 'Je vais suivre vos recommandations',
      timestamp: new Date(Date.now() - 7200000),
      messageCount: 8,
      type: 'medical'
    },
    {
      id: 3,
      title: 'Prise de rendez-vous urgente',
      lastMessage: 'Rendez-vous confirmé pour demain',
      timestamp: new Date(Date.now() - 86400000),
      messageCount: 5,
      type: 'appointment'
    },
    {
      id: 4,
      title: 'Résultats analyses sanguines',
      lastMessage: 'Tout semble normal',
      timestamp: new Date(Date.now() - 172800000),
      messageCount: 15,
      type: 'results'
    },
    {
      id: 5,
      title: 'Suivi post-consultation',
      lastMessage: 'Les médicaments font effet',
      timestamp: new Date(Date.now() - 259200000),
      messageCount: 7,
      type: 'followup'
    }
  ];

  // Messages par conversation
  const conversationMessages = {
    1: [
      {
        id: 1,
        sender: 'assistant',
        content: 'Bonjour ! Je suis votre assistant médical IA. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date(Date.now() - 300000),
        type: 'text'
      },
      {
        id: 2,
        sender: 'user',
        content: 'Bonjour, j\'ai des symptômes qui ressemblent à une grippe depuis 2 jours.',
        timestamp: new Date(Date.now() - 240000),
        type: 'text'
      },
      {
        id: 3,
        sender: 'assistant',
        content: 'Je comprends vos inquiétudes. Pouvez-vous me décrire précisément vos symptômes ? Avez-vous de la fièvre, des courbatures, une toux ?',
        timestamp: new Date(Date.now() - 180000),
        type: 'text'
      }
    ]
  };

  // Charger les conversations au montage du composant
  useEffect(() => {
    setConversations(initialConversations);
    // Sélectionner la première conversation par défaut
    if (initialConversations.length > 0) {
      setSelectedConversation(initialConversations[0]);
      setMessages(conversationMessages[1] || []);
    }
  }, []);

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Créer une nouvelle conversation
  const createNewConversation = () => {
    const newConversation = {
      id: Date.now(),
      title: 'Nouvelle conversation',
      lastMessage: '',
      timestamp: new Date(),
      messageCount: 0,
      type: 'medical'
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
  };

  // Sélectionner une conversation
  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversationMessages[conversation.id] || [{
      id: 1,
      sender: 'assistant',
      content: 'Bonjour ! Je suis votre assistant médical IA. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
      type: 'text'
    }]);
  };

  // Supprimer une conversation
  const deleteConversation = (conversationId, e) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
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
    }
  };

  // Éditer le titre d'une conversation
  const startEditingConversation = (conversation, e) => {
    e.stopPropagation();
    setEditingConversation(conversation.id);
    setEditingTitle(conversation.title);
  };

  const saveConversationTitle = (conversationId) => {
    if (editingTitle.trim()) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: editingTitle.trim() }
            : conv
        )
      );
      
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => ({ ...prev, title: editingTitle.trim() }));
      }
    }
    setEditingConversation(null);
    setEditingTitle('');
  };

  const cancelEditingConversation = () => {
    setEditingConversation(null);
    setEditingTitle('');
  };

  // Partager une conversation
  const shareConversation = (conversation, e) => {
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: `Conversation: ${conversation.title}`,
        text: `Partage de la conversation médicale: ${conversation.title}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copier le lien dans le presse-papiers
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Lien de la conversation copié dans le presse-papiers !');
      }).catch(() => {
        alert('Impossible de partager la conversation.');
      });
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Mettre à jour le titre de la conversation si c'est le premier message
    if (selectedConversation.title === 'Nouvelle conversation' && messages.length <= 1) {
      const newTitle = newMessage.trim().length > 50 
        ? newMessage.trim().substring(0, 50) + '...'
        : newMessage.trim();
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, title: newTitle }
            : conv
        )
      );
      
      setSelectedConversation(prev => ({ ...prev, title: newTitle }));
    }

    // Simuler une réponse de l'assistant
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantResponse = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: generateAssistantResponse(userMessage.content),
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantResponse]);
      
      // Mettre à jour la conversation dans la liste
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { 
                ...conv, 
                lastMessage: assistantResponse.content,
                timestamp: assistantResponse.timestamp,
                messageCount: conv.messageCount + 2
              }
            : conv
        )
      );
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Générer une réponse de l'assistant (simulation)
  const generateAssistantResponse = (userMessage) => {
    const responses = [
      'Je comprends vos préoccupations. Pouvez-vous me donner plus de détails sur vos symptômes ?',
      'Ces symptômes peuvent avoir plusieurs causes. Depuis quand ressentez-vous ces troubles ?',
      'Il est important de surveiller ces signes. Je recommande de consulter un professionnel de santé.',
      'Merci pour ces informations. Voici quelques conseils qui pourraient vous aider en attendant...',
      'D\'après ce que vous me décrivez, voici ce que je peux vous suggérer comme première approche...',
      'Ces symptômes nécessitent une attention particulière. Avez-vous déjà consulté pour des problèmes similaires ?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
    const now = new Date();
    const diffDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return formatMessageTime(timestamp);
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return timestamp.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  // Obtenir l'icône selon le type de conversation
  const getConversationIcon = (type) => {
    switch (type) {
      case 'medical': return MedicalIcons.Doctor;
      case 'appointment': return MedicalIcons.Calendar;
      case 'results': return MedicalIcons.Report;
      case 'followup': return MedicalIcons.Heart;
      default: return NavigationIcons.Chat;
    }
  };

  // Filtrer les conversations selon la recherche
  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      conversation.title.toLowerCase().includes(query) ||
      conversation.lastMessage.toLowerCase().includes(query) ||
      conversation.type.toLowerCase().includes(query)
    );
  });

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
        
        <div className={`max-w-[70%] ${isUser ? 'ml-auto' : ''}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-mediai-primary text-white rounded-br-md' 
              : 'bg-surface-background text-content-primary rounded-bl-md border border-border-primary'
          }`}>
            <p className="text-sm font-body leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
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
      <div className={`${sidebarCollapsed ? 'w-12 sm:w-16' : 'w-72 sm:w-80'} bg-white border-r border-border-primary flex flex-col transition-all duration-300 ${sidebarCollapsed ? '' : 'hidden sm:flex'}`}>
        {/* Header de la sidebar */}
        <div className="p-3 sm:p-4 border-b border-border-primary">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-lg sm:text-xl font-heading font-semibold text-content-primary">
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
          <div className="p-4 border-b border-border-primary">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-border-primary rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-transparent font-body text-content-primary placeholder-content-tertiary bg-white"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Icon icon={ActionIcons.Search} size="w-4 h-4" className="text-content-tertiary" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-content-tertiary hover:text-content-primary"
                  title="Effacer la recherche"
                >
                  <Icon icon={ActionIcons.Close} size="w-4 h-4" />
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
          
          {filteredConversations.length === 0 && searchQuery ? (
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
          ) : (
            filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => selectConversation(conversation)}
              className={`p-4 cursor-pointer border-b border-border-primary hover:bg-surface-muted transition-colors group ${
                selectedConversation?.id === conversation.id ? 'bg-mediai-primary/5 border-r-2 border-r-mediai-primary' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-mediai-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon icon={getConversationIcon(conversation.type)} size="w-4 h-4" className="text-mediai-primary" />
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      {editingConversation === conversation.id ? (
                        <div className="flex-1 mr-2">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveConversationTitle(conversation.id);
                              } else if (e.key === 'Escape') {
                                cancelEditingConversation();
                              }
                            }}
                            onBlur={() => saveConversationTitle(conversation.id)}
                            className="w-full text-sm font-medium text-content-primary bg-transparent border-b border-mediai-primary focus:outline-none font-heading"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <h3 className="text-sm font-medium text-content-primary truncate font-heading">
                          {conversation.title}
                        </h3>
                      )}
                      
                      {editingConversation !== conversation.id && (
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => startEditingConversation(conversation, e)}
                            className="text-content-tertiary hover:text-mediai-primary transition-all p-1"
                            title="Éditer le titre"
                          >
                            <Icon icon={ActionIcons.Edit} size="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={(e) => shareConversation(conversation, e)}
                            className="text-content-tertiary hover:text-mediai-primary transition-all p-1"
                            title="Partager la conversation"
                          >
                            <Icon icon={ActionIcons.Share} size="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={(e) => deleteConversation(conversation.id, e)}
                            className="text-content-tertiary hover:text-danger transition-all p-1"
                            title="Supprimer la conversation"
                          >
                            <Icon icon={ActionIcons.Delete} size="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-content-secondary truncate mt-1 font-body">
                      {conversation.lastMessage || 'Aucun message'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-content-tertiary font-body-medium">
                        {formatConversationTime(conversation.timestamp)}
                      </span>
                      
                      {conversation.messageCount > 0 && (
                        <span className="text-xs bg-mediai-primary/10 text-mediai-primary px-2 py-0.5 rounded-full font-body-medium">
                          {conversation.messageCount}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
          )}
        </div>
        
        {/* User info en bas */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border-primary bg-surface-muted">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-mediai-primary flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.nom?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content-primary truncate font-body">
                  {user?.nom || 'Utilisateur'}
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
            <div className="p-4 sm:p-6 border-b border-border-primary bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {/* Bouton pour afficher sidebar sur mobile */}
                  <button 
                    className="sm:hidden p-2 text-content-secondary hover:text-content-primary transition-colors"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    <Icon icon={NavigationIcons.Menu} size="w-5 h-5" />
                  </button>
                  
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Icon icon={MedicalIcons.AI} size="w-4 h-4 sm:w-5 sm:h-5" className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-heading font-semibold text-content-primary">
                      Assistant Médical IA
                    </h2>
                    <p className="text-xs sm:text-sm text-success font-body-medium flex items-center">
                      <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                      En ligne
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-surface-background">
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {messages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}
                
                {/* Indicateur de frappe */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <Icon icon={MedicalIcons.AI} size="w-3 h-3 sm:w-4 sm:h-4" className="text-white" />
                    </div>
                    <div className="bg-white border border-border-primary rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 sm:py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-content-secondary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-content-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-content-secondary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-border-primary bg-white">
              <div className="max-w-4xl mx-auto">
                {/* Suggestions rapides */}
                <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
                  {[
                    'J\'ai mal à la tête depuis ce matin',
                    'Besoin d\'un rendez-vous urgent',
                    'Questions sur mes résultats d\'analyse',
                    'Effets secondaires de mon traitement'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setNewMessage(suggestion)}
                      className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-surface-muted hover:bg-surface-background border border-border-primary rounded-lg text-content-secondary hover:text-content-primary transition-colors font-body"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2 sm:space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Tapez votre message..."
                      disabled={isLoading}
                      rows={1}
                      className="w-full p-3 sm:p-4 pr-12 sm:pr-16 border border-border-primary rounded-xl resize-none focus:ring-2 focus:ring-mediai-primary focus:border-transparent font-body text-content-primary placeholder-content-tertiary bg-white text-sm sm:text-base"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    
                    {/* Boutons dans le textarea */}
                    <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex items-center space-x-1 sm:space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        title="Joindre un fichier"
                        className="text-content-tertiary hover:text-content-secondary hidden sm:inline-flex"
                      >
                        <Icon icon={ActionIcons.Attach} size="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        title="Enregistrement vocal"
                        className="text-content-tertiary hover:text-content-secondary"
                      >
                        <Icon icon={ActionIcons.Mic} size="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    loading={isLoading}
                    className="px-4 py-3 sm:px-6 sm:py-4 h-12 sm:h-14"
                  >
                    <Icon icon={ActionIcons.Send} size="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </form>
              </div>
            </div>
          </>
        ) : (
          /* État vide - Aucune conversation sélectionnée */
          <div className="flex-1 flex items-center justify-center bg-surface-background">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                <Icon icon={MedicalIcons.AI} size="w-12 h-12" className="text-white" />
              </div>
              
              <h2 className="text-2xl font-heading font-semibold text-content-primary mb-4">
                Assistant Médical IA
              </h2>
              
              <p className="text-content-secondary font-body mb-6 leading-relaxed">
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
    </div>
  );
};

export default DoctorChatIa;
