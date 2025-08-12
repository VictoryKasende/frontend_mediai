import React from 'react';

/**
 * Composant Logo Mediai réutilisable
 * @param {string} size - Taille du logo (sm, md, lg, xl)
 * @param {boolean} withContainer - Afficher avec un conteneur rond
 * @param {string} containerBg - Couleur de fond du conteneur
 * @param {string} className - Classes CSS supplémentaires
 */
const Logo = ({ 
  size = 'md', 
  withContainer = true, 
  containerBg = 'bg-dark',
  className = '',
  ...props 
}) => {
  // Tailles définies
  const sizes = {
    sm: {
      container: 'h-10 w-10',
      logo: 'h-6 w-6',
      padding: 'p-2'
    },
    md: {
      container: 'h-12 w-12',
      logo: 'h-8 w-8',
      padding: 'p-2'
    },
    lg: {
      container: 'h-14 w-14',
      logo: 'h-10 w-10',
      padding: 'p-2'
    },
    xl: {
      container: 'h-20 w-20',
      logo: 'h-16 w-16',
      padding: 'p-2'
    }
  };

  const currentSize = sizes[size] || sizes.md;

  const logoElement = (
    <img 
      src="/logo_mediai.png" 
      alt="Logo Mediai" 
      className={`${currentSize.logo} object-contain filter drop-shadow-sm ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
      {...props}
    />
  );

  if (withContainer) {
    return (
      <div className={`
        ${currentSize.container} 
        ${containerBg} 
        rounded-full 
        flex items-center justify-center 
        shadow-lg 
        ${currentSize.padding}
        mx-auto
      `}>
        {logoElement}
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {logoElement}
    </div>
  );
};

export default Logo;
