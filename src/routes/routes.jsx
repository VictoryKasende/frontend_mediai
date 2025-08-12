import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Importation des pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ChatPage from '../pages/Chat/ChatPage';
import ConsultationPage from '../pages/Consultation/ConsultationPage';
import PatientDashboard from '../pages/Patient/PatientDashboard';
import TestPage from '../pages/TestPage';

// Layout principal
import Layout from '../components/Layout';

/**
 * Composant pour protéger les routes authentifiées
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

/**
 * Composant pour rediriger les utilisateurs déjà connectés
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    // Rediriger selon le rôle de l'utilisateur
    if (user?.role === 'patient') {
      return <Navigate to="/patient" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * Composant pour protéger les routes d'administration
 */
const AdminRoute = ({ children }) => {
  const { user, hasRole, USER_ROLES } = useAuth();
  
  if (!hasRole(USER_ROLES.ADMIN)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Accès non autorisé
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return children;
};

/**
 * Composant pour rediriger vers le bon dashboard selon le rôle
 */
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'patient') {
    return <Navigate to="/patient" replace />;
  }
  
  // Pour les autres rôles (médecin, administrateur, profil)
  return <Navigate to="/dashboard" replace />;
};

/**
 * Configuration des routes de l'application
 */
export const router = createBrowserRouter([
  // Redirection racine vers le bon dashboard selon le rôle
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RoleBasedRedirect />
      </ProtectedRoute>
    )
  },
  
  // Routes d'authentification
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        )
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        )
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        )
      },
      // Redirection par défaut vers login
      {
        path: '',
        element: <Navigate to="/auth/login" replace />
      }
    ]
  },
  
  // Routes protégées - Dashboard
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    )
  },
  
  // Routes protégées - Chat
  {
    path: '/chat',
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        )
      },
      {
        path: ':chatId',
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        )
      }
    ]
  },
  
  // Routes protégées - Consultation
  {
    path: '/consultation',
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute>
            <ConsultationPage />
          </ProtectedRoute>
        )
      },
      {
        path: ':consultationId',
        element: (
          <ProtectedRoute>
            <ConsultationPage />
          </ProtectedRoute>
        )
      }
    ]
  },
  
  // Routes protégées - Patient Dashboard
  {
    path: '/patient',
    element: (
      <ProtectedRoute>
        <PatientDashboard />
      </ProtectedRoute>
    )
  },
  
  // Route de démonstration pour tester le dashboard patient (sans authentification)
  {
    path: '/demo/patient',
    element: <PatientDashboard />
  },
  
  // Page de test pour naviguer facilement
  {
    path: '/test',
    element: <TestPage />
  },
  
  // Routes d'administration (réservées aux administrateurs)
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <div className="p-6">
            <h1 className="text-2xl font-bold">⚙️ Administration</h1>
            <p className="text-gray-600 mt-2">Interface d'administration - En développement</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">👥 Gestion des utilisateurs</h3>
                <p className="text-sm text-gray-600">Gérer les comptes médecins, patients et profils</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">📊 Statistiques globales</h3>
                <p className="text-sm text-gray-600">Voir les métriques de la plateforme</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold mb-2">⚙️ Configuration</h3>
                <p className="text-sm text-gray-600">Paramètres généraux de l'application</p>
              </div>
            </div>
          </div>
        </AdminRoute>
      </ProtectedRoute>
    )
  },
  
  // Routes d'erreur et pages légales
  {
    path: '/terms',
    element: (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">📋 Conditions d'utilisation</h1>
          <p className="text-gray-600">
            Page des conditions d'utilisation de la plateforme Mediai - En développement
          </p>
        </div>
      </div>
    )
  },
  {
    path: '/privacy',
    element: (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">🔒 Politique de confidentialité</h1>
          <p className="text-gray-600">
            Politique de confidentialité de la plateforme Mediai - En développement
          </p>
        </div>
      </div>
    )
  },
  
  // Page 404 - Route par défaut pour les URL non trouvées
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl text-gray-600 mb-4">Page non trouvée</h2>
          <p className="text-gray-500 mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }
]);

/**
 * Fonction utilitaire pour la navigation programmatique
 */
export const navigationUtils = {
  // Liens vers les principales sections
  dashboard: '/dashboard',
  chat: '/chat',
  consultation: '/consultation',
  admin: '/admin',
  
  // Liens d'authentification
  login: '/auth/login',
  register: '/auth/register',
  
  // Fonction pour construire des liens avec paramètres
  chatWithId: (chatId) => `/chat/${chatId}`,
  consultationWithId: (consultationId) => `/consultation/${consultationId}`,
  
  // Fonction pour rediriger selon le rôle utilisateur
  getDefaultRouteForRole: (role) => {
    switch (role) {
      case 'administrator':
        return '/admin';
      case 'medecin':
        return '/dashboard';
      case 'patient':
        return '/chat';
      default:
        return '/dashboard';
    }
  }
};

export default router;
