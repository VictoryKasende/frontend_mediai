import React, { useState } from 'react';
import { MedicalIcons, NavigationIcons, StatusIcons } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';

/**
 * Détails d'une consultation avec réponse du médecin
 */
const ConsultationDetails = ({ consultation, onBack }) => {
  const [activeTab, setActiveTab] = useState('fiche');

  if (!consultation) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <StatusIcons.Error className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-medical-subtitle text-xl mb-2">Consultation non trouvée</h2>
          <p className="text-medical-body mb-4">La consultation demandée n'existe pas.</p>
          <Button onClick={onBack}>Retour à la liste</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'fiche', label: 'Ma fiche', icon: MedicalIcons.Document },
    { id: 'reponse', label: 'Réponse médecin', icon: MedicalIcons.Doctor },
    { id: 'historique', label: 'Historique', icon: MedicalIcons.History }
  ];

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'confirmee':
        return 'bg-blue-100 text-blue-800';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminee':
        return 'bg-green-100 text-green-800';
      case 'annulee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'confirmee':
        return 'Confirmée';
      case 'en_attente':
        return 'En attente';
      case 'terminee':
        return 'Terminée';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  };

  const renderFicheTab = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Informations générales */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-medium mb-1">Numéro de dossier</label>
            <p className="text-dark text-sm lg:text-base">{consultation.numero_dossier}</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-medium mb-1">Date de soumission</label>
            <p className="text-dark text-sm lg:text-base">{new Date(consultation.date_soumission).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-medium mb-1">Date de consultation</label>
            <p className="text-dark text-sm lg:text-base">{new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-medium mb-1">Heure</label>
            <p className="text-dark text-sm lg:text-base">{consultation.heure_debut}</p>
          </div>
        </div>
      </div>

      {/* Médecin sélectionné */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Médecin consulté</h3>
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <MedicalIcons.Doctor className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
          </div>
          <div>
            <h4 className="text-medical-subtitle text-base lg:text-lg">{consultation.medecin.nom}</h4>
            <p className="text-primary text-sm lg:text-base">{consultation.medecin.specialite}</p>
          </div>
        </div>
      </div>

      {/* Motif de consultation */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Motif de consultation</h3>
        <p className="text-medical-body text-sm lg:text-base">{consultation.motif_consultation}</p>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Actions disponibles</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" size="sm" className="flex items-center justify-center space-x-2">
            <MedicalIcons.Download className="w-4 h-4" />
            <span>Télécharger la fiche</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center justify-center space-x-2">
            <MedicalIcons.Print className="w-4 h-4" />
            <span>Imprimer</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center justify-center space-x-2">
            <MedicalIcons.Edit className="w-4 h-4" />
            <span>Modifier</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderReponseTab = () => {
    if (!consultation.reponse_medecin) {
      return (
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-light text-center">
          <StatusIcons.Clock className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-500 mx-auto mb-3 lg:mb-4" />
          <h3 className="text-medical-subtitle text-lg lg:text-xl mb-2">En attente de réponse</h3>
          <p className="text-medical-body text-sm lg:text-base mb-4">
            Le médecin n'a pas encore répondu à votre fiche de consultation.
          </p>
          <p className="text-medical-caption text-xs lg:text-sm">
            Vous recevrez une notification dès que la réponse sera disponible.
          </p>
        </div>
      );
    }

    const reponse = consultation.reponse_medecin;

    if (consultation.statut === 'annulee') {
      return (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <StatusIcons.Error className="w-6 h-6 text-red-600" />
              <h3 className="text-medical-subtitle text-xl text-red-800">Consultation annulée</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">Motif d'annulation</label>
                <p className="text-red-800">{reponse.motif_annulation}</p>
              </div>
              {reponse.nouveau_rdv && (
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">Nouveau rendez-vous proposé</label>
                  <p className="text-red-800">{new Date(reponse.nouveau_rdv).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>
          </div>

          {reponse.nouveau_rdv && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
              <h3 className="text-medical-subtitle text-xl mb-4">Actions</h3>
              <div className="flex space-x-3">
                <Button>
                  <MedicalIcons.Check className="w-4 h-4 mr-2" />
                  Accepter le nouveau RDV
                </Button>
                <Button variant="outline">
                  <MedicalIcons.Calendar className="w-4 h-4 mr-2" />
                  Proposer une autre date
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 lg:space-y-6">
        {/* Diagnostic */}
        {reponse.diagnostic && (
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
            <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Diagnostic</h3>
            <p className="text-medical-body text-sm lg:text-base">{reponse.diagnostic}</p>
          </div>
        )}

        {/* Recommandations */}
        {reponse.recommandations && (
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
            <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Recommandations</h3>
            <p className="text-medical-body text-sm lg:text-base">{reponse.recommandations}</p>
          </div>
        )}

        {/* Prescription */}
        {reponse.prescription && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
            <h3 className="text-medical-subtitle text-xl mb-4">Prescription</h3>
            <p className="text-medical-body">{reponse.prescription}</p>
          </div>
        )}

        {/* Suivi */}
        {reponse.suivi && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <StatusIcons.Info className="w-5 h-5 text-blue-600" />
              <h3 className="text-medical-subtitle text-lg text-blue-800">Suivi nécessaire</h3>
            </div>
            <p className="text-blue-800">{reponse.suivi}</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
          <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Actions</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex items-center justify-center space-x-2">
              <MedicalIcons.Download className="w-4 h-4" />
              <span>Télécharger l'ordonnance</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2">
              <MedicalIcons.Message className="w-4 h-4" />
              <span>Contacter le médecin</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2">
              <MedicalIcons.Calendar className="w-4 h-4" />
              <span>Nouveau RDV</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoriqueTab = () => {
    const historique = [
      {
        date: consultation.date_soumission,
        action: 'Fiche soumise',
        description: 'Votre fiche de consultation a été envoyée au médecin',
        statut: 'termine'
      },
      {
        date: consultation.date_consultation,
        action: 'RDV programmé',
        description: `Rendez-vous fixé le ${new Date(consultation.date_consultation).toLocaleDateString('fr-FR')} à ${consultation.heure_debut}`,
        statut: consultation.statut === 'confirmee' ? 'en_cours' : consultation.statut
      },
      ...(consultation.reponse_medecin ? [{
        date: consultation.reponse_medecin.date,
        action: 'Réponse du médecin',
        description: 'Le médecin a répondu à votre consultation',
        statut: 'termine'
      }] : [])
    ];

    return (
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 lg:mb-6">Historique de la consultation</h3>
        <div className="space-y-4 lg:space-y-6">
          {historique.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 lg:space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  item.statut === 'termine' ? 'bg-green-500' :
                  item.statut === 'en_cours' ? 'bg-blue-500' :
                  'bg-gray-300'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <h4 className="text-sm lg:text-base font-medium text-dark">{item.action}</h4>
                  <span className="text-xs lg:text-sm text-medium">
                    {new Date(item.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-medium mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-light">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack}
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <NavigationIcons.Back className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-medical-title text-base sm:text-lg lg:text-xl truncate">Détails de la consultation</h1>
                <p className="text-medical-caption text-xs sm:text-sm truncate">
                  {consultation.numero_dossier} - {consultation.medecin.nom}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.statut)}`}>
                {getStatusLabel(consultation.statut)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-6">
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl p-1 shadow-sm border border-light mb-4 lg:mb-6">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-medium hover:text-dark hover:bg-light'
                  }`}
                >
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 lg:space-y-6">
          {activeTab === 'fiche' && renderFicheTab()}
          {activeTab === 'reponse' && renderReponseTab()}
          {activeTab === 'historique' && renderHistoriqueTab()}
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetails;