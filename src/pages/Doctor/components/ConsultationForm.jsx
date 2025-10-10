import React, { useState } from 'react';
import { Icon, StatusIcons } from '../../../components/Icons';

/**
 * Formulaire de consultation pour créer ou modifier une consultation
 */
const ConsultationForm = ({
  isOpen,
  onClose,
  consultation = null, // null pour création, objet pour modification
  onSubmit,
  isLoading = false,
  title = null
}) => {
  const isEditing = !!consultation;
  const modalTitle = title || (isEditing ? 'Modifier la consultation' : 'Nouvelle consultation');

  // État du formulaire
  const [formData, setFormData] = useState({
    prenom: consultation?.prenom || '',
    nom: consultation?.nom || '',
    telephone: consultation?.telephone || '',
    age: consultation?.age || '',
    localisation: consultation?.localisation || '',
    motif_consultation: consultation?.motif_consultation || '',
    symptomes: consultation?.symptomes || '',
    antecedents_medicaux: consultation?.antecedents_medicaux || '',
    medicaments_actuels: consultation?.medicaments_actuels || '',
    medecin_traitant: consultation?.medecin_traitant || '',
    urgence: consultation?.urgence || 'normale',
    date_consultation: consultation?.date_consultation || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  // Gestion des changements
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur si elle existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!formData.motif_consultation.trim()) newErrors.motif_consultation = 'Le motif de consultation est requis';
    if (!formData.symptomes.trim()) newErrors.symptomes = 'Les symptômes sont requis';
    if (!formData.date_consultation) newErrors.date_consultation = 'La date de consultation est requise';

    // Validation du téléphone (format simple)
    if (formData.telephone && !/^[\d\s\+\-\(\)]{8,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    // Validation de l'âge
    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 150)) {
      newErrors.age = 'Âge invalide (0-150 ans)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border-light">
        {/* En-tête */}
        <div className="bg-mediai-primary text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-heading flex items-center">
              <Icon icon={StatusIcons.FileText} size="w-6 h-6" className="mr-3" />
              {modalTitle}
            </h3>
            {isEditing && (
              <p className="text-white/80 text-sm mt-2">
                Consultation #{consultation.id}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-light rounded-xl p-6">
            <h4 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
              <Icon icon={StatusIcons.User} size="w-5 h-5" className="mr-2" />
              Informations personnelles
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.prenom ? 'border-red-500 focus:ring-red-500' : 'border-border-light focus:ring-mediai-primary'
                  }`}
                  placeholder="Prénom du patient"
                />
                {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.nom ? 'border-red-500 focus:ring-red-500' : 'border-border-light focus:ring-mediai-primary'
                  }`}
                  placeholder="Nom du patient"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.telephone ? 'border-red-500 focus:ring-red-500' : 'border-border-light focus:ring-mediai-primary'
                  }`}
                  placeholder="+237 6XX XX XX XX"
                />
                {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Âge
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="150"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.age ? 'border-red-500 focus:ring-red-500' : 'border-border-light focus:ring-mediai-primary'
                  }`}
                  placeholder="Âge en années"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="localisation"
                  value={formData.localisation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary"
                  placeholder="Ville, quartier..."
                />
              </div>
            </div>
          </div>

          {/* Détails de la consultation */}
          <div className="bg-light rounded-xl p-6">
            <h4 className="text-lg font-bold text-mediai-dark mb-4 flex items-center">
              <Icon icon={StatusIcons.FileText} size="w-5 h-5" className="mr-2" />
              Détails de la consultation
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-mediai-dark mb-2">
                    Date de consultation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_consultation"
                    value={formData.date_consultation}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                      errors.date_consultation ? 'border-red-500 focus:ring-red-500' : 'border-border-light focus:ring-mediai-primary'
                    }`}
                  />
                  {errors.date_consultation && <p className="text-red-500 text-xs mt-1">{errors.date_consultation}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-mediai-dark mb-2">
                    Niveau d'urgence
                  </label>
                  <select
                    name="urgence"
                    value={formData.urgence}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary"
                  >
                    <option value="faible">Faible</option>
                    <option value="normale">Normale</option>
                    <option value="elevee">Élevée</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Motif de consultation <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="motif_consultation"
                  value={formData.motif_consultation}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-none ${
                    errors.motif_consultation ? 'border-red-500 focus:ring-red-500' : 'border-border-light focus:ring-mediai-primary'
                  }`}
                  placeholder="Décrivez brièvement le motif de la consultation..."
                />
                {errors.motif_consultation && <p className="text-red-500 text-xs mt-1">{errors.motif_consultation}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Symptômes <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="symptomes"
                  value={formData.symptomes}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 resize-none ${
                    errors.symptomes ? 'border-red-500 focus:ring-red-500' : 'border-border-light focus:ring-mediai-primary'
                  }`}
                  placeholder="Décrivez les symptômes ressentis par le patient..."
                />
                {errors.symptomes && <p className="text-red-500 text-xs mt-1">{errors.symptomes}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Antécédents médicaux
                </label>
                <textarea
                  name="antecedents_medicaux"
                  value={formData.antecedents_medicaux}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary resize-none"
                  placeholder="Antécédents médicaux pertinents..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Médicaments actuels
                </label>
                <textarea
                  name="medicaments_actuels"
                  value={formData.medicaments_actuels}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary resize-none"
                  placeholder="Médicaments actuellement pris par le patient..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-mediai-dark mb-2">
                  Médecin traitant
                </label>
                <input
                  type="text"
                  name="medecin_traitant"
                  value={formData.medecin_traitant}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-mediai-primary"
                  placeholder="Nom du médecin traitant habituel"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border-light">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-border-light text-mediai-medium rounded-xl hover:bg-light transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-mediai-primary text-white rounded-xl hover:bg-mediai-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
            >
              <Icon icon={StatusIcons.Save} size="w-4 h-4" />
              <span>{isLoading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer consultation')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationForm;