import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MedicalIcons, NavigationIcons, StatusIcons, ActionIcons, Icon, MedicalIcon } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { exportToPDF, printConsultation } from '../../services/MedicalPDFService';

/**
 * Gestion des consultations médicales - Interface docteur
 * Système complet de gestion des fiches de consultation avec diagnostic, traitement et export PDF
 */
const DoctorConsultations = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('list'); // 'list', 'detail', 'form'
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState('');
  
  // État pour le formulaire de consultation
  const [formData, setFormData] = useState({
    diagnostic: '',
    recommandations: '',
    traitement: '',
    examensComplementaires: '',
    conseils: ''
  });

  // Données mock des consultations
  useEffect(() => {
    const loadConsultations = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockConsultations = [
        {
          id: 'CONS-001',
          patient: {
            nom: 'Kabila',
            postnom: 'Jean',
            prenom: 'Claude',
            age: 45,
            sexe: 'M',
            telephone: '+243 812 345 678'
          },
          dateConsultation: '2024-08-29T09:30:00',
          motifConsultation: 'Douleurs thoraciques récurrentes',
          signesVitaux: {
            temperature: '37.2°C',
            tension: '140/90 mmHg',
            pouls: '88 bpm',
            poids: '75 kg',
            taille: '175 cm'
          },
          anamnese: {
            histoireMaladie: 'Douleurs thoraciques depuis 3 semaines, survenant principalement lors d\'efforts physiques.',
            antecedents: 'Hypertension artérielle, diabète type 2',
            allergies: 'Aucune allergie connue',
            medicaments: 'Metformine 500mg 2x/jour, Amlodipine 5mg 1x/jour'
          },
          examenClinique: {
            etatGeneral: 'Bon état général, patient coopératif',
            cardiovasculaire: 'Souffles cardiaques absents, rythme régulier',
            respiratoire: 'Murmures vésiculaires normaux',
            autres: 'Abdomen souple, pas de masse palpable'
          },
          // Partie à compléter par le médecin
          diagnostic: '',
          recommandations: '',
          traitement: '',
          examensComplementaires: '',
          conseils: '',
          statut: 'en_attente',
          urgence: 'moyenne',
          dateCreation: '2024-08-29T09:30:00'
        },
        {
          id: 'CONS-002',
          patient: {
            nom: 'Luamba',
            postnom: 'Marie',
            prenom: 'Grace',
            age: 32,
            sexe: 'F',
            telephone: '+243 897 123 456'
          },
          dateConsultation: '2024-08-29T11:15:00',
          motifConsultation: 'Éruption cutanée persistante',
          signesVitaux: {
            temperature: '36.8°C',
            tension: '110/70 mmHg',
            pouls: '72 bpm',
            poids: '62 kg',
            taille: '165 cm'
          },
          anamnese: {
            histoireMaladie: 'Éruption cutanée apparue il y a 1 semaine, avec démangeaisons importantes.',
            antecedents: 'Aucun antécédent particulier',
            allergies: 'Allergie aux fruits de mer',
            medicaments: 'Aucun traitement en cours'
          },
          examenClinique: {
            etatGeneral: 'Bon état général',
            peau: 'Éruption érythémateuse diffuse sur les bras et le torse',
            autres: 'Pas d\'autres signes cliniques'
          },
          diagnostic: 'Dermatite de contact probable',
          recommandations: 'Éviter les irritants, hygiène douce',
          traitement: 'Crème corticoïde topique 2x/jour pendant 7 jours',
          examensComplementaires: 'Tests allergologiques si persistance',
          conseils: 'Éviter les produits cosmétiques pendant le traitement',
          statut: 'termine',
          urgence: 'faible',
          dateCreation: '2024-08-29T11:15:00',
          dateCompletee: '2024-08-29T12:00:00'
        }
      ];
      
      setConsultations(mockConsultations);
      setIsLoading(false);
    };

    loadConsultations();
  }, []);

  // Filtrage des consultations
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = searchTerm === '' || 
      consultation.patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patient.postnom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.motifConsultation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || consultation.statut === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'en_attente': return 'bg-warning text-white';
      case 'en_cours': return 'bg-mediai-primary text-white';
      case 'termine': return 'bg-success text-white';
      case 'reporte': return 'bg-medium text-white';
      default: return 'bg-medium text-white';
    }
  };

  const getUrgenceColor = (urgence) => {
    switch(urgence) {
      case 'haute': return 'bg-danger text-white';
      case 'moyenne': return 'bg-warning text-white';
      case 'faible': return 'bg-success text-white';
      default: return 'bg-medium text-white';
    }
  };

  const handleConsultationClick = (consultation) => {
    setSelectedConsultation(consultation);
    // Réinitialiser le formData
    setFormData({
      diagnostic: '',
      recommandations: '',
      traitement: '',
      examensComplementaires: '',
      conseils: ''
    });
    setActiveView('detail');
  };

  const handleEditConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    // Initialiser le formData avec les données existantes
    setFormData({
      diagnostic: consultation.diagnostic || '',
      recommandations: consultation.recommandations || '',
      traitement: consultation.traitement || '',
      examensComplementaires: consultation.examensComplementaires || '',
      conseils: consultation.conseils || ''
    });
    setActiveView('form');
  };

  // Gestion de la signature numérique
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    setSignature(signatureData);
    setShowSignatureModal(false);
  };

  // Export PDF
  const handleExportToPDF = async (consultation) => {
    try {
      // Ajouter la signature si elle existe
      const consultationWithSignature = {
        ...consultation,
        signature: signature || null,
        medecin: {
          nom: user?.name || 'Dr. Jean Dupont',
          specialite: 'Médecine Générale'
        }
      };
      
      const result = await exportToPDF(consultationWithSignature);
      if (result.success) {
        console.log('PDF généré avec succès:', result.fileName);
      } else {
        console.error('Erreur lors de la génération du PDF:', result.error);
        alert('Erreur lors de la génération du PDF');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'export PDF');
    }
  };

  // Print consultation
  const handlePrintConsultation = (consultation) => {
    try {
      // Ajouter la signature si elle existe
      const consultationWithSignature = {
        ...consultation,
        signature: signature || null,
        medecin: {
          nom: user?.name || 'Dr. Jean Dupont',
          specialite: 'Médecine Générale'
        }
      };
      
      printConsultation(consultationWithSignature);
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de l\'impression');
    }
  };

  // Sauvegarde de la consultation
  const saveConsultation = (consultationData) => {
    const updatedConsultations = consultations.map(c => 
      c.id === consultationData.id ? { ...c, ...consultationData, statut: 'termine' } : c
    );
    setConsultations(updatedConsultations);
    
    // Réinitialiser le formData
    setFormData({
      diagnostic: '',
      recommandations: '',
      traitement: '',
      examensComplementaires: '',
      conseils: ''
    });
    
    // Afficher une confirmation avec options d'export
    const confirmExport = window.confirm(
      `Consultation finalisée avec succès !\n\nVoulez-vous exporter la fiche de consultation en PDF pour l'envoyer au patient ?`
    );
    
    if (confirmExport) {
      handleExportToPDF(consultationData);
    }
    
    setActiveView('list');
  };

  const renderConsultationsList = () => (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-mediai-dark font-heading">Gestion des consultations</h2>
            <p className="text-mediai-medium font-body mt-1">
              {filteredConsultations.length} consultation(s) • Dr. {user?.name}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une consultation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-border-light rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body w-full sm:w-80"
              />
              <Icon icon={NavigationIcons.Search} size="w-5 h-5" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mediai-medium" />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-border-light rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark font-body"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="reporte">Reporté</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des consultations */}
      <div className="bg-white rounded-2xl shadow-xl border border-border-light overflow-hidden">
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-medium rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MedicalIcon icon={MedicalIcons.Document} size="w-10 h-10" className="text-mediai-medium" />
              </div>
              <h3 className="text-xl font-bold text-mediai-dark mb-2 font-heading">Aucune consultation trouvée</h3>
              <p className="text-mediai-medium font-body">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucune consultation ne correspond à vos critères de recherche.'
                  : 'Aucune consultation disponible pour le moment.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConsultations.map((consultation) => (
                <div 
                  key={consultation.id}
                  className="border border-border-light rounded-xl p-6 hover:bg-light transition-all duration-300 hover-lift cursor-pointer"
                  onClick={() => handleConsultationClick(consultation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6">
                      <div className="w-16 h-16 bg-mediai-primary rounded-xl flex items-center justify-center">
                        <MedicalIcon icon={MedicalIcons.Profile} size="w-8 h-8" className="text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-mediai-dark font-heading">
                            {consultation.patient.nom} {consultation.patient.postnom} {consultation.patient.prenom}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatutColor(consultation.statut)}`}>
                            {consultation.statut.replace('_', ' ')}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getUrgenceColor(consultation.urgence)}`}>
                            {consultation.urgence}
                          </span>
                        </div>
                        
                        <p className="text-mediai-dark font-body-medium mb-2">
                          <strong>Motif:</strong> {consultation.motifConsultation}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-mediai-medium font-body">
                          <div>
                            <span className="font-medium">Âge:</span> {consultation.patient.age} ans
                          </div>
                          <div>
                            <span className="font-medium">Sexe:</span> {consultation.patient.sexe}
                          </div>
                          <div>
                            <span className="font-medium">Téléphone:</span> {consultation.patient.telephone}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditConsultation(consultation);
                        }}
                        className="p-2 text-mediai-primary hover:text-mediai-secondary hover:bg-light rounded-lg transition-colors"
                        title="Éditer la consultation"
                      >
                        <Icon icon={ActionIcons.Edit} size="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportToPDF(consultation);
                        }}
                        className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors"
                        title="Exporter en PDF"
                      >
                        <Icon icon={ActionIcons.Download} size="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderConsultationDetail = () => {
    if (!selectedConsultation) return null;
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveView('list')}
                className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors"
              >
                <Icon icon={NavigationIcons.ArrowLeft} size="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-mediai-dark font-heading">
                  Consultation #{selectedConsultation.id}
                </h2>
                <p className="text-mediai-medium font-body">
                  {selectedConsultation.patient.nom} {selectedConsultation.patient.postnom} {selectedConsultation.patient.prenom}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleEditConsultation(selectedConsultation)}
                className="px-4 py-2 bg-mediai-primary text-white rounded-lg hover:bg-mediai-secondary transition-colors font-body"
              >
                Compléter
              </button>
              <button
                onClick={() => handlePrintConsultation(selectedConsultation)}
                className="px-4 py-2 bg-success text-white rounded-lg hover:bg-mediai-dark transition-colors font-body"
              >
                Imprimer
              </button>
              <button
                onClick={() => handleExportToPDF(selectedConsultation)}
                className="px-4 py-2 bg-medium text-white rounded-lg hover:bg-mediai-dark transition-colors font-body"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Détails de la consultation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations patient */}
          <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
            <h3 className="text-lg font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={MedicalIcons.Profile} size="w-5 h-5" className="mr-2" />
              Informations patient
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-mediai-medium">Nom complet</label>
                <p className="text-mediai-dark font-body">
                  {selectedConsultation.patient.nom} {selectedConsultation.patient.postnom} {selectedConsultation.patient.prenom}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-mediai-medium">Âge</label>
                <p className="text-mediai-dark font-body">{selectedConsultation.patient.age} ans</p>
              </div>
              <div>
                <label className="text-sm font-medium text-mediai-medium">Sexe</label>
                <p className="text-mediai-dark font-body">{selectedConsultation.patient.sexe}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-mediai-medium">Téléphone</label>
                <p className="text-mediai-dark font-body">{selectedConsultation.patient.telephone}</p>
              </div>
            </div>
          </div>

          {/* Signes vitaux */}
          <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
            <h3 className="text-lg font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={MedicalIcons.Heart} size="w-5 h-5" className="mr-2" />
              Signes vitaux
            </h3>
            <div className="space-y-3">
              {Object.entries(selectedConsultation.signesVitaux).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-mediai-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  <p className="text-mediai-dark font-body font-mono">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Statut et urgence */}
          <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
            <h3 className="text-lg font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={StatusIcons.Clock} size="w-5 h-5" className="mr-2" />
              Statut consultation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-mediai-medium">Statut</label>
                <div className="mt-1">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${getStatutColor(selectedConsultation.statut)}`}>
                    {selectedConsultation.statut.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-mediai-medium">Urgence</label>
                <div className="mt-1">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${getUrgenceColor(selectedConsultation.urgence)}`}>
                    {selectedConsultation.urgence}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-mediai-medium">Date de consultation</label>
                <p className="text-mediai-dark font-body">
                  {new Date(selectedConsultation.dateConsultation).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Anamnèse et examen clinique */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
            <h3 className="text-lg font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={MedicalIcons.Document} size="w-5 h-5" className="mr-2" />
              Anamnèse
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-mediai-medium">Motif de consultation</label>
                <p className="text-mediai-dark font-body mt-1">{selectedConsultation.motifConsultation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-mediai-medium">Histoire de la maladie</label>
                <p className="text-mediai-dark font-body mt-1">{selectedConsultation.anamnese?.histoireMaladie}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-mediai-medium">Antécédents</label>
                <p className="text-mediai-dark font-body mt-1">{selectedConsultation.anamnese?.antecedents}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-mediai-medium">Allergies</label>
                <p className="text-mediai-dark font-body mt-1">{selectedConsultation.anamnese?.allergies}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-mediai-medium">Médicaments actuels</label>
                <p className="text-mediai-dark font-body mt-1">{selectedConsultation.anamnese?.medicaments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
            <h3 className="text-lg font-bold text-mediai-dark font-heading mb-4 flex items-center">
              <MedicalIcon icon={MedicalIcons.Stethoscope} size="w-5 h-5" className="mr-2" />
              Examen clinique
            </h3>
            <div className="space-y-4">
              {Object.entries(selectedConsultation.examenClinique || {}).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-mediai-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                  <p className="text-mediai-dark font-body mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnostic et traitement (si complété) */}
        {selectedConsultation.diagnostic && (
          <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
            <h3 className="text-lg font-bold text-mediai-dark font-heading mb-6 flex items-center">
              <MedicalIcon icon={MedicalIcons.Check} size="w-5 h-5" className="mr-2" />
              Diagnostic et traitement
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-mediai-medium">Diagnostic</label>
                  <div className="bg-light p-4 rounded-lg mt-1">
                    <p className="text-mediai-dark font-body">{selectedConsultation.diagnostic}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-mediai-medium">Traitement proposé</label>
                  <div className="bg-light p-4 rounded-lg mt-1">
                    <p className="text-mediai-dark font-body">{selectedConsultation.traitement}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-mediai-medium">Examens complémentaires</label>
                  <div className="bg-light p-4 rounded-lg mt-1">
                    <p className="text-mediai-dark font-body">{selectedConsultation.examensComplementaires}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-mediai-medium">Conseils et recommandations</label>
                  <div className="bg-light p-4 rounded-lg mt-1">
                    <p className="text-mediai-dark font-body">{selectedConsultation.conseils}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedConsultation.recommandations && (
              <div className="mt-6">
                <label className="text-sm font-medium text-mediai-medium">Recommandations médicales</label>
                <div className="bg-light p-4 rounded-lg mt-1">
                  <p className="text-mediai-dark font-body">{selectedConsultation.recommandations}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderConsultationForm = () => {
    if (!selectedConsultation) return null;

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const updatedConsultation = {
        ...selectedConsultation,
        ...formData,
        statut: 'termine',
        dateCompletee: new Date().toISOString()
      };
      saveConsultation(updatedConsultation);
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveView('detail')}
              className="p-2 text-mediai-medium hover:text-mediai-dark hover:bg-light rounded-lg transition-colors"
            >
              <Icon icon={NavigationIcons.ArrowLeft} size="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-mediai-dark font-heading">
                Compléter la consultation
              </h2>
              <p className="text-mediai-medium font-body">
                {selectedConsultation.patient.nom} {selectedConsultation.patient.postnom} {selectedConsultation.patient.prenom}
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire de diagnostic */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
            <h3 className="text-lg font-bold text-mediai-dark font-heading mb-6 flex items-center">
              <MedicalIcon icon={MedicalIcons.Document} size="w-5 h-5" className="mr-2" />
              Diagnostic et traitement médical
            </h3>
            
            <div className="space-y-6">
              {/* Diagnostic */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Diagnostic <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.diagnostic}
                  onChange={(e) => handleInputChange('diagnostic', e.target.value)}
                  placeholder="Saisissez le diagnostic principal et différentiel..."
                  className="w-full p-4 border border-border-light rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Recommandations médicales */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Recommandations médicales <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.recommandations}
                  onChange={(e) => handleInputChange('recommandations', e.target.value)}
                  placeholder="Recommandations générales pour le suivi du patient..."
                  className="w-full p-4 border border-border-light rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Traitement proposé */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Traitement proposé <span className="text-danger">*</span>
                </label>
                <textarea
                  value={formData.traitement}
                  onChange={(e) => handleInputChange('traitement', e.target.value)}
                  placeholder="Détaillez le plan de traitement : médicaments, posologie, durée..."
                  className="w-full p-4 border border-border-light rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none"
                  rows={5}
                  required
                />
              </div>

              {/* Examens complémentaires */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Examens complémentaires
                </label>
                <textarea
                  value={formData.examensComplementaires}
                  onChange={(e) => handleInputChange('examensComplementaires', e.target.value)}
                  placeholder="Examens de laboratoire, imagerie, consultations spécialisées..."
                  className="w-full p-4 border border-border-light rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none"
                  rows={4}
                />
              </div>

              {/* Conseils et recommandations */}
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2 font-body">
                  Conseils et recommandations
                </label>
                <textarea
                  value={formData.conseils}
                  onChange={(e) => handleInputChange('conseils', e.target.value)}
                  placeholder="Conseils d'hygiène de vie, prévention, signes d'alarme..."
                  className="w-full p-4 border border-border-light rounded-xl focus:ring-2 focus:ring-mediai-primary focus:border-mediai-primary bg-light text-mediai-dark placeholder-mediai-medium font-body resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-xl border border-border-light p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-mediai-secondary text-white rounded-lg hover:bg-mediai-dark transition-colors font-body"
                >
                  <MedicalIcon icon={ActionIcons.Edit} size="w-4 h-4" />
                  <span>Signature numérique</span>
                </button>
                
                {signature && (
                  <div className="flex items-center space-x-2 text-success">
                    <MedicalIcon icon={MedicalIcons.Check} size="w-4 h-4" />
                    <span className="text-sm font-body">Signé</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveView('detail')}
                  className="px-6 py-3 border border-border-light text-mediai-dark rounded-lg hover:bg-light transition-colors font-body"
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const tempConsultation = { ...selectedConsultation, ...formData };
                    handlePrintConsultation(tempConsultation);
                  }}
                  className="px-6 py-3 bg-success text-white rounded-lg hover:bg-mediai-dark transition-colors font-body"
                >
                  Aperçu impression
                </button>
                
                <button
                  type="submit"
                  disabled={!formData.diagnostic || !formData.recommandations || !formData.traitement}
                  className="px-6 py-3 gradient-mediai text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-body"
                >
                  Finaliser et sauvegarder
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };

  // Modal de signature numérique
  const renderSignatureModal = () => (
    showSignatureModal && (
      <div className="fixed inset-0 bg-overlay-bg backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-border-light">
          <div className="bg-mediai-dark text-white p-6 rounded-t-2xl flex justify-between items-center">
            <h3 className="text-xl font-bold font-heading">Signature numérique</h3>
            <button 
              onClick={() => setShowSignatureModal(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-mediai-medium font-body mb-4">
              Dessinez votre signature dans l'espace ci-dessous :
            </p>
            
            <div className="border-2 border-dashed border-border-light rounded-xl p-4 bg-light">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                className="w-full border border-border-light rounded-lg bg-white cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={clearSignature}
                className="px-4 py-2 border border-border-light text-mediai-dark rounded-lg hover:bg-light transition-colors font-body"
              >
                Effacer
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-6 py-2 border border-border-light text-mediai-dark rounded-lg hover:bg-light transition-colors font-body"
                >
                  Annuler
                </button>
                <button
                  onClick={saveSignature}
                  className="px-6 py-2 gradient-mediai text-white rounded-lg hover:shadow-lg transition-all duration-300 font-body"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-8">
      {activeView === 'list' && renderConsultationsList()}
      {activeView === 'detail' && renderConsultationDetail()}
      {activeView === 'form' && renderConsultationForm()}
      {renderSignatureModal()}
    </div>
  );
};

export default DoctorConsultations;
