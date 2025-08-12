import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationIcons, MedicalIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';

/**
 * Page Dashboard - Tableau de bord principal
 * Affichage des statistiques et suivi de l'activité
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalConsultations: 0,
    messagesEnAttente: 0,
    consultationsAujourdhui: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Simulation du chargement des données
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // TODO: Remplacer par de vrais appels API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données factices selon le rôle
        const mockStats = {
          totalPatients: user?.role === 'medecin' ? 156 : 1,
          totalConsultations: user?.role === 'medecin' ? 342 : 12,
          messagesEnAttente: 7,
          consultationsAujourdhui: user?.role === 'medecin' ? 8 : 2
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Cartes de statistiques
  const StatCard = ({ title, value, icon, variant = 'primary' }) => (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              variant === 'primary' ? 'bg-blue-50' :
              variant === 'success' ? 'bg-green-50' :
              variant === 'warning' ? 'bg-yellow-50' :
              variant === 'danger' ? 'bg-red-50' : 'bg-purple-50'
            }`}>
              <MedicalIcon icon={icon} size="w-6 h-6" variant={variant} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate font-body">{title}</dt>
              <dd className="text-2xl font-bold text-gray-900 font-heading">
                {isLoading ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
                ) : (
                  value
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  // Activités récentes factices
  const recentActivities = [
    {
      id: 1,
      type: 'consultation',
      message: 'Consultation avec Dr. Martin prévue à 14h30',
      time: 'Il y a 2 heures',
      icon: MedicalIcons.Stethoscope,
      variant: 'primary'
    },
    {
      id: 2,
      type: 'message',
      message: 'Nouveau message de l\'assistant médical',
      time: 'Il y a 4 heures',
      icon: NavigationIcons.Chat,
      variant: 'success'
    },
    {
      id: 3,
      type: 'reminder',
      message: 'Rappel: Prise de médicament à 18h00',
      time: 'Il y a 6 heures',
      icon: MedicalIcons.Pill,
      variant: 'warning'
    }
  ];

  return (
    <div className="space-y-6 font-medical">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Tableau de bord
            </h1>
            <p className="text-medical-body mt-1">
              Bienvenue, <span className="font-medium">{user?.name}</span> 
              <span className="text-medical-caption"> ({user?.role})</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <MedicalIcon 
              icon={NavigationIcons.Dashboard} 
              size="w-8 h-8" 
              variant="medical"
            />
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patients"
          value={stats.totalPatients}
          icon={StatusIcons.Star}
          variant="primary"
        />
        <StatCard
          title="Consultations totales"
          value={stats.totalConsultations}
          icon={MedicalIcons.Stethoscope}
          variant="success"
        />
        <StatCard
          title="Messages en attente"
          value={stats.messagesEnAttente}
          icon={NavigationIcons.Chat}
          variant="warning"
        />
        <StatCard
          title="Consultations aujourd'hui"
          value={stats.consultationsAujourdhui}
          icon={MedicalIcons.Appointment}
          variant="medical"
        />
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Icon icon={MedicalIcons.Activity} size="w-5 h-5" className="mr-2 text-blue-600" />
              <h2 className="text-lg font-heading font-medium text-gray-900">Activités récentes</h2>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="rounded-lg bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-4">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.variant === 'primary' ? 'bg-blue-50' :
                        activity.variant === 'success' ? 'bg-green-50' :
                        activity.variant === 'warning' ? 'bg-yellow-50' : 'bg-purple-50'
                      }`}>
                        <MedicalIcon icon={activity.icon} size="w-5 h-5" variant={activity.variant} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 font-body">
                        {activity.message}
                      </p>
                      <p className="text-medical-caption">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Raccourcis rapides */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Icon icon={ActionIcons.Settings} size="w-5 h-5" className="mr-2 text-blue-600" />
              <h2 className="text-lg font-heading font-medium text-gray-900">Actions rapides</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <MedicalIcon icon={NavigationIcons.Chat} size="w-8 h-8" variant="primary" className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-900 font-body">Nouveau chat</span>
              </button>
              <button className="flex flex-col items-center p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <MedicalIcon icon={MedicalIcons.Appointment} size="w-8 h-8" variant="success" className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-900 font-body">Prendre RDV</span>
              </button>
              <button className="flex flex-col items-center p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <MedicalIcon icon={MedicalIcons.Document} size="w-8 h-8" variant="warning" className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-900 font-body">Mes dossiers</span>
              </button>
              <button className="flex flex-col items-center p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <MedicalIcon icon={ActionIcons.Settings} size="w-8 h-8" variant="medical" className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-900 font-body">Paramètres</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prochains rendez-vous */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Icon icon={MedicalIcons.Appointment} size="w-5 h-5" className="mr-2 text-blue-600" />
            <h2 className="text-lg font-heading font-medium text-gray-900">Prochains rendez-vous</h2>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MedicalIcon icon={MedicalIcons.Appointment} size="w-8 h-8" variant="secondary" />
              </div>
              <p className="text-medical-body">Aucun rendez-vous prévu pour aujourd'hui</p>
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
                Planifier un rendez-vous
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
