import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { MedicalIcons, StatusIcons, ActionIcons } from './Icons';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import PhoneInput from './PhoneInput';
import { authService } from '../services/api';

/**
 * Modal de paramètres du profil patient
 */
const SettingsModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Informations personnelles
    nom: '',
    postnom: '',
    prenom: '',
    email: '',
    telephone: '',
    date_naissance: '',
    sexe: '',
    etat_civil: '',
    occupation: '',
    
    // Adresse
    avenue: '',
    quartier: '',
    commune: '',
    
    // Contact d'urgence
    contact_nom: '',
    contact_telephone: '',
    contact_adresse: '',
    contact_lien: ''
  });

  // Charger les données du profil utilisateur
  useEffect(() => {
    if (isOpen && user) {
      // Remplir directement avec les données de l'utilisateur connecté
      setFormData(prev => ({
        ...prev,
        nom: user.nom || '',
        postnom: user.postnom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        date_naissance: user.date_naissance || '',
        sexe: user.sexe || '',
        etat_civil: user.etat_civil || '',
        occupation: user.occupation || '',
        avenue: user.avenue || '',
        quartier: user.quartier || '',
        commune: user.commune || '',
        contact_nom: user.contact_nom || '',
        contact_telephone: user.contact_telephone || '',
        contact_adresse: user.contact_adresse || '',
        contact_lien: user.contact_lien || ''
      }));
      
      // Optionnellement, charger les données fraîches du serveur
      loadUserProfile();
    }
  }, [isOpen, user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getUserProfile();
      
      if (response.success) {
        const userData = response.data;
        setFormData(prev => ({
          ...prev,
          nom: userData.nom || '',
          postnom: userData.postnom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
          telephone: userData.telephone || '',
          date_naissance: userData.date_naissance || '',
          sexe: userData.sexe || '',
          etat_civil: userData.etat_civil || '',
          occupation: userData.occupation || '',
          avenue: userData.avenue || '',
          quartier: userData.quartier || '',
          commune: userData.commune || '',
          contact_nom: userData.contact_nom || '',
          contact_telephone: userData.contact_telephone || '',
          contact_adresse: userData.contact_adresse || '',
          contact_lien: userData.contact_lien || ''
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      showError('Erreur', 'Impossible de charger les informations du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const profileData = {
        nom: formData.nom,
        postnom: formData.postnom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        date_naissance: formData.date_naissance,
        sexe: formData.sexe,
        etat_civil: formData.etat_civil,
        occupation: formData.occupation,
        avenue: formData.avenue,
        quartier: formData.quartier,
        commune: formData.commune,
        contact_nom: formData.contact_nom,
        contact_telephone: formData.contact_telephone,
        contact_adresse: formData.contact_adresse,
        contact_lien: formData.contact_lien
      };

      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        // Mettre à jour les données utilisateur dans le contexte
        updateUser(response.data);
        showSuccess('Succès', 'Profil mis à jour avec succès');
        onClose(); // Fermer le modal après la mise à jour
      } else {
        showError('Erreur', response.message || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showError('Erreur', 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <form onSubmit={handleSubmitProfile} className="space-y-8">
      {/* Informations personnelles */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 lg:p-8 border border-mediai-primary">
        <h3 className="text-xl font-semibold text-mediai-dark mb-6 flex items-center">
          <MedicalIcons.User className="w-6 h-6 mr-3 text-mediai-primary" />
          Informations personnelles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Input
            label="Nom"
            value={formData.nom}
            onChange={(e) => handleInputChange('nom', e.target.value)}
            placeholder="Votre nom"
            required
          />
          <Input
            label="Post-nom"
            value={formData.postnom}
            onChange={(e) => handleInputChange('postnom', e.target.value)}
            placeholder="Votre post-nom"
          />
          <Input
            label="Prénom"
            value={formData.prenom}
            onChange={(e) => handleInputChange('prenom', e.target.value)}
            placeholder="Votre prénom"
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="votre@email.com"
            required
          />
          <PhoneInput
            label="Téléphone"
            value={formData.telephone}
            onChange={(value) => handleInputChange('telephone', value)}
            placeholder="+243 XXX XXX XXX"
          />
          <Input
            label="Date de naissance"
            type="date"
            value={formData.date_naissance}
            onChange={(e) => handleInputChange('date_naissance', e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">Sexe</label>
            <select
              value={formData.sexe}
              onChange={(e) => handleInputChange('sexe', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-transparent transition-all"
            >
              <option value="">Sélectionner</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <Input
            label="État civil"
            value={formData.etat_civil}
            onChange={(e) => handleInputChange('etat_civil', e.target.value)}
            placeholder="Célibataire, Marié(e), etc."
          />
          <Input
            label="Occupation"
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            placeholder="Votre profession"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Adresse */}
        <div className="bg-white rounded-xl p-6 lg:p-8 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-mediai-dark mb-6 flex items-center">
            <MedicalIcons.MapPin className="w-6 h-6 mr-3 text-orange-500" />
            Adresse
          </h3>
          
          <div className="space-y-4">
            <Input
              label="Avenue"
              value={formData.avenue}
              onChange={(e) => handleInputChange('avenue', e.target.value)}
              placeholder="Nom de l'avenue"
            />
            <Input
              label="Quartier"
              value={formData.quartier}
              onChange={(e) => handleInputChange('quartier', e.target.value)}
              placeholder="Nom du quartier"
            />
            <Input
              label="Commune"
              value={formData.commune}
              onChange={(e) => handleInputChange('commune', e.target.value)}
              placeholder="Nom de la commune"
            />
          </div>
        </div>

        {/* Contact d'urgence */}
        <div className="bg-white rounded-xl p-6 lg:p-8 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-mediai-dark mb-6 flex items-center">
            <MedicalIcons.Phone className="w-6 h-6 mr-3 text-red-500" />
            Contact d'urgence
          </h3>
          
          <div className="space-y-4">
            <Input
              label="Nom du contact"
              value={formData.contact_nom}
              onChange={(e) => handleInputChange('contact_nom', e.target.value)}
              placeholder="Nom de la personne à contacter"
            />
            <PhoneInput
              label="Téléphone du contact"
              value={formData.contact_telephone}
              onChange={(value) => handleInputChange('contact_telephone', value)}
              placeholder="+243 XXX XXX XXX"
            />
            <Input
              label="Lien avec le contact"
              value={formData.contact_lien}
              onChange={(e) => handleInputChange('contact_lien', e.target.value)}
              placeholder="Père, Mère, Époux/se, etc."
            />
            <Input
              label="Adresse du contact"
              value={formData.contact_adresse}
              onChange={(e) => handleInputChange('contact_adresse', e.target.value)}
              placeholder="Adresse de la personne à contacter"
            />
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="px-8 py-3"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-mediai-primary hover:bg-mediai-primary/90 px-8 py-3"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Mise à jour...</span>
            </div>
          ) : (
            'Mettre à jour le profil'
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Paramètres du profil"
      maxWidth="max-w-[95vw] h-[90vh]"
    >
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mediai-primary"></div>
            <span className="text-mediai-medium">Chargement...</span>
          </div>
        </div>
      )}

      {/* Contenu du profil avec scroll */}
      <div className="relative max-h-[75vh] overflow-y-auto">
        {renderProfileTab()}
      </div>
    </Modal>
  );
};

export default SettingsModal;
