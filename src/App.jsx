import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { router } from './routes/routes';

/**
 * Composant principal de l'application Mediai
 * Fournit le contexte d'authentification, les notifications et configure le routage
 */
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="App">
          <RouterProvider router={router} />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
