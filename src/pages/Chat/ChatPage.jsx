import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';

/**
 * Page Chat - Messagerie en temps réel entre utilisateurs et IA médicale
 */
const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState('assistant');
  const messagesEndRef = useRef(null);

  // Types de chat disponibles
  const chatTypes = [
    { id: 'assistant', name: 'Assistant Médical IA', icon: MedicalIcons.AI, status: 'en ligne' },
    { id: 'emergency', name: 'Urgences', icon: MedicalIcons.Emergency, status: 'disponible' },
    { id: 'support', name: 'Support Technique', icon: NavigationIcons.Help, status: 'en ligne' }
  ];

  // Messages initiaux factices
  const initialMessages = [
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
      content: 'Bonjour, j\'ai des questions sur mes symptômes.',
      timestamp: new Date(Date.now() - 240000),
      type: 'text'
    },
    {
      id: 3,
      sender: 'assistant',
      content: 'Je vais vous aider à comprendre vos symptômes. Pouvez-vous me décrire ce que vous ressentez ?',
      timestamp: new Date(Date.now() - 180000),
      type: 'text'
    }
  ];

  // Charger les messages au montage du composant
  useEffect(() => {
    setMessages(initialMessages);
  }, [selectedChat]);

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

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
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Générer une réponse de l'assistant (simulation)
  const generateAssistantResponse = (userMessage) => {
    const responses = [
      'Je comprends vos préoccupations. Pouvez-vous me donner plus de détails ?',
      'Ces symptômes peuvent avoir plusieurs causes. Avez-vous consulté récemment ?',
      'Il est important de surveiller ces signes. Je recommande de consulter un professionnel.',
      'Merci pour ces informations. Voici quelques conseils qui pourraient vous aider...',
      'D\'après ce que vous me décrivez, voici ce que je peux vous suggérer...'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Formater l'heure
  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  // Composant Message
  const Message = ({ message }) => {
    const isUser = message.sender === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm border border-gray-200 font-medical">
      {/* Sidebar - Liste des chats */}
      <div className="w-1/4 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-heading font-semibold text-gray-900">
            <MedicalIcon icon={NavigationIcons.Chat} size="w-5 h-5" variant="primary" className="inline mr-2" />
            Messagerie
          </h2>
        </div>
        
        <div className="overflow-y-auto">
          {chatTypes.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                selectedChat === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MedicalIcon icon={chat.icon} size="w-5 h-5" variant="primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate font-body">
                    {chat.name}
                  </p>
                  <p className="text-xs text-green-500 font-body">{chat.status}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">
        {/* Header du chat */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <MedicalIcon 
                  icon={chatTypes.find(c => c.id === selectedChat)?.icon || NavigationIcons.Chat} 
                  size="w-5 h-5" 
                  variant="primary" 
                />
              </div>
              <div>
                <h3 className="text-lg font-heading font-medium text-gray-900">
                  {chatTypes.find(c => c.id === selectedChat)?.name}
                </h3>
                <p className="text-sm text-green-500 font-body">
                  {chatTypes.find(c => c.id === selectedChat)?.status}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Icon icon={ActionIcons.Phone} size="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Icon icon={ActionIcons.Video} size="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Icon icon={ActionIcons.Settings} size="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          
          {/* Indicateur de frappe */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                disabled={isLoading}
                className="pr-12"
              />
            </div>
            
            {/* Boutons d'actions */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                title="Joindre un fichier"
              >
                📎
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                title="Enregistrement vocal"
              >
                🎤
              </Button>
              <Button
                type="submit"
                disabled={!newMessage.trim() || isLoading}
                loading={isLoading}
              >
                Envoyer
              </Button>
            </div>
          </form>

          {/* Suggestions rapides */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              'J\'ai mal à la tête',
              'Prise de rendez-vous',
              'Résultats d\'analyse',
              'Question sur traitement'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setNewMessage(suggestion)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
