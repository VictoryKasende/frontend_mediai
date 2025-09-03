import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PasswordInput from '../../components/PasswordInput';
import Logo from '../../components/Logo';
import { 
  HeartIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Page de connexion professionnelle pour Mediai
 * Authentification pour patients et médecins
 */
const Login = () => {
  const { login, isLoading } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Message de succès depuis l'inscription
  const successMessage = location.state?.message;
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Afficher le message de bienvenue ou d'inscription réussie
  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
    }
  }, [successMessage, showSuccess]);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Le mot de passe doit contenir au moins 4 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData);
      if (result.success) {
        // Toast de succès
        showSuccess(`Bienvenue ${result.user?.first_name || 'sur Mediai'} ! Connexion réussie.`);
        
        // Rediriger selon le rôle de l'utilisateur
        const userRole = result.user?.role;
        if (userRole === 'medecin') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      } else {
        setErrors({ submit: result.error });
        showError(result.error || 'Identifiants incorrects');
      }
    } catch (error) {
      const errorMessage = 'Une erreur est survenue lors de la connexion';
      setErrors({ submit: errorMessage });
      showError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light py-12 px-4 sm:px-6 lg:px-8 font-medical">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <Logo size="lg" />
          </div>
          <h2 className="text-3xl font-bold text-dark font-heading">
            Connexion à Mediai
          </h2>
          <p className="mt-3 text-sm text-medium font-body">
            Plateforme médicale sécurisée pour patients et médecins
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-lg border border-light p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Nom d'utilisateur"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Votre nom d'utilisateur"
                required
                error={errors.username}
                icon={UserIcon}
                helperText="Votre identifiant de connexion"
              />

              <PasswordInput
                label="Mot de passe"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                required
                error={errors.password}
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(!showPassword)}
              />
            </div>

            {/* Erreur de soumission */}
            {errors.submit && (
              <div className="bg-light border border-medium rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-medium" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-dark">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Options supplémentaires */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-medium rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-dark font-body">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link to="/auth/forgot-password" className="font-medium text-primary hover:text-secondary transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Bouton de connexion */}
            <Button
              type="submit"
              className="w-full flex items-center justify-center text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 bg-primary hover:bg-secondary"
              loading={isLoading}
              disabled={isLoading}
            >
              {!isLoading && (
                <ArrowRightIcon className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">Se connecter</span>
              <span className="sm:hidden">Connexion</span>
            </Button>
          </form>
        </div>

        {/* Lien d'inscription */}
        <div className="text-center">
          <p className="text-sm text-medium font-body">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="font-medium text-primary hover:text-secondary transition-colors font-medical">
              S'inscrire comme patient
            </Link>
          </p>
        </div>

        {/* Note de sécurité */}
        <div className="bg-light border border-medium rounded-lg p-4 text-center">
          <div className="flex items-center justify-center">
            <ShieldCheckIcon className="h-4 w-4 text-primary mr-2" />
            <p className="text-xs text-dark">
              Connexion sécurisée - Vos données médicales sont protégées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
