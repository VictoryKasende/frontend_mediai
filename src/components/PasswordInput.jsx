import React from 'react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

/**
 * Composant Input spécialisé pour les mots de passe
 * Avec bouton de visibilité intégré et icône de cadenas
 */
const PasswordInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder = "Votre mot de passe", 
  required = false, 
  error, 
  helperText,
  showPassword,
  toggleShowPassword,
  className = "",
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark mb-2 font-medical">
          {label}
          {required && <span className="text-medium ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Icône cadenas à gauche */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <LockClosedIcon className="h-5 w-5 text-medium transition-colors" aria-hidden="true" />
        </div>
        
        {/* Input du mot de passe */}
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-11 pr-12 py-3 border rounded-lg shadow-sm focus:outline-none transition-all duration-200 font-body placeholder-medium hover:border-primary text-dark ${
            error
              ? 'border-medium focus:border-medium'
              : 'border-medium focus:border-primary'
          } bg-white ${className}`}
          {...props}
        />
        
        {/* Bouton œil à droite */}
        <button
          type="button"
          className="absolute inset-y-0 right-0 w-12 flex items-center justify-center hover:bg-light rounded-r-lg transition-colors"
          onClick={toggleShowPassword}
          onMouseDown={(e) => e.preventDefault()}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-4 w-4 text-medium hover:text-dark" aria-hidden="true" />
          ) : (
            <EyeIcon className="h-4 w-4 text-medium hover:text-dark" aria-hidden="true" />
          )}
        </button>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-medium flex items-center font-body">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-medium font-body">{helperText}</p>
      )}
    </div>
  );
};

export default PasswordInput;
