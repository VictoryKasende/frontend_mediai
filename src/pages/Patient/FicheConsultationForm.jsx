import React, { useState } from 'react';
import { MedicalIcons, NavigationIcons } from '../../components/Icons';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PhoneInput from '../../components/PhoneInput';

/**
 * Formulaire de fiche de consultation - Étape par étape
 */
const FicheConsultationForm = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
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
    
    // Personne à contacter
    contact_nom: '',
    contact_telephone: '',
    contact_adresse: '',
    
    // Médecin sélectionné
    medecin_id: '',
    medecin_nom: '',
    
    // Signes vitaux
    temperature: '',
    spo2: '',
    poids: '',
    tension_arterielle: '',
    pouls: '',
    frequence_respiratoire: '',
    
    // Présence
    patient: true,
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
    coloration_bulbaire: 'Normale',
    coloration_palpebrale: 'Normale',
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
    engagement: ''
  });

  const steps = [
    { id: 1, title: 'Informations personnelles', icon: MedicalIcons.Profile },
    { id: 2, title: 'Contact & Adresse', icon: MedicalIcons.Location },
    { id: 3, title: 'Choix du médecin', icon: MedicalIcons.Doctor },
    { id: 4, title: 'Signes vitaux', icon: MedicalIcons.Heart },
    { id: 5, title: 'Motif de consultation', icon: MedicalIcons.Document },
    { id: 6, title: 'Médicaments', icon: MedicalIcons.Pills },
    { id: 7, title: 'Symptômes', icon: MedicalIcons.Symptoms },
    { id: 8, title: 'Antécédents', icon: MedicalIcons.History },
    { id: 9, title: 'Examen clinique', icon: MedicalIcons.Stethoscope },
    { id: 10, title: 'Finalisation', icon: MedicalIcons.Check }
  ];

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Données de la fiche:', formData);
    alert('Fiche de consultation soumise avec succès !');
    if (onBack) onBack();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderInformationsPersonnelles();
      case 2:
        return renderContactAdresse();
      case 3:
        return renderChoixMedecin();
      case 4:
        return renderSignesVitaux();
      case 5:
        return renderMotifConsultation();
      case 6:
        return renderMedicaments();
      case 7:
        return renderSymptomes();
      case 8:
        return renderAntecedents();
      case 9:
        return renderExamenClinique();
      case 10:
        return renderFinalisation();
      default:
        return null;
    }
  };

  const renderContactAdresse = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Adresse personnelle</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <Input
            label="Avenue/Rue"
            value={formData.avenue}
            onChange={(e) => handleInputChange('avenue', e.target.value)}
            placeholder="Nom de l'avenue ou rue"
          />
          <Input
            label="Quartier"
            value={formData.quartier}
            onChange={(e) => handleInputChange('quartier', e.target.value)}
            placeholder="Votre quartier"
          />
          <Input
            label="Commune"
            value={formData.commune}
            onChange={(e) => handleInputChange('commune', e.target.value)}
            placeholder="Votre commune"
          />
        </div>
      </div>

      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Personne à contacter en cas d'urgence</h3>
        <div className="space-y-4">
          <Input
            label="Nom complet *"
            value={formData.contact_nom}
            onChange={(e) => handleInputChange('contact_nom', e.target.value)}
            placeholder="Nom de la personne à contacter"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <PhoneInput
              label="Téléphone *"
              value={formData.contact_telephone}
              onChange={(value) => handleInputChange('contact_telephone', value)}
              placeholder="Numéro de téléphone"
              required
            />
            <Input
              label="Adresse"
              value={formData.contact_adresse}
              onChange={(e) => handleInputChange('contact_adresse', e.target.value)}
              placeholder="Adresse complète"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderChoixMedecin = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Sélectionnez un médecin</h3>
        <p className="text-medical-body text-sm lg:text-base mb-4 lg:mb-6">
          Choisissez le médecin que vous souhaitez consulter. Vous pouvez rechercher par spécialité ou par nom.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {[
            { id: 1, nom: 'Dr. Martin Dubois', specialite: 'Cardiologie', disponible: true },
            { id: 2, nom: 'Dr. Sophie Laurent', specialite: 'Médecine générale', disponible: true },
            { id: 3, nom: 'Dr. Jean Moreau', specialite: 'Neurologie', disponible: false },
            { id: 4, nom: 'Dr. Marie Durand', specialite: 'Dermatologie', disponible: true },
            { id: 5, nom: 'Dr. Pierre Martin', specialite: 'Pédiatrie', disponible: true },
            { id: 6, nom: 'Dr. Claire Bernard', specialite: 'Gynécologie', disponible: true }
          ].map((medecin) => (
            <div
              key={medecin.id}
              className={`border rounded-lg p-3 lg:p-4 cursor-pointer transition-all ${
                formData.medecin_id === medecin.id.toString()
                  ? 'border-primary bg-blue-50'
                  : medecin.disponible
                  ? 'border-medium hover:border-primary'
                  : 'border-light bg-gray-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (medecin.disponible) {
                  handleInputChange('medecin_id', medecin.id.toString());
                  handleInputChange('medecin_nom', medecin.nom);
                }
              }}
            >
              <div className="flex items-center space-x-2 lg:space-x-3 mb-2">
                <MedicalIcons.Doctor className="w-6 h-6 lg:w-8 lg:h-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-dark text-sm lg:text-base truncate">{medecin.nom}</h4>
                  <p className="text-xs lg:text-sm text-medium truncate">{medecin.specialite}</p>
                </div>
                {formData.medecin_id === medecin.id.toString() && (
                  <MedicalIcons.Check className="w-4 h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" />
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  medecin.disponible 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {medecin.disponible ? 'Disponible' : 'Indisponible'}
                </span>
                {medecin.disponible && (
                  <span className="text-xs text-medium hidden sm:inline">Cliquez pour sélectionner</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {formData.medecin_id && (
          <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <MedicalIcons.Check className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
              <span className="text-green-800 font-medium text-sm lg:text-base">
                Médecin sélectionné : {formData.medecin_nom}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSignesVitaux = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Signes vitaux</h3>
        <p className="text-medical-body text-sm lg:text-base mb-4">
          Remplissez les signes vitaux que vous connaissez. Laissez vide si vous ne connaissez pas la valeur.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
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

      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Personnes présentes lors de la consultation</h3>
        <div className="space-y-3 lg:space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.patient}
              onChange={(e) => handleInputChange('patient', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">Patient présent</span>
          </label>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.proche}
                onChange={(e) => handleInputChange('proche', e.target.checked)}
                className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
              />
              <span className="text-dark text-sm lg:text-base">Proche présent</span>
            </label>
            {formData.proche && (
              <div className="ml-7">
                <Input
                  label="Lien avec le patient"
                  value={formData.proche_lien}
                  onChange={(e) => handleInputChange('proche_lien', e.target.value)}
                  placeholder="ex: époux/épouse, parent, enfant..."
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.soignant}
                onChange={(e) => handleInputChange('soignant', e.target.checked)}
                className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
              />
              <span className="text-dark text-sm lg:text-base">Soignant présent</span>
            </label>
            {formData.soignant && (
              <div className="ml-7">
                <Input
                  label="Rôle du soignant"
                  value={formData.soignant_role}
                  onChange={(e) => handleInputChange('soignant_role', e.target.value)}
                  placeholder="ex: infirmier, aide-soignant..."
                />
              </div>
            )}
          </div>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.medecin}
              onChange={(e) => handleInputChange('medecin', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">Médecin présent</span>
          </label>

          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autre}
                onChange={(e) => handleInputChange('autre', e.target.checked)}
                className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
              />
              <span className="text-dark text-sm lg:text-base">Autre personne présente</span>
            </label>
            {formData.autre && (
              <div className="ml-7">
                <Input
                  label="Précisions"
                  value={formData.autre_precisions}
                  onChange={(e) => handleInputChange('autre_precisions', e.target.value)}
                  placeholder="Précisez qui d'autre est présent..."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMotifConsultation = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Motif de la consultation</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark mb-2">
              Motif principal de consultation *
            </label>
            <textarea
              value={formData.motif_consultation}
              onChange={(e) => handleInputChange('motif_consultation', e.target.value)}
              placeholder="Décrivez brièvement pourquoi vous consultez aujourd'hui..."
              rows={4}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 resize-none text-xs lg:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-dark mb-2">
              Histoire de la maladie actuelle
            </label>
            <textarea
              value={formData.histoire_maladie}
              onChange={(e) => handleInputChange('histoire_maladie', e.target.value)}
              placeholder="Décrivez l'évolution de vos symptômes : quand ont-ils commencé, comment ont-ils évolué, qu'est-ce qui les améliore ou les aggrave..."
              rows={6}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 resize-none text-xs lg:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicaments = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Prise de médicaments</h3>
        <p className="text-medical-body text-sm lg:text-base mb-4">
          Indiquez où vous prenez habituellement vos médicaments :
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.maison_medicaments}
              onChange={(e) => handleInputChange('maison_medicaments', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">À la maison</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.pharmacie_medicaments}
              onChange={(e) => handleInputChange('pharmacie_medicaments', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">À la pharmacie</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.centre_sante_medicaments}
              onChange={(e) => handleInputChange('centre_sante_medicaments', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">Au centre de santé</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hopital_medicaments}
              onChange={(e) => handleInputChange('hopital_medicaments', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">À l'hôpital</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer sm:col-span-2">
            <input
              type="checkbox"
              checked={formData.medicaments_non_pris}
              onChange={(e) => handleInputChange('medicaments_non_pris', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">Je ne prends pas de médicaments</span>
          </label>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium text-dark mb-2">
            Détails sur les médicaments
          </label>
          <textarea
            value={formData.details_medicaments}
            onChange={(e) => handleInputChange('details_medicaments', e.target.value)}
            placeholder="Listez les médicaments que vous prenez actuellement (nom, dosage, fréquence) ou toute information pertinente..."
            rows={4}
            className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 resize-none text-xs lg:text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderSymptomes = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Symptômes actuels</h3>
        <p className="text-medical-body text-sm lg:text-base mb-4">
          Cochez les symptômes que vous ressentez actuellement :
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.cephalees}
              onChange={(e) => handleInputChange('cephalees', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <div>
              <span className="text-dark font-medium text-sm lg:text-base">Céphalées</span>
              <p className="text-xs lg:text-sm text-medium">Maux de tête</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.vertiges}
              onChange={(e) => handleInputChange('vertiges', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <div>
              <span className="text-dark font-medium text-sm lg:text-base">Vertiges</span>
              <p className="text-xs lg:text-sm text-medium">Sensation de rotation</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.palpitations}
              onChange={(e) => handleInputChange('palpitations', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <div>
              <span className="text-dark font-medium text-sm lg:text-base">Palpitations</span>
              <p className="text-xs lg:text-sm text-medium">Battements cardiaques rapides</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.troubles_visuels}
              onChange={(e) => handleInputChange('troubles_visuels', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <div>
              <span className="text-dark font-medium text-sm lg:text-base">Troubles visuels</span>
              <p className="text-xs lg:text-sm text-medium">Vision floue, double...</p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer sm:col-span-2">
            <input
              type="checkbox"
              checked={formData.nycturie}
              onChange={(e) => handleInputChange('nycturie', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <div>
              <span className="text-dark font-medium text-sm lg:text-base">Nycturie</span>
              <p className="text-xs lg:text-sm text-medium">Urination nocturne fréquente</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAntecedents = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Antécédents médicaux personnels</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hypertendu}
              onChange={(e) => handleInputChange('hypertendu', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">Hypertension artérielle</span>
          </label>
          
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.diabetique}
              onChange={(e) => handleInputChange('diabetique', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">Diabète</span>
          </label>
          
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.epileptique}
              onChange={(e) => handleInputChange('epileptique', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">Épilepsie</span>
          </label>
          
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.trouble_comportement}
              onChange={(e) => handleInputChange('trouble_comportement', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">Troubles du comportement</span>
          </label>
          
          <label className="flex items-center space-x-3 p-3 lg:p-4 border border-medium rounded-lg hover:bg-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.gastritique}
              onChange={(e) => handleInputChange('gastritique', e.target.checked)}
              className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 rounded cursor-pointer"
            />
            <span className="text-dark text-sm lg:text-base">Gastrite</span>
          </label>
        </div>
      </div>

      <div className="bg-light rounded-lg p-4 lg:p-6">
        <h3 className="text-medical-subtitle text-base lg:text-lg mb-4">Habitudes de vie</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-dark mb-2">Tabac</label>
              <div className="relative">
                <select
                  value={formData.tabac}
                  onChange={(e) => handleInputChange('tabac', e.target.value)}
                  className="w-full appearance-none bg-white px-4 py-3 pr-10 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-xs lg:text-sm text-dark cursor-pointer hover:border-primary"
                >
                  <option value="non">Non</option>
                  <option value="rarement">Rarement</option>
                  <option value="souvent">Souvent</option>
                  <option value="tres_souvent">Très souvent</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs lg:text-sm font-medium text-dark mb-2">Alcool</label>
              <div className="relative">
                <select
                  value={formData.alcool}
                  onChange={(e) => handleInputChange('alcool', e.target.value)}
                  className="w-full appearance-none bg-white px-4 py-3 pr-10 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-xs lg:text-sm text-dark cursor-pointer hover:border-primary"
                >
                  <option value="non">Non</option>
                  <option value="rarement">Rarement</option>
                  <option value="souvent">Souvent</option>
                  <option value="tres_souvent">Très souvent</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs lg:text-sm font-medium text-dark mb-2">Activité physique</label>
              <div className="relative">
                <select
                  value={formData.activite_physique}
                  onChange={(e) => handleInputChange('activite_physique', e.target.value)}
                  className="w-full appearance-none bg-white px-4 py-3 pr-10 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-xs lg:text-sm text-dark cursor-pointer hover:border-primary"
                >
                  <option value="non">Jamais</option>
                  <option value="rarement">Rarement</option>
                  <option value="souvent">Souvent</option>
                  <option value="tres_souvent">Très souvent</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-dark mb-2">
                Détails activité physique
              </label>
              <textarea
                value={formData.activite_physique_detail}
                onChange={(e) => handleInputChange('activite_physique_detail', e.target.value)}
                placeholder="Type d'activité, fréquence, durée..."
                rows={3}
                className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Alimentation habituelle
              </label>
              <textarea
                value={formData.alimentation_habituelle}
                onChange={(e) => handleInputChange('alimentation_habituelle', e.target.value)}
                placeholder="Décrivez votre alimentation habituelle..."
                rows={3}
                className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-light rounded-lg p-4">
        <h3 className="text-medical-subtitle text-lg mb-4">Allergies</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.allergie_medicamenteuse}
              onChange={(e) => handleInputChange('allergie_medicamenteuse', e.target.checked)}
              className="text-primary"
            />
            <span className="text-dark">Allergie médicamenteuse</span>
          </label>
          
          {formData.allergie_medicamenteuse && (
            <Input
              label="Médicament(s) allergène(s)"
              value={formData.medicament_allergique}
              onChange={(e) => handleInputChange('medicament_allergique', e.target.value)}
              placeholder="Précisez les médicaments qui causent des allergies..."
              className="ml-6"
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderExamenClinique = () => (
    <div className="space-y-6">
      <div className="bg-light rounded-lg p-4 mb-6">
        <h3 className="text-medical-subtitle text-lg mb-4">État général</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">État général</label>
            <select
              value={formData.etat}
              onChange={(e) => handleInputChange('etat', e.target.value)}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors"
            >
              <option value="Conservé">Conservé</option>
              <option value="Altéré">Altéré</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Fébrile</label>
            <select
              value={formData.febrile}
              onChange={(e) => handleInputChange('febrile', e.target.value)}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors"
            >
              <option value="Non">Non</option>
              <option value="Oui">Oui</option>
            </select>
          </div>
        </div>
        
        {formData.etat === 'Altéré' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-dark mb-2">
              Par quoi l'état général est-il altéré ?
            </label>
            <textarea
              value={formData.par_quoi}
              onChange={(e) => handleInputChange('par_quoi', e.target.value)}
              placeholder="Décrivez ce qui altère l'état général..."
              rows={3}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
        )}
      </div>

      <div className="bg-light rounded-lg p-4 mb-6">
        <h3 className="text-medical-subtitle text-lg mb-4">Capacités</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Capacité physique</label>
            <select
              value={formData.capacite_physique}
              onChange={(e) => handleInputChange('capacite_physique', e.target.value)}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors"
            >
              <option value="Top">Top</option>
              <option value="Moyen">Moyen</option>
              <option value="Bas">Bas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Capacité psychologique</label>
            <select
              value={formData.capacite_psychologique}
              onChange={(e) => handleInputChange('capacite_psychologique', e.target.value)}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors"
            >
              <option value="Top">Top</option>
              <option value="Moyen">Moyen</option>
              <option value="Bas">Bas</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-light rounded-lg p-4">
        <h3 className="text-medical-subtitle text-lg mb-4">Examens des régions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Tête</label>
            <textarea
              value={formData.tete}
              onChange={(e) => handleInputChange('tete', e.target.value)}
              placeholder="Observations sur la tête..."
              rows={2}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Cou</label>
            <textarea
              value={formData.cou}
              onChange={(e) => handleInputChange('cou', e.target.value)}
              placeholder="Observations sur le cou..."
              rows={2}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Poumons</label>
            <textarea
              value={formData.poumons}
              onChange={(e) => handleInputChange('poumons', e.target.value)}
              placeholder="Observations sur les poumons..."
              rows={2}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Cœur</label>
            <textarea
              value={formData.coeur}
              onChange={(e) => handleInputChange('coeur', e.target.value)}
              placeholder="Observations sur le cœur..."
              rows={2}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Membres</label>
            <textarea
              value={formData.membres}
              onChange={(e) => handleInputChange('membres', e.target.value)}
              placeholder="Observations sur les membres..."
              rows={2}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Colonne/Bassin</label>
            <textarea
              value={formData.colonne_bassin}
              onChange={(e) => handleInputChange('colonne_bassin', e.target.value)}
              placeholder="Observations sur la colonne vertébrale et le bassin..."
              rows={2}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinalisation = () => (
    <div className="space-y-6">
      <div className="bg-light rounded-lg p-4 mb-6">
        <h3 className="text-medical-subtitle text-lg mb-4">Vos préoccupations et attentes</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Principales préoccupations
            </label>
            <textarea
              value={formData.preoccupations}
              onChange={(e) => handleInputChange('preoccupations', e.target.value)}
              placeholder="Quelles sont vos principales inquiétudes concernant votre santé ?"
              rows={3}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Vos attentes de cette consultation
            </label>
            <textarea
              value={formData.attentes}
              onChange={(e) => handleInputChange('attentes', e.target.value)}
              placeholder="Qu'attendez-vous de cette consultation ?"
              rows={3}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Votre compréhension de votre état
            </label>
            <textarea
              value={formData.comprehension}
              onChange={(e) => handleInputChange('comprehension', e.target.value)}
              placeholder="Comment comprenez-vous votre état de santé actuel ?"
              rows={3}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Votre engagement dans le traitement
            </label>
            <textarea
              value={formData.engagement}
              onChange={(e) => handleInputChange('engagement', e.target.value)}
              placeholder="Comment envisagez-vous de suivre les recommandations médicales ?"
              rows={3}
              className="w-full px-4 py-3 border border-medium rounded-lg focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <MedicalIcons.Check className="w-6 h-6 text-green-600" />
          <h3 className="text-medical-subtitle text-lg text-green-800">Récapitulatif</h3>
        </div>
        <div className="text-green-700 space-y-2">
          <p><strong>Patient :</strong> {formData.prenom} {formData.nom}</p>
          <p><strong>Médecin sélectionné :</strong> {formData.medecin_nom || 'Aucun médecin sélectionné'}</p>
          <p><strong>Motif :</strong> {formData.motif_consultation || 'Non spécifié'}</p>
          <p className="text-sm text-green-600 mt-4">
            ✓ Fiche prête à être soumise. Le médecin sélectionné recevra votre demande de consultation.
          </p>
        </div>
      </div>
    </div>
  );
  // Informations personnelles (étape 1)
  const renderInformationsPersonnelles = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <Input
          label="Nom *"
          value={formData.nom}
          onChange={(e) => handleInputChange('nom', e.target.value)}
          placeholder="Votre nom de famille"
          required
        />
        <Input
          label="Post-nom"
          value={formData.postnom}
          onChange={(e) => handleInputChange('postnom', e.target.value)}
          placeholder="Votre post-nom"
        />
        <Input
          label="Prénom *"
          value={formData.prenom}
          onChange={(e) => handleInputChange('prenom', e.target.value)}
          placeholder="Votre prénom"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <Input
          label="Date de naissance *"
          type="date"
          value={formData.date_naissance}
          onChange={(e) => handleInputChange('date_naissance', e.target.value)}
          required
        />
        <Input
          label="Âge *"
          type="number"
          value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
          placeholder="Votre âge"
          min="0"
          max="150"
          required
        />
        <div>
          <label className="block text-xs lg:text-sm font-medium text-dark mb-2">
            Sexe *
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="sexe"
                value="M"
                checked={formData.sexe === 'M'}
                onChange={(e) => handleInputChange('sexe', e.target.value)}
                className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <span className="text-xs lg:text-sm text-dark">Masculin</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="sexe"
                value="F"
                checked={formData.sexe === 'F'}
                onChange={(e) => handleInputChange('sexe', e.target.value)}
                className="w-4 h-4 text-primary border-medium focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <span className="text-xs lg:text-sm text-dark">Féminin</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        <PhoneInput
          label="Numéro de téléphone *"
          value={formData.telephone}
          onChange={(value) => handleInputChange('telephone', value)}
          placeholder="Votre numéro de téléphone"
          required
        />
        <div>
          <label className="block text-xs lg:text-sm font-medium text-dark mb-2">
            État civil
          </label>
          <div className="relative">
            <select
              value={formData.etat_civil}
              onChange={(e) => handleInputChange('etat_civil', e.target.value)}
              className="w-full appearance-none bg-white px-4 py-3 pr-10 border border-medium rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-xs lg:text-sm text-dark cursor-pointer hover:border-primary"
            >
              <option value="Célibataire">Célibataire</option>
              <option value="Marié(e)">Marié(e)</option>
              <option value="Divorcé(e)">Divorcé(e)</option>
              <option value="Veuf(ve)">Veuf(ve)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <Input
        label="Occupation/Profession"
        value={formData.occupation}
        onChange={(e) => handleInputChange('occupation', e.target.value)}
        placeholder="Votre profession ou occupation"
      />
    </div>
  );
  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-light">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Logo size="sm" />
              <div className="min-w-0 flex-1">
                <h1 className="text-medical-title text-base sm:text-lg lg:text-xl truncate">Fiche de consultation</h1>
                <p className="text-medical-caption text-xs sm:text-sm truncate">
                  Étape {currentStep} sur {steps.length}: {steps[currentStep - 1]?.title}
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-sm border border-medium rounded-lg hover:border-primary transition-colors"
            >
              <NavigationIcons.ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Retour</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 lg:py-6">
        {/* Progress Bar */}
        <div className="mb-4 lg:mb-6">
          <div className="hidden sm:flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isActive
                        ? 'border-primary bg-primary text-white'
                        : isCompleted
                        ? 'border-primary bg-primary text-white'
                        : 'border-medium bg-white text-medium'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="mt-1 lg:mt-2 text-xs text-center max-w-16 lg:max-w-20">
                    <span className={`font-medium ${isActive ? 'text-primary' : 'text-medium'}`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Mobile progress indicator */}
          <div className="sm:hidden mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-medium">Étape {currentStep}</span>
              <span className="text-medium truncate flex-1 text-center">{steps[currentStep - 1]?.title}</span>
              <span className="text-medium">{currentStep}/{steps.length}</span>
            </div>
          </div>
          
          <div className="w-full bg-light rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-light p-4 lg:p-6 xl:p-8">
          <h2 className="text-medical-subtitle text-lg sm:text-xl lg:text-2xl mb-4 lg:mb-6">
            {steps[currentStep - 1]?.title}
          </h2>
          
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0 mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-light">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <NavigationIcons.ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </Button>
            
            {currentStep === steps.length ? (
              <Button
                onClick={handleSubmit}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <MedicalIcons.Check className="w-4 h-4" />
                <span>Soumettre la fiche</span>
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <span>Suivant</span>
                <NavigationIcons.ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FicheConsultationForm;
