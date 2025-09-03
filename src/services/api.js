import axios from 'axios';

// Configuration des URL selon l'environnement
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://mediai-front-app-3vcax.ondigitalocean.app/api/v1';
  }
  return 'https://medi-ai-app-t7r39.ondigitalocean.app';
};

// Configuration de base
const API_CONFIG = {
  LOCAL_URL: 'http://localhost:8000/api/v1',
  PRODUCTION_URL: 'https://medi-ai-app-t7r39.ondigitalocean.app/api/v1',
  TIMEOUT: 30000
};

// Créer l'instance axios
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediai_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Gestion du token expiré (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('mediai_refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${getBaseURL()}/auth/refresh/`, {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem('mediai_access_token', newAccessToken);
          
          // Retry la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Si le refresh échoue, déconnecter l'utilisateur
          localStorage.removeItem('mediai_access_token');
          localStorage.removeItem('mediai_refresh_token');
          localStorage.removeItem('mediai_user');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Pas de refresh token, rediriger vers login
        localStorage.removeItem('mediai_access_token');
        localStorage.removeItem('mediai_refresh_token');
        localStorage.removeItem('mediai_user');
        window.location.href = '/auth/login';
      }
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
 * Service d'authentification selon l'API Medical IA
 */
export const authService = {
  /**
   * Enregistrement d'un nouvel utilisateur
   * @param {Object} userData - Données d'enregistrement
   * @param {string} userData.username - Nom d'utilisateur
   * @param {string} userData.password - Mot de passe (minimum 4 caractères)
   * @param {string} userData.email - Email
   * @param {string} userData.role - Role ('patient' ou 'medecin')
   * @param {string} userData.first_name - Prénom
   * @param {string} userData.last_name - Nom
   * @returns {Promise<Object>} - Données utilisateur créé
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/users/register/', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Connexion utilisateur
   * @param {Object} credentials - Identifiants de connexion
   * @param {string} credentials.username - Nom d'utilisateur
   * @param {string} credentials.password - Mot de passe
   * @returns {Promise<Object>} - Tokens JWT
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/token/', credentials);
      const { access, refresh } = response.data;
      
      // Stocker les tokens
      localStorage.setItem('mediai_access_token', access);
      localStorage.setItem('mediai_refresh_token', refresh);
      
      // Récupérer les informations utilisateur
      const userInfo = await this.getUserProfile();
      localStorage.setItem('mediai_user', JSON.stringify(userInfo));
      
      return {
        tokens: { access, refresh },
        user: userInfo
      };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Rafraîchir le token d'accès
   * @param {string} refreshToken - Token de rafraîchissement
   * @returns {Promise<Object>} - Nouveau token d'accès
   */
  async refreshToken(refreshToken) {
    try {
      const response = await api.post('/auth/refresh/', {
        refresh: refreshToken
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Vérifier la validité d'un token
   * @param {string} token - Token à vérifier
   * @returns {Promise<boolean>} - Validité du token
   */
  async verifyToken(token) {
    try {
      await api.post('/auth/verify/', { token });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Récupérer le profil utilisateur
   * @returns {Promise<Object>} - Profil utilisateur
   */
  async getUserProfile() {
    try {
      const response = await api.get('/auth/users/me/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Modifier le profil utilisateur
   * @param {Object} profileData - Données à modifier
   * @param {string} profileData.first_name - Prénom
   * @param {string} profileData.last_name - Nom
   * @param {string} profileData.email - Email
   * @returns {Promise<Object>} - Profil mis à jour
   */
  async updateProfile(profileData) {
    try {
      const response = await api.patch('/auth/users/me/', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Déconnexion utilisateur
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem('mediai_refresh_token');
      if (refreshToken) {
        // Essayer d'abord l'endpoint standard de logout
        try {
          await api.post('/auth/logout/', {
            refresh: refreshToken
          });
        } catch (logoutError) {
          // Si ça échoue, essayer l'endpoint de blacklist
          try {
            await api.post('/auth/token/blacklist/', {
              refresh: refreshToken
            });
          } catch (blacklistError) {
            console.warn('Impossible d\'invalider le token côté serveur:', blacklistError.response?.data || blacklistError.message);
          }
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error.response?.data || error.message);
    } finally {
      // Nettoyer le localStorage dans tous les cas
      localStorage.removeItem('mediai_access_token');
      localStorage.removeItem('mediai_refresh_token');
      localStorage.removeItem('mediai_user');
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   * @returns {boolean} - État de connexion
   */
  isAuthenticated() {
    const token = localStorage.getItem('mediai_access_token');
    const user = localStorage.getItem('mediai_user');
    return !!(token && user);
  },

  /**
   * Récupérer l'utilisateur depuis le localStorage
   * @returns {Object|null} - Données utilisateur
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('mediai_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Gestion des erreurs d'authentification
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return {
            message: 'Données invalides',
            details: data,
            status: 400
          };
        case 401:
          return {
            message: 'Identifiants incorrects',
            details: data,
            status: 401
          };
        case 403:
          return {
            message: 'Accès refusé',
            details: data,
            status: 403
          };
        case 404:
          return {
            message: 'Service non trouvé',
            details: data,
            status: 404
          };
        case 500:
          return {
            message: 'Erreur serveur interne',
            details: data,
            status: 500
          };
        default:
          return {
            message: 'Erreur inconnue',
            details: data,
            status
          };
      }
    } else if (error.request) {
      return {
        message: 'Erreur de connexion au serveur',
        details: error.message,
        status: 0
      };
    } else {
      return {
        message: 'Erreur inattendue',
        details: error.message,
        status: -1
      };
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
      const response = await api.get('/conversations/');
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
      const response = await api.get(`/conversations/${conversationId}/messages/`);
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
      const response = await api.post(`/conversations/${conversationId}/messages/`, messageData);
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
      const response = await api.post('/conversations/', conversationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtenir les détails d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @returns {Promise<Object>} - Détails de la conversation
   */
  getConversationDetails: async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour le titre d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} titre - Nouveau titre
   * @returns {Promise<Object>} - Conversation mise à jour
   */
  updateConversationTitle: async (conversationId, titre) => {
    try {
      const response = await api.patch(`/conversations/${conversationId}/`, { titre });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour le nom d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} nom - Nouveau nom
   * @param {number|null} fiche - ID de la fiche (optionnel)
   * @returns {Promise<Object>} - Conversation mise à jour
   */
  updateConversationName: async (conversationId, nom, fiche = null) => {
    try {
      const payload = { nom };
      if (fiche !== null) {
        payload.fiche = fiche;
      }
      const response = await api.patch(`/conversations/${conversationId}/`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour une conversation (nom, titre, fiche)
   * @param {string} conversationId - ID de la conversation
   * @param {Object} updateData - Données à mettre à jour
   * @param {string} updateData.nom - Nouveau nom (optionnel)
   * @param {string} updateData.titre - Nouveau titre (optionnel)
   * @param {number} updateData.fiche - ID de la fiche (optionnel)
   * @returns {Promise<Object>} - Conversation mise à jour
   */
  updateConversation: async (conversationId, updateData) => {
    try {
      // Ne garder que les champs définis
      const payload = {};
      if (updateData.nom !== undefined) payload.nom = updateData.nom;
      if (updateData.titre !== undefined) payload.titre = updateData.titre;
      if (updateData.fiche !== undefined) payload.fiche = updateData.fiche;
      
      const response = await api.patch(`/conversations/${conversationId}/`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprimer une conversation
   * @param {string} conversationId - ID de la conversation
   * @returns {Promise<void>} - Confirmation de suppression
   */
  deleteConversation: async (conversationId) => {
    try {
      const response = await api.delete(`/conversations/${conversationId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// ==================== IA MEDICALE ====================

/**
 * Service de gestion de l'IA médicale
 */
export const iaService = {
  /**
   * Démarrer une analyse IA des symptômes (selon votre exemple)
   * @param {Object} analyseData - Données pour l'analyse
   * @param {string} analyseData.symptomes - Description des symptômes
   * @param {number} analyseData.conversation_id - ID de la conversation (optionnel)
   * @returns {Promise<Object>} - Résultat de l'analyse ou task_id
   */
  async startAnalyse(analyseData) {
    try {
      const token = localStorage.getItem('mediai_access_token');
      const baseURL = getBaseURL().replace('/api/v1', ''); // Retirer /api/v1 pour avoir la base
      
      const response = await fetch(`${baseURL}/api/ia/analyse/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symptomes: analyseData.symptomes,
          conversation_id: analyseData.conversation_id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Vérifier le statut d'une tâche IA
   * @param {string} taskId - ID de la tâche Celery
   * @returns {Promise<Object>} - Statut de la tâche
   */
  async getTaskStatus(taskId) {
    try {
      const token = localStorage.getItem('mediai_access_token');
      const baseURL = getBaseURL().replace('/api/v1', '');
      
      const response = await fetch(`${baseURL}/api/ia/status/${taskId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer le résultat d'une analyse IA
   * @param {string} cacheKey - Clé de cache retournée lors du démarrage
   * @returns {Promise<Object>} - Résultat de l'analyse
   */
  async getAnalyseResult(cacheKey) {
    try {
      const token = localStorage.getItem('mediai_access_token');
      const baseURL = getBaseURL().replace('/api/v1', '');
      
      const response = await fetch(`${baseURL}/api/ia/result/?cache_key=${cacheKey}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Analyser des symptômes avec polling automatique du résultat
   * @param {Object} analyseData - Données pour l'analyse
   * @param {Function} onProgress - Callback pour le suivi du progrès (optionnel)
   * @returns {Promise<Object>} - Résultat final de l'analyse
   */
  async analyzeSymptoms(analyseData, onProgress = null) {
    try {
      // Démarrer l'analyse
      const startResult = await this.startAnalyse(analyseData);
      
      // Si déjà en cache, retourner immédiatement
      if (startResult.already_cached && startResult.response) {
        return {
          status: 'done',
          response: startResult.response,
          cache_key: startResult.cache_key
        };
      }

      // Sinon, poller le résultat
      const cacheKey = startResult.cache_key;
      let attempts = 0;
      const maxAttempts = 30; // 30 secondes max
      
      while (attempts < maxAttempts) {
        if (onProgress) {
          onProgress({
            status: 'pending',
            progress: Math.min((attempts / maxAttempts) * 100, 90),
            message: 'Analyse en cours...'
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
        
        const result = await this.getAnalyseResult(cacheKey);
        
        if (result.status === 'done' && result.response) {
          if (onProgress) {
            onProgress({
              status: 'done',
              progress: 100,
              message: 'Analyse terminée !'
            });
          }
          return result;
        }
        
        attempts++;
      }

      throw new Error('Timeout: L\'analyse IA a pris trop de temps');
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs d'IA
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return {
            message: 'Données invalides pour l\'analyse IA',
            details: data,
            status: 400
          };
        case 401:
          return {
            message: 'Autorisation requise pour utiliser l\'IA',
            details: data,
            status: 401
          };
        case 403:
          return {
            message: 'Accès à l\'IA réservé aux médecins',
            details: data,
            status: 403
          };
        case 429:
          return {
            message: 'Trop de requêtes IA. Veuillez patienter.',
            details: data,
            status: 429
          };
        case 500:
          return {
            message: 'Erreur serveur lors de l\'analyse IA',
            details: data,
            status: 500
          };
        default:
          return {
            message: 'Erreur inconnue de l\'IA médicale',
            details: data,
            status
          };
      }
    } else if (error.request) {
      return {
        message: 'Erreur de connexion au service IA',
        details: error.message,
        status: 0
      };
    } else {
      return {
        message: 'Erreur inattendue lors de l\'analyse IA',
        details: error.message,
        status: -1
      };
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
