import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { NavigationIcons, MedicalIcons, ActionIcons, Icon, MedicalIcon } from './Icons';

/**
 * Composant Layout principal avec navigation
 * @param {React.ReactNode} children - Contenu de la page
 */
const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items selon le rôle de l'utilisateur
  const getNavigationItems = () => {
    if (!isAuthenticated) return [];

    const baseItems = [
      { 
        name: 'Dashboard', 
        href: '/dashboard', 
        icon: NavigationIcons.Dashboard,
        iconSolid: NavigationIcons.DashboardSolid 
      },
      { 
        name: 'Chat', 
        href: '/chat', 
        icon: NavigationIcons.Chat,
        iconSolid: NavigationIcons.ChatSolid 
      },
      { 
        name: 'Consultation', 
        href: '/consultation', 
        icon: NavigationIcons.Consultation,
        iconSolid: NavigationIcons.ConsultationSolid 
      }
    ];

    // Ajouter des éléments spécifiques selon le rôle
    if (user?.role === 'administrator') {
      baseItems.push({ 
        name: 'Administration', 
        href: '/admin', 
        icon: NavigationIcons.Admin,
        iconSolid: NavigationIcons.Admin 
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Fonction pour déterminer si un lien est actif
  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Gestion de la déconnexion
  const handleLogout = () => {
    logout();
  };

  // Si l'utilisateur n'est pas connecté, ne pas afficher le layout complet
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-medical">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo et titre */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center group">
                <div className="flex-shrink-0">
                  <MedicalIcon 
                    icon={MedicalIcons.Heart} 
                    size="w-8 h-8" 
                    variant="medical"
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-heading font-bold text-gray-900">Mediai</h1>
                  <p className="text-xs text-medical-caption">Plateforme Médicale</p>
                </div>
              </Link>
            </div>

            {/* Navigation desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = isActiveLink(item.href);
                const IconComponent = isActive ? item.iconSolid : item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon 
                      icon={IconComponent} 
                      size="w-5 h-5" 
                      className="mr-2"
                      color={isActive ? 'text-blue-600' : 'text-current'}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Profil utilisateur */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 font-heading">{user?.name}</p>
                <p className="text-xs text-medical-caption capitalize">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden md:flex items-center"
              >
                <Icon icon={ActionIcons.Logout} size="w-4 h-4" className="mr-2" />
                Déconnexion
              </Button>

              {/* Menu mobile toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Icon 
                  icon={isMobileMenuOpen ? ActionIcons.Close : ActionIcons.Menu} 
                  size="w-6 h-6" 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              {navigationItems.map((item) => {
                const isActive = isActiveLink(item.href);
                const IconComponent = isActive ? item.iconSolid : item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon 
                      icon={IconComponent} 
                      size="w-5 h-5" 
                      className="mr-3"
                      color={isActive ? 'text-blue-600' : 'text-current'}
                    />
                    {item.name}
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900 font-heading">{user?.name}</p>
                  <p className="text-xs text-medical-caption capitalize">{user?.role}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="mx-3 flex items-center w-auto"
                >
                  <Icon icon={ActionIcons.Logout} size="w-4 h-4" className="mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="font-body">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
