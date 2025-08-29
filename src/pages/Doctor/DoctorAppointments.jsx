import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MedicalIcons, NavigationIcons, StatusIcons, ActionIcons, Icon } from '../../components/Icons';
import Button from '../../components/Button';
import Input from '../../components/Input';

/**
 * Gestion des rendez-vous médicaux - Interface docteur
 * Planning, confirmation, modification et suivi des rendez-vous
 */
const DoctorAppointments = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('calendar'); // 'calendar', 'list', 'detail'
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // État pour la modification de rendez-vous
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    heure: '',
    motif: '',
    notes: '',
    statut: 'confirme'
  });

  // Données mock des rendez-vous
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAppointments = [
        {
          id: 'RDV-001',
          patient: {
            nom: 'Kabila Jean Claude',
            telephone: '+243 812 345 678',
            email: 'jean.kabila@email.com'
          },
          date: '2025-08-29',
          heure: '09:00',
          motif: 'Consultation générale',
          statut: 'confirme',
          type: 'consultation',
          notes: 'Patient régulier - Suivi hypertension',
          duree: 30,
          createdAt: '2025-08-25T10:00:00Z'
        },
        {
          id: 'RDV-002',
          patient: {
            nom: 'Mukendi Marie Claire',
            telephone: '+243 823 456 789',
            email: 'marie.mukendi@email.com'
          },
          date: '2025-08-29',
          heure: '10:30',
          motif: 'Contrôle post-opératoire',
          statut: 'en_attente',
          type: 'suivi',
          notes: 'Opération appendicectomie - Contrôle cicatrisation',
          duree: 20,
          createdAt: '2025-08-26T14:30:00Z'
        },
        {
          id: 'RDV-003',
          patient: {
            nom: 'Tshisekedi Paul',
            telephone: '+243 834 567 890',
            email: 'paul.tshisekedi@email.com'
          },
          date: '2025-08-29',
          heure: '14:00',
          motif: 'Résultats analyses',
          statut: 'confirme',
          type: 'resultats',
          notes: 'Analyses sanguines complètes',
          duree: 15,
          createdAt: '2025-08-27T09:15:00Z'
        },
        {
          id: 'RDV-004',
          patient: {
            nom: 'Ngozi Fatima',
            telephone: '+243 845 678 901',
            email: 'fatima.ngozi@email.com'
          },
          date: '2025-08-30',
          heure: '08:30',
          motif: 'Consultation pédiatrique',
          statut: 'reporte',
          type: 'consultation',
          notes: 'Enfant 5 ans - Contrôle croissance',
          duree: 25,
          createdAt: '2025-08-28T16:45:00Z'
        },
        {
          id: 'RDV-005',
          patient: {
            nom: 'Kasongo Emmanuel',
            telephone: '+243 856 789 012',
            email: 'emmanuel.kasongo@email.com'
          },
          date: '2025-08-30',
          heure: '11:00',
          motif: 'Urgence - Douleurs thoraciques',
          statut: 'urgent',
          type: 'urgence',
          notes: 'Patient en urgence - Douleurs thoraciques sévères',
          duree: 45,
          createdAt: '2025-08-29T07:20:00Z'
        }
      ];
      
      setAppointments(mockAppointments);
      setIsLoading(false);
    };
    
    loadAppointments();
  }, []);

  // Filtrage des rendez-vous
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.motif.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || appointment.statut === filterStatus;
    
    let matchesDate = true;
    if (filterDate === 'today') {
      matchesDate = appointment.date === new Date().toISOString().split('T')[0];
    } else if (filterDate === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = appointment.date === tomorrow.toISOString().split('T')[0];
    } else if (filterDate === 'week') {
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(today.getDate() + 7);
      const appointmentDate = new Date(appointment.date);
      matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Fonctions de gestion des rendez-vous
  const confirmAppointment = (appointmentId) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, statut: 'confirme' }
          : appointment
      )
    );
  };

  const cancelAppointment = (appointmentId, reason = '') => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?');
    if (confirmed) {
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, statut: 'annule', notes: appointment.notes + (reason ? `\nAnnulé: ${reason}` : '') }
            : appointment
        )
      );
    }
  };

  const rescheduleAppointment = (appointmentId) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        date: appointment.date,
        heure: appointment.heure,
        motif: appointment.motif,
        notes: appointment.notes,
        statut: 'reporte'
      });
      setActiveView('detail');
    }
  };

  const saveAppointmentChanges = () => {
    if (editingAppointment) {
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === editingAppointment.id 
            ? { 
                ...appointment, 
                ...formData,
                statut: 'confirme' // Confirmer après modification
              }
            : appointment
        )
      );
      setEditingAppointment(null);
      setActiveView('list');
    }
  };

  // Statistiques du jour
  const todayAppointments = appointments.filter(app => 
    app.date === new Date().toISOString().split('T')[0]
  );
  
  const stats = {
    total: todayAppointments.length,
    confirmes: todayAppointments.filter(app => app.statut === 'confirme').length,
    enAttente: todayAppointments.filter(app => app.statut === 'en_attente').length,
    urgents: todayAppointments.filter(app => app.statut === 'urgent').length
  };

  // Utilitaires
  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'confirme': return StatusIcons.Success;
      case 'en_attente': return StatusIcons.Warning;
      case 'urgent': return StatusIcons.Error;
      case 'reporte': return StatusIcons.Info;
      case 'annule': return StatusIcons.Cancelled;
      default: return StatusIcons.Pending;
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'confirme': return 'text-success bg-success/10 border-success/20';
      case 'en_attente': return 'text-warning bg-warning/10 border-warning/20';
      case 'urgent': return 'text-danger bg-danger/10 border-danger/20';
      case 'reporte': return 'text-info bg-info/10 border-info/20';
      case 'annule': return 'text-mediai-medium bg-mediai-light border-mediai-medium/20';
      default: return 'text-mediai-medium bg-mediai-light border-mediai-medium/20';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'confirme': return 'Confirmé';
      case 'en_attente': return 'En attente';
      case 'urgent': return 'Urgent';
      case 'reporte': return 'Reporté';
      case 'annule': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 animate-fadeIn">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse-medical">
            <Icon icon={MedicalIcons.Calendar} size="w-12 h-12" className="text-mediai-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-xl shadow-sm border border-mediai-light p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading text-mediai-dark mb-2">
              Gestion des Rendez-vous
            </h2>
            <p className="text-mediai-medium font-body">
              Planning du {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-4 py-2 rounded-lg font-body transition-colors ${
                activeView === 'calendar' 
                  ? 'bg-mediai-primary text-white' 
                  : 'bg-mediai-light text-mediai-dark hover:bg-gray-200'
              }`}
            >
              <Icon icon={MedicalIcons.Calendar} size="w-5 h-5 inline mr-2" />
              Planning
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-4 py-2 rounded-lg font-body transition-colors ${
                activeView === 'list' 
                  ? 'bg-mediai-primary text-white' 
                  : 'bg-mediai-light text-mediai-dark hover:bg-gray-200'
              }`}
            >
              <Icon icon={NavigationIcons.List} size="w-5 h-5 inline mr-2" />
              Liste
            </button>
          </div>
        </div>

        {/* Statistiques du jour */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="gradient-primary text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-body-medium">Total aujourd'hui</p>
                <p className="text-2xl font-heading font-bold">{stats.total}</p>
              </div>
              <Icon icon={MedicalIcons.Calendar} size="w-8 h-8" className="text-white/60" />
            </div>
          </div>
          
          <div className="gradient-success text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-body-medium">Confirmés</p>
                <p className="text-2xl font-heading font-bold">{stats.confirmes}</p>
              </div>
              <Icon icon={StatusIcons.Success} size="w-8 h-8" className="text-white/60" />
            </div>
          </div>
          
          <div className="gradient-warning text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-body-medium">En attente</p>
                <p className="text-2xl font-heading font-bold">{stats.enAttente}</p>
              </div>
              <Icon icon={StatusIcons.Warning} size="w-8 h-8" className="text-white/60" />
            </div>
          </div>
          
          <div className="gradient-danger text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-body-medium">Urgents</p>
                <p className="text-2xl font-heading font-bold">{stats.urgents}</p>
              </div>
              <Icon icon={StatusIcons.Error} size="w-8 h-8" className="text-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border border-mediai-light p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Rechercher
            </label>
            <Input
              type="text"
              placeholder="Nom du patient ou motif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-3 border border-mediai-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="confirme">Confirmés</option>
              <option value="en_attente">En attente</option>
              <option value="urgent">Urgents</option>
              <option value="reporte">Reportés</option>
              <option value="annule">Annulés</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Période
            </label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full p-3 border border-mediai-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-transparent"
            >
              <option value="today">Aujourd'hui</option>
              <option value="tomorrow">Demain</option>
              <option value="week">Cette semaine</option>
              <option value="all">Toutes les dates</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-mediai-dark mb-2">
              Date spécifique
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {activeView === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-mediai-light">
          <div className="p-6 border-b border-mediai-light">
            <h3 className="text-lg font-heading text-mediai-dark">
              Liste des rendez-vous ({filteredAppointments.length})
            </h3>
          </div>
          
          <div className="divide-y divide-mediai-light">
            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center">
                <Icon icon={MedicalIcons.Calendar} size="w-16 h-16" className="text-mediai-medium mx-auto mb-4" />
                <p className="text-mediai-medium font-body">Aucun rendez-vous trouvé</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-6 hover:bg-mediai-light/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setActiveView('detail');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                        appointment.statut === 'confirme' ? 'bg-success' :
                        appointment.statut === 'en_attente' ? 'bg-warning' :
                        appointment.statut === 'urgent' ? 'bg-danger' :
                        appointment.statut === 'reporte' ? 'bg-info' :
                        'bg-medium'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-heading text-mediai-dark">
                            {appointment.patient.nom}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.statut)}`}>
                            {getStatusText(appointment.statut)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-mediai-medium">
                          <div className="flex items-center">
                            <Icon icon={MedicalIcons.Calendar} size="w-4 h-4 mr-2" />
                            {new Date(appointment.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center">
                            <Icon icon={MedicalIcons.Clock} size="w-4 h-4 mr-2" />
                            {appointment.heure} ({appointment.duree}min)
                          </div>
                          <div className="flex items-center">
                            <Icon icon={MedicalIcons.Stethoscope} size="w-4 h-4 mr-2" />
                            {appointment.motif}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {appointment.statut === 'en_attente' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmAppointment(appointment.id);
                          }}
                          className="p-2 text-success hover:bg-green-50 rounded-lg transition-colors"
                          title="Confirmer"
                        >
                          <Icon icon={StatusIcons.Success} size="w-5 h-5" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          rescheduleAppointment(appointment.id);
                        }}
                        className="p-2 text-mediai-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="Reprogrammer"
                      >
                        <Icon icon={ActionIcons.Edit} size="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelAppointment(appointment.id);
                        }}
                        className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors"
                        title="Annuler"
                      >
                        <Icon icon={ActionIcons.Delete} size="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Vue Planning (Calendar) */}
      {activeView === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-mediai-light p-6">
          <h3 className="text-lg font-heading text-mediai-dark mb-6">
            Planning de la journée
          </h3>
          
          <div className="space-y-2">
            {todayAppointments
              .sort((a, b) => a.heure.localeCompare(b.heure))
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-4 border-l-4 rounded-r-lg cursor-pointer transition-all hover:shadow-md ${
                    appointment.statut === 'confirme' ? 'border-l-success bg-green-50' :
                    appointment.statut === 'en_attente' ? 'border-l-warning bg-yellow-50' :
                    appointment.statut === 'urgent' ? 'border-l-danger bg-red-50' :
                    appointment.statut === 'reporte' ? 'border-l-info bg-blue-50' :
                    'border-l-medium bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setActiveView('detail');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-heading text-mediai-dark">
                        {appointment.heure}
                      </div>
                      <div>
                        <h4 className="font-heading text-mediai-dark">
                          {appointment.patient.nom}
                        </h4>
                        <p className="text-sm text-mediai-medium">
                          {appointment.motif} • {appointment.duree}min
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.statut)}`}>
                      {getStatusText(appointment.statut)}
                    </span>
                  </div>
                </div>
              ))}
            
            {todayAppointments.length === 0 && (
              <div className="text-center py-12">
                <Icon icon={MedicalIcons.Calendar} size="w-16 h-16" className="text-mediai-medium mx-auto mb-4" />
                <p className="text-mediai-medium font-body">Aucun rendez-vous aujourd'hui</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vue détail/modification */}
      {activeView === 'detail' && selectedAppointment && (
        <div className="bg-white rounded-xl shadow-sm border border-mediai-light p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading text-mediai-dark">
              {editingAppointment ? 'Modifier le rendez-vous' : 'Détails du rendez-vous'}
            </h3>
            <button
              onClick={() => {
                setActiveView('list');
                setEditingAppointment(null);
                setSelectedAppointment(null);
              }}
              className="p-2 text-mediai-medium hover:text-mediai-dark rounded-lg transition-colors"
            >
              <Icon icon={NavigationIcons.Close} size="w-6 h-6" />
            </button>
          </div>

          {editingAppointment ? (
            // Formulaire de modification
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-mediai-dark mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-mediai-dark mb-2">
                    Heure
                  </label>
                  <Input
                    type="time"
                    value={formData.heure}
                    onChange={(e) => setFormData(prev => ({ ...prev, heure: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2">
                  Motif de consultation
                </label>
                <Input
                  type="text"
                  value={formData.motif}
                  onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                  className="w-full"
                  placeholder="Motif de la consultation..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-mediai-dark mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-mediai-light rounded-lg focus:ring-2 focus:ring-mediai-primary focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Notes additionnelles..."
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingAppointment(null);
                    setActiveView('list');
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={saveAppointmentChanges}
                >
                  Sauvegarder les modifications
                </Button>
              </div>
            </div>
          ) : (
            // Vue détaillée
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-heading text-mediai-dark border-b border-mediai-light pb-2">
                    Informations Patient
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-mediai-medium">Nom complet</span>
                      <p className="font-medium text-mediai-dark">{selectedAppointment.patient.nom}</p>
                    </div>
                    <div>
                      <span className="text-sm text-mediai-medium">Téléphone</span>
                      <p className="font-medium text-mediai-dark">{selectedAppointment.patient.telephone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-mediai-medium">Email</span>
                      <p className="font-medium text-mediai-dark">{selectedAppointment.patient.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-heading text-mediai-dark border-b border-mediai-light pb-2">
                    Détails du Rendez-vous
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-mediai-medium">Date</span>
                      <p className="font-medium text-mediai-dark">
                        {new Date(selectedAppointment.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-mediai-medium">Heure</span>
                      <p className="font-medium text-mediai-dark">{selectedAppointment.heure}</p>
                    </div>
                    <div>
                      <span className="text-sm text-mediai-medium">Durée</span>
                      <p className="font-medium text-mediai-dark">{selectedAppointment.duree} minutes</p>
                    </div>
                    <div>
                      <span className="text-sm text-mediai-medium">Statut</span>
                      <p className={`font-medium inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(selectedAppointment.statut)}`}>
                        <Icon icon={getStatusIcon(selectedAppointment.statut)} size="w-4 h-4 mr-1" />
                        {getStatusText(selectedAppointment.statut)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-heading text-mediai-dark border-b border-mediai-light pb-2 mb-4">
                  Motif de consultation
                </h4>
                <p className="text-mediai-dark bg-mediai-light/30 p-4 rounded-lg">
                  {selectedAppointment.motif}
                </p>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <h4 className="font-heading text-mediai-dark border-b border-mediai-light pb-2 mb-4">
                    Notes
                  </h4>
                  <p className="text-mediai-dark bg-mediai-light/30 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-mediai-light">
                {selectedAppointment.statut === 'en_attente' && (
                  <Button
                    variant="success"
                    onClick={() => confirmAppointment(selectedAppointment.id)}
                  >
                    <Icon icon={StatusIcons.Success} size="w-5 h-5 mr-2" />
                    Confirmer
                  </Button>
                )}
                
                <Button
                  variant="primary"
                  onClick={() => rescheduleAppointment(selectedAppointment.id)}
                >
                  <Icon icon={ActionIcons.Edit} size="w-5 h-5 mr-2" />
                  Modifier
                </Button>
                
                <Button
                  variant="danger"
                  onClick={() => cancelAppointment(selectedAppointment.id)}
                >
                  <Icon icon={ActionIcons.Delete} size="w-5 h-5 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
