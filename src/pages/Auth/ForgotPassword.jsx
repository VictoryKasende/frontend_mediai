import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Logo from '../../components/Logo';
import { 
  HeartIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

/**
 * Page de récupération de mot de passe pour Mediai
 * Permet aux utilisateurs de réinitialiser leur mot de passe
 */
const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

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

    if (!formData.email) {
      newErrors.email = 'L\'adresse email est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez saisir une adresse email valide';
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

    setIsLoading(true);

    try {
      // TODO: Remplacer par un appel API réel pour la récupération de mot de passe
      // Simulation d'envoi d'email de récupération
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Demande de récupération pour:', formData.email);
      setIsEmailSent(true);
      
    } catch (error) {
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer plus tard.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Affichage après envoi de l'email
  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light py-12 px-4 sm:px-6 lg:px-8 font-medical">
        <div className="max-w-md w-full space-y-8">
          
          {/* Header de confirmation */}
          <div className="text-center">
            <div className="mx-auto mb-6">
              <Logo size="lg" />
            </div>
            <h2 className="text-3xl font-bold text-dark font-heading">
              Email envoyé !
            </h2>
            <p className="mt-3 text-sm text-medium font-body">
              Instructions de récupération envoyées à votre adresse
            </p>
          </div>

          {/* Message de confirmation */}
          <div className="bg-white rounded-lg shadow-lg border p-8">
            <div className="text-center space-y-4">
              <div className="bg-light border border-medium rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-dark font-heading mb-2">
                      Email envoyé à : {formData.email}
                    </h3>
                    <p className="text-sm text-medium font-body">
                      Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-light border border-medium rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-dark font-heading mb-2">
                      Que faire ensuite ?
                    </h4>
                    <ul className="text-sm text-medium space-y-1 font-body">
                      <li>• Vérifiez votre boîte de réception</li>
                      <li>• Consultez aussi vos spams/courriers indésirables</li>
                      <li>• Cliquez sur le lien dans l'email reçu</li>
                      <li>• Créez un nouveau mot de passe sécurisé</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Link to="/auth/login">
                <Button className="w-full flex items-center justify-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Retour à la connexion
                </Button>
              </Link>
              
              <button
                onClick={() => {
                  setIsEmailSent(false);
                  setFormData({ email: '' });
                }}
                className="w-full text-sm text-primary hover:text-secondary transition-colors font-medical"
              >
                Renvoyer l'email à une autre adresse
              </button>
            </div>
          </div>

          {/* Note de sécurité */}
          <div className="bg-light border border-medium rounded-lg p-4 text-center">
            <div className="flex items-center justify-center">
              <ShieldCheckIcon className="h-4 w-4 text-primary mr-2" />
              <p className="text-xs text-medium">
                Le lien de récupération expire dans 24h pour votre sécurité
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire de demande de récupération
  return (
    <div className="min-h-screen flex items-center justify-center bg-light py-12 px-4 sm:px-6 lg:px-8 font-medical">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <Logo size="lg" />
          </div>
          <h2 className="text-3xl font-bold text-dark font-heading">
            Mot de passe oublié ?
          </h2>
          <p className="mt-3 text-sm text-medium font-body">
            Saisissez votre email pour recevoir un lien de récupération
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-lg border border-light p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <Input
              label="Adresse email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nom@exemple.com"
              required
              error={errors.email}
              icon={EnvelopeIcon}
              helperText="L'email associé à votre compte Mediai"
            />

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

            {/* Information sur le processus */}
            <div className="bg-light border border-medium rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-dark font-heading mb-1">
                    Comment ça marche ?
                  </h4>
                  <p className="text-sm text-medium font-body">
                    Nous vous enverrons un email sécurisé avec un lien pour créer un nouveau mot de passe. 
                    Le lien expire dans 24h.
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton d'envoi */}
            <Button
              type="submit"
              className="w-full flex items-center justify-center text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
              loading={isLoading}
              disabled={isLoading}
            >
              {!isLoading && (
                <EnvelopeIcon className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">Envoyer le lien de récupération</span>
              <span className="sm:hidden">Envoyer</span>
            </Button>
          </form>
        </div>

        {/* Retour à la connexion */}
        <div className="text-center">
          <Link 
            to="/auth/login" 
            className="inline-flex items-center text-sm text-primary hover:text-secondary transition-colors font-medical"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour à la connexion
          </Link>
        </div>

        {/* Note de sécurité */}
        <div className="bg-light border border-medium rounded-lg p-4 text-center">
          <div className="flex items-center justify-center">
            <ShieldCheckIcon className="h-4 w-4 text-primary mr-2" />
            <p className="text-xs text-medium">
              Vos données personnelles et médicales restent protégées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
