import React from 'react';
import PhoneInputComponent from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

/**
 * Composant Input personnalisé pour numéros de téléphone avec drapeaux
 * Utilise react-phone-number-input pour la sélection de pays et validation
 */
const PhoneInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder = "Numéro de téléphone", 
  required = false, 
  error, 
  helperText,
  defaultCountry = "CD",
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
      
      <PhoneInputComponent
        name={name}
        value={value}
        onChange={onChange}
        defaultCountry={defaultCountry}
        placeholder={placeholder}
        international
        countryCallingCodeEditable={false}
        className={`phone-input-container ${className}`}
        numberInputProps={{
          className: `w-full py-3 px-4 border rounded-lg shadow-sm focus:outline-none transition-all duration-200 font-body placeholder-medium hover:border-primary text-dark ${
            error
              ? 'border-medium focus:border-medium'
              : 'border-medium focus:border-primary'
          } bg-white`,
          required
        }}
        {...props}
      />
      
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

export default PhoneInput;
