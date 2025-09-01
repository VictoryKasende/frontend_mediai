import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Importation des pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import DoctorChatIa from '../pages/Doctor/DoctorChatIa';
import PatientDashboard from '../pages/Patient/PatientDashboard';
import DoctorDashboard from '../pages/Doctor/DoctorDashboard';

// Layout principal
// import Layout from '../components/Layout';

/**
 * Composant pour protéger les routes authentifiées
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return children;
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
    if (user?.role === 'medecin' || user?.role === 'doctor') {
      return <Navigate to="/doctor" replace />;
    }
    return <Navigate to="/doctor" replace />;
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
  if (user?.role === 'medecin' || user?.role === 'doctor') {
    return <Navigate to="/doctor" replace />;
  }
  return <Navigate to="/doctor" replace />;
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
  
  // Routes du doctor
  {
    path: '/doctor',
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute>
            <DoctorDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DoctorDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <DoctorChatIa />
          </ProtectedRoute>
        )
      },
      {
        path: 'consultation',
        element: (
          <ProtectedRoute>
            <DoctorDashboard />
          </ProtectedRoute>
        )
      }
    ]
  },

  // Routes du patient
  {
    path: '/patient',
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        )
      }
    ]
  },

  // Routes de compatibilité (redirections)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DoctorDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <DoctorChatIa />
      </ProtectedRoute>
    )
  },
  {
    path: '/consultation',
    element: (
      <ProtectedRoute>
        <DoctorDashboard />
      </ProtectedRoute>
    )
  },

  // Routes de démonstration (sans authentification)
  {
    path: '/demo/patient',
    element: <PatientDashboard />
  },
  {
    path: '/demo/doctor',
    element: <DoctorDashboard />
  },
  
  // Routes d'administration (simplifiées)
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <div className="min-h-screen gradient-mediai">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4 font-heading">Administration</h1>
                <p className="text-xl text-white/80 font-body max-w-2xl mx-auto">
                  Interface d'administration de la plateforme Mediai
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover-lift">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-heading">Gestion des utilisateurs</h3>
                  <p className="text-white/70 font-body">Gérer les comptes médecins, patients et profils</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover-lift">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-heading">Statistiques</h3>
                  <p className="text-white/70 font-body">Voir les métriques de la plateforme</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover-lift">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-heading">Configuration</h3>
                  <p className="text-white/70 font-body">Paramètres généraux de l'application</p>
                </div>
              </div>
            </div>
          </div>
        </AdminRoute>
      </ProtectedRoute>
    )
  },
  
  // Pages légales stylisées
  {
    path: '/terms',
    element: (
      <div className="min-h-screen bg-light py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-2xl rounded-3xl border border-border-light overflow-hidden">
            <div className="gradient-primary px-8 py-12 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4 font-heading">Conditions d'utilisation</h1>
              <p className="text-xl text-white/80 font-body max-w-2xl mx-auto">
                Conditions générales d'utilisation de la plateforme Mediai
              </p>
            </div>
            
            <div className="p-12">
              <div className="prose prose-lg max-w-none text-mediai-dark font-body">
                <div className="bg-light rounded-2xl p-8 border border-border-light">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-mediai-primary rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-mediai-dark font-heading">En cours de développement</h2>
                      <p className="text-mediai-medium mt-1">Cette page sera bientôt disponible</p>
                    </div>
                  </div>
                  
                  <p className="text-mediai-medium leading-relaxed">
                    Les conditions d'utilisation de la plateforme Mediai sont actuellement en cours de rédaction. 
                    Elles incluront les termes et conditions d'usage, les droits et responsabilités des utilisateurs, 
                    ainsi que les règles de confidentialité et de sécurité des données médicales.
                  </p>
                  
                  <div className="mt-8 pt-6 border-t border-border-light">
                    <button 
                      onClick={() => window.history.back()}
                      className="inline-flex items-center px-6 py-3 bg-mediai-primary hover:bg-mediai-secondary text-white rounded-xl font-medium transition-all duration-300 hover-lift"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Retour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  
  {
    path: '/privacy',
    element: (
      <div className="min-h-screen bg-light py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-2xl rounded-3xl border border-border-light overflow-hidden">
            <div className="gradient-mediai-dark px-8 py-12 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4 font-heading">Politique de confidentialité</h1>
              <p className="text-xl text-white/80 font-body max-w-2xl mx-auto">
                Protection et traitement des données personnelles sur Mediai
              </p>
            </div>
            
            <div className="p-12">
              <div className="prose prose-lg max-w-none text-mediai-dark font-body">
                <div className="bg-light rounded-2xl p-8 border border-border-light">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-mediai-secondary rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-mediai-dark font-heading">Sécurité des données</h2>
                      <p className="text-mediai-medium mt-1">Votre confidentialité est notre priorité</p>
                    </div>
                  </div>
                  
                  <p className="text-mediai-medium leading-relaxed">
                    La politique de confidentialité de Mediai est en cours de finalisation. Elle détaillera comment nous 
                    collectons, utilisons et protégeons vos données personnelles et médicales, conformément aux réglementations 
                    en vigueur (RGPD, lois sur la protection des données de santé).
                  </p>
                  
                  <div className="mt-8 pt-6 border-t border-border-light">
                    <button 
                      onClick={() => window.history.back()}
                      className="inline-flex items-center px-6 py-3 bg-mediai-secondary hover:bg-mediai-primary text-white rounded-xl font-medium transition-all duration-300 hover-lift"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Retour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  
  // Page 404 stylisée
  {
    path: '*',
    element: (
      <div className="min-h-screen gradient-mediai flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="relative mb-12">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/30">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/30 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/20 rounded-full animate-pulse delay-1000"></div>
          </div>
          
          <h1 className="text-8xl font-bold text-white mb-4 font-heading tracking-tight">404</h1>
          <h2 className="text-3xl font-bold text-white mb-6 font-heading">Page introuvable</h2>
          <p className="text-xl text-white/80 mb-12 font-body leading-relaxed">
            Oups ! La page que vous recherchez semble avoir disparu ou a été déplacée.
            <br />
            <span className="text-lg">Ne vous inquiétez pas, nous allons vous aider à retrouver votre chemin.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-lg text-white border-2 border-white/30 rounded-2xl font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 hover-lift"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-8 py-4 bg-white text-mediai-primary rounded-2xl font-medium transition-all duration-300 hover:bg-white/90 hover:scale-105 hover-lift shadow-xl"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Accueil
            </button>
          </div>
          
          <div className="mt-16 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3 font-heading">Besoin d'aide ?</h3>
            <p className="text-white/70 text-sm font-body">
              Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe support.
            </p>
          </div>
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
  
  // Fonction pour rediriger selon le rôle utilisateur
  getDefaultRouteForRole: (role) => {
    switch (role) {
      case 'administrator':
        return '/admin';
      case 'medecin':
      case 'doctor':
        return '/doctor';
      case 'patient':
        return '/patient';
      default:
        return '/doctor';
    }
  }
};

export default router;
