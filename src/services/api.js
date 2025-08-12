import axios from 'axios';

// Configuration de base d'Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      localStorage.removeItem('mediai_token');
      localStorage.removeItem('mediai_user');
      window.location.href = '/auth/login';
    }
    
    // Gestion des erreurs réseau
    if (!error.response) {
      console.error('Erreur réseau:', error.message);
      return Promise.reject({
        message: 'Erreur de connexion au serveur'
      });
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTHENTIFICATION ====================

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion utilisateur
   * @param {Object} credentials - Identifiants de connexion
   * @param {string} credentials.email - Email
   * @param {string} credentials.password - Mot de passe
   * @returns {Promise<Object>} - Données utilisateur et token
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Inscription utilisateur
   * @param {Object} userData - Données d'inscription
   * @returns {Promise<Object>} - Confirmation d'inscription
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Déconnexion
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('mediai_token');
      localStorage.removeItem('mediai_user');
    }
  },

  /**
   * Récupérer le profil utilisateur actuel
   * @returns {Promise<Object>} - Profil utilisateur
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mot de passe oublié
   * @param {string} email - Email de récupération
   * @returns {Promise<Object>} - Confirmation d'envoi
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ==================== CONSULTATIONS ====================

/**
 * Service de gestion des consultations
 */
export const consultationService = {
  /**
   * Récupérer toutes les consultations
   * @param {Object} filters - Filtres de recherche
   * @returns {Promise<Array>} - Liste des consultations
   */
  getConsultations: async (filters = {}) => {
    try {
      const response = await api.get('/consultations', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer une consultation par ID
   * @param {string} id - ID de la consultation
   * @returns {Promise<Object>} - Détails de la consultation
   */
  getConsultation: async (id) => {
    try {
      const response = await api.get(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Créer une nouvelle consultation
   * @param {Object} consultationData - Données de la consultation
   * @returns {Promise<Object>} - Consultation créée
   */
  createConsultation: async (consultationData) => {
    try {
      const response = await api.post('/consultations', consultationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour une consultation
   * @param {string} id - ID de la consultation
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Object>} - Consultation mise à jour
   */
  updateConsultation: async (id, updateData) => {
    try {
      const response = await api.put(`/consultations/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Annuler une consultation
   * @param {string} id - ID de la consultation
   * @returns {Promise<Object>} - Confirmation d'annulation
   */
  cancelConsultation: async (id) => {
    try {
      const response = await api.delete(`/consultations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ==================== CHAT ====================

/**
 * Service de gestion du chat
 */
export const chatService = {
  /**
   * Récupérer les conversations
   * @returns {Promise<Array>} - Liste des conversations
   */
  getConversations: async () => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer les messages d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @returns {Promise<Array>} - Messages de la conversation
   */
  getMessages: async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Envoyer un message
   * @param {string} conversationId - ID de la conversation
   * @param {Object} messageData - Données du message
   * @returns {Promise<Object>} - Message envoyé
   */
  sendMessage: async (conversationId, messageData) => {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Créer une nouvelle conversation
   * @param {Object} conversationData - Données de la conversation
   * @returns {Promise<Object>} - Conversation créée
   */
  createConversation: async (conversationData) => {
    try {
      const response = await api.post('/chat/conversations', conversationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ==================== DASHBOARD ====================

/**
 * Service de gestion du tableau de bord
 */
export const dashboardService = {
  /**
   * Récupérer les statistiques du tableau de bord
   * @returns {Promise<Object>} - Statistiques
   */
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer les activités récentes
   * @param {number} limit - Nombre d'activités à récupérer
   * @returns {Promise<Array>} - Activités récentes
   */
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get('/dashboard/activities', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ==================== UTILISATEURS ====================

/**
 * Service de gestion des utilisateurs
 */
export const userService = {
  /**
   * Mettre à jour le profil utilisateur
   * @param {Object} userData - Nouvelles données utilisateur
   * @returns {Promise<Object>} - Profil mis à jour
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Changer le mot de passe
   * @param {Object} passwordData - Données du changement de mot de passe
   * @returns {Promise<Object>} - Confirmation
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ==================== UPLOAD ====================

/**
 * Service de gestion des fichiers
 */
export const uploadService = {
  /**
   * Uploader un fichier
   * @param {File} file - Fichier à uploader
   * @param {Object} options - Options d'upload
   * @returns {Promise<Object>} - Informations du fichier uploadé
   */
  uploadFile: async (file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: options.onProgress
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Export de l'instance axios configurée
export default api;
