import React from 'react';

/**
 * Composant Switch moderne pour les questions Oui/Non
 * @param {string} label - Libellé du switch
 * @param {boolean} checked - État du switch
 * @param {function} onChange - Fonction appelée lors du changement
 * @param {string} size - Taille du switch ('sm', 'md', 'lg')
 * @param {boolean} disabled - Switch désactivé
 * @param {string} className - Classes CSS supplémentaires
 */
const Switch = ({ 
  label, 
  checked = false, 
  onChange, 
  size = 'md', 
  disabled = false,
  className = '',
  description = null
}) => {
  const sizeClasses = {
    sm: {
      switch: 'w-8 h-4',
      toggle: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      switch: 'w-11 h-6',
      toggle: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      switch: 'w-14 h-7',
      toggle: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={`
            ${currentSize.switch}
            relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-mediai-primary focus:ring-offset-2 
            ${disabled 
              ? 'bg-gray-200 cursor-not-allowed' 
              : checked 
                ? 'bg-mediai-primary hover:bg-mediai-secondary' 
                : 'bg-gray-300 hover:bg-gray-400'
            }
          `}
          aria-pressed={checked}
          aria-labelledby={label ? `switch-label-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined}
        >
          <span className="sr-only">
            {label} - {checked ? 'Oui' : 'Non'}
          </span>
          <span
            className={`
              ${currentSize.toggle}
              inline-block transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
              ${checked ? currentSize.translate : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>
      
      <div className="flex-1">
        {label && (
          <label 
            id={`switch-label-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className={`
              block text-sm lg:text-base font-medium cursor-pointer
              ${disabled ? 'text-gray-400' : 'text-mediai-dark'}
            `}
            onClick={() => !disabled && onChange(!checked)}
          >
            {label}
            {checked !== undefined && (
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${checked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {checked ? 'Oui' : 'Non'}
              </span>
            )}
          </label>
        )}
        
        {description && (
          <p className={`mt-1 text-xs lg:text-sm ${disabled ? 'text-gray-400' : 'text-mediai-medium'}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default Switch;