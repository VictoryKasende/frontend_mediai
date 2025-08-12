import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PhoneInput from '../../components/PhoneInput';
import PasswordInput from '../../components/PasswordInput';
import Logo from '../../components/Logo';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LockClosedIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HeartIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

/**
 * Page d'inscription professionnelle pour patients
 * Formulaire multi-étapes avec validation complète
 */
const Register = () => {
  const { USER_ROLES } = useAuth();
  const navigate = useNavigate();
  
  // État du formulaire multi-étapes
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState({
    // Étape 1: Informations personnelles
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Étape 2: Adresse et informations complémentaires
    address: '',
    city: '',
    postalCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Étape 3: Sécurité et préférences
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptMarketing: false,
    role: USER_ROLES.PATIENT
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation par étape
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'Le prénom est requis';
        } else if (formData.firstName.length < 2) {
          newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
        }
        
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Le nom est requis';
        } else if (formData.lastName.length < 2) {
          newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
        }
        
        if (!formData.email) {
          newErrors.email = 'L\'adresse email est requise';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Veuillez saisir une adresse email valide';
        }
        
        if (!formData.phone) {
          newErrors.phone = 'Le numéro de téléphone est requis';
        } else if (!formData.phone.startsWith('+')) {
          newErrors.phone = 'Veuillez sélectionner un pays et saisir un numéro valide';
        }
        
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'La date de naissance est requise';
        } else {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 0 || age > 120) {
            newErrors.dateOfBirth = 'Veuillez saisir une date de naissance valide';
          }
        }
        
        if (!formData.gender) {
          newErrors.gender = 'Veuillez sélectionner votre genre';
        }
        break;
        
      case 2:
        if (!formData.address.trim()) {
          newErrors.address = 'L\'adresse est requise';
        }
        
        if (!formData.city.trim()) {
          newErrors.city = 'La ville est requise';
        }
        
        // Code postal optionnel - validation seulement si renseigné
        if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) {
          newErrors.postalCode = 'Le code postal doit contenir 5 chiffres';
        }
        
        if (!formData.emergencyContact.trim()) {
          newErrors.emergencyContact = 'Un contact d\'urgence est requis';
        }
        
        if (!formData.emergencyPhone) {
          newErrors.emergencyPhone = 'Le numéro d\'urgence est requis';
        } else if (!formData.emergencyPhone.startsWith('+')) {
          newErrors.emergencyPhone = 'Veuillez sélectionner un pays et saisir un numéro valide';
        }
        break;
        
      case 3:
        if (!formData.password) {
          newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 4) {
          newErrors.password = 'Le mot de passe doit contenir au moins 4 caractères';
        }
        
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Soumission finale du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Remplacer par un appel API réel
      // Simulation d'une inscription réussie
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Données d\'inscription complètes:', formData);
      
      // Rediriger vers la page de connexion avec un message de succès
      navigate('/auth/login', { 
        state: { 
          message: 'Inscription réussie ! Bienvenue sur Mediai. Vous pouvez maintenant vous connecter.' 
        } 
      });
    } catch (error) {
      setErrors({ submit: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu de l'étape 1 - Informations personnelles
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Prénom"
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Marie"
          required
          error={errors.firstName}
          icon={UserIcon}
        />
        <Input
          label="Nom"
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Martin"
          required
          error={errors.lastName}
          icon={UserIcon}
        />
      </div>

      <Input
        label="Adresse email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="marie.martin@exemple.com"
        required
        error={errors.email}
        icon={EnvelopeIcon}
        helperText="Votre email servira à vous connecter"
      />

      <PhoneInput
        label="Numéro de téléphone"
        name="phone"
        value={formData.phone}
        onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
        placeholder="Numéro de téléphone"
        required
        error={errors.phone}
        helperText="Votre numéro pour vous contacter en cas d'urgence"
        defaultCountry="CD"
      />

      <Input
        label="Date de naissance"
        type="date"
        name="dateOfBirth"
        value={formData.dateOfBirth}
        onChange={handleChange}
        required
        error={errors.dateOfBirth}
        icon={CalendarIcon}
      />

      <div>
        <label className="block text-sm font-medium text-dark mb-2">
          Genre <span className="text-medium">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'female', label: 'Femme' },
            { value: 'male', label: 'Homme' },
            { value: 'other', label: 'Autre' }
          ].map((option) => (
            <label key={option.value} className="flex items-center p-3 border border-medium rounded-lg cursor-pointer hover:bg-light transition-colors">
              <input
                type="radio"
                name="gender"
                value={option.value}
                checked={formData.gender === option.value}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-medium"
              />
              <span className="ml-2 text-sm text-dark">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.gender && (
          <p className="mt-1 text-sm text-medium">{errors.gender}</p>
        )}
      </div>
    </div>
  );

  // Rendu de l'étape 2 - Adresse et contact d'urgence
  const renderStep2 = () => (
    <div className="space-y-4">
      <Input
        label="Adresse complète"
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="123 rue de la Santé"
        required
        error={errors.address}
        icon={MapPinIcon}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Ville"
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Paris"
          required
          error={errors.city}
        />
        <Input
          label="Code postal"
          helperText = "Ce champ n'est pas obligatoire"
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          placeholder="75001"
          error={errors.postalCode}
          maxLength="5"
        />
      </div>

        <div className="bg-light border border-medium rounded-lg p-4">
          <h4 className="text-sm font-medium text-dark mb-3 font-medical">Contact d'urgence</h4>        <Input
          label="Nom du contact d'urgence"
          type="text"
          name="emergencyContact"
          value={formData.emergencyContact}
          onChange={handleChange}
          placeholder="Prénom Nom (relation)"
          required
          error={errors.emergencyContact}
          helperText="Ex: Pierre Martin (époux)"
        />
        
        <PhoneInput
          label="Téléphone d'urgence"
          name="emergencyPhone"
          value={formData.emergencyPhone}
          onChange={(value) => setFormData(prev => ({ ...prev, emergencyPhone: value || '' }))}
          placeholder="Numéro d'urgence"
          required
          error={errors.emergencyPhone}
          defaultCountry="CD"
        />
      </div>
    </div>
  );

  // Rendu de l'étape 3 - Sécurité et conditions
  const renderStep3 = () => (
    <div className="space-y-4">
      <PasswordInput
        label="Mot de passe"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Votre mot de passe"
        required
        error={errors.password}
        helperText="Au moins 4 caractères (ex: 1234, abcd, motdepasse)"
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
      />

      <PasswordInput
        label="Confirmer le mot de passe"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirmez votre mot de passe"
        required
        error={errors.confirmPassword}
        showPassword={showConfirmPassword}
        toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />

      {/* Conditions d'utilisation */}
      <div className="space-y-3 mt-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-medium rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className="text-dark">
              J'accepte les{' '}
              <Link to="/terms" className="text-primary hover:text-secondary underline">
                conditions d'utilisation
              </Link>{' '}
              et la{' '}
              <Link to="/privacy" className="text-primary hover:text-secondary underline">
                politique de confidentialité
              </Link>{' '}
              de Mediai <span className="text-medium">*</span>
            </label>
            {errors.acceptTerms && (
              <p className="mt-1 text-medium">{errors.acceptTerms}</p>
            )}
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="acceptMarketing"
              name="acceptMarketing"
              type="checkbox"
              checked={formData.acceptMarketing}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-medium rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptMarketing" className="text-dark">
              J'accepte de recevoir des communications de Mediai sur les nouveautés et conseils santé <span className="text-medium">(optionnel)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Note informative */}
      <div className="bg-light border border-medium rounded-lg p-3 mt-4">
        <div className="flex items-center justify-center">
          <InformationCircleIcon className="h-4 w-4 text-primary mr-2" />
          <p className="text-xs text-medium text-center">
            Les champs marqués d'un astérisque (*) sont obligatoires pour créer votre compte
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-light py-12 px-4 sm:px-6 lg:px-8 font-medical">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4">
            <Logo size="md" />
          </div>
          <h2 className="text-3xl font-bold text-dark font-heading">
            Rejoignez Mediai
          </h2>
          <p className="mt-2 text-sm text-medium font-body">
            Votre santé, notre priorité. Créez votre compte patient en quelques étapes.
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-light">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark font-medical">
              Étape {currentStep} sur {totalSteps}
            </span>
            <span className="text-sm text-medium font-body">
              {Math.round((currentStep / totalSteps) * 100)}% complété
            </span>
          </div>
          <div className="w-full bg-light rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-medium mt-2 font-body">
            <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>
              Informations personnelles
            </span>
            <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>
              Adresse & Contact
            </span>
            <span className={currentStep >= 3 ? 'text-primary font-medium' : ''}>
              Sécurité & Conditions
            </span>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-lg border border-light p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contenu de l'étape actuelle */}
            <div className="min-h-[400px]">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Erreur de soumission */}
            {errors.submit && (
              <div className="bg-light border border-medium rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-medium" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-dark">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between items-center pt-4 border-t">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center"
                >
                  Suivant
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  className="flex items-center justify-center bg-primary hover:bg-secondary text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Créer mon compte</span>
                  <span className="sm:hidden">Créer</span>
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Lien de connexion */}
        <div className="text-center">
          <p className="text-sm text-medium font-body">
            Déjà inscrit ?{' '}
            <Link 
              to="/auth/login" 
              className="font-medium text-primary hover:text-secondary transition-colors font-medical"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Note de sécurité */}
        <div className="bg-light border border-medium rounded-lg p-4 text-center">
          <div className="flex items-center justify-center">
            <ShieldCheckIcon className="h-4 w-4 text-primary mr-2" />
            <p className="text-xs text-medium">
              Vos données personnelles et médicales sont protégées et conformes au RGPD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
