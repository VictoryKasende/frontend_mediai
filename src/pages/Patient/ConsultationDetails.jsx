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
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-xl mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-medium mb-1">Numéro de dossier</label>
            <p className="text-dark">{consultation.numero_dossier}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-medium mb-1">Date de soumission</label>
            <p className="text-dark">{new Date(consultation.date_soumission).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-medium mb-1">Date de consultation</label>
            <p className="text-dark">{new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-medium mb-1">Heure</label>
            <p className="text-dark">{consultation.heure_debut}</p>
          </div>
        </div>
      </div>

      {/* Médecin sélectionné */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-xl mb-4">Médecin consulté</h3>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <MedicalIcons.Doctor className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h4 className="text-medical-subtitle text-lg">{consultation.medecin.nom}</h4>
            <p className="text-primary">{consultation.medecin.specialite}</p>
          </div>
        </div>
      </div>

      {/* Motif de consultation */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-xl mb-4">Motif de consultation</h3>
        <p className="text-medical-body">{consultation.motif_consultation}</p>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-xl mb-4">Actions disponibles</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">
            <MedicalIcons.Download className="w-4 h-4 mr-2" />
            Télécharger la fiche
          </Button>
          <Button variant="outline" size="sm">
            <MedicalIcons.Print className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm">
            <MedicalIcons.Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>
    </div>
  );

  const renderReponseTab = () => {
    if (!consultation.reponse_medecin) {
      return (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-light text-center">
          <StatusIcons.Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-medical-subtitle text-xl mb-2">En attente de réponse</h3>
          <p className="text-medical-body mb-4">
            Le médecin n'a pas encore répondu à votre fiche de consultation.
          </p>
          <p className="text-medical-caption">
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
      <div className="space-y-6">
        {/* Diagnostic */}
        {reponse.diagnostic && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
            <h3 className="text-medical-subtitle text-xl mb-4">Diagnostic</h3>
            <p className="text-medical-body">{reponse.diagnostic}</p>
          </div>
        )}

        {/* Recommandations */}
        {reponse.recommandations && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
            <h3 className="text-medical-subtitle text-xl mb-4">Recommandations</h3>
            <p className="text-medical-body">{reponse.recommandations}</p>
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
          <h3 className="text-medical-subtitle text-xl mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button>
              <MedicalIcons.Download className="w-4 h-4 mr-2" />
              Télécharger l'ordonnance
            </Button>
            <Button variant="outline">
              <MedicalIcons.Message className="w-4 h-4 mr-2" />
              Contacter le médecin
            </Button>
            <Button variant="outline">
              <MedicalIcons.Calendar className="w-4 h-4 mr-2" />
              Prendre un nouveau RDV
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
        icone: MedicalIcons.Document,
        couleur: 'text-blue-600'
      }
    ];

    if (consultation.reponse_medecin) {
      historique.push({
        date: consultation.reponse_medecin.date,
        action: consultation.statut === 'annulee' ? 'Consultation annulée' : 'Réponse du médecin',
        description: consultation.statut === 'annulee' 
          ? `Consultation annulée: ${consultation.reponse_medecin.motif_annulation}`
          : 'Le médecin a répondu à votre fiche de consultation',
        icone: consultation.statut === 'annulee' ? StatusIcons.Error : MedicalIcons.Doctor,
        couleur: consultation.statut === 'annulee' ? 'text-red-600' : 'text-green-600'
      });
    }

    if (consultation.statut === 'terminee') {
      historique.push({
        date: consultation.date_consultation,
        action: 'Consultation terminée',
        description: 'La consultation s\'est déroulée avec succès',
        icone: StatusIcons.Success,
        couleur: 'text-green-600'
      });
    }

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-light">
        <h3 className="text-medical-subtitle text-xl mb-6">Historique de la consultation</h3>
        <div className="space-y-6">
          {historique.map((event, index) => {
            const IconComponent = event.icone;
            return (
              <div key={index} className="flex space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${event.couleur}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-medical-subtitle">{event.action}</h4>
                    <span className="text-medical-caption">
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-medical-body mt-1">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div>
                <h1 className="text-medical-title text-xl">Détails de la consultation</h1>
                <p className="text-medical-caption">
                  {consultation.numero_dossier} - {consultation.medecin.nom}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consultation.statut)}`}>
                {getStatusLabel(consultation.statut)}
              </span>
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-medium hover:text-dark transition-colors"
              >
                <NavigationIcons.ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-light mb-6">
          <div className="border-b border-light">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-medium hover:text-dark hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'fiche' && renderFicheTab()}
          {activeTab === 'reponse' && renderReponseTab()}
          {activeTab === 'historique' && renderHistoriqueTab()}
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetails;
