import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { MedicalIcons, StatusIcons, ActionIcons } from './Icons';
import { consultationService } from '../services/api';

/**
 * Modal pour envoyer notifications patient (WhatsApp/SMS)
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal ouvert/fermé
 * @param {Function} props.onClose - Callback fermeture
 * @param {number} props.consultationId - ID consultation
 * @param {string} props.patientPhone - Numéro téléphone patient
 * @param {string} props.patientName - Nom du patient
 */
const PatientNotificationModal = ({ 
  isOpen, 
  onClose, 
  consultationId, 
  patientPhone,
  patientName 
}) => {
  const [selectedChannel, setSelectedChannel] = useState('whatsapp'); // whatsapp | sms
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Réinitialiser l'état lors de l'ouverture
  const handleOpen = () => {
    setSelectedChannel('whatsapp');
    setIsSending(false);
    setSuccess(false);
    setError(null);
  };

  // Gérer la fermeture
  const handleClose = () => {
    if (!isSending) {
      onClose();
      // Réinitialiser après animation fermeture
      setTimeout(() => {
        setSuccess(false);
        setError(null);
        setSelectedChannel('whatsapp');
      }, 300);
    }
  };

  // Envoyer notification
  const handleSend = async () => {
    if (!consultationId || !patientPhone) {
      setError('Informations manquantes pour envoyer la notification');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      console.log(`📤 Envoi notification ${selectedChannel} pour consultation #${consultationId}...`);

      // Appel API backend
      await consultationService.sendNotification(consultationId, {
        channel: selectedChannel,
        phone_number: patientPhone
      });

      console.log('✅ Notification envoyée avec succès');
      setSuccess(true);
      setError(null);

      // Fermer automatiquement après 2 secondes
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur envoi notification:', err);
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message ||
                          err.response?.data?.error ||
                          `Erreur lors de l'envoi de la notification ${selectedChannel}`;
      
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setIsSending(false);
    }
  };

  // Formater le numéro de téléphone pour affichage
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Non renseigné';
    
    // Format: +243 XXX XXX XXX
    if (phone.startsWith('+243') && phone.length === 13) {
      return `+243 ${phone.slice(4, 7)} ${phone.slice(7, 10)} ${phone.slice(10, 13)}`;
    }
    
    return phone;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onOpen={handleOpen}
      size="md"
      title="Recevoir ma consultation"
    >
      <div className="space-y-6">
        {/* État succès */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <StatusIcons.Success className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-green-900 font-semibold mb-1">
                  Notification envoyée !
                </h4>
                <p className="text-green-700 text-sm">
                  Vous allez recevoir votre fiche de consultation par {selectedChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'} dans quelques instants.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* État erreur */}
        {error && !success && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <StatusIcons.Error className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-red-900 font-semibold mb-1">
                  Erreur d'envoi
                </h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire principal */}
        {!success && (
          <>
            {/* Informations patient */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MedicalIcons.User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Patient
                  </label>
                  <p className="text-blue-800 font-semibold">{patientName || 'Patient'}</p>
                </div>
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <MedicalIcons.Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone
                  </label>
                  <p className="text-gray-900 font-mono text-lg">
                    {formatPhoneNumber(patientPhone)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sélection canal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choisissez votre canal de réception
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Option WhatsApp */}
                <button
                  type="button"
                  onClick={() => setSelectedChannel('whatsapp')}
                  disabled={isSending}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    selectedChannel === 'whatsapp'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  } ${isSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {/* Icône sélection */}
                  {selectedChannel === 'whatsapp' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <StatusIcons.Success className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Contenu */}
                  <div className="flex flex-col items-center space-y-2">
                    {/* Logo WhatsApp (emoji) */}
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${
                        selectedChannel === 'whatsapp' ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        WhatsApp
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Message instantané
                      </p>
                    </div>
                  </div>
                </button>

                {/* Option SMS */}
                <button
                  type="button"
                  onClick={() => setSelectedChannel('sms')}
                  disabled={isSending}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    selectedChannel === 'sms'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  } ${isSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {/* Icône sélection */}
                  {selectedChannel === 'sms' && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <StatusIcons.Success className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Contenu */}
                  <div className="flex flex-col items-center space-y-2">
                    {/* Logo SMS (emoji) */}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${
                        selectedChannel === 'sms' ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        SMS
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Message texte
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Informations sur le contenu */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <StatusIcons.Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-indigo-900 font-medium mb-2">
                    Contenu de la notification
                  </h4>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      <span>Résumé de votre consultation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      <span>Diagnostic du médecin</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      <span>Traitement prescrit</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                      <span>Recommandations médicales</span>
                    </li>
                    {selectedChannel === 'whatsapp' && (
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                        <span>Lien pour télécharger le PDF</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Avertissement numéro invalide */}
            {(!patientPhone || patientPhone === 'Non renseigné') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <StatusIcons.Warning className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-yellow-900 font-medium mb-1">
                      Numéro de téléphone manquant
                    </h4>
                    <p className="text-yellow-700 text-sm">
                      Vous devez renseigner un numéro de téléphone valide dans votre profil pour recevoir des notifications.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            {success ? 'Fermer' : 'Annuler'}
          </Button>
          
          {!success && (
            <Button
              onClick={handleSend}
              disabled={isSending || !patientPhone || patientPhone === 'Non renseigné'}
              className="min-w-[140px]"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Envoi...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ActionIcons.Send className="w-4 h-4" />
                  <span>Envoyer par {selectedChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</span>
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PatientNotificationModal;
