import axios from 'axios';

// Configuration de base depuis les variables d'environnement
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000
};

// Créer l'instance axios
const api = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Activer les cookies pour CSRF
  withCredentials: true,
});

/**
 * Récupérer le token CSRF depuis les cookies
 * @returns {string|null} - Token CSRF
 */
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Récupérer le token CSRF depuis le serveur
 * @returns {Promise<string>} - Token CSRF
 */
async function fetchCSRFToken() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.csrfToken;
    }
  } catch (error) {
    console.warn('Impossible de récupérer le token CSRF:', error);
  }
  return null;
}

// Intercepteur pour ajouter le token d'authentification et CSRF
api.interceptors.request.use(
  async (config) => {
    // Ajouter le token d'authentification
    const token = localStorage.getItem('mediai_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter le token CSRF pour les requêtes POST/PUT/PATCH/DELETE
    if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      // Récupérer le token CSRF depuis les cookies
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
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
          const response = await axios.post(`${API_CONFIG.API_BASE_URL}/auth/jwt/refresh/`, {
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
      console.log('Envoi des données d\'inscription:', userData);
      console.log('URL d\'inscription:', '/auth/users/register/');
      
      // Essayer d'abord sans CSRF token
      let response;
      try {
        response = await api.post('/auth/users/register/', userData);
      } catch (csrfError) {
        if (csrfError.response?.status === 403) {
          // Si erreur CSRF, récupérer le token et réessayer
          console.log('Erreur CSRF détectée lors de l\'inscription, récupération du token...');
          
          // Récupérer le token CSRF
          await fetchCSRFToken();
          
          // Réessayer avec le token CSRF
          response = await api.post('/auth/users/register/', userData);
        } else {
          throw csrfError;
        }
      }
      
      console.log('Réponse d\'inscription réussie:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      console.error('Détails de l\'erreur:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
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
      // Essayer d'abord sans CSRF token
      let response;
      try {
        response = await api.post('/auth/jwt/token/', credentials);
      } catch (csrfError) {
        if (csrfError.response?.status === 403) {
          // Si erreur CSRF, récupérer le token et réessayer
          console.log('Erreur CSRF détectée, récupération du token...');
          
          // Récupérer le token CSRF
          await fetchCSRFToken();
          
          // Réessayer avec le token CSRF
          response = await api.post('/auth/jwt/token/', credentials);
        } else {
          throw csrfError;
        }
      }
      
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
      const response = await api.post('/auth/jwt/refresh/', {
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
   * Récupérer la liste de tous les médecins
   * @param {Object} filters - Filtres optionnels
   * @param {boolean} filters.available - Filtrer par disponibilité
   * @param {string} filters.specialty - Filtrer par spécialité
   * @returns {Promise<Object>} - Liste paginée des médecins
   */
  async getMedecins(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.available !== undefined) {
        params.append('available', filters.available);
      }
      if (filters.specialty) {
        params.append('specialty', filters.specialty);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/auth/medecins/?${queryString}` : '/auth/medecins/';
      
      const response = await api.get(url);
      console.log('Médecins récupérés depuis l\'API (backend uniquement):', response.data);
      
      // Retourner uniquement les données du backend
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins:', error);
      console.log('Aucun médecin disponible - erreur backend');
      // Retourner une structure vide en cas d'erreur
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    }
  },

  /**
   * Récupérer uniquement les médecins disponibles
   * @returns {Promise<Object>} - Liste des médecins disponibles
   */
  async getAvailableMedecins() {
    try {
      const response = await api.get('/auth/medecins/available/');
      console.log('Médecins disponibles depuis l\'API (backend uniquement):', response.data);
      
      // Retourner uniquement les données du backend
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des médecins disponibles:', error);
      console.log('Aucun médecin disponible - erreur backend');
      // Retourner une structure vide en cas d'erreur
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    }
  },

  /**
   * Récupérer un médecin spécifique par son ID
   * @param {number} medecinId - ID du médecin
   * @returns {Promise<Object>} - Détails du médecin
   */
  async getMedecinById(medecinId) {
    try {
      const response = await api.get(`/auth/medecins/${medecinId}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du médecin ${medecinId}:`, error);
      throw this.handleError(error);
    }
  },

  /**
   * Rechercher des médecins par spécialité
   * @param {string} specialty - Spécialité recherchée
   * @param {boolean} availableOnly - Uniquement les médecins disponibles
   * @returns {Promise<Object>} - Médecins correspondants
   */
  async searchMedecinsBySpecialty(specialty, availableOnly = true) {
    try {
      const filters = { specialty };
      if (availableOnly) {
        filters.available = true;
      }
      return await this.getMedecins(filters);
    } catch (error) {
      console.error('Erreur lors de la recherche par spécialité:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Données statiques de médecins (fallback)
   * @param {Object} filters - Filtres à appliquer
   * @returns {Object} - Liste filtrée des médecins statiques
   */
  getMedecinsStatic(filters = {}) {
    const medecins = [
      {
        id: 1,
        username: "dr_mukendi",
        first_name: "Jean",
        last_name: "Mukendi",
        email: "j.mukendi@mediai.com",
        role: "medecin",
        phone: "+243123456789",
        patient_profile: null,
        medecin_profile: {
          id: 1,
          specialty: "Médecine générale",
          phone_number: "+243123456789",
          address: "Cabinet Médical, Av. Kabasele, Kinshasa",
          is_available: true
        }
      },
      {
        id: 2,
        username: "dr_kalala",
        first_name: "Marie",
        last_name: "Kalala",
        email: "m.kalala@mediai.com",
        role: "medecin",
        phone: "+243987654321",
        patient_profile: null,
        medecin_profile: {
          id: 2,
          specialty: "Cardiologie",
          phone_number: "+243987654321",
          address: "Clinique Cardiologique, Bd. Lumumba, Kinshasa",
          is_available: true
        }
      },
      {
        id: 3,
        username: "dr_tshimanga",
        first_name: "Paul",
        last_name: "Tshimanga",
        email: "p.tshimanga@mediai.com",
        role: "medecin",
        phone: "+243555123456",
        patient_profile: null,
        medecin_profile: {
          id: 3,
          specialty: "Pédiatrie",
          phone_number: "+243555123456",
          address: "Clinique Pédiatrique, Av. Binza, Kinshasa",
          is_available: false
        }
      },
      {
        id: 4,
        username: "dr_mbuyi",
        first_name: "Grace",
        last_name: "Mbuyi",
        email: "g.mbuyi@mediai.com",
        role: "medecin",
        phone: "+243777888999",
        patient_profile: null,
        medecin_profile: {
          id: 4,
          specialty: "Gynécologie",
          phone_number: "+243777888999",
          address: "Centre Gynécologique, Av. Kimbangu, Kinshasa",
          is_available: true
        }
      },
      {
        id: 5,
        username: "dr_lubaki",
        first_name: "Joseph",
        last_name: "Lubaki",
        email: "j.lubaki@mediai.com",
        role: "medecin",
        phone: "+243444555666",
        patient_profile: null,
        medecin_profile: {
          id: 5,
          specialty: "Dermatologie",
          phone_number: "+243444555666",
          address: "Cabinet Dermatologique, Av. Kasavubu, Kinshasa",
          is_available: true
        }
      },
      {
        id: 6,
        username: "dr_mumbere",
        first_name: "Sylvie",
        last_name: "Mumbere",
        email: "s.mumbere@mediai.com",
        role: "medecin",
        phone: "+243333444555",
        patient_profile: null,
        medecin_profile: {
          id: 6,
          specialty: "Psychiatrie",
          phone_number: "+243333444555",
          address: "Centre de Santé Mentale, Av. Tabora, Kinshasa",
          is_available: true
        }
      }
    ];

    // Appliquer les filtres
    let filteredMedecins = [...medecins];

    if (filters.available !== undefined) {
      filteredMedecins = filteredMedecins.filter(medecin => 
        medecin.medecin_profile?.is_available === filters.available
      );
    }

    if (filters.specialty) {
      filteredMedecins = filteredMedecins.filter(medecin =>
        medecin.medecin_profile?.specialty?.toLowerCase()
          .includes(filters.specialty.toLowerCase())
      );
    }

    return {
      count: filteredMedecins.length,
      next: null,
      previous: null,
      results: filteredMedecins
    };
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
          console.warn('Endpoint /auth/logout/ non disponible:', logoutError.response?.data || logoutError.message);
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
      
      console.error('Erreur API détaillée:', {
        status,
        data,
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data
      });
      
      switch (status) {
        case 400:
          // Extraire le message d'erreur spécifique si disponible
          let errorMessage = 'Données invalides';
          if (data) {
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data.detail) {
              errorMessage = data.detail;
            } else if (data.error) {
              errorMessage = data.error;
            } else if (data.message) {
              errorMessage = data.message;
            } else if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
              errorMessage = data.non_field_errors[0];
            } else {
              // Chercher la première erreur de champ
              const fieldErrors = Object.values(data).flat();
              if (fieldErrors.length > 0) {
                errorMessage = fieldErrors[0];
              }
            }
          }
          return {
            message: errorMessage,
            details: data,
            status: 400
          };
        case 401:
          // Gestion spécifique des erreurs de token
          if (data && (data.code === 'token_not_valid' || data.detail?.includes('token'))) {
            return {
              message: 'Session expirée. Veuillez vous reconnecter.',
              details: data,
              status: 401,
              code: 'token_not_valid'
            };
          }
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
 * Service de gestion des consultations médicales
 * 
 * Base URL: /api/v1/fiche-consultation/
 * 
 * Statuts disponibles:
 * - en_analyse: Analyse IA en cours
 * - analyse_terminee: IA a terminé l'analyse
 * - valide_medecin: Validée par un médecin
 * - rejete_medecin: Rejetée par un médecin
 */
export const consultationService = {
  /**
   * Lister les consultations avec filtres optionnels
   * @param {Object} params - Paramètres de requête
   * @param {string} params.status - Filtrer par statut(s) - ex: "en_analyse,valide_medecin"
   * @param {boolean} params.is_patient_distance - Vue simplifiée pour consultations à distance
   * @returns {Promise<Array>} - Liste des consultations
   */
  async getConsultations(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status) {
        queryParams.append('status', params.status);
      }
      
      if (params.is_patient_distance) {
        queryParams.append('is_patient_distance', 'true');
      }

      const url = `/fiche-consultation/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('Récupération des consultations:', url);
      
      const response = await api.get(url);
      console.log('Consultations récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des consultations:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer une consultation spécifique
   * @param {number} id - ID de la consultation
   * @returns {Promise<Object>} - Détails de la consultation
   */
  async getConsultation(id) {
    try {
      console.log('Récupération de la consultation:', id);
      const response = await api.get(`/fiche-consultation/${id}/`);
      console.log('Consultation récupérée:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la consultation:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Créer une nouvelle consultation
   * ⚠️ Important: Lance automatiquement une analyse IA asynchrone!
   * @param {Object} consultationData - Données de la consultation
   * @returns {Promise<Object>} - Consultation créée
   */
  async createConsultation(consultationData) {
    try {
      console.log('Création d\'une nouvelle consultation:', consultationData);
      const response = await api.post('/fiche-consultation/', consultationData);
      console.log('Consultation créée:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Modifier une consultation existante
   * ⚠️ Note: Le champ status est en lecture seule
   * @param {number} id - ID de la consultation
   * @param {Object} consultationData - Données à modifier
   * @returns {Promise<Object>} - Consultation modifiée
   */
  async updateConsultation(id, consultationData) {
    try {
      console.log('Modification de la consultation:', id, consultationData);
      const response = await api.patch(`/fiche-consultation/${id}/`, consultationData);
      console.log('Consultation modifiée:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification de la consultation:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une consultation
   * @param {number} id - ID de la consultation
   * @returns {Promise<void>}
   */
  async deleteConsultation(id) {
    try {
      console.log('Suppression de la consultation:', id);
      await api.delete(`/fiche-consultation/${id}/`);
      console.log('Consultation supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la consultation:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer une consultation par son ID
   * @param {number} id - ID de la consultation
   * @returns {Promise<Object>} - Consultation complète
   */
  async getConsultationById(id) {
    try {
      console.log('Récupération de la consultation:', id);
      const response = await api.get(`/fiche-consultation/${id}/`);
      console.log('Consultation récupérée:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la consultation:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Actions spéciales - Workflow IA
   */

  /**
   * Valider une consultation (Médecin ou Admin uniquement)
   * Conditions: Status doit être analyse_terminee, en_analyse ou valide_medecin
   * @param {number} id - ID de la consultation
   * @param {Object} validationData - Données de validation
   * @param {string} validationData.diagnostic - Diagnostic (obligatoire)
   * @param {string} validationData.traitement - Traitement recommandé
   * @param {string} validationData.examen_complementaire - Examens complémentaires
   * @param {string} validationData.recommandations - Recommandations
   * @param {string} validationData.signature_medecin - Signature du médecin
   * @returns {Promise<Object>} - Consultation validée
   */
  async validateConsultation(id, validationData) {
    try {
      console.log('Validation de la consultation:', id, validationData);
      const response = await api.post(`/fiche-consultation/${id}/validate/`, validationData);
      console.log('Consultation validée:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la validation de la consultation:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Rejeter une consultation (Médecin ou Admin uniquement)
   * Conditions: Status doit être analyse_terminee ou en_analyse
   * @param {number} id - ID de la consultation
   * @param {string} commentaire - Motif détaillé du rejet (obligatoire)
   * @returns {Promise<Object>} - Consultation rejetée
   */
  async rejectConsultation(id, commentaire) {
    try {
      console.log('Rejet de la consultation:', id, commentaire);
      const response = await api.post(`/fiche-consultation/${id}/reject/`, {
        commentaire
      });
      console.log('Consultation rejetée:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du rejet de la consultation:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Relancer l'analyse IA (Médecin ou Admin uniquement)
   * @param {number} id - ID de la consultation
   * @returns {Promise<Object>} - Réponse de relance
   */
  async relancerAnalyse(id) {
    try {
      console.log('Relance de l\'analyse IA pour la consultation:', id);
      const response = await api.post(`/fiche-consultation/${id}/relancer/`);
      console.log('Analyse IA relancée:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la relance de l\'analyse IA:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Envoyer via WhatsApp (Médecin ou Admin uniquement)
   * @param {number} id - ID de la consultation
   * @param {Object} whatsappData - Données pour WhatsApp
   * @param {string} whatsappData.message_template - Template du message (optionnel)
   * @param {string} whatsappData.additional_info - Informations supplémentaires (optionnel)
   * @returns {Promise<Object>} - Réponse d'envoi WhatsApp
   */
  async sendWhatsApp(id, whatsappData = {}) {
    try {
      console.log('Envoi WhatsApp pour la consultation:', id, whatsappData);
      const response = await api.post(`/fiche-consultation/${id}/send-whatsapp/`, whatsappData);
      console.log('Message WhatsApp envoyé:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi WhatsApp:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer les messages d'une consultation
   * @param {number} id - ID de la consultation
   * @returns {Promise<Array>} - Messages de la consultation
   */
  async getConsultationMessages(id) {
    try {
      console.log('Récupération des messages pour la consultation:', id);
      const response = await api.get(`/fiche-consultation/${id}/messages/`);
      console.log('Messages récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Ajouter un message à une consultation
   * @param {number} id - ID de la consultation
   * @param {Object} messageData - Données du message
   * @param {string} messageData.content - Contenu du message
   * @returns {Promise<Object>} - Message ajouté
   */
  async addConsultationMessage(id, messageData) {
    try {
      console.log('Ajout d\'un message à la consultation:', id, messageData);
      const response = await api.post(`/fiche-consultation/${id}/messages/`, messageData);
      console.log('Message ajouté:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Assigner un médecin à une consultation (Staff/Admin uniquement)
   * @param {number} id - ID de la consultation
   * @param {number} medecinId - ID du médecin à assigner
   * @returns {Promise<Object>} - Consultation avec médecin assigné
   */
  async assignMedecin(id, medecinId) {
    try {
      console.log('Assignation du médecin:', medecinId, 'à la consultation:', id);
      const response = await api.post(`/fiche-consultation/${id}/assign-medecin/`, {
        medecin_id: medecinId
      });
      console.log('Médecin assigné:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'assignation du médecin:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs spécifique aux consultations
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    return authService.handleError(error);
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
      const baseURL = API_CONFIG.BASE_URL; // Utiliser directement la variable d'environnement
      
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
      const baseURL = API_CONFIG.BASE_URL;
      
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
      const baseURL = API_CONFIG.BASE_URL;
      
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

// ==================== LABORATOIRE ====================

/**
 * Service de gestion des résultats de laboratoire
 */
export const labService = {
  /**
   * Lister les résultats de laboratoire
   * @param {Object} filters - Filtres optionnels
   * @param {number} filters.fiche_consultation - ID de la fiche de consultation
   * @param {string} filters.status - Statut des résultats
   * @returns {Promise<Object>} - Liste paginée des résultats
   */
  async getLabResults(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const url = `/lab-results/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer un résultat de laboratoire
   * @param {Object} labData - Données du résultat
   * @param {number} labData.fiche_consultation - ID de la fiche (obligatoire)
   * @param {string} labData.name - Nom de l'examen (obligatoire)
   * @param {string} labData.value - Valeur du résultat (obligatoire)
   * @param {string} labData.unit - Unité de mesure
   * @param {string} labData.reference_range - Plage de référence
   * @param {string} labData.status - Statut (normal, abnormal, critical)
   * @param {string} labData.date - Date du test
   * @param {string} labData.notes - Notes complémentaires
   * @returns {Promise<Object>} - Résultat créé
   */
  async createLabResult(labData) {
    try {
      const response = await api.post('/lab-results/', labData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer un résultat de laboratoire
   * @param {number} id - ID du résultat
   * @returns {Promise<Object>} - Détails du résultat
   */
  async getLabResult(id) {
    try {
      const response = await api.get(`/lab-results/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Modifier un résultat de laboratoire
   * @param {number} id - ID du résultat
   * @param {Object} labData - Données à modifier
   * @returns {Promise<Object>} - Résultat modifié
   */
  async updateLabResult(id, labData) {
    try {
      const response = await api.patch(`/lab-results/${id}/`, labData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer un résultat de laboratoire
   * @param {number} id - ID du résultat
   * @returns {Promise<void>}
   */
  async deleteLabResult(id) {
    try {
      await api.delete(`/lab-results/${id}/`);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    return authService.handleError(error);
  }
};

// ==================== PIÈCES JOINTES ====================

/**
 * Service de gestion des pièces jointes
 */
export const attachmentService = {
  /**
   * Lister les pièces jointes
   * @param {Object} filters - Filtres optionnels
   * @param {number} filters.fiche_consultation - ID de la fiche de consultation
   * @returns {Promise<Object>} - Liste paginée des pièces jointes
   */
  async getAttachments(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const url = `/attachments/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Uploader une pièce jointe
   * @param {Object} attachmentData - Données de la pièce jointe
   * @param {File} attachmentData.file - Fichier à uploader (obligatoire)
   * @param {number} attachmentData.fiche_consultation - ID de la fiche (obligatoire)
   * @param {string} attachmentData.description - Description du fichier
   * @param {Function} onProgress - Callback de progression
   * @returns {Promise<Object>} - Pièce jointe créée
   */
  async uploadAttachment(attachmentData, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', attachmentData.file);
      formData.append('fiche_consultation', attachmentData.fiche_consultation);
      
      if (attachmentData.description) {
        formData.append('description', attachmentData.description);
      }

      const response = await api.post('/attachments/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        } : undefined
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer une pièce jointe
   * @param {number} id - ID de la pièce jointe
   * @returns {Promise<Object>} - Détails de la pièce jointe
   */
  async getAttachment(id) {
    try {
      const response = await api.get(`/attachments/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Télécharger un fichier
   * @param {number} id - ID de la pièce jointe
   * @returns {Promise<Blob>} - Fichier en blob
   */
  async downloadAttachment(id) {
    try {
      const response = await api.get(`/attachments/${id}/download/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une pièce jointe
   * @param {number} id - ID de la pièce jointe
   * @returns {Promise<void>}
   */
  async deleteAttachment(id) {
    try {
      await api.delete(`/attachments/${id}/`);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    return authService.handleError(error);
  }
};

// ==================== RENDEZ-VOUS ====================

/**
 * Service de gestion des rendez-vous
 */
export const appointmentService = {
  /**
   * Lister les rendez-vous
   * @param {Object} filters - Filtres optionnels
   * @param {string} filters.status - Statut du rendez-vous
   * @param {string} filters.date_start - Date de début
   * @param {string} filters.date_end - Date de fin
   * @returns {Promise<Object>} - Liste paginée des rendez-vous
   */
  async getAppointments(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const url = `/appointments/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer une demande de rendez-vous (patient)
   * @param {Object} appointmentData - Données du rendez-vous
   * @param {number} appointmentData.fiche_consultation - ID de la fiche (obligatoire)
   * @param {string} appointmentData.preferred_date - Date préférée
   * @param {string} appointmentData.preferred_time - Heure préférée
   * @param {string} appointmentData.type - Type (presentiel, distance)
   * @param {string} appointmentData.notes - Notes du patient
   * @returns {Promise<Object>} - Rendez-vous créé
   */
  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/appointments/', appointmentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer un rendez-vous
   * @param {number} id - ID du rendez-vous
   * @returns {Promise<Object>} - Détails du rendez-vous
   */
  async getAppointment(id) {
    try {
      const response = await api.get(`/appointments/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Assigner un médecin (staff ou médecin)
   * @param {number} id - ID du rendez-vous
   * @param {number} medecinId - ID du médecin
   * @returns {Promise<Object>} - Rendez-vous assigné
   */
  async assignMedecin(id, medecinId) {
    try {
      const response = await api.post(`/appointments/${id}/assign/`, {
        medecin_id: medecinId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Confirmer un créneau (médecin)
   * @param {number} id - ID du rendez-vous
   * @param {Object} confirmData - Données de confirmation
   * @param {string} confirmData.confirmed_date - Date confirmée
   * @param {string} confirmData.confirmed_time - Heure confirmée
   * @param {string} confirmData.notes - Notes du médecin
   * @returns {Promise<Object>} - Rendez-vous confirmé
   */
  async confirmAppointment(id, confirmData) {
    try {
      const response = await api.post(`/appointments/${id}/confirm/`, confirmData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Refuser un rendez-vous (médecin)
   * @param {number} id - ID du rendez-vous
   * @param {string} reason - Motif du refus
   * @returns {Promise<Object>} - Rendez-vous refusé
   */
  async declineAppointment(id, reason) {
    try {
      const response = await api.post(`/appointments/${id}/decline/`, {
        reason: reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Annuler un rendez-vous (patient ou médecin)
   * @param {number} id - ID du rendez-vous
   * @param {string} reason - Motif d'annulation
   * @returns {Promise<Object>} - Rendez-vous annulé
   */
  async cancelAppointment(id, reason) {
    try {
      const response = await api.post(`/appointments/${id}/cancel/`, {
        reason: reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Agenda du médecin
   * @param {Object} filters - Filtres optionnels
   * @param {string} filters.date_start - Date de début
   * @param {string} filters.date_end - Date de fin
   * @returns {Promise<Object>} - Agenda du médecin
   */
  async getDoctorAgenda(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const url = `/appointments/mon-agenda/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    return authService.handleError(error);
  }
};

// ==================== DISPONIBILITÉS ====================

/**
 * Service de gestion des disponibilités médecin
 */
export const availabilityService = {
  /**
   * Lister les disponibilités médecin
   * @param {Object} filters - Filtres optionnels
   * @param {number} filters.medecin - ID du médecin
   * @param {string} filters.date_start - Date de début
   * @param {string} filters.date_end - Date de fin
   * @returns {Promise<Object>} - Liste paginée des disponibilités
   */
  async getAvailabilities(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const url = `/availabilities/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer une disponibilité
   * @param {Object} availabilityData - Données de disponibilité
   * @returns {Promise<Object>} - Disponibilité créée
   */
  async createAvailability(availabilityData) {
    try {
      const response = await api.post('/availabilities/', availabilityData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créneaux disponibles pour période
   * @param {Object} filters - Filtres
   * @param {number} filters.medecin - ID du médecin
   * @param {string} filters.date_start - Date de début
   * @param {string} filters.date_end - Date de fin
   * @returns {Promise<Object>} - Créneaux disponibles
   */
  async getAvailableSlots(filters) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/availabilities/available-slots/?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Générer le calendrier ICS
   * @param {number} medecinId - ID du médecin
   * @returns {Promise<Blob>} - Fichier ICS
   */
  async getCalendarICS(medecinId) {
    try {
      const response = await api.get(`/availabilities/calendar-ics/?medecin=${medecinId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    return authService.handleError(error);
  }
};

// ==================== EXPORTS ====================

/**
 * Service de gestion des exports
 */
export const exportService = {
  /**
   * Export JSON d'une fiche de consultation
   * @param {number} ficheId - ID de la fiche
   * @returns {Promise<Object>} - Données JSON de la fiche
   */
  async exportFicheJSON(ficheId) {
    try {
      const response = await api.get(`/fiche-consultation/${ficheId}/export/json/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Export PDF d'une fiche de consultation
   * @param {number} ficheId - ID de la fiche
   * @returns {Promise<Blob>} - Fichier PDF
   */
  async exportFichePDF(ficheId) {
    try {
      const response = await api.get(`/fiche-consultation/${ficheId}/export/pdf/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Créer un export de données
   * @param {Object} exportData - Paramètres d'export
   * @param {string} exportData.format - Format (csv, json, parquet, excel)
   * @param {string} exportData.data_type - Type de données
   * @param {Object} exportData.filters - Filtres
   * @returns {Promise<Object>} - Job d'export créé
   */
  async createDataExport(exportData) {
    try {
      const response = await api.post('/exports/', exportData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Lister les jobs d'export
   * @returns {Promise<Object>} - Liste des exports
   */
  async getExports() {
    try {
      const response = await api.get('/exports/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Récupérer un job d'export
   * @param {number} id - ID du job
   * @returns {Promise<Object>} - Détails du job
   */
  async getExport(id) {
    try {
      const response = await api.get(`/exports/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Télécharger un fichier d'export
   * @param {number} id - ID du job
   * @returns {Promise<Blob>} - Fichier d'export
   */
  async downloadExport(id) {
    try {
      const response = await api.get(`/exports/${id}/download/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    return authService.handleError(error);
  }
};

// ==================== NOTIFICATIONS ====================

/**
 * Service de gestion des notifications
 */
export const notificationService = {
  /**
   * Envoyer notification au patient
   * @param {number} ficheId - ID de la fiche
   * @param {Object} notificationData - Données de notification
   * @param {string} notificationData.type - Type (sms, whatsapp, email)
   * @param {string} notificationData.message - Message personnalisé
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendNotification(ficheId, notificationData) {
    try {
      const response = await api.post(`/fiche-consultation/${ficheId}/send-notification/`, notificationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    return authService.handleError(error);
  }
};

// ==================== RÉFÉRENCES ====================

/**
 * Service de gestion des références bibliographiques
 */
export const referenceService = {
  /**
   * Lister les références d'une fiche
   * @param {number} ficheId - ID de la fiche
   * @returns {Promise<Array>} - Liste des références
   */
  async getFicheReferences(ficheId) {
    try {
      const response = await api.get(`/fiche-consultation/${ficheId}/references/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Ajouter une référence à une fiche
   * @param {number} ficheId - ID de la fiche
   * @param {Object} referenceData - Données de la référence
   * @param {string} referenceData.title - Titre de la référence (obligatoire)
   * @param {string} referenceData.url - URL de la référence
   * @param {string} referenceData.type - Type de référence
   * @param {string} referenceData.description - Description
   * @returns {Promise<Object>} - Référence ajoutée
   */
  async addFicheReference(ficheId, referenceData) {
    try {
      const response = await api.post(`/fiche-consultation/${ficheId}/references/`, referenceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Modifier une référence
   * @param {number} id - ID de la référence
   * @param {Object} referenceData - Données à modifier
   * @returns {Promise<Object>} - Référence modifiée
   */
  async updateReference(id, referenceData) {
    try {
      const response = await api.patch(`/references/${id}/`, referenceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Supprimer une référence
   * @param {number} id - ID de la référence
   * @returns {Promise<void>}
   */
  async deleteReference(id) {
    try {
      await api.delete(`/references/${id}/`);
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    return authService.handleError(error);
  }
};

// ==================== DIAGNOSTIC ÉDITABLE ====================

/**
 * Service d'édition du diagnostic médecin
 */
export const diagnosticService = {
  /**
   * Éditer le diagnostic médecin
   * @param {number} ficheId - ID de la fiche
   * @param {Object} diagnosticData - Données du diagnostic
   * @param {string} diagnosticData.diagnostic - Diagnostic (obligatoire)
   * @param {string} diagnosticData.traitement - Traitement
   * @param {string} diagnosticData.recommandations - Recommandations
   * @param {string} diagnosticData.examen_complementaire - Examens complémentaires
   * @param {string} diagnosticData.commentaire_medecin - Commentaire médecin
   * @param {string} diagnosticData.signature_medecin - Signature
   * @returns {Promise<Object>} - Diagnostic mis à jour
   */
  async editDiagnostic(ficheId, diagnosticData) {
    try {
      const response = await api.patch(`/fiche-consultation/${ficheId}/edit-diagnostic/`, diagnosticData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs
   * @param {Object} error - Erreur Axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    return authService.handleError(error);
  }
};

/**
 * Service de gestion du tableau de bord
 */
export const dashboardService = {
  /**
   * Récupérer les statistiques du tableau de bord patient
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
   * Récupérer les statistiques du médecin
   * @returns {Promise<Object>} - Statistiques médicales
   */
  getDoctorStats: async () => {
    try {
      // Utiliser l'endpoint des consultations pour calculer les stats
      const consultationsResponse = await consultationService.getConsultations();
      
      // Extraire le tableau results de la réponse paginée
      const consultations = consultationsResponse?.results || [];
      console.log('Consultations extraites pour stats:', consultations);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const stats = {
        consultationsEnCours: consultations.filter(c => 
          c.status === 'en_analyse' || c.status === 'analyse_terminee'
        ).length,
        consultationsAujourdhui: consultations.filter(c => {
          const consultDate = new Date(c.created_at);
          consultDate.setHours(0, 0, 0, 0);
          return consultDate.getTime() === today.getTime();
        }).length,
        consultationsValidees: consultations.filter(c => 
          c.status === 'valide_medecin'
        ).length,
        consultationsEnAttente: consultations.filter(c => 
          c.status === 'analyse_terminee' && !c.diagnostic
        ).length,
        totalConsultations: consultations.length,
        patientsUniques: new Set(consultations.map(c => c.email)).size
      };
      
      console.log('Statistiques calculées:', stats);
      return { success: true, data: stats };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats médecin:', error);
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

// ==================== MESSAGERIE FICHES ====================

/**
 * Service de messagerie pour les fiches de consultation
 */
export const ficheMessagingService = {
  /**
   * Lister les messages d'une fiche de consultation
   * @param {number} ficheId - ID de la fiche
   * @param {Object} filters - Filtres optionnels (author, created_at__gte, created_at__lte)
   * @returns {Promise<Array>} - Liste des messages
   */
  async getMessages(ficheId, filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/fiche-consultation/${ficheId}/messages/?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Ajouter un message à une fiche de consultation
   * @param {number} ficheId - ID de la fiche
   * @param {string} content - Contenu du message (max 2000 caractères)
   * @returns {Promise<Object>} - Message créé
   */
  async addMessage(ficheId, content) {
    try {
      const response = await api.post(`/fiche-consultation/${ficheId}/messages/`, {
        content: content
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs pour le service de messagerie
   * @param {Object} error - Erreur axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    if (error.response?.data) {
      // Retourner directement les données d'erreur pour préserver la structure
      return error.response.data;
    }
    return {
      detail: error.message || 'Erreur lors de l\'opération de messagerie'
    };
  }
};

// ==================== RELANCE ANALYSE IA ====================

/**
 * Service de relance d'analyse IA pour les fiches
 */
export const ficheAIService = {
  /**
   * Relancer l'analyse IA d'une fiche de consultation
   * @param {number} ficheId - ID de la fiche
   * @param {Object} options - Options de relance
   * @param {boolean} options.force_reanalysis - Forcer une nouvelle analyse
   * @param {boolean} options.include_messages - Inclure les messages
   * @param {string} options.analysis_type - Type d'analyse ('complete', 'diagnostic_only', 'recommendation_only')
   * @returns {Promise<Object>} - Réponse de la tâche
   */
  async relanceAnalysis(ficheId, options = {}) {
    try {
      const payload = {
        force_reanalysis: true,
        include_messages: true,
        analysis_type: 'complete',
        ...options
      };

      const response = await api.post(`/fiche-consultation/${ficheId}/relancer/`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Gestion des erreurs pour le service IA
   * @param {Object} error - Erreur axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      detail: error.message || 'Erreur lors de la relance d\'analyse IA'
    };
  }
};

// ==================== WHATSAPP ====================

/**
 * Service WhatsApp pour l'envoi de fiches
 */
export const whatsappService = {
  /**
   * Envoyer une fiche via WhatsApp
   * @param {number} ficheId - ID de la fiche
   * @param {Object} options - Options d'envoi
   * @param {string} options.template_type - Type de template ('consultation_validee', 'consultation_rejetee', 'demande_informations', 'custom')
   * @param {string} options.recipient_phone - Numéro du destinataire (optionnel)
   * @param {string} options.custom_message - Message personnalisé (optionnel)
   * @param {boolean} options.include_attachments - Inclure les documents
   * @param {string} options.language - Langue ('fr', 'en', 'sw')
   * @param {boolean} options.send_immediately - Envoyer immédiatement
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async sendFiche(ficheId, options = {}) {
    try {
      const payload = {
        template_type: 'consultation_validee',
        include_attachments: true,
        language: 'fr',
        send_immediately: true,
        ...options
      };

      const response = await api.post(`/fiche-consultation/${ficheId}/send-whatsapp/`, payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Templates WhatsApp disponibles
   */
  templates: {
    consultation_validee: {
      name: 'Consultation Validée',
      description: 'Template pour consultation validée avec diagnostic'
    },
    consultation_rejetee: {
      name: 'Consultation Rejetée',
      description: 'Template pour consultation rejetée avec motif'
    },
    demande_informations: {
      name: 'Demande d\'informations',
      description: 'Template pour demande d\'informations supplémentaires'
    },
    custom: {
      name: 'Message personnalisé',
      description: 'Template personnalisé'
    }
  },

  /**
   * Vérifier si un numéro est dans le sandbox WhatsApp
   * @param {string} phoneNumber - Numéro de téléphone
   * @returns {Promise<Object>} - Statut sandbox
   */
  async checkSandboxStatus(phoneNumber) {
    try {
      const response = await api.get(`/whatsapp/sandbox-status/?phone=${encodeURIComponent(phoneNumber)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Envoyer les instructions d'onboarding par SMS
   * @param {string} phoneNumber - Numéro de téléphone
   * @returns {Promise<Object>} - Résultat envoi SMS
   */
  async sendOnboardingSMS(phoneNumber) {
    try {
      const response = await api.post('/whatsapp/onboarding-sms/', {
        phone_number: phoneNumber
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Générer un QR code pour l'onboarding WhatsApp
   * @returns {Promise<Object>} - URL du QR code
   */
  async generateOnboardingQR() {
    try {
      const response = await api.get('/whatsapp/onboarding-qr/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Obtenir les instructions d'onboarding
   * @returns {Object} - Instructions d'onboarding
   */
  getOnboardingInstructions() {
    return {
      sandbox_number: '+14155238886',
      join_message: 'join tie-for',
      qr_url: 'https://wa.me/14155238886?text=join%20tie-for',
      steps: [
        'Ouvrez WhatsApp sur votre téléphone',
        'Scannez le QR code ou cliquez sur le lien',
        'Envoyez le message "join tie-for"',
        'Attendez la confirmation d\'activation'
      ]
    };
  },

  /**
   * Gestion des erreurs pour le service WhatsApp
   * @param {Object} error - Erreur axios
   * @returns {Object} - Erreur formatée
   */
  handleError(error) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      detail: error.message || 'Erreur lors de l\'envoi WhatsApp'
    };
  }
};

// Export de l'instance axios configurée
export default api;
