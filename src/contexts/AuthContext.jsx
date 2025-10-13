/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

// Types de rôles utilisateur selon l'API
export const USER_ROLES = {
  DOCTOR: 'medecin',
  PATIENT: 'patient'
};

// Actions pour le reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER'
};

// État initial de l'authentification
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Commencer par true pour éviter les redirections prématurées
  error: null
};

// Reducer pour gérer l'état d'authentification
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        isLoading: false, // Marquer comme terminé après l'initialisation
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    default:
      return state;
  }
};

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Provider d'authentification
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Fonction de connexion
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await authService.login({
        username: credentials.username || credentials.email,
        password: credentials.password
      });
      
      const user = response.user;
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.message || 'Erreur de connexion';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // Préparer seulement les données requises par l'API
      const registrationData = {
        username: userData.username?.trim(),
        email: userData.email?.trim(),
        password: userData.password,
        first_name: userData.firstName?.trim(),
        last_name: userData.lastName?.trim(),
        role: USER_ROLES.PATIENT // Toujours patient pour cette interface
      };
      
      // Validation côté client avant envoi
      if (!registrationData.username || registrationData.username.length < 2) {
        throw new Error('Le nom d\'utilisateur doit contenir au moins 2 caractères');
      }
      
      if (!registrationData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
        throw new Error('Adresse email invalide');
      }
      
      if (!registrationData.password || registrationData.password.length < 4) {
        throw new Error('Le mot de passe doit contenir au moins 4 caractères');
      }
      
      if (!registrationData.first_name || registrationData.first_name.length < 1) {
        throw new Error('Le prénom est requis');
      }
      
      if (!registrationData.last_name || registrationData.last_name.length < 1) {
        throw new Error('Le nom est requis');
      }
      
      console.log('Données d\'inscription envoyées:', registrationData); // Pour debug
      
      const registrationResult = await authService.register(registrationData);
      console.log('Inscription réussie:', registrationResult); // Pour debug
      
      // Après inscription réussie, connecter automatiquement l'utilisateur
      return await login({
        username: userData.username,
        password: userData.password
      });
    } catch (error) {
      console.error('Erreur d\'inscription détaillée:', error); // Pour debug
      const errorMessage = error.message || 'Erreur lors de l\'inscription';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: true };
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: false, error: error.message };
    }
  };

  // Fonction pour mettre à jour les informations utilisateur
  const updateUser = (userData) => {
    // Mettre à jour l'utilisateur dans l'état
    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
    
    // Mettre à jour également dans le localStorage
    localStorage.setItem('mediai_user', JSON.stringify(userData));
  };

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Fonction pour vérifier les permissions
  // eslint-disable-next-line no-unused-vars
  const hasPermission = (permission) => {
    // TODO: Implémenter la logique des permissions
    return true;
  };

  // Vérifier l'authentification au chargement de l'app
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('mediai_user');
      const accessToken = localStorage.getItem('mediai_access_token');
      
      // Si pas de données sauvegardées, marquer comme terminé
      if (!savedUser || !accessToken) {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
        return;
      }

      try {
        const user = JSON.parse(savedUser);
        
        // Vérifier si le token est toujours valide
        const isValid = await authService.verifyToken(accessToken);
        
        if (isValid) {
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        } else {
          // Token invalide, essayer de le rafraîchir
          const refreshToken = localStorage.getItem('mediai_refresh_token');
          if (refreshToken) {
            try {
              const newTokens = await authService.refreshToken(refreshToken);
              localStorage.setItem('mediai_access_token', newTokens.access);
              
              // Récupérer les informations utilisateur à jour
              const updatedUser = await authService.getUserProfile();
              localStorage.setItem('mediai_user', JSON.stringify(updatedUser));
              dispatch({ type: AUTH_ACTIONS.SET_USER, payload: updatedUser });
            } catch (error) {
              console.warn('Impossible de rafraîchir le token:', error);
              // Nettoyer le localStorage et marquer comme non authentifié
              localStorage.removeItem('mediai_user');
              localStorage.removeItem('mediai_access_token');
              localStorage.removeItem('mediai_refresh_token');
              dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
            }
          } else {
            // Pas de refresh token, nettoyer et marquer comme non authentifié
            localStorage.removeItem('mediai_user');
            localStorage.removeItem('mediai_access_token');
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        // Nettoyer le localStorage en cas d'erreur
        localStorage.removeItem('mediai_user');
        localStorage.removeItem('mediai_access_token');
        localStorage.removeItem('mediai_refresh_token');
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      }
    };

    initializeAuth();
  }, []);

  // Valeurs fournies par le contexte
  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasPermission,
    USER_ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
