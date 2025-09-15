import React, { useState, useEffect } from 'react';
import { MedicalIcons, NavigationIcons, StatusIcons } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { consultationService, authService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { exportToPDF, printConsultation } from '../../services/MedicalPDFService';

/**
 * Détails d'une consultation avec réponse du médecin
 */
const ConsultationDetails = ({ consultationId, onBack, onEdit }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('fiche');
  const [consultation, setConsultation] = useState(null);
  const [medecins, setMedecins] = useState([]);
  const [assignedMedecin, setAssignedMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    if (consultationId) {
      loadConsultation();
      loadMedecins();
    }
  }, [consultationId]);

  useEffect(() => {
    if (consultation && medecins.length > 0) {
      findAssignedMedecin();
    }
  }, [consultation, medecins]);

  const loadConsultation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await consultationService.getConsultation(consultationId);
      setConsultation(data);
      console.log('Consultation chargée:', data);
      
    } catch (error) {
      console.error('Erreur lors du chargement de la consultation:', error);
      setError('Impossible de charger les détails de la consultation');
      showError('Erreur de chargement', 'Impossible de charger les détails');
    } finally {
      setLoading(false);
    }
  };

  const loadMedecins = async () => {
    try {
      const response = await authService.getMedecins();
      const medecinsList = response.results || response;
      setMedecins(medecinsList);
      console.log('Médecins chargés:', medecinsList);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      // En cas d'erreur, on peut continuer sans la liste des médecins
    }
  };

  const findAssignedMedecin = () => {
    if (consultation?.assigned_medecin !== undefined && consultation.assigned_medecin !== null) {
      const medecin = medecins.find(m => m.id === consultation.assigned_medecin);
      setAssignedMedecin(medecin);
      console.log('Médecin assigné trouvé:', medecin);
    }
  };

  // Fonction utilitaire pour obtenir le nom du médecin
  const getMedecinInfo = () => {
    if (assignedMedecin) {
      return {
        nom: `Dr ${assignedMedecin.first_name} ${assignedMedecin.last_name}`,
        specialite: assignedMedecin.medecin_profile?.specialty || 'Médecine générale',
        email: assignedMedecin.email,
        telephone: assignedMedecin.medecin_profile?.phone_number
      };
    }
    
    // Fallback sur les données de la consultation
    if (consultation?.medecin_nom) {
      return {
        nom: consultation.medecin_nom,
        specialite: consultation.medecin_specialite || 'Médecine générale',
        email: consultation.medecin_email,
        telephone: consultation.medecin_telephone
      };
    }
    
    return {
      nom: 'Médecin non assigné',
      specialite: 'Non spécifiée',
      email: null,
      telephone: null
    };
  };

  // Fonction pour télécharger la fiche en PDF
  const handleDownloadPDF = async () => {
    try {
      if (!consultation) return;

      const medecinInfo = getMedecinInfo();
      const consultationForPDF = {
        ...consultation,
        patient: {
          nom: [consultation.nom, consultation.postnom, consultation.prenom].filter(Boolean).join(' '),
          age: consultation.age,
          telephone: consultation.telephone,
          sexe: consultation.sexe,
          adresse: [consultation.avenue, consultation.quartier, consultation.commune].filter(Boolean).join(', ')
        },
        medecin: {
          nom: medecinInfo.nom,
          specialite: medecinInfo.specialite,
          numero_ordre: consultation.numero_ordre
        },
        date: consultation.date_consultation || consultation.created_at,
        heure: consultation.heure_debut || '10:00',
        motif: consultation.motif_consultation,
        histoire: consultation.histoire_maladie,
        diagnostic: consultation.diagnostic,
        traitement: consultation.traitement,
        recommandations: consultation.recommandations,
        signature_medecin: consultation.signature_medecin
      };

      const result = await exportToPDF(consultationForPDF);
      if (result.success) {
        showSuccess('PDF téléchargé', 'La fiche de consultation a été téléchargée avec succès');
      } else {
        showError('Erreur de téléchargement', 'Impossible de générer le PDF');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      showError('Erreur de téléchargement', 'Une erreur est survenue lors du téléchargement');
    }
  };

  // Fonction pour imprimer la fiche
  const handlePrint = () => {
    try {
      if (!consultation) return;

      const medecinInfo = getMedecinInfo();
      const consultationForPrint = {
        ...consultation,
        patient: {
          nom: [consultation.nom, consultation.postnom, consultation.prenom].filter(Boolean).join(' '),
          age: consultation.age,
          telephone: consultation.telephone,
          sexe: consultation.sexe,
          adresse: [consultation.avenue, consultation.quartier, consultation.commune].filter(Boolean).join(', ')
        },
        medecin: {
          nom: medecinInfo.nom,
          specialite: medecinInfo.specialite,
          numero_ordre: consultation.numero_ordre
        },
        date: consultation.date_consultation || consultation.created_at,
        heure: consultation.heure_debut || '10:00',
        motif: consultation.motif_consultation,
        histoire: consultation.histoire_maladie,
        diagnostic: consultation.diagnostic,
        traitement: consultation.traitement,
        recommandations: consultation.recommandations,
        signature_medecin: consultation.signature_medecin
      };

      printConsultation(consultationForPrint);
      showSuccess('Impression lancée', 'La fiche de consultation est en cours d\'impression');
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      showError('Erreur d\'impression', 'Une erreur est survenue lors de l\'impression');
    }
  };

  // Fonction pour modifier la consultation
  const handleEdit = () => {
    if (onEdit && consultation) {
      onEdit(consultation.id);
    } else {
      // Fallback: rediriger vers le formulaire de modification
      showError('Modification non disponible', 'La modification n\'est pas encore disponible');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-mediai-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-medical-subtitle text-xl mb-2">Chargement...</h2>
          <p className="text-medical-body">Récupération des détails de la consultation</p>
        </div>
      </div>
    );
  }

  if (error || !consultation) {
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
      case 'en_analyse':
        return 'bg-blue-100 text-blue-800';
      case 'analyse_terminee':
        return 'bg-yellow-100 text-yellow-800';
      case 'valide_medecin':
        return 'bg-green-100 text-green-800';
      case 'rejete_medecin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'en_analyse':
        return 'En analyse IA';
      case 'analyse_terminee':
        return 'Analyse terminée';
      case 'valide_medecin':
        return 'Validée par médecin';
      case 'rejete_medecin':
        return 'Rejetée par médecin';
      default:
        return statut || 'En attente';
    }
  };

  const renderFicheTab = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Informations personnelles */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 lg:p-6 shadow-sm border border-mediai-primary">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.User className="w-5 h-5 mr-2 text-mediai-primary" />
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Nom complet</label>
            <p className="text-mediai-dark text-sm lg:text-base font-semibold">
              {[consultation.nom, consultation.postnom, consultation.prenom].filter(Boolean).join(' ')}
            </p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Date de naissance</label>
            <p className="text-mediai-dark text-sm lg:text-base">
              {consultation.date_naissance ? new Date(consultation.date_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
            </p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Âge</label>
            <p className="text-mediai-dark text-sm lg:text-base">{consultation.age || 'Non renseigné'} ans</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Sexe</label>
            <p className="text-mediai-dark text-sm lg:text-base">{consultation.sexe === 'M' ? 'Masculin' : consultation.sexe === 'F' ? 'Féminin' : 'Non renseigné'}</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Téléphone</label>
            <p className="text-mediai-dark text-sm lg:text-base">{consultation.telephone || 'Non renseigné'}</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">État civil</label>
            <p className="text-mediai-dark text-sm lg:text-base">{consultation.etat_civil || 'Non renseigné'}</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Occupation</label>
            <p className="text-mediai-dark text-sm lg:text-base">{consultation.occupation || 'Non renseignée'}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Adresse</label>
            <p className="text-mediai-dark text-sm lg:text-base">
              {[consultation.avenue, consultation.quartier, consultation.commune].filter(Boolean).join(', ') || 'Non renseignée'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact d'urgence */}
      {(consultation.contact_nom || consultation.contact_telephone || consultation.contact_adresse) && (
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
          <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
            <MedicalIcons.Phone className="w-5 h-5 mr-2 text-orange-500" />
            Contact d'urgence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Nom</label>
              <p className="text-mediai-dark text-sm lg:text-base">{consultation.contact_nom || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Téléphone</label>
              <p className="text-mediai-dark text-sm lg:text-base">{consultation.contact_telephone || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Adresse</label>
              <p className="text-mediai-dark text-sm lg:text-base">{consultation.contact_adresse || 'Non renseignée'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Médecin assigné */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.Doctor className="w-5 h-5 mr-2 text-mediai-primary" />
          Médecin responsable
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Nom du médecin</label>
            <p className="text-mediai-dark text-sm lg:text-base font-medium">{getMedecinInfo().nom}</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Spécialité</label>
            <p className="text-mediai-dark text-sm lg:text-base">{getMedecinInfo().specialite}</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Status d'assignation</label>
            <p className={`text-sm lg:text-base font-medium ${
              assignedMedecin || consultation.medecin_nom ? 'text-green-600' : 'text-orange-600'
            }`}>
              {assignedMedecin || consultation.medecin_nom ? '✓ Assigné' : '⚠ Non assigné'}
            </p>
          </div>
          {getMedecinInfo().email && (
            <div>
              <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Email</label>
              <p className="text-mediai-dark text-sm lg:text-base">{getMedecinInfo().email}</p>
            </div>
          )}
          {getMedecinInfo().telephone && (
            <div>
              <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Téléphone</label>
              <p className="text-mediai-dark text-sm lg:text-base">{getMedecinInfo().telephone}</p>
            </div>
          )}
          {consultation.assigned_medecin !== undefined && consultation.assigned_medecin !== null && (
            <div>
              <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">ID Médecin</label>
              <p className="text-mediai-dark text-sm lg:text-base font-mono">#{consultation.assigned_medecin}</p>
            </div>
          )}
        </div>
      </div>

      {/* Informations consultation */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.Calendar className="w-5 h-5 mr-2 text-mediai-primary" />
          Informations de consultation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Numéro de dossier</label>
            <p className="text-mediai-dark text-sm lg:text-base font-mono">{consultation.numero_dossier || `CONS-${consultation.id}`}</p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Date de consultation</label>
            <p className="text-mediai-dark text-sm lg:text-base">
              {consultation.date_consultation ? new Date(consultation.date_consultation).toLocaleDateString('fr-FR') : 'Non programmée'}
            </p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Heure</label>
            <p className="text-mediai-dark text-sm lg:text-base">
              {consultation.heure_debut && consultation.heure_fin 
                ? `${consultation.heure_debut} - ${consultation.heure_fin}`
                : consultation.heure_debut || 'Non programmée'
              }
            </p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Date de création</label>
            <p className="text-mediai-dark text-sm lg:text-base">
              {new Date(consultation.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-medium mb-1">Type de patient</label>
            <div className="flex items-center space-x-2">
              {consultation.is_patient_distance && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  À distance
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signes vitaux */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.Heart className="w-5 h-5 mr-2 text-red-500" />
          Signes vitaux
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <label className="block text-xs font-medium text-red-600 mb-1">Température</label>
            <p className="text-lg font-bold text-red-700">{consultation.temperature || '-'}°C</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <label className="block text-xs font-medium text-blue-600 mb-1">SpO2</label>
            <p className="text-lg font-bold text-blue-700">{consultation.spo2 || '-'}%</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <label className="block text-xs font-medium text-green-600 mb-1">Poids</label>
            <p className="text-lg font-bold text-green-700">{consultation.poids || '-'} kg</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <label className="block text-xs font-medium text-purple-600 mb-1">Tension</label>
            <p className="text-lg font-bold text-purple-700">{consultation.tension_arterielle || '-'}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <label className="block text-xs font-medium text-orange-600 mb-1">Pouls</label>
            <p className="text-lg font-bold text-orange-700">{consultation.pouls || '-'} bpm</p>
          </div>
          <div className="text-center p-3 bg-cyan-50 rounded-lg">
            <label className="block text-xs font-medium text-cyan-600 mb-1">Fréq. resp.</label>
            <p className="text-lg font-bold text-cyan-700">{consultation.frequence_respiratoire || '-'}/min</p>
          </div>
        </div>
      </div>

      {/* Personne qui accompagne */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.Users className="w-5 h-5 mr-2 text-indigo-500" />
          Personne accompagnante
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'patient', label: 'Patient seul', value: consultation.patient },
            { key: 'proche', label: 'Proche', value: consultation.proche },
            { key: 'soignant', label: 'Soignant', value: consultation.soignant },
            { key: 'medecin', label: 'Médecin', value: consultation.medecin },
            { key: 'autre', label: 'Autre', value: consultation.autre }
          ].map(item => (
            <div key={item.key} className={`p-3 rounded-lg border-2 ${
              item.value ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${item.value ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={`text-sm font-medium ${item.value ? 'text-green-700' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        {consultation.proche_lien && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-mediai-medium mb-1">Lien avec le proche</label>
            <p className="text-mediai-dark text-sm">{consultation.proche_lien}</p>
          </div>
        )}
        {consultation.soignant_role && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-mediai-medium mb-1">Rôle du soignant</label>
            <p className="text-mediai-dark text-sm">{consultation.soignant_role}</p>
          </div>
        )}
        {consultation.autre_precisions && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-mediai-medium mb-1">Précisions (autre)</label>
            <p className="text-mediai-dark text-sm">{consultation.autre_precisions}</p>
          </div>
        )}
      </div>

      {/* Motif et histoire */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.Document className="w-5 h-5 mr-2 text-mediai-primary" />
          Motif et histoire de la maladie
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mediai-medium mb-2">Motif de consultation</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-mediai-dark text-sm lg:text-base leading-relaxed">
                {consultation.motif_consultation || 'Aucun motif spécifié'}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-mediai-medium mb-2">Histoire de la maladie</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-mediai-dark text-sm lg:text-base leading-relaxed">
                {consultation.histoire_maladie || 'Aucune histoire renseignée'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Médications */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.Pills className="w-5 h-5 mr-2 text-green-500" />
          Médicaments et traitements
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mediai-medium mb-2">Sources de médicaments</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'maison_medicaments', label: 'Maison' },
                { key: 'pharmacie_medicaments', label: 'Pharmacie' },
                { key: 'centre_sante_medicaments', label: 'Centre de santé' },
                { key: 'hopital_medicaments', label: 'Hôpital' }
              ].map(item => (
                <div key={item.key} className={`p-2 rounded text-center ${
                  consultation[item.key] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            {consultation.medicaments_non_pris && (
              <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-center">
                <span className="text-xs font-medium">Médicaments non pris</span>
              </div>
            )}
          </div>
          {consultation.details_medicaments && (
            <div>
              <label className="block text-sm font-medium text-mediai-medium mb-2">Détails des médicaments</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-mediai-dark text-sm leading-relaxed">{consultation.details_medicaments}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Symptômes */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.Stethoscope className="w-5 h-5 mr-2 text-red-500" />
          Symptômes présents
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { key: 'cephalees', label: 'Céphalées' },
            { key: 'vertiges', label: 'Vertiges' },
            { key: 'palpitations', label: 'Palpitations' },
            { key: 'troubles_visuels', label: 'Troubles visuels' },
            { key: 'nycturie', label: 'Nycturie' },
            { key: 'febrile', label: 'Fièvre', value: consultation.febrile === 'Oui' }
          ].map(item => (
            <div key={item.key} className={`p-3 rounded-lg border-2 ${
              (item.value !== undefined ? item.value : consultation[item.key]) 
                ? 'border-red-300 bg-red-50 text-red-700' 
                : 'border-gray-200 bg-gray-50 text-gray-500'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${
                  (item.value !== undefined ? item.value : consultation[item.key]) 
                    ? 'bg-red-500' 
                    : 'bg-gray-300'
                }`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Antécédents médicaux */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.History className="w-5 h-5 mr-2 text-purple-500" />
          Antécédents médicaux
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mediai-medium mb-2">Antécédents personnels</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'hypertendu', label: 'Hypertension' },
                { key: 'diabetique', label: 'Diabète' },
                { key: 'epileptique', label: 'Épilepsie' },
                { key: 'trouble_comportement', label: 'Troubles du comportement' },
                { key: 'gastritique', label: 'Gastrite' }
              ].map(item => (
                <div key={item.key} className={`p-2 rounded text-center ${
                  consultation[item.key] ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-mediai-medium mb-2">Habitudes de vie</label>
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${
                consultation.tabac === 'oui' ? 'border-red-300 bg-red-50' : 
                consultation.tabac === 'non' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <label className="block text-xs font-medium mb-1">Tabac</label>
                <p className="text-sm font-semibold">{consultation.tabac || 'Non renseigné'}</p>
              </div>
              <div className={`p-3 rounded-lg border ${
                consultation.alcool === 'oui' ? 'border-red-300 bg-red-50' : 
                consultation.alcool === 'non' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <label className="block text-xs font-medium mb-1">Alcool</label>
                <p className="text-sm font-semibold">{consultation.alcool || 'Non renseigné'}</p>
              </div>
              <div className={`p-3 rounded-lg border ${
                consultation.activite_physique === 'oui' ? 'border-green-300 bg-green-50' : 
                consultation.activite_physique === 'non' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <label className="block text-xs font-medium mb-1">Activité physique</label>
                <p className="text-sm font-semibold">{consultation.activite_physique || 'Non renseigné'}</p>
              </div>
            </div>
            {consultation.activite_physique_detail && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-600 mb-1">Détails activité physique</label>
                <p className="text-sm text-gray-800">{consultation.activite_physique_detail}</p>
              </div>
            )}
          </div>

          {consultation.alimentation_habituelle && (
            <div>
              <label className="block text-sm font-medium text-mediai-medium mb-2">Alimentation habituelle</label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-mediai-dark text-sm">{consultation.alimentation_habituelle}</p>
              </div>
            </div>
          )}

          {(consultation.allergie_medicamenteuse || consultation.medicament_allergique) && (
            <div>
              <label className="block text-sm font-medium text-mediai-medium mb-2">Allergies médicamenteuses</label>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full" />
                  <span className="text-red-800 font-medium text-sm">Allergie signalée</span>
                </div>
                {consultation.medicament_allergique && (
                  <p className="text-red-700 text-sm">Médicament: {consultation.medicament_allergique}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Antécédents familiaux */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.Users className="w-5 h-5 mr-2 text-indigo-500" />
          Antécédents familiaux
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mediai-medium mb-2">Maladies familiales</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'familial_drepanocytaire', label: 'Drépanocytose' },
                { key: 'familial_diabetique', label: 'Diabète' },
                { key: 'familial_obese', label: 'Obésité' },
                { key: 'familial_hypertendu', label: 'Hypertension' },
                { key: 'familial_trouble_comportement', label: 'Troubles comportement' }
              ].map(item => (
                <div key={item.key} className={`p-2 rounded text-center ${
                  consultation[item.key] ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-mediai-medium mb-2">Liens familiaux concernés</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'lien_pere', label: 'Père' },
                { key: 'lien_mere', label: 'Mère' },
                { key: 'lien_frere', label: 'Frère(s)' },
                { key: 'lien_soeur', label: 'Sœur(s)' }
              ].map(item => (
                <div key={item.key} className={`p-2 rounded text-center ${
                  consultation[item.key] ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Événements traumatiques */}
      {(consultation.evenement_traumatique === 'oui' || consultation.trauma_divorce || consultation.trauma_perte_parent || consultation.trauma_deces_epoux || consultation.trauma_deces_enfant) && (
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
          <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
            <StatusIcons.Warning className="w-5 h-5 mr-2 text-orange-500" />
            Événements traumatiques
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-medium text-sm">Événements traumatiques signalés</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'trauma_divorce', label: 'Divorce' },
                { key: 'trauma_perte_parent', label: 'Perte d\'un parent' },
                { key: 'trauma_deces_epoux', label: 'Décès époux/épouse' },
                { key: 'trauma_deces_enfant', label: 'Décès d\'un enfant' }
              ].map(item => (
                <div key={item.key} className={`p-2 rounded text-center ${
                  consultation[item.key] ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Examen physique */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
          <MedicalIcons.Stethoscope className="w-5 h-5 mr-2 text-mediai-primary" />
          Examen physique
        </h3>
        <div className="space-y-4">
          {/* État général */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-mediai-medium mb-1">État général</label>
              <p className="text-mediai-dark text-sm p-2 bg-gray-50 rounded">{consultation.etat_general || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-mediai-medium mb-1">État conservé</label>
              <p className="text-mediai-dark text-sm p-2 bg-gray-50 rounded">{consultation.etat || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-mediai-medium mb-1">Observé par</label>
              <p className="text-mediai-dark text-sm p-2 bg-gray-50 rounded">{consultation.par_quoi || 'Non renseigné'}</p>
            </div>
          </div>

          {/* Capacités */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
              <label className="block text-sm font-medium text-blue-700 mb-1">Capacité physique</label>
              <p className="text-blue-800 font-semibold">{consultation.capacite_physique || 'Non évaluée'}</p>
              {consultation.capacite_physique_score && (
                <p className="text-blue-600 text-sm">Score: {consultation.capacite_physique_score}</p>
              )}
            </div>
            <div className="p-3 rounded-lg border border-purple-200 bg-purple-50">
              <label className="block text-sm font-medium text-purple-700 mb-1">Capacité psychologique</label>
              <p className="text-purple-800 font-semibold">{consultation.capacite_psychologique || 'Non évaluée'}</p>
              {consultation.capacite_psychologique_score && (
                <p className="text-purple-600 text-sm">Score: {consultation.capacite_psychologique_score}</p>
              )}
            </div>
          </div>

          {/* Signes physiques */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${
                consultation.febrile === 'Oui' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
              }`}>
                <label className="block text-xs font-medium mb-1">État fébrile</label>
                <p className={`font-semibold ${
                  consultation.febrile === 'Oui' ? 'text-red-800' : 'text-green-800'
                }`}>{consultation.febrile || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-mediai-medium mb-1">Coloration bulbaire</label>
                <p className="text-mediai-dark text-sm p-2 bg-gray-50 rounded">{consultation.coloration_bulbaire || 'Non examinée'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-mediai-medium mb-1">Coloration palpébrale</label>
                <p className="text-mediai-dark text-sm p-2 bg-gray-50 rounded">{consultation.coloration_palpebrale || 'Non examinée'}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-mediai-medium mb-1">Tégument</label>
              <p className="text-mediai-dark text-sm p-2 bg-gray-50 rounded">{consultation.tegument || 'Non examiné'}</p>
            </div>
          </div>

          {/* Examen par région */}
          <div className="space-y-3">
            {[
              { key: 'tete', label: 'Tête' },
              { key: 'cou', label: 'Cou' },
              { key: 'paroi_thoracique', label: 'Paroi thoracique' },
              { key: 'poumons', label: 'Poumons' },
              { key: 'coeur', label: 'Cœur' },
              { key: 'epigastre_hypochondres', label: 'Épigastre et hypochondres' },
              { key: 'peri_ombilical_flancs', label: 'Péri-ombilical et flancs' },
              { key: 'hypogastre_fosses_iliaques', label: 'Hypogastre et fosses iliaques' },
              { key: 'membres', label: 'Membres' },
              { key: 'colonne_bassin', label: 'Colonne et bassin' }
            ].filter(item => consultation[item.key]).map(item => (
              <div key={item.key}>
                <label className="block text-sm font-medium text-mediai-medium mb-1">{item.label}</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-mediai-dark text-sm">{consultation[item.key]}</p>
                </div>
              </div>
            ))}

            {consultation.examen_gynecologique && (
              <div>
                <label className="block text-sm font-medium text-mediai-medium mb-1">Examen gynécologique</label>
                <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                  <p className="text-pink-800 text-sm">{consultation.examen_gynecologique}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Évaluation psychosociale */}
      {(consultation.preoccupations || consultation.comprehension || consultation.attentes || consultation.engagement) && (
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
          <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
            <MedicalIcons.Brain className="w-5 h-5 mr-2 text-indigo-500" />
            Évaluation psychosociale
          </h3>
          <div className="space-y-4">
            {[
              { key: 'preoccupations', label: 'Préoccupations' },
              { key: 'comprehension', label: 'Compréhension' },
              { key: 'attentes', label: 'Attentes' },
              { key: 'engagement', label: 'Engagement' }
            ].filter(item => consultation[item.key]).map(item => (
              <div key={item.key}>
                <label className="block text-sm font-medium text-mediai-medium mb-2">{item.label}</label>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-indigo-800 text-sm leading-relaxed">{consultation[item.key]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Autres antécédents */}
      {consultation.autres_antecedents && (
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
          <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
            <MedicalIcons.Notes className="w-5 h-5 mr-2 text-gray-500" />
            Autres antécédents
          </h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-mediai-dark text-sm leading-relaxed">{consultation.autres_antecedents}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Actions disponibles</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            size="sm" 
            onClick={handleDownloadPDF}
            className="flex items-center justify-center space-x-2 bg-mediai-primary hover:bg-mediai-primary/90 text-white border-mediai-primary"
          >
            <MedicalIcons.Download className="w-4 h-4" />
            <span>Télécharger la fiche</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400"
          >
            <MedicalIcons.Print className="w-4 h-4" />
            <span>Imprimer</span>
          </Button>
          {(consultation.status === 'en_analyse' || !consultation.diagnostic) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit}
              className="flex items-center justify-center space-x-2 bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 hover:border-amber-400"
            >
              <MedicalIcons.Edit className="w-4 h-4" />
              <span>Modifier</span>
            </Button>
          )}
        </div>
        {(consultation.status !== 'en_analyse' && consultation.diagnostic) && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <StatusIcons.Info className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-800 text-sm">
                Cette consultation ne peut plus être modifiée car elle a été traitée par un médecin.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReponseTab = () => {
    // Vérifier s'il y a une réponse médecin
    const hasResponse = consultation.diagnostic || consultation.traitement || consultation.recommandations || consultation.examen_complementaire;
    
    if (!hasResponse) {
      return (
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-200 text-center">
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

    return (
      <div className="space-y-4 lg:space-y-6">
        {/* Diagnostic médecin */}
        {consultation.diagnostic && (
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
              <MedicalIcons.Doctor className="w-5 h-5 mr-2 text-mediai-primary" />
              Diagnostic médical
            </h3>
            <div className="p-3 bg-mediai-light rounded-lg">
              <p className="text-mediai-dark text-sm lg:text-base leading-relaxed">{consultation.diagnostic}</p>
            </div>
            {consultation.date_validation && (
              <div className="mt-3 flex items-center text-xs text-mediai-medium">
                <MedicalIcons.Check className="w-4 h-4 mr-1" />
                <span>Validé le {new Date(consultation.date_validation).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>
        )}

        {/* Traitement */}
        {consultation.traitement && (
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
              <MedicalIcons.Pills className="w-5 h-5 mr-2 text-green-600" />
              Traitement prescrit
            </h3>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm lg:text-base leading-relaxed">{consultation.traitement}</p>
            </div>
          </div>
        )}

        {/* Examens complémentaires */}
        {consultation.examen_complementaire && (
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
              <MedicalIcons.Test className="w-5 h-5 mr-2 text-purple-600" />
              Examens complémentaires
            </h3>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-purple-800 text-sm lg:text-base leading-relaxed">{consultation.examen_complementaire}</p>
            </div>
          </div>
        )}

        {/* Recommandations */}
        {consultation.recommandations && (
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
              <MedicalIcons.Notes className="w-5 h-5 mr-2 text-orange-600" />
              Recommandations
            </h3>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-sm lg:text-base leading-relaxed">{consultation.recommandations}</p>
            </div>
          </div>
        )}

        {/* Commentaire de rejet si applicable */}
        {consultation.status === 'rejete_medecin' && consultation.commentaire_rejet && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 lg:p-6">
            <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center text-red-800">
              <StatusIcons.Error className="w-5 h-5 mr-2" />
              Motif de rejet
            </h3>
            <div className="p-3 bg-white border border-red-100 rounded-lg">
              <p className="text-red-700 text-sm lg:text-base leading-relaxed">{consultation.commentaire_rejet}</p>
            </div>
          </div>
        )}

        {/* Signature médecin */}
        {consultation.signature_medecin && (
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
            <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4 flex items-center">
              <MedicalIcons.Signature className="w-5 h-5 mr-2 text-indigo-600" />
              Signature du médecin
            </h3>
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
              <p className="text-indigo-800 font-semibold">{consultation.signature_medecin}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
          <h3 className="text-medical-subtitle text-lg lg:text-xl mb-4">Actions disponibles</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleDownloadPDF}
              className="flex items-center justify-center space-x-2 bg-mediai-primary hover:bg-mediai-primary/90 text-white border-mediai-primary"
            >
              <MedicalIcons.Download className="w-4 h-4" />
              <span>Télécharger l'ordonnance</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400"
            >
              <MedicalIcons.Print className="w-4 h-4" />
              <span>Imprimer la réponse</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 hover:border-indigo-400"
              onClick={() => showError('Fonctionnalité en cours', 'La messagerie médecin sera bientôt disponible')}
            >
              <MedicalIcons.Message className="w-4 h-4" />
              <span>Contacter le médecin</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoriqueTab = () => {
    // Construire l'historique chronologique de la consultation
    const historique = [
      {
        date: consultation.created_at,
        action: 'Fiche créée',
        description: 'Votre fiche de consultation a été créée et sauvegardée',
        statut: 'termine',
        icon: MedicalIcons.Document,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      ...(consultation.date_soumission ? [{
        date: consultation.date_soumission,
        action: 'Fiche soumise',
        description: 'Votre fiche de consultation a été envoyée pour analyse IA',
        statut: 'termine',
        icon: StatusIcons.Upload,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      }] : []),
      ...(consultation.date_consultation ? [{
        date: consultation.date_consultation,
        action: 'Rendez-vous programmé',
        description: `Consultation ${consultation.is_patient_distance ? 'à distance' : 'en présentiel'} programmée le ${new Date(consultation.date_consultation).toLocaleDateString('fr-FR')} à ${consultation.heure_debut || '10:00'}`,
        statut: consultation.status === 'valide_medecin' ? 'termine' : 'en_cours',
        icon: MedicalIcons.Calendar,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
      }] : []),
      ...(consultation.diagnostic ? [{
        date: consultation.date_validation || consultation.updated_at,
        action: 'Diagnostic médical validé',
        description: `${getMedecinInfo().nom} a validé le diagnostic et prescrit un traitement`,
        statut: 'termine',
        icon: MedicalIcons.Doctor,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
      }] : []),
      ...(consultation.status === 'rejete_medecin' ? [{
        date: consultation.date_rejet || consultation.updated_at,
        action: 'Consultation rejetée',
        description: `Le médecin a rejeté la consultation. Motif: ${consultation.commentaire_rejet || 'Non spécifié'}`,
        statut: 'erreur',
        icon: StatusIcons.Error,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }] : [])
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Ajouter l'étape suivante si applicable
    const prochaineEtape = (() => {
      if (consultation.status === 'en_analyse') {
        return {
          date: null,
          action: 'En attente d\'analyse IA',
          description: 'Votre fiche est en cours d\'analyse par l\'intelligence artificielle',
          statut: 'en_cours',
          icon: MedicalIcons.Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      }
      if (consultation.diagnostic && !consultation.date_consultation) {
        return {
          date: null,
          action: 'Programmation du rendez-vous',
          description: 'Votre rendez-vous de consultation sera bientôt programmé',
          statut: 'en_attente',
          icon: MedicalIcons.Calendar,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      }
      return null;
    })();

    if (prochaineEtape) {
      historique.push(prochaineEtape);
    }

    return (
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-medical-subtitle text-lg lg:text-xl flex items-center">
            <MedicalIcons.History className="w-5 h-5 mr-2 text-mediai-primary" />
            Historique de la consultation
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-mediai-medium">CONS-{consultation.id}</span>
          </div>
        </div>

        <div className="space-y-4">
          {historique.map((item, index) => {
            const IconComponent = item.icon;
            const isLast = index === historique.length - 1;
            
            return (
              <div key={index} className="relative">
                {/* Ligne de connexion */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                )}
                
                <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 ${item.borderColor} ${item.bgColor}`}>
                  {/* Icône */}
                  <div className={`flex-shrink-0 p-2 rounded-full bg-white border-2 ${item.borderColor}`}>
                    <IconComponent className={`w-5 h-5 ${item.color}`} />
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                      <h4 className={`text-sm lg:text-base font-semibold ${item.color}`}>
                        {item.action}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {item.date && (
                          <span className="text-xs lg:text-sm text-mediai-medium">
                            {new Date(item.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })} à {new Date(item.date).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.statut === 'termine' ? 'bg-green-100 text-green-800' :
                          item.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                          item.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          item.statut === 'erreur' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.statut === 'termine' ? 'Terminé' :
                           item.statut === 'en_cours' ? 'En cours' :
                           item.statut === 'en_attente' ? 'En attente' :
                           item.statut === 'erreur' ? 'Erreur' : 'Inconnu'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs lg:text-sm text-mediai-medium mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistiques de la consultation */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-mediai-dark mb-4">Informations supplémentaires</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">Durée totale</p>
              <p className="text-sm font-bold text-blue-700">
                {consultation.date_validation && consultation.created_at 
                  ? Math.ceil((new Date(consultation.date_validation) - new Date(consultation.created_at)) / (1000 * 60 * 60 * 24))
                  : Math.ceil((new Date() - new Date(consultation.created_at)) / (1000 * 60 * 60 * 24))
                } jours
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs font-medium text-green-600 mb-1">Type</p>
              <p className="text-sm font-bold text-green-700">
                {consultation.is_patient_distance ? 'À distance' : 'Présentiel'}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs font-medium text-purple-600 mb-1">Médecin</p>
              <p className="text-sm font-bold text-purple-700">
                {assignedMedecin || consultation.medecin_nom ? 'Assigné' : 'Non assigné'}
              </p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs font-medium text-orange-600 mb-1">Statut</p>
              <p className="text-sm font-bold text-orange-700">
                {consultation.status === 'valide_medecin' ? 'Validé' :
                 consultation.status === 'en_analyse' ? 'En analyse' :
                 consultation.status === 'rejete_medecin' ? 'Rejeté' : 'En cours'}
              </p>
            </div>
          </div>
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
                  CONS-{consultation.id} - {getMedecinInfo().nom}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                {getStatusLabel(consultation.status)}
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