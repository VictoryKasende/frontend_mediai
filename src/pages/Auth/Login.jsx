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
  const { showSuccess, showError } = useNotification();
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
    // Effacer seulement l'erreur du champ modifié, pas l'erreur de soumission
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Veuillez saisir votre nom d\'utilisateur';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 2 caractères';
    }

    if (!formData.password) {
      newErrors.password = 'Veuillez saisir votre mot de passe';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Le mot de passe doit contenir au moins 4 caractères';
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Empêcher tout rechargement de page
    if (isLoading) {
      return false;
    }
    
    // Réinitialiser les erreurs avant la validation
    setErrors({});
    
    const validation = validateForm();
    if (!validation.isValid) {
      // Afficher un toast d'erreur spécifique pour la validation qui disparaît après 4 secondes
      const validationErrors = Object.values(validation.errors);
      if (validationErrors.length > 0) {
        showError(validationErrors[0]); // Afficher la première erreur
        // Le toast disparaîtra automatiquement, mais l'erreur reste dans le formulaire
      } else {
        showError('Veuillez corriger les erreurs dans le formulaire');
      }
      return false;
    }

    try {
      const result = await login(formData);
      if (result.success) {
        // Toast de succès
        showSuccess(`Bienvenue ${result.user?.first_name || result.user?.nom || 'sur Mediai'} ! Connexion réussie.`);
        
        // Rediriger selon le rôle de l'utilisateur
        const userRole = result.user?.role;
        if (userRole === 'medecin') {
          navigate('/doctor/dashboard', { replace: true });
        } else {
          navigate('/patient/dashboard', { replace: true });
        }
      } else {
        // Gestion des erreurs spécifiques
        let errorMessage = 'Une erreur est survenue lors de la connexion';
        
        if (result.error) {
          const error = result.error.toLowerCase();
          
          if (error.includes('invalid') || error.includes('incorrect') || error.includes('wrong') || error.includes('credentials')) {
            errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
          } else if (error.includes('user') && (error.includes('not found') || error.includes('does not exist'))) {
            errorMessage = 'Aucun compte trouvé avec ce nom d\'utilisateur. Vérifiez votre saisie ou créez un compte.';
          } else if (error.includes('password')) {
            errorMessage = 'Mot de passe incorrect. Avez-vous oublié votre mot de passe ?';
          } else if (error.includes('account') && error.includes('disabled')) {
            errorMessage = 'Votre compte a été désactivé. Contactez l\'administrateur pour plus d\'informations.';
          } else if (error.includes('too many') || error.includes('rate limit')) {
            errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.';
          } else if (error.includes('network') || error.includes('connection')) {
            errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.';
          } else if (error.includes('authentication') || error.includes('login')) {
            errorMessage = 'Échec de l\'authentification. Vérifiez vos identifiants et réessayez.';
          } else {
            errorMessage = result.error;
          }
        }
        
        console.log('Erreur de connexion:', result.error); // Pour debug
        
        // Afficher l'erreur avec un toast qui disparaît automatiquement
        setErrors({ submit: errorMessage });
        showError(errorMessage); // Le toast disparaîtra automatiquement après 4 secondes
        
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error); // Pour debug
      
      let errorMessage = 'Une erreur technique est survenue. Veuillez réessayer dans quelques instants.';
      
      if (error.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'La connexion a pris trop de temps. Veuillez réessayer.';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Service de connexion indisponible. Réessayez plus tard.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.';
        }
      }
      
      // Afficher l'erreur avec un toast qui disparaît automatiquement
      setErrors({ submit: errorMessage });
      showError(errorMessage); // Le toast disparaîtra automatiquement après 4 secondes
      
      return false;
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
                placeholder="Exemple: Deborah, Jean"
                required
                error={errors.username}
                icon={UserIcon}
                helperText="Votre nom d'utilisateur (prénom, nom ou identifiant)"
              />

              <PasswordInput
                label="Mot de passe"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Saisissez votre mot de passe"
                required
                error={errors.password}
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(!showPassword)}
                helperText="Minimum 4 caractères requis"
              />
            </div>

            {/* Erreur de soumission */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur de connexion
                    </h3>
                    <p className="mt-1 text-sm text-red-700">{errors.submit}</p>
                    <div className="mt-3">
                      <div className="-mx-2 -my-1.5 flex">
                        <button
                          type="button"
                          onClick={() => setErrors({})}
                          className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                        >
                          Fermer
                        </button>
                        {errors.submit.includes('mot de passe') && (
                          <Link
                            to="/auth/forgot-password"
                            className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                          >
                            Mot de passe oublié ?
                          </Link>
                        )}
                        {errors.submit.includes('compte') && !errors.submit.includes('désactivé') && (
                          <Link
                            to="/auth/register"
                            className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                          >
                            Créer un compte
                          </Link>
                        )}
                      </div>
                    </div>
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
              onClick={(e) => {
                // Empêcher le comportement par défaut si le bouton est dans un état de chargement
                if (isLoading) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }}
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
