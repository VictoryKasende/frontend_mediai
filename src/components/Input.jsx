import React, { forwardRef } from 'react';

/**
 * Composant Input réutilisable pour les formulaires
 * @param {string} label - Label du champ
 * @param {string} type - Type d'input (text, email, password, etc.)
 * @param {string} placeholder - Texte de placeholder
 * @param {boolean} required - Champ obligatoire
 * @param {boolean} disabled - Champ désactivé
 * @param {string} error - Message d'erreur
 * @param {string} helperText - Texte d'aide
 * @param {React.Component} icon - Icône à afficher (optionnel)
 * @param {string} className - Classes CSS supplémentaires
 * @param {React.Ref} ref - Référence React
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  // Classes de base pour l'input
  const baseInputClasses = 'w-full py-3 border rounded-lg shadow-sm focus:outline-none transition-all duration-200 font-body placeholder-medium text-dark';
  
  // Classes conditionnelles selon l'état
  const inputStateClasses = error
    ? 'border-medium focus:border-medium'
    : 'border-medium focus:border-primary';
    
  const disabledClasses = disabled ? 'bg-light cursor-not-allowed opacity-60' : 'bg-white hover:border-primary';
  
  // Classes selon la présence d'icône
  const paddingClasses = Icon ? 'pl-11 pr-4' : 'px-4';
  
  // Classes finales pour l'input
  const inputClasses = `${baseInputClasses} ${inputStateClasses} ${disabledClasses} ${paddingClasses} ${className}`;
  
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-dark mb-2 font-medical">
          {label}
          {required && <span className="text-medium ml-1">*</span>}
        </label>
      )}
      
      {/* Container pour input et icône */}
      <div className="relative">
        {/* Icône */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-medium transition-colors" aria-hidden="true" />
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <p className="mt-2 text-sm text-medium flex items-center font-body">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      
      {/* Texte d'aide */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-medium font-body">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
