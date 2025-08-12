import React from 'react';

/**
 * Composant Button réutilisable avec différentes variantes et tailles
 * @param {string} variant - Type de bouton (primary, secondary, danger, success)
 * @param {string} size - Taille du bouton (sm, md, lg)
 * @param {boolean} disabled - État désactivé
 * @param {boolean} loading - État de chargement
 * @param {string} type - Type HTML du bouton
 * @param {function} onClick - Fonction de clic
 * @param {React.ReactNode} children - Contenu du bouton
 * @param {string} className - Classes CSS supplémentaires
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  children,
  className = '',
  ...props
}) => {
  // Classes de base communes à tous les boutons
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Classes selon la variante
  const variantClasses = {
    primary: 'bg-primary hover:bg-secondary text-white focus:ring-primary',
    secondary: 'bg-light hover:bg-medium text-dark focus:ring-medium',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary'
  };

  // Classes selon la taille
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Classes pour l'état désactivé
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  // Construction des classes finales
  const finalClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${disabled || loading ? disabledClasses : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={finalClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
