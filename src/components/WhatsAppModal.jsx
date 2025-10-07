import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { whatsappService } from '../services/api';
import { ActionIcons, MedicalIcons, StatusIcons } from './Icons';
import Button from './Button';

/**
 * Composant pour l'envoi de fiches via WhatsApp
 * Permet de choisir un template et personnaliser le message
 */
const WhatsAppModal = ({ fiche, isOpen, onClose, onMessageSent }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState('check'); // check, qr, sms, success
  const [sandboxStatus, setSandboxStatus] = useState(null);
  const [whatsappOptions, setWhatsappOptions] = useState({
    template_type: 'consultation_validee',
    recipient_phone: '',
    custom_message: '',
    include_attachments: true,
    language: 'fr',
    send_immediately: true
  });

  // Préremplir les données quand la fiche change
  useEffect(() => {
    if (fiche && isOpen) {
      // Récupérer le numéro de téléphone depuis différents champs possibles
      const phoneNumber = fiche.telephone || 
                          fiche.patient?.phone || 
                          fiche.patient?.telephone || 
                          fiche.phone || 
                          '';

      // Déterminer le template par défaut selon le statut
      let defaultTemplate = 'consultation_validee';
      if (fiche.status === 'rejete_medecin' || fiche.status === 'rejete') {
        defaultTemplate = 'consultation_rejetee';
      } else if (fiche.status === 'en_attente' || fiche.status === 'analyse_terminee') {
        defaultTemplate = 'demande_informations';
      }

      setWhatsappOptions(prev => ({
        ...prev,
        template_type: defaultTemplate,
        recipient_phone: phoneNumber,
        custom_message: ''
      }));
    }
  }, [fiche, isOpen]);

  /**
   * Envoyer la fiche via WhatsApp
   */
  const handleSendWhatsApp = async () => {
    console.log('🔄 Début envoi WhatsApp');
    console.log('📋 Fiche:', fiche);
    console.log('⚙️ Options WhatsApp:', whatsappOptions);

    if (!fiche) {
      console.log('❌ Erreur: Aucune fiche sélectionnée');
      showError('Erreur', 'Aucune fiche sélectionnée');
      return;
    }

    // Validation du numéro de téléphone
    if (!whatsappOptions.recipient_phone?.trim()) {
      console.log('❌ Erreur: Numéro de téléphone manquant');
      showError('Erreur', 'Numéro de téléphone requis');
      return;
    }

    // Validation du message personnalisé si template custom
    if (whatsappOptions.template_type === 'custom' && !whatsappOptions.custom_message?.trim()) {
      console.log('❌ Erreur: Message personnalisé manquant pour template custom');
      showError('Erreur', 'Message personnalisé requis pour le template custom');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Envoi en cours vers WhatsApp service...');
      const result = await whatsappService.sendFiche(fiche.id, whatsappOptions);
      console.log('✅ Résultat envoi WhatsApp:', result);
      
      showSuccess('WhatsApp envoyé', 'La fiche a été envoyée avec succès via WhatsApp');
      
      // Notifier le composant parent
      if (onMessageSent) {
        onMessageSent(result);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi WhatsApp:', error);
      console.error('❌ Erreur détaillée:', error.response?.data || error.message);
      
      const errorMsg = error.detail || error.recipient_phone?.[0] || error.message || 'Erreur lors de l\'envoi WhatsApp';
      showError('Erreur', errorMsg);
    } finally {
      setLoading(false);
      console.log('🏁 Fin du processus d\'envoi WhatsApp');
    }
  };

  /**
   * Gérer le changement des options
   */
  const handleOptionChange = (key, value) => {
    setWhatsappOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Obtenir l'aperçu du template sélectionné
   */
  const getTemplatePreview = () => {
    // Extraire les informations patient de la fiche
    const patientName = fiche ? (
      fiche.patient?.first_name || 
      fiche.nom || 
      fiche.prenom || 
      `${fiche.nom || ''} ${fiche.prenom || ''}`.trim() ||
      'Patient'
    ) : '[Nom Patient]';

    const consultationDate = fiche?.created_at ? 
      new Date(fiche.created_at).toLocaleDateString('fr-FR') : 
      '[Date de consultation]';

    const medecinName = fiche?.assigned_medecin_info?.first_name ||
      fiche?.medecin_name ||
      'Dr [Médecin]';

    const diagnostic = fiche?.diagnostic || 
      fiche?.diagnostic_ia || 
      '[Diagnostic à définir]';

    const traitement = fiche?.traitement || 
      '[Traitement à prescrire]';

    const recommandations = fiche?.recommandations || 
      '[Recommandations à suivre]';

    const motifRejet = fiche?.commentaire_rejet || 
      fiche?.motif_rejet || 
      '[Motif de rejet à spécifier]';

    const templates = {
      consultation_validee: {
        title: 'Consultation Validée',
        preview: `🏥 *Consultation Médicale - Résultats*

Bonjour ${patientName},

Votre consultation du ${consultationDate} a été validée par ${medecinName}.

📋 *Diagnostic:* ${diagnostic}
💊 *Traitement:* ${traitement}
📝 *Recommandations:* ${recommandations}

Pour toute question, contactez notre service au +243 XX XX XX XX.

Bonne santé ! 🌟`
      },
      consultation_rejetee: {
        title: 'Consultation Rejetée',
        preview: `🏥 *Consultation Médicale - Information*

Bonjour ${patientName},

Votre consultation du ${consultationDate} nécessite des informations complémentaires.

❗ *Motif:* ${motifRejet}

Merci de compléter votre dossier ou de nous contacter au +243 XX XX XX XX.

Cordialement,
L'équipe médicale`
      },
      demande_informations: {
        title: 'Demande d\'informations',
        preview: `🏥 *Consultation Médicale - Demande d'informations*

Bonjour ${patientName},

Concernant votre consultation du ${consultationDate}, nous avons besoin d'informations complémentaires pour finaliser votre dossier médical.

Merci de nous contacter au +243 XX XX XX XX ou d'utiliser notre plateforme pour fournir les détails demandés.

Cordialement,
L'équipe médicale`
      },
      custom: {
        title: 'Message personnalisé',
        preview: whatsappOptions.custom_message || 'Tapez votre message personnalisé ci-dessous...'
      }
    };

    return templates[whatsappOptions.template_type] || templates.consultation_validee;
  };

  /**
   * Vérifier si le numéro est dans le sandbox WhatsApp
   */
  const checkSandboxStatus = async (phoneNumber) => {
    try {
      setLoading(true);
      const response = await whatsappService.checkSandboxStatus(phoneNumber);
      setSandboxStatus(response);
      return response.is_in_sandbox;
    } catch (error) {
      console.error('Erreur lors de la vérification sandbox:', error);
      setSandboxStatus({ is_in_sandbox: false, error: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Démarrer le processus d'onboarding WhatsApp
   */
  const startOnboarding = async () => {
    if (!whatsappOptions.recipient_phone?.trim()) {
      showError('Erreur', 'Numéro de téléphone requis');
      return;
    }

    setShowOnboarding(true);
    setOnboardingStep('check');
    
    const isInSandbox = await checkSandboxStatus(whatsappOptions.recipient_phone);
    
    if (isInSandbox) {
      setOnboardingStep('success');
      setShowOnboarding(false);
      showSuccess('WhatsApp prêt', 'Le numéro est déjà configuré pour WhatsApp');
    } else {
      setOnboardingStep('qr');
    }
  };

  /**
   * Envoyer les instructions par SMS
   */
  const sendSMSInstructions = async () => {
    try {
      setLoading(true);
      await whatsappService.sendOnboardingSMS(whatsappOptions.recipient_phone);
      setOnboardingStep('sms');
      showSuccess('SMS envoyé', 'Instructions d\'onboarding envoyées par SMS');
    } catch (error) {
      console.error('Erreur SMS:', error);
      showError('Erreur SMS', 'Impossible d\'envoyer les instructions par SMS');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Générer le QR code WhatsApp
   */
  const generateWhatsAppQR = () => {
    const joinMessage = encodeURIComponent('join tie-for');
    return `https://wa.me/14155238886?text=${joinMessage}`;
  };

  if (!isOpen || !fiche) return null;

  const templatePreview = getTemplatePreview();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-screen overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <ActionIcons.Phone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Envoi WhatsApp
              </h3>
              <p className="text-sm text-gray-600">
                Fiche #{fiche.id} • {fiche?.nom} {fiche?.prenom}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full p-2"
          >
            <ActionIcons.Close className="w-6 h-6" />
          </Button>
        </div>

        {/* Interface d'onboarding WhatsApp */}
        {showOnboarding && (
          <div className="p-6 bg-blue-50 border-t border-blue-200">
            <div className="max-w-4xl mx-auto">
              {onboardingStep === 'check' && (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Vérification WhatsApp</h4>
                  <p className="text-blue-700">Vérification si le numéro est configuré pour WhatsApp...</p>
                </div>
              )}

              {onboardingStep === 'qr' && (
                <div className="text-center space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Configuration WhatsApp requise</h4>
                    <p className="text-gray-700 mb-6">Ce numéro doit d'abord rejoindre notre sandbox WhatsApp.</p>
                    
                    {/* QR Code */}
                    <div className="bg-gray-100 rounded-lg p-6 mb-6">
                      <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                          <MedicalIcons.QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">QR Code WhatsApp</p>
                          <p className="text-xs text-gray-400 mt-1">Scannez pour rejoindre</p>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="text-left space-y-4">
                      <h5 className="font-semibold text-gray-900">Instructions :</h5>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        <li>Ouvrez WhatsApp sur votre téléphone</li>
                        <li>Scannez le QR code ci-dessus</li>
                        <li>Envoyez le message "join tie-for"</li>
                        <li>Attendez la confirmation</li>
                      </ol>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={sendSMSInstructions}
                        disabled={loading}
                        className="flex-1"
                      >
                        <ActionIcons.Message className="w-4 h-4 mr-2" />
                        Envoyer par SMS
                      </Button>
                      <Button
                        onClick={() => window.open(generateWhatsAppQR(), '_blank')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <ActionIcons.Phone className="w-4 h-4 mr-2" />
                        Ouvrir WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {onboardingStep === 'sms' && (
                <div className="text-center">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <StatusIcons.CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Instructions SMS envoyées</h4>
                    <p className="text-gray-700 mb-4">
                      Les instructions d'activation WhatsApp ont été envoyées par SMS au numéro {whatsappOptions.recipient_phone}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowOnboarding(false)}
                    >
                      Fermer
                    </Button>
                  </div>
                </div>
              )}

              {onboardingStep === 'success' && (
                <div className="text-center">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <StatusIcons.CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">WhatsApp configuré</h4>
                    <p className="text-gray-700 mb-4">
                      Le numéro {whatsappOptions.recipient_phone} est maintenant prêt pour recevoir des messages WhatsApp
                    </p>
                    <Button
                      onClick={() => setShowOnboarding(false)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Continuer l'envoi
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Configuration */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">Configuration de l'envoi</h4>
              
              {/* Numéro destinataire */}
              <div className="mb-6 bg-gray-50 rounded-xl p-6">
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Numéro de téléphone destinataire
                </label>
                <input
                  type="tel"
                  value={whatsappOptions.recipient_phone}
                  onChange={(e) => handleOptionChange('recipient_phone', e.target.value)}
                  placeholder="+243123456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Format international requis (ex: +243123456789)
                </p>
                
                {/* Bouton de vérification WhatsApp */}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startOnboarding}
                    disabled={!whatsappOptions.recipient_phone?.trim() || loading}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <MedicalIcons.Settings className="w-4 h-4 mr-2" />
                    Vérifier/Configurer WhatsApp
                  </Button>
                  
                  {sandboxStatus && (
                    <div className="mt-2 text-sm">
                      {sandboxStatus.is_in_sandbox ? (
                        <span className="text-green-600 flex items-center">
                          <ActionIcons.Check className="w-4 h-4 mr-1" />
                          WhatsApp configuré
                        </span>
                      ) : (
                        <span className="text-orange-600 flex items-center">
                          <ActionIcons.Warning className="w-4 h-4 mr-1" />
                          Configuration WhatsApp requise
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Template */}
              <div className="mb-6 bg-gray-50 rounded-xl p-6">
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Type de message
                </label>
                <select
                  value={whatsappOptions.template_type}
                  onChange={(e) => handleOptionChange('template_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="consultation_validee">Consultation validée</option>
                  <option value="consultation_rejetee">Consultation rejetée</option>
                  <option value="demande_informations">Demande d'informations</option>
                  <option value="custom">Message personnalisé</option>
                </select>
              </div>

              {/* Message personnalisé pour template custom */}
              {whatsappOptions.template_type === 'custom' && (
                <div className="mb-6 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Message personnalisé
                  </label>
                  <textarea
                    value={whatsappOptions.custom_message}
                    onChange={(e) => handleOptionChange('custom_message', e.target.value)}
                    placeholder="Tapez votre message personnalisé..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm ${
                      whatsappOptions.custom_message.length > 800 ? 'text-red-500 font-medium' : 'text-gray-500'
                    }`}>
                      {whatsappOptions.custom_message.length}/1000 caractères
                    </span>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    id="include_attachments"
                    type="checkbox"
                    checked={whatsappOptions.include_attachments}
                    onChange={(e) => handleOptionChange('include_attachments', e.target.checked)}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="include_attachments" className="text-sm font-medium text-gray-700">
                    Inclure les documents PDF/images
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    id="send_immediately"
                    type="checkbox"
                    checked={whatsappOptions.send_immediately}
                    onChange={(e) => handleOptionChange('send_immediately', e.target.checked)}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="send_immediately" className="text-sm font-medium text-gray-700">
                    Envoyer immédiatement
                  </label>
                </div>
              </div>

              {/* Langue */}
              <div className="bg-gray-50 rounded-xl p-6">
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Langue
                </label>
                <select
                  value={whatsappOptions.language}
                  onChange={(e) => handleOptionChange('language', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="sw">Kiswahili</option>
                </select>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">Aperçu du message</h4>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                    <div className="w-5 h-5 bg-white rounded-full"></div>
                  </div>
                  <span className="font-semibold text-green-700 text-lg">{templatePreview.title}</span>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                    {templatePreview.preview}
                  </pre>
                </div>
              </div>

              {/* Informations patient */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mt-6">
                <h5 className="text-base font-semibold text-blue-900 mb-4">Informations patient</h5>
                <div className="text-sm text-blue-800 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Nom:</span> 
                    <span>{
                      fiche?.patient?.first_name && fiche?.patient?.last_name
                        ? `${fiche.patient.first_name} ${fiche.patient.last_name}`
                        : fiche?.nom && fiche?.prenom
                        ? `${fiche.nom} ${fiche.prenom}`
                        : `${fiche?.nom || ''} ${fiche?.postnom || ''} ${fiche?.prenom || ''}`.trim() || 'Non renseigné'
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Téléphone:</span>
                    <span>{
                      fiche?.telephone || 
                      fiche?.patient?.phone || 
                      fiche?.patient?.telephone || 
                      fiche?.phone || 
                      'Non renseigné'
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Statut:</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {
                        fiche?.status === 'en_attente' ? 'En attente' :
                        fiche?.status === 'analyse_terminee' ? 'Analyse terminée' :
                        fiche?.status === 'valide_medecin' ? 'Validée par médecin' :
                        fiche?.status === 'rejete_medecin' ? 'Rejetée par médecin' :
                        fiche?.status || 'Non défini'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{
                      fiche?.created_at ? new Date(fiche.created_at).toLocaleDateString('fr-FR') : 'Non renseignée'
                    }</span>
                  </div>
                  {fiche?.motif_consultation && (
                    <div className="flex justify-between">
                      <span className="font-medium">Motif:</span>
                      <span className="text-right max-w-xs">{fiche.motif_consultation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 rounded-xl"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSendWhatsApp}
            disabled={loading || !whatsappOptions.recipient_phone?.trim()}
            className="min-w-40 px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Envoi...
              </>
            ) : (
              <>
                <ActionIcons.Send className="w-5 h-5 mr-2 text-white" />
                Envoyer WhatsApp
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;