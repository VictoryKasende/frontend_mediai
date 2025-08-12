import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types de rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'administrator',
  DOCTOR: 'medecin',
  PATIENT: 'patient',
  PROFILE: 'profil'
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
  isLoading: false,
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
        isAuthenticated: false,
        user: null,
        error: null
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
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
      // TODO: Remplacer par un appel API réel
      // Simulation d'une connexion réussie
      const mockUser = {
        id: 1,
        email: credentials.email,
        role: USER_ROLES.DOCTOR,
        name: 'Dr. Jean Dupont',
        avatar: null
      };
      
      // Sauvegarder dans localStorage
      localStorage.setItem('mediai_user', JSON.stringify(mockUser));
      localStorage.setItem('mediai_token', 'mock_token_123');
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: mockUser });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('mediai_user');
    localStorage.removeItem('mediai_token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Fonction pour vérifier les permissions
  const hasPermission = (permission) => {
    // TODO: Implémenter la logique des permissions
    return true;
  };

  // Vérifier l'authentification au chargement de l'app
  useEffect(() => {
    const savedUser = localStorage.getItem('mediai_user');
    const savedToken = localStorage.getItem('mediai_token');
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        logout();
      }
    }
  }, []);

  // Valeurs fournies par le contexte
  const value = {
    ...state,
    login,
    logout,
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
