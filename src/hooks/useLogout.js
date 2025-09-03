import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

/**
 * Hook personnalisé pour gérer la déconnexion avec notifications
 */
export const useLogout = () => {
  const { logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const result = await logout();
      
      if (result.success) {
        showSuccess('Déconnexion réussie. À bientôt sur Mediai !');
      } else {
        showError('Erreur lors de la déconnexion, mais vous avez été déconnecté.');
      }
      
      // Redirection vers la page de connexion
      navigate('/auth/login');
    } catch (error) {
      showError('Erreur lors de la déconnexion');
      // Redirection même en cas d'erreur
      navigate('/auth/login');
    }
  };

  return { handleLogout };
};
