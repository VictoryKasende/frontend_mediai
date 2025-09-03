import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Importation des pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import DoctorChatIa from '../pages/Doctor/DoctorChatIa';
import PatientDashboard from '../pages/Patient/PatientDashboard';
import DoctorDashboard from '../pages/Doctor/DoctorDashboard';

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
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

/**
 * Composant pour protéger les routes médecin
 */
const DoctorRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (user?.role !== 'medecin' && user?.role !== 'doctor') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

/**
 * Composant pour protéger les routes patient
 */
const PatientRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (user?.role !== 'patient') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

/**
 * Page 404 personnalisée
 */
const NotFoundPage = () => (
  <div className="min-h-screen bg-light flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-mediai-dark mb-4">404</h1>
      <p className="text-xl text-mediai-medium mb-8">Page non trouvée</p>
      <a 
        href="/" 
        className="inline-block px-6 py-3 bg-mediai-primary text-white rounded-lg hover:bg-mediai-secondary transition-colors"
      >
        Retour à l'accueil
      </a>
    </div>
  </div>
);

/**
 * Page d'accès non autorisé
 */
const UnauthorizedPage = () => (
  <div className="min-h-screen bg-light flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-danger mb-4">403</h1>
      <p className="text-xl text-mediai-medium mb-8">Accès non autorisé</p>
      <a 
        href="/" 
        className="inline-block px-6 py-3 bg-mediai-primary text-white rounded-lg hover:bg-mediai-secondary transition-colors"
      >
        Retour à l'accueil
      </a>
    </div>
  </div>
);

/**
 * Configuration principale des routes de l'application
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route racine - redirection intelligente */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      
      {/* Routes d'authentification */}
      <Route path="/auth/*" element={
        <Routes>
          <Route path="login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      } />
      
      {/* Routes Patient */}
      <Route path="/patient/*" element={
        <Routes>
          <Route path="" element={
            <PatientRoute>
              <PatientDashboard />
            </PatientRoute>
          } />
          <Route path="dashboard" element={
            <PatientRoute>
              <PatientDashboard />
            </PatientRoute>
          } />
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>
      } />
      
      {/* Routes Médecin */}
      <Route path="/doctor/*" element={
        <Routes>
          <Route path="" element={
            <DoctorRoute>
              <DoctorDashboard />
            </DoctorRoute>
          } />
          <Route path="dashboard" element={
            <DoctorRoute>
              <DoctorDashboard />
            </DoctorRoute>
          } />
          <Route path="chat" element={
            <DoctorRoute>
              <DoctorChatIa />
            </DoctorRoute>
          } />
          <Route path="*" element={<Navigate to="/doctor" replace />} />
        </Routes>
      } />
      
      {/* Pages d'erreur */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
