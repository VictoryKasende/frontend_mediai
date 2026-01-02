import React, { useState, useEffect } from 'react';
import { MedicalIcons, NavigationIcons, StatusIcons } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PhoneInput from '../../components/PhoneInput';
import Switch from '../../components/Switch';
import ConfirmModal from '../../components/ConfirmModal';
import { consultationService } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Formulaire de consultation en présentiel pour médecin
 * Permet au médecin de créer une fiche de consultation pour un patient présent physiquement
 */
const ConsultationPresentielForm = ({ onBack, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    // Informations patient
    nom: '',
    postnom: '',
    prenom: '',
    date_naissance: '',
    age: '',
    sexe: '',
    telephone: '',
    etat_civil: 'Célibataire',
    occupation: '',
    
    // Adresse
    avenue: '',
    quartier: '',
    commune: '',
    nom_hopital: '',

    // Personne à contacter
    contact_nom: '',
    contact_telephone: '',
    contact_adresse: '',
    
    // Signes vitaux
    temperature: '',
    spo2: '',
    poids: '',
    tension_arterielle: '',
    pouls: '',
    frequence_respiratoire: '',
    
    // Présence (patient physiquement présent)
    patient: true, // Toujours true pour consultation présentiel
    proche: false,
    soignant: false,
    medecin: false,
    autre: false,
    proche_lien: '',
    soignant_role: '',
    autre_precisions: '',
    
    // Anamnèse
    motif_consultation: '',
    histoire_maladie: '',
    
    // Médicaments
    maison_medicaments: false,
    pharmacie_medicaments: false,
    centre_sante_medicaments: false,
    hopital_medicaments: false,
    medicaments_non_pris: false,
    details_medicaments: '',
    
    // Symptômes
    cephalees: false,
    vertiges: false,
    palpitations: false,
    troubles_visuels: false,
    nycturie: false,
    
    // Antécédents
    hypertendu: false,
    diabetique: false,
    epileptique: false,
    trouble_comportement: false,
    gastritique: false,
    
    // Habitudes
    tabac: 'non',
    alcool: 'non',
    activite_physique: 'rarement',
    activite_physique_detail: '',
    alimentation_habituelle: '',
    
    // Allergies
    allergie_medicamenteuse: false,
    medicament_allergique: '',
    
    // Antécédents familiaux
    familial_drepanocytaire: false,
    familial_diabetique: false,
    familial_obese: false,
    familial_hypertendu: false,
    familial_trouble_comportement: false,
    
    lien_pere: false,
    lien_mere: false,
    lien_frere: false,
    lien_soeur: false,
    
    // Traumatismes
    evenement_traumatique: 'non',
    trauma_divorce: false,
    trauma_perte_parent: false,
    trauma_deces_epoux: false,
    trauma_deces_enfant: false,
    
    etat_general: '',
    autres_antecedents: '',
    
    // Examen clinique
    etat: 'Conservé',
    par_quoi: '',
    capacite_physique: 'Top',
    capacite_physique_score: '',
    capacite_psychologique: 'Top',
    capacite_psychologique_score: '',
    febrile: 'Non',
    coloration_bulbaire: 'normale',
    coloration_palpebrale: 'normale',
    tegument: 'Normal',
    
    // Régions examinées
    tete: '',
    cou: '',
    paroi_thoracique: '',
    poumons: '',
    coeur: '',
    epigastre_hypochondres: '',
    peri_ombilical_flancs: '',
    hypogastre_fosses_iliaques: '',
    membres: '',
    colonne_bassin: '',
    examen_gynecologique: '',
    
    // Expériences patient
    preoccupations: '',
    comprehension: '',
    attentes: '',
    engagement: '',
    
    // Hypothèse et analyses proposées
    hypothese_patient_medecin: '',
    analyses_proposees: '',
    observations_importantes: ''
  });

  const steps = [
    { id: 1, title: 'Identité du patient', icon: MedicalIcons.Profile },
    { id: 2, title: 'Contact & Adresse', icon: MedicalIcons.Location },
    { id: 3, title: 'Signes vitaux', icon: MedicalIcons.Heart },
    { id: 4, title: 'Motif de consultation', icon: MedicalIcons.Document },
    { id: 5, title: 'Médicaments', icon: MedicalIcons.Pills },
    { id: 6, title: 'Symptômes', icon: MedicalIcons.Symptoms },
    { id: 7, title: 'Antécédents', icon: MedicalIcons.History },
    { id: 8, title: 'Examen clinique', icon: MedicalIcons.Stethoscope },
    { id: 9, title: 'Hypothèse & Analyses', icon: MedicalIcons.Search },
    { id: 10, title: 'Finalisation', icon: MedicalIcons.Check }
  ];

  // Validation par étape
  const validateStep = (step) => {
    const errors = [];
    
    switch (step) {
      case 1: // Identité du patient
        if (!formData.nom?.trim()) errors.push('Nom du patient');
        if (!formData.postnom?.trim()) errors.push('Post-nom du patient');
        if (!formData.prenom?.trim()) errors.push('Prénom du patient');
        if (!formData.date_naissance?.trim()) errors.push('Date de naissance');
        if (!formData.age?.trim()) errors.push('Âge du patient');
        if (!formData.telephone?.trim()) errors.push('Numéro de téléphone');
        if (!formData.etat_civil?.trim()) errors.push('État civil');
        if (!formData.occupation?.trim()) errors.push('Profession/occupation');
        break;
        
      case 2: // Contact & Adresse
        if (!formData.avenue?.trim()) errors.push('Avenue/rue');
        if (!formData.quartier?.trim()) errors.push('Quartier');
        if (!formData.commune?.trim()) errors.push('Commune');
        if (!formData.contact_nom?.trim()) errors.push('Nom de la personne à contacter');
        if (!formData.contact_telephone?.trim()) errors.push('Téléphone du contact');
        if (!formData.contact_adresse?.trim()) errors.push('Adresse du contact');
        break;
        
      case 8: // Examen clinique
        if (!formData.etat?.trim()) errors.push('État général');
        if (!formData.capacite_physique?.trim()) errors.push('Capacité physique');
        if (!formData.capacite_psychologique?.trim()) errors.push('Capacité psychologique');
        if (!formData.febrile?.trim()) errors.push('État fébrile');
        if (!formData.coloration_bulbaire?.trim()) errors.push('Coloration bulbaire');
        if (!formData.coloration_palpebrale?.trim()) errors.push('Coloration palpébrale');
        if (!formData.tegument?.trim()) errors.push('État du tégument');
        break;
        
      default:
        break;
    }
    
    return errors;
  };

  // Fonction pour calculer l'âge à partir de la date de naissance
  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return '';
    
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Si la date de naissance change, calculer automatiquement l'âge
      if (name === 'date_naissance') {
        newData.age = calculateAge(value);
      }
      
      return newData;
    });
  };

  const handleNext = () => {
    const errors = validateStep(currentStep);
    
    if (errors.length > 0) {
      showError(
        'Champs obligatoires manquants',
        `Veuillez remplir les champs suivants : ${errors.join(', ')}`
      );
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validation complète
      const requiredFields = {
        nom: 'Nom du patient',
        postnom: 'Post-nom du patient',
        prenom: 'Prénom du patient',
        date_naissance: 'Date de naissance',
        age: 'Âge du patient',
        telephone: 'Numéro de téléphone',
        etat_civil: 'État civil',
        occupation: 'Profession/occupation',
        avenue: 'Avenue/rue',
        quartier: 'Quartier',
        commune: 'Commune',
        contact_nom: 'Nom de la personne à contacter',
        contact_telephone: 'Téléphone du contact',
        contact_adresse: 'Adresse du contact',
        etat: 'État général',
        capacite_physique: 'Capacité physique',
        capacite_psychologique: 'Capacité psychologique',
        febrile: 'État fébrile',
        coloration_bulbaire: 'Coloration bulbaire',
        coloration_palpebrale: 'Coloration palpébrale',
        tegument: 'État du tégument'
      };
      
      const missingFields = [];
      Object.keys(requiredFields).forEach(field => {
        const value = formData[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingFields.push(requiredFields[field]);
        }
      });
      
      if (missingFields.length > 0) {
        showError(
          'Champs obligatoires manquants',
          `Veuillez remplir les champs suivants : ${missingFields.join(', ')}`
        );
        return;
      }
      
      // Préparer les données
      const consultationData = {
        // Informations patient
        nom: formData.nom || '',
        postnom: formData.postnom || '',
        prenom: formData.prenom || '',
        date_naissance: formData.date_naissance || null,
        age: formData.age ? parseInt(formData.age) : null,
        sexe: formData.sexe || '',
        telephone: formData.telephone || '',
        etat_civil: formData.etat_civil || 'Célibataire',
        occupation: formData.occupation || '',
        
        // IMPORTANT : Consultation en PRÉSENTIEL (FALSE pour à distance)
        is_patient_distance: false,
        
        // Assigner le médecin connecté automatiquement
        assigned_medecin: user?.id || user?.medecin_profile?.id || user?.doctor_id || null,
        
        // Adresse
        avenue: formData.avenue || '',
        quartier: formData.quartier || '',
        commune: formData.commune || '',
        nom_hopital: formData.nom_hopital || '',
        
        // Personne à contacter
        contact_nom: formData.contact_nom || '',
        contact_telephone: formData.contact_telephone || '',
        contact_adresse: formData.contact_adresse || '',
        
        // Signes vitaux
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        spo2: formData.spo2 ? parseFloat(formData.spo2) : null,
        poids: formData.poids ? parseFloat(formData.poids) : null,
        tension_arterielle: formData.tension_arterielle || '',
        pouls: formData.pouls ? parseInt(formData.pouls) : null,
        frequence_respiratoire: formData.frequence_respiratoire ? parseInt(formData.frequence_respiratoire) : null,
        
        // Présence
        patient: true, // Patient toujours présent en présentiel
        proche: Boolean(formData.proche),
        soignant: Boolean(formData.soignant),
        medecin: Boolean(formData.medecin),
        autre: Boolean(formData.autre),
        proche_lien: formData.proche_lien || '',
        soignant_role: formData.soignant_role || '',
        autre_precisions: formData.autre_precisions || '',
        
        // Anamnèse
        motif_consultation: formData.motif_consultation || '',
        histoire_maladie: formData.histoire_maladie || '',
        
        // Médicaments
        maison_medicaments: Boolean(formData.maison_medicaments),
        pharmacie_medicaments: Boolean(formData.pharmacie_medicaments),
        centre_sante_medicaments: Boolean(formData.centre_sante_medicaments),
        hopital_medicaments: Boolean(formData.hopital_medicaments),
        medicaments_non_pris: Boolean(formData.medicaments_non_pris),
        details_medicaments: formData.details_medicaments || '',
        
        // Symptômes
        cephalees: Boolean(formData.cephalees),
        vertiges: Boolean(formData.vertiges),
        palpitations: Boolean(formData.palpitations),
        troubles_visuels: Boolean(formData.troubles_visuels),
        nycturie: Boolean(formData.nycturie),
        
        // Antécédents
        hypertendu: Boolean(formData.hypertendu),
        diabetique: Boolean(formData.diabetique),
        epileptique: Boolean(formData.epileptique),
        trouble_comportement: Boolean(formData.trouble_comportement),
        gastritique: Boolean(formData.gastritique),
        
        // Habitudes
        tabac: formData.tabac || 'non',
        alcool: formData.alcool || 'non',
        activite_physique: formData.activite_physique || 'rarement',
        activite_physique_detail: formData.activite_physique_detail || '',
        alimentation_habituelle: formData.alimentation_habituelle || '',
        
        // Allergies
        allergie_medicamenteuse: Boolean(formData.allergie_medicamenteuse),
        medicament_allergique: formData.medicament_allergique || '',
        
        // Antécédents familiaux
        familial_drepanocytaire: Boolean(formData.familial_drepanocytaire),
        familial_diabetique: Boolean(formData.familial_diabetique),
        familial_obese: Boolean(formData.familial_obese),
        familial_hypertendu: Boolean(formData.familial_hypertendu),
        familial_trouble_comportement: Boolean(formData.familial_trouble_comportement),
        
        // Liens familiaux
        lien_pere: Boolean(formData.lien_pere),
        lien_mere: Boolean(formData.lien_mere),
        lien_frere: Boolean(formData.lien_frere),
        lien_soeur: Boolean(formData.lien_soeur),
        
        // Traumatismes
        evenement_traumatique: formData.evenement_traumatique || 'non',
        trauma_divorce: Boolean(formData.trauma_divorce),
        trauma_perte_parent: Boolean(formData.trauma_perte_parent),
        trauma_deces_epoux: Boolean(formData.trauma_deces_epoux),
        trauma_deces_enfant: Boolean(formData.trauma_deces_enfant),
        
        // Autres
        etat_general: formData.etat_general || '',
        autres_antecedents: formData.autres_antecedents || '',
        
        // Examen clinique
        etat: formData.etat || 'Conservé',
        par_quoi: formData.par_quoi || '',
        capacite_physique: formData.capacite_physique || 'Top',
        capacite_physique_score: formData.capacite_physique_score || '',
        capacite_psychologique: formData.capacite_psychologique || 'Top',
        capacite_psychologique_score: formData.capacite_psychologique_score || '',
        febrile: formData.febrile || 'Non',
        coloration_bulbaire: formData.coloration_bulbaire || 'normale',
        coloration_palpebrale: formData.coloration_palpebrale || 'normale',
        tegument: formData.tegument || 'Normal',
        
        // Régions examinées
        tete: formData.tete || '',
        cou: formData.cou || '',
        paroi_thoracique: formData.paroi_thoracique || '',
        poumons: formData.poumons || '',
        coeur: formData.coeur || '',
        epigastre_hypochondres: formData.epigastre_hypochondres || '',
        peri_ombilical_flancs: formData.peri_ombilical_flancs || '',
        hypogastre_fosses_iliaques: formData.hypogastre_fosses_iliaques || '',
        membres: formData.membres || '',
        colonne_bassin: formData.colonne_bassin || '',
        examen_gynecologique: formData.examen_gynecologique || '',
        
        // Expériences patient
        preoccupations: formData.preoccupations || '',
        comprehension: formData.comprehension || '',
        attentes: formData.attentes || '',
        engagement: formData.engagement || '',
        
        // Hypothèse et analyses proposées
        hypothese_patient_medecin: formData.hypothese_patient_medecin || '',
        analyses_proposees: formData.analyses_proposees || ''
      };
      
      console.log('📤 Données envoyées au backend:', JSON.stringify(consultationData, null, 2));
      
      const result = await consultationService.createConsultation(consultationData);
      
      showSuccess(
        'Consultation créée avec succès !',
        'La fiche de consultation a été enregistrée et l\'analyse va commencer.'
      );
      
      // Callback de succès
      if (onSuccess) {
        setTimeout(() => onSuccess(result), 1500);
      } else if (onBack) {
        setTimeout(() => onBack(), 1500);
      }
      
    } catch (error) {
      console.error('Erreur lors de la création de la consultation:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création de la consultation.';
      
      if (error.details && typeof error.details === 'object') {
        const fieldErrors = [];
        Object.keys(error.details).forEach(field => {
          if (Array.isArray(error.details[field])) {
            fieldErrors.push(`${field}: ${error.details[field][0]}`);
          } else if (typeof error.details[field] === 'string') {
            fieldErrors.push(`${field}: ${error.details[field]}`);
          }
        });
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('\n');
        }
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      showError('Erreur de création', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderInformationsPersonnelles();
      case 2:
        return renderContactAdresse();
      case 3:
        return renderSignesVitaux();
      case 4:
        return renderMotifConsultation();
      case 5:
        return renderMedicaments();
      case 6:
        return renderSymptomes();
      case 7:
        return renderAntecedents();
      case 8:
        return renderExamenClinique();
      case 9:
        return renderHypotheseAnalyses();
      case 10:
        return renderFinalisation();
      default:
        return null;
    }
  };

  const renderInformationsPersonnelles = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
          <MedicalIcons.Profile className="w-5 h-5 mr-2 text-mediai-primary" />
          Identité du patient
        </h3>
        <p className="text-sm text-mediai-medium mb-6">
          Renseignez les informations d'identité du patient présent en consultation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label={<span>Nom <span className="text-red-500">*</span></span>}
            value={formData.nom}
            onChange={(e) => handleInputChange('nom', e.target.value)}
            placeholder="Nom de famille"
            required
          />
          <Input
            label={<span>Post-nom <span className="text-red-500">*</span></span>}
            value={formData.postnom}
            onChange={(e) => handleInputChange('postnom', e.target.value)}
            placeholder="Post-nom"
            required
          />
          <Input
            label={<span>Prénom <span className="text-red-500">*</span></span>}
            value={formData.prenom}
            onChange={(e) => handleInputChange('prenom', e.target.value)}
            placeholder="Prénom"
            required
          />
          <Input
            label={<span>Date de naissance <span className="text-red-500">*</span></span>}
            type="date"
            value={formData.date_naissance}
            onChange={(e) => handleInputChange('date_naissance', e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Âge <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">(calculé automatiquement)</span>
            </label>
            <input
              type="number"
              value={formData.age}
              readOnly
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Remplissez d'abord la date de naissance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Sexe <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.sexe}
              onChange={(e) => handleInputChange('sexe', e.target.value)}
              className="w-full px-4 py-3 border border-mediai-medium rounded-lg focus:border-mediai-primary focus:ring-1 focus:ring-mediai-primary"
              required
            >
              <option value="">Sélectionnez</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <PhoneInput
            label={<span>Téléphone <span className="text-red-500">*</span></span>}
            value={formData.telephone}
            onChange={(value) => handleInputChange('telephone', value)}
            placeholder="Numéro de téléphone"
            required
          />
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              État civil <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.etat_civil}
              onChange={(e) => handleInputChange('etat_civil', e.target.value)}
              className="w-full px-4 py-3 border border-mediai-medium rounded-lg focus:border-mediai-primary focus:ring-1 focus:ring-mediai-primary"
              required
            >
              <option value="Célibataire">Célibataire</option>
              <option value="Marié(e)">Marié(e)</option>
              <option value="Divorcé(e)">Divorcé(e)</option>
              <option value="Veuf/Veuve">Veuf/Veuve</option>
              <option value="Union libre">Union libre</option>
            </select>
          </div>
          <Input
            label={<span>Profession/Occupation <span className="text-red-500">*</span></span>}
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            placeholder="Profession"
            required
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <StatusIcons.Info className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Consultation en présentiel</span>
          </div>
          <p className="text-blue-600 text-sm mt-1">
            Ce formulaire est destiné aux patients physiquement présents au cabinet.
          </p>
        </div>
      </div>
    </div>
  );

  const renderContactAdresse = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-mediai-dark mb-4">Adresse du patient</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label={<span>Avenue/Rue <span className="text-red-500">*</span></span>}
            value={formData.avenue}
            onChange={(e) => handleInputChange('avenue', e.target.value)}
            placeholder="Nom de l'avenue"
            required
          />
          <Input
            label={<span>Quartier <span className="text-red-500">*</span></span>}
            value={formData.quartier}
            onChange={(e) => handleInputChange('quartier', e.target.value)}
            placeholder="Quartier"
            required
          />
          <Input
            label={<span>Commune <span className="text-red-500">*</span></span>}
            value={formData.commune}
            onChange={(e) => handleInputChange('commune', e.target.value)}
            placeholder="Commune"
            required
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-mediai-dark mb-4">Hôpital / Centre de santé (optionnel)</h3>
        <Input
          label="Nom de l'hôpital ou centre de santé"
          value={formData.nom_hopital}
          onChange={(e) => handleInputChange('nom_hopital', e.target.value)}
          placeholder="Ex: Hôpital Général de Kinshasa, Clinique Ngaliema..."
        />
        <p className="text-xs text-mediai-medium mt-2">
          Si le patient est suivi dans un hôpital ou centre de santé, indiquez son nom ici.
        </p>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-mediai-dark mb-4">Personne à contacter en cas d'urgence</h3>
        <div className="space-y-4">
          <Input
            label={<span>Nom complet <span className="text-red-500">*</span></span>}
            value={formData.contact_nom}
            onChange={(e) => handleInputChange('contact_nom', e.target.value)}
            placeholder="Nom de la personne à contacter"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhoneInput
              label={<span>Téléphone <span className="text-red-500">*</span></span>}
              value={formData.contact_telephone}
              onChange={(value) => handleInputChange('contact_telephone', value)}
              placeholder="Numéro de téléphone"
              required
            />
            <Input
              label={<span>Adresse <span className="text-red-500">*</span></span>}
              value={formData.contact_adresse}
              onChange={(e) => handleInputChange('contact_adresse', e.target.value)}
              placeholder="Adresse complète"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Note: Les autres fonctions render (renderSignesVitaux, renderMotifConsultation, etc.) 
  // sont identiques au formulaire patient, je vais les importer depuis le fichier patient
  // Pour le moment, je vais les copier directement

  const renderSignesVitaux = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
        <h3 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
          <MedicalIcons.Heart className="w-5 h-5 mr-2 text-pink-500" />
          Signes vitaux
        </h3>
        <p className="text-sm text-mediai-medium mb-6">
          Mesurez et renseignez les signes vitaux du patient.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Température (°C)"
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => handleInputChange('temperature', e.target.value)}
            placeholder="37.0"
            min="30"
            max="45"
          />
          <Input
            label="SpO2 (%)"
            type="number"
            value={formData.spo2}
            onChange={(e) => handleInputChange('spo2', e.target.value)}
            placeholder="98"
            min="0"
            max="100"
          />
          <Input
            label="Poids (kg)"
            type="number"
            step="0.1"
            value={formData.poids}
            onChange={(e) => handleInputChange('poids', e.target.value)}
            placeholder="70.0"
            min="0"
            max="300"
          />
          <Input
            label="Tension artérielle"
            value={formData.tension_arterielle}
            onChange={(e) => handleInputChange('tension_arterielle', e.target.value)}
            placeholder="120/80"
          />
          <Input
            label="Pouls (bpm)"
            type="number"
            value={formData.pouls}
            onChange={(e) => handleInputChange('pouls', e.target.value)}
            placeholder="72"
            min="0"
            max="300"
          />
          <Input
            label="Fréquence respiratoire"
            type="number"
            value={formData.frequence_respiratoire}
            onChange={(e) => handleInputChange('frequence_respiratoire', e.target.value)}
            placeholder="16"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
          <MedicalIcons.Users className="w-5 h-5 mr-2 text-slate-500" />
          Personnes présentes
        </h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.patient}
              onChange={(e) => handleInputChange('patient', e.target.checked)}
              className="w-4 h-4 text-primary rounded"
              disabled
            />
            <span className="text-dark">Patient présent (obligatoire)</span>
          </label>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.proche}
                onChange={(e) => handleInputChange('proche', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-dark">Proche présent</span>
            </label>
            {formData.proche && (
              <div className="ml-7">
                <Input
                  label="Lien avec le patient"
                  value={formData.proche_lien}
                  onChange={(e) => handleInputChange('proche_lien', e.target.value)}
                  placeholder="ex: époux/épouse, parent..."
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.soignant}
                onChange={(e) => handleInputChange('soignant', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-dark">Soignant présent</span>
            </label>
            {formData.soignant && (
              <div className="ml-7">
                <Input
                  label="Rôle du soignant"
                  value={formData.soignant_role}
                  onChange={(e) => handleInputChange('soignant_role', e.target.value)}
                  placeholder="ex: infirmier..."
                />
              </div>
            )}
          </div>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.medecin}
              onChange={(e) => handleInputChange('medecin', e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span className="text-dark">Médecin présent</span>
          </label>

          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.autre}
                onChange={(e) => handleInputChange('autre', e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-dark">Autre personne</span>
            </label>
            {formData.autre && (
              <div className="ml-7">
                <Input
                  label="Précisions"
                  value={formData.autre_precisions}
                  onChange={(e) => handleInputChange('autre_precisions', e.target.value)}
                  placeholder="Qui d'autre est présent..."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Les autres render functions seraient identiques, je vais créer une version simplifiée
  // Pour gagner de l'espace, je vais référencer les mêmes composants

  const renderMotifConsultation = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
        <h3 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
          <MedicalIcons.Document className="w-5 h-5 mr-2 text-amber-500" />
          Motif de consultation
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Motif principal *
            </label>
            <textarea
              value={formData.motif_consultation}
              onChange={(e) => handleInputChange('motif_consultation', e.target.value)}
              placeholder="Pourquoi le patient consulte aujourd'hui..."
              rows={4}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Histoire de la maladie
            </label>
            <textarea
              value={formData.histoire_maladie}
              onChange={(e) => handleInputChange('histoire_maladie', e.target.value)}
              placeholder="Évolution des symptômes..."
              rows={6}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicaments = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
        <h3 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
          <MedicalIcons.Pill className="w-5 h-5 mr-2 text-teal-500" />
          Médicaments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.maison_medicaments}
              onChange={(e) => handleInputChange('maison_medicaments', e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>À la maison</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.pharmacie_medicaments}
              onChange={(e) => handleInputChange('pharmacie_medicaments', e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>À la pharmacie</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.centre_sante_medicaments}
              onChange={(e) => handleInputChange('centre_sante_medicaments', e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>Centre de santé</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.hopital_medicaments}
              onChange={(e) => handleInputChange('hopital_medicaments', e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>Hôpital</span>
          </label>
          <label className="flex items-center space-x-3 md:col-span-2">
            <input
              type="checkbox"
              checked={formData.medicaments_non_pris}
              onChange={(e) => handleInputChange('medicaments_non_pris', e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>Aucun médicament</span>
          </label>
        </div>
        <textarea
          value={formData.details_medicaments}
          onChange={(e) => handleInputChange('details_medicaments', e.target.value)}
          placeholder="Liste des médicaments (nom, dosage, fréquence)..."
          rows={4}
          className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary resize-none"
        />
      </div>
    </div>
  );

  const renderSymptomes = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 shadow-sm border border-red-200">
        <h3 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
          <MedicalIcons.Symptoms className="w-5 h-5 mr-2 text-red-500" />
          Symptômes actuels
        </h3>
        <p className="text-sm text-mediai-medium mb-6">
          Indiquez les symptômes que le patient ressent actuellement :
        </p>
        
        <div className="grid grid-cols-1 gap-5">
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <Switch
              label="Céphalées"
              description="Maux de tête, migraines"
              checked={formData.cephalees}
              onChange={(value) => handleInputChange('cephalees', value)}
              size="md"
            />
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <Switch
              label="Vertiges"
              description="Sensation de rotation, déséquilibre"
              checked={formData.vertiges}
              onChange={(value) => handleInputChange('vertiges', value)}
              size="md"
            />
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <Switch
              label="Palpitations"
              description="Battements cardiaques rapides ou irréguliers"
              checked={formData.palpitations}
              onChange={(value) => handleInputChange('palpitations', value)}
              size="md"
            />
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <Switch
              label="Troubles visuels"
              description="Vision floue, double vision, éblouissements"
              checked={formData.troubles_visuels}
              onChange={(value) => handleInputChange('troubles_visuels', value)}
              size="md"
            />
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-red-100">
            <Switch
              label="Nycturie"
              description="Besoin d'uriner fréquemment la nuit"
              checked={formData.nycturie}
              onChange={(value) => handleInputChange('nycturie', value)}
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAntecedents = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-purple-200">
        <h3 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
          <MedicalIcons.History className="w-5 h-5 mr-2 text-purple-500" />
          Antécédents médicaux personnels
        </h3>
        <p className="text-sm text-mediai-medium mb-6">
          Indiquez les antécédents médicaux du patient :
        </p>
        
        <div className="grid grid-cols-1 gap-5">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <Switch
              label="Hypertension artérielle"
              description="Tension artérielle élevée"
              checked={formData.hypertendu}
              onChange={(value) => handleInputChange('hypertendu', value)}
              size="md"
            />
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <Switch
              label="Diabète"
              description="Trouble de la régulation du glucose"
              checked={formData.diabetique}
              onChange={(value) => handleInputChange('diabetique', value)}
              size="md"
            />
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <Switch
              label="Épilepsie"
              description="Troubles neurologiques avec crises"
              checked={formData.epileptique}
              onChange={(value) => handleInputChange('epileptique', value)}
              size="md"
            />
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <Switch
              label="Troubles du comportement"
              description="Problèmes psychologiques ou comportementaux"
              checked={formData.trouble_comportement}
              onChange={(value) => handleInputChange('trouble_comportement', value)}
              size="md"
            />
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <Switch
              label="Gastrite"
              description="Inflammation de la muqueuse gastrique"
              checked={formData.gastritique}
              onChange={(value) => handleInputChange('gastritique', value)}
              size="md"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-blue-200">
        <h4 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
          <MedicalIcons.Activity className="w-5 h-5 mr-2 text-blue-500" />
          Habitudes de vie
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tabac</label>
            <select
              value={formData.tabac}
              onChange={(e) => handleInputChange('tabac', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="non">Non</option>
              <option value="rarement">Rarement</option>
              <option value="souvent">Souvent</option>
              <option value="tres_souvent">Très souvent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Alcool</label>
            <select
              value={formData.alcool}
              onChange={(e) => handleInputChange('alcool', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="non">Non</option>
              <option value="rarement">Rarement</option>
              <option value="souvent">Souvent</option>
              <option value="tres_souvent">Très souvent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Activité physique</label>
            <select
              value={formData.activite_physique}
              onChange={(e) => handleInputChange('activite_physique', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="non">Jamais</option>
              <option value="rarement">Rarement</option>
              <option value="souvent">Souvent</option>
              <option value="tres_souvent">Très souvent</option>
            </select>
          </div>
        </div>

        <h4 className="font-bold text-mediai-dark mb-3">Allergies</h4>
        <label className="flex items-center space-x-3 mb-3">
          <input
            type="checkbox"
            checked={formData.allergie_medicamenteuse}
            onChange={(e) => handleInputChange('allergie_medicamenteuse', e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
          <span>Allergie médicamenteuse</span>
        </label>
        {formData.allergie_medicamenteuse && (
          <Input
            label="Médicament(s) allergique(s)"
            value={formData.medicament_allergique}
            onChange={(e) => handleInputChange('medicament_allergique', e.target.value)}
            placeholder="Liste des médicaments..."
          />
        )}
      </div>
    </div>
  );

  const renderExamenClinique = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
          <MedicalIcons.Stethoscope className="w-5 h-5 mr-2 text-indigo-500" />
          Examen clinique
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              État général <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.etat}
              onChange={(e) => handleInputChange('etat', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="Conservé">Conservé</option>
              <option value="Altéré">Altéré</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Capacité physique <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.capacite_physique}
              onChange={(e) => handleInputChange('capacite_physique', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="Top">Top</option>
              <option value="Moyen">Moyen</option>
              <option value="Bas">Bas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Capacité psychologique <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.capacite_psychologique}
              onChange={(e) => handleInputChange('capacite_psychologique', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="Top">Top</option>
              <option value="Moyen">Moyen</option>
              <option value="Bas">Bas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              État fébrile <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.febrile}
              onChange={(e) => handleInputChange('febrile', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="Non">Non</option>
              <option value="Oui">Oui</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Coloration bulbaire <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.coloration_bulbaire}
              onChange={(e) => handleInputChange('coloration_bulbaire', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="normale">Normale</option>
              <option value="jaunatre">Jaunâtre</option>
              <option value="rougeatre">Rougeâtre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Coloration palpébrale <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.coloration_palpebrale}
              onChange={(e) => handleInputChange('coloration_palpebrale', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="normale">Normale</option>
              <option value="pale">Pâle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Tégument <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.tegument}
              onChange={(e) => handleInputChange('tegument', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="Normal">Normal</option>
              <option value="Anormal">Anormal</option>
            </select>
          </div>
        </div>

        <h4 className="font-bold text-mediai-dark mt-6 mb-3">Examens par région</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Tête" value={formData.tete} onChange={(e) => handleInputChange('tete', e.target.value)} placeholder="Observations..." />
          <Input label="Cou" value={formData.cou} onChange={(e) => handleInputChange('cou', e.target.value)} placeholder="Observations..." />
          <Input label="Paroi thoracique" value={formData.paroi_thoracique} onChange={(e) => handleInputChange('paroi_thoracique', e.target.value)} placeholder="Observations..." />
          <Input label="Poumons" value={formData.poumons} onChange={(e) => handleInputChange('poumons', e.target.value)} placeholder="Observations..." />
          <Input label="Cœur" value={formData.coeur} onChange={(e) => handleInputChange('coeur', e.target.value)} placeholder="Observations..." />
          <Input label="Épigastre / Hypochondres" value={formData.epigastre_hypochondres} onChange={(e) => handleInputChange('epigastre_hypochondres', e.target.value)} placeholder="Observations..." />
          <Input label="Péri-ombilical / Flancs" value={formData.peri_ombilical_flancs} onChange={(e) => handleInputChange('peri_ombilical_flancs', e.target.value)} placeholder="Observations..." />
          <Input label="Hypogastre / Fosses iliaques" value={formData.hypogastre_fosses_iliaques} onChange={(e) => handleInputChange('hypogastre_fosses_iliaques', e.target.value)} placeholder="Observations..." />
          <Input label="Membres" value={formData.membres} onChange={(e) => handleInputChange('membres', e.target.value)} placeholder="Observations..." />
          <Input label="Colonne vertébrale / Bassin" value={formData.colonne_bassin} onChange={(e) => handleInputChange('colonne_bassin', e.target.value)} placeholder="Observations..." />
          <Input label="Examen gynécologique" value={formData.examen_gynecologique} onChange={(e) => handleInputChange('examen_gynecologique', e.target.value)} placeholder="Observations (si applicable)..." />
        </div>
      </div>
    </div>
  );

  const renderHypotheseAnalyses = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-6 shadow-sm border border-blue-200">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4 font-bold text-mediai-dark flex items-center">
          <MedicalIcons.Search className="w-5 h-5 mr-2 text-mediai-primary" />
          Hypothèse et Analyses proposées
        </h3>
        <p className="text-medical-body text-sm lg:text-base mb-4 lg:mb-6 text-mediai-medium">
          Partagez vos impressions sur l'état de santé du patient et les examens que vous pensez nécessaires.
        </p>
        
        <div className="space-y-4 lg:space-y-6">
          {/* Hypothèse diagnostique */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-dark mb-2">
              Hypothèse diagnostique
            </label>
            <textarea
              value={formData.hypothese_patient_medecin}
              onChange={(e) => handleInputChange('hypothese_patient_medecin', e.target.value)}
              placeholder="Selon vous, de quoi le patient pourrait-il souffrir ? Quelle est votre hypothèse diagnostique ?"
              rows={3}
              className="w-full px-3 lg:px-4 py-3 border border-border-light rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20 transition-all resize-none text-sm lg:text-base"
            />
            <p className="text-xs text-mediai-medium mt-1">
              Optionnel - Votre hypothèse diagnostique initiale
            </p>
          </div>

          {/* Analyses proposées */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-dark mb-2">
              Examens ou analyses paracliniques proposés
            </label>
            <textarea
              value={formData.analyses_proposees}
              onChange={(e) => handleInputChange('analyses_proposees', e.target.value)}
              placeholder="Ex: Numération formule sanguine, Glycémie à jeun, Radiographie thoracique, etc."
              rows={3}
              className="w-full px-3 lg:px-4 py-3 border border-border-light rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20 transition-all resize-none text-sm lg:text-base"
            />
            <p className="text-xs text-mediai-medium mt-1">
              Optionnel - Suggestions d'examens complémentaires
            </p>
          </div>

          {/* Observations importantes */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-mediai-dark mb-2">
              Observations importantes à signaler
            </label>
            <textarea
              value={formData.observations_importantes || ''}
              onChange={(e) => handleInputChange('observations_importantes', e.target.value)}
              placeholder="Y a-t-il quelque chose d'important à signaler concernant ce patient ?"
              rows={3}
              className="w-full px-3 lg:px-4 py-3 border border-border-light rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20 transition-all resize-none text-sm lg:text-base"
            />
            <p className="text-xs text-mediai-medium mt-1">
              Optionnel - Toute information que vous jugez pertinente
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinalisation = () => (
    <div className="space-y-6">
      {/* Section préoccupations et attentes */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-mediai-dark mb-4">Préoccupations et attentes du patient</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Principales préoccupations
            </label>
            <textarea
              value={formData.preoccupations}
              onChange={(e) => handleInputChange('preoccupations', e.target.value)}
              placeholder="Quelles sont les principales inquiétudes du patient concernant sa santé ?"
              rows={3}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Attentes de cette consultation
            </label>
            <textarea
              value={formData.attentes}
              onChange={(e) => handleInputChange('attentes', e.target.value)}
              placeholder="Qu'attend le patient de cette consultation ?"
              rows={3}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Compréhension de l'état
            </label>
            <textarea
              value={formData.comprehension}
              onChange={(e) => handleInputChange('comprehension', e.target.value)}
              placeholder="Comment le patient comprend-il son état de santé actuel ?"
              rows={3}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Engagement dans le traitement
            </label>
            <textarea
              value={formData.engagement}
              onChange={(e) => handleInputChange('engagement', e.target.value)}
              placeholder="Comment le patient envisage-t-il de suivre les recommandations médicales ?"
              rows={3}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <MedicalIcons.Check className="w-8 h-8 text-green-600" />
          <h3 className="text-lg font-bold text-green-800">Récapitulatif</h3>
        </div>
        <div className="text-green-700 space-y-2">
          <p><strong>Patient :</strong> {formData.prenom} {formData.nom} {formData.postnom}</p>
          <p><strong>Âge :</strong> {formData.age} ans</p>
          <p><strong>Téléphone :</strong> {formData.telephone}</p>
          <p><strong>Type :</strong> Consultation en présentiel</p>
          <p><strong>Motif :</strong> {formData.motif_consultation || 'Non spécifié'}</p>
          <p className="text-sm text-green-600 mt-4">
            ✓ Fiche prête à être soumise. La consultation sera enregistrée dans le système.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-2">
          <StatusIcons.Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Prochaines étapes :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>La fiche sera enregistrée dans le système</li>
              <li>L'analyse démarrera automatiquement</li>
              <li>Vous pourrez compléter le diagnostic et le traitement après validation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-mediai-light via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <NavigationIcons.ArrowLeft className="w-5 h-5 text-mediai-dark" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-mediai-dark">Nouvelle consultation en présentiel</h1>
                <p className="text-sm text-mediai-medium">Patient physiquement présent au cabinet</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MedicalIcons.Stethoscope className="w-6 h-6 text-mediai-primary" />
              <span className="text-sm font-medium text-mediai-primary">Médecin : Dr. {user?.first_name} {user?.last_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep === step.id
                      ? 'bg-mediai-primary text-white shadow-lg scale-110'
                      : currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <MedicalIcons.Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center hidden md:block ${
                    currentStep === step.id ? 'text-mediai-primary font-semibold' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <NavigationIcons.ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Suivant
              <NavigationIcons.ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <MedicalIcons.Check className="w-4 h-4 mr-2" />
                  Enregistrer la consultation
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          handleSubmit();
        }}
        title="Confirmer l'enregistrement"
        message="Êtes-vous sûr de vouloir enregistrer cette consultation en présentiel ? Vérifiez que toutes les informations sont correctes."
        confirmText="Oui, enregistrer"
        cancelText="Annuler"
        type="success"
      />
    </div>
  );
};

export default ConsultationPresentielForm;
