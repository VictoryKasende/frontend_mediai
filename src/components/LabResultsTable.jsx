import React, { useState } from 'react';
import { MedicalIcons, ActionIcons, StatusIcons } from './Icons';
import Button from './Button';
import Modal from './Modal';

/**
 * Composant de tableau des résultats de laboratoire
 * @param {Array} labResults - Résultats de laboratoire
 * @param {function} onAddResult - Ajouter un nouveau résultat
 * @param {function} onEditResult - Éditer un résultat
 * @param {function} onDeleteResult - Supprimer un résultat
 * @param {boolean} isEditable - Mode édition
 */
const LabResultsTable = ({ 
  labResults = [], 
  onAddResult, 
  onEditResult, 
  onDeleteResult,
  isEditable = true,
  showAddButton = true 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    unit: '',
    reference_range: '',
    status: 'normal', // normal, abnormal, critical
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      unit: '',
      reference_range: '',
      status: 'normal',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleAdd = () => {
    setEditingResult(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (result) => {
    setEditingResult(result);
    setFormData({
      name: result.name || '',
      value: result.value || '',
      unit: result.unit || '',
      reference_range: result.reference_range || '',
      status: result.status || 'normal',
      date: result.date || new Date().toISOString().split('T')[0],
      notes: result.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const resultData = {
      ...formData,
      id: editingResult ? editingResult.id : Date.now()
    };

    if (editingResult) {
      onEditResult && onEditResult(resultData);
    } else {
      onAddResult && onAddResult(resultData);
    }

    setShowAddModal(false);
    resetForm();
    setEditingResult(null);
  };

  const handleDelete = (result) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le résultat "${result.name}" ?`)) {
      onDeleteResult && onDeleteResult(result.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-100';
      case 'abnormal':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'abnormal':
        return 'Anormal';
      case 'critical':
        return 'Critique';
      default:
        return 'Inconnu';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return <StatusIcons.Success className="w-4 h-4" />;
      case 'abnormal':
        return <StatusIcons.Warning className="w-4 h-4" />;
      case 'critical':
        return <StatusIcons.Error className="w-4 h-4" />;
      default:
        return <StatusIcons.Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MedicalIcons.Lab className="w-5 h-5 mr-2 text-mediai-primary" />
          Résultats de laboratoire
        </h3>
        {showAddButton && isEditable && (
          <Button size="sm" onClick={handleAdd}>
            <ActionIcons.Plus className="w-4 h-4 mr-2" />
            Ajouter résultat
          </Button>
        )}
      </div>

      {/* Tableau */}
      {labResults.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Examen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Résultat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valeurs de référence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {isEditable && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {labResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{result.name}</p>
                        {result.notes && (
                          <p className="text-xs text-gray-500 mt-1">{result.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{result.value}</span>
                        {result.unit && <span className="text-gray-500 ml-1">{result.unit}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500">
                        {result.reference_range || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)}
                        <span className="ml-1">{getStatusLabel(result.status)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {result.date ? new Date(result.date).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    {isEditable && (
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(result)}
                          >
                            <ActionIcons.Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(result)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <ActionIcons.Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MedicalIcons.Lab className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Aucun résultat de laboratoire</p>
          {showAddButton && isEditable && (
            <Button size="sm" onClick={handleAdd}>
              <ActionIcons.Plus className="w-4 h-4 mr-2" />
              Ajouter le premier résultat
            </Button>
          )}
        </div>
      )}

      {/* Modal d'ajout/édition */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
          setEditingResult(null);
        }}
        title={editingResult ? 'Modifier le résultat' : 'Ajouter un résultat'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'examen *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20"
              placeholder="Ex: Hémoglobine, Glycémie..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Résultat *
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20"
                placeholder="Ex: 12.5, Positif..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20"
                placeholder="Ex: g/dL, mg/L..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valeurs de référence
            </label>
            <input
              type="text"
              value={formData.reference_range}
              onChange={(e) => setFormData(prev => ({ ...prev, reference_range: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20"
              placeholder="Ex: 12-16 g/dL, < 1.0 mg/L..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20"
                required
              >
                <option value="normal">Normal</option>
                <option value="abnormal">Anormal</option>
                <option value="critical">Critique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes complémentaires
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-mediai-primary focus:ring-2 focus:ring-mediai-primary focus:ring-opacity-20 resize-none"
              placeholder="Observations, commentaires..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
                setEditingResult(null);
              }}
            >
              Annuler
            </Button>
            <Button type="submit">
              {editingResult ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LabResultsTable;