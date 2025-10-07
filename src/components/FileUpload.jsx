import React, { useState, useRef, useEffect } from 'react';
import { ActionIcons, MedicalIcons, StatusIcons } from './Icons';
import Button from './Button';
import { attachmentService } from '../services/api';

/**
 * Composant de téléchargement de fichiers avec prévisualisation
 * @param {number} ficheId - ID de la fiche de consultation
 * @param {Array} initialFiles - Fichiers existants depuis le backend
 * @param {function} onFilesChange - Callback lors du changement de fichiers
 * @param {Array} acceptedTypes - Types de fichiers acceptés
 * @param {number} maxSize - Taille max en MB
 * @param {number} maxFiles - Nombre max de fichiers
 * @param {boolean} showPreview - Afficher la prévisualisation
 */
const FileUpload = ({ 
  ficheId,
  onFilesChange, 
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxSize = 10, // 10MB
  maxFiles = 5,
  showPreview = true,
  disabled = false,
  label = "Pièces jointes"
}) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Charger les fichiers existants au montage
  useEffect(() => {
    if (ficheId) {
      loadExistingFiles();
    }
  }, [ficheId]);

  // Charger fichiers depuis le backend
  const loadExistingFiles = async () => {
    if (!ficheId) return;
    
    setIsLoading(true);
    try {
      const response = await attachmentService.getAll({ fiche_consultation: ficheId });
      const backendFiles = (response.results || response).map(attachment => ({
        id: attachment.id,
        backendId: attachment.id,
        name: attachment.name || attachment.file_name,
        size: attachment.file_size || 0,
        type: attachment.file_type || '',
        status: 'completed',
        progress: 100,
        url: attachment.file || attachment.file_url,
        file: null
      }));
      setFiles(backendFiles);
      onFilesChange && onFilesChange(backendFiles);
    } catch (error) {
      console.error('Erreur chargement fichiers existants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour callback parent quand files change
  useEffect(() => {
    onFilesChange && onFilesChange(files);
  }, [files]);

  const validateFile = (file) => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      return `Le fichier "${file.name}" est trop volumineux (max ${maxSize}MB)`;
    }

    // Vérifier le type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `Type de fichier non supporté pour "${file.name}". Types acceptés: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = async (selectedFiles) => {
    setUploadError('');

    if (!selectedFiles || selectedFiles.length === 0) return;
    if (!ficheId) {
      setUploadError('ID de fiche manquant. Impossible d\'uploader des fichiers.');
      return;
    }

    const fileArray = Array.from(selectedFiles);
    
    // Vérifier le nombre total de fichiers
    if (files.length + fileArray.length > maxFiles) {
      setUploadError(`Nombre maximum de fichiers atteint (${maxFiles} max)`);
      return;
    }

    // Valider chaque fichier
    const errors = [];
    const validFiles = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        const tempId = Date.now() + Math.random();
        validFiles.push({
          id: tempId,
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
          url: null,
          backendId: null
        });
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join('\\n'));
      return;
    }

    // Ajouter les fichiers valides à l'état immédiatement
    setFiles(prevFiles => [...prevFiles, ...validFiles]);

    // Upload réel vers le backend pour chaque fichier
    validFiles.forEach((fileData) => {
      uploadFileToBackend(fileData);
    });
  };

  // Upload réel vers le backend
  const uploadFileToBackend = async (fileData) => {
    try {
      const result = await attachmentService.upload(
        ficheId,
        fileData.file,
        {
          name: fileData.name,
          description: '',
          onProgress: (percent) => {
            // Mettre à jour la progression
            setFiles(prevFiles => 
              prevFiles.map(f => 
                f.id === fileData.id 
                  ? { ...f, progress: percent }
                  : f
              )
            );
          }
        }
      );

      // Upload réussi - mettre à jour avec les données backend
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileData.id
            ? {
                ...f,
                backendId: result.id,
                status: 'completed',
                progress: 100,
                url: result.file || result.file_url
              }
            : f
        )
      );

    } catch (error) {
      console.error('Erreur upload fichier:', error);
      
      // Marquer le fichier en erreur
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileData.id
            ? {
                ...f,
                status: 'error',
                progress: 0,
                error: error.response?.data?.detail || error.message || 'Erreur d\'upload'
              }
            : f
        )
      );
      
      setUploadError(`Erreur upload "${fileData.name}": ${error.response?.data?.detail || error.message}`);
    }
  };

  // Supprimer un fichier (backend + état local)
  const removeFile = async (fileId, backendId) => {
    // Si le fichier a un ID backend, le supprimer du serveur
    if (backendId) {
      try {
        await attachmentService.delete(backendId);
        console.log('✅ Fichier supprimé du backend:', backendId);
      } catch (error) {
        console.error('❌ Erreur suppression backend:', error);
        setUploadError(`Erreur suppression: ${error.response?.data?.detail || error.message}`);
        return; // Ne pas supprimer de l'état si erreur backend
      }
    }
    
    // Supprimer de l'état local
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  // Télécharger un fichier
  const downloadFile = async (backendId, fileName) => {
    if (!backendId) return;
    
    try {
      const blob = await attachmentService.download(backendId);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Fichier téléchargé:', fileName);
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      setUploadError(`Erreur téléchargement: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <MedicalIcons.Document className="w-8 h-8 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <MedicalIcons.Image className="w-8 h-8 text-blue-500" />;
      case 'doc':
      case 'docx':
        return <MedicalIcons.Document className="w-8 h-8 text-blue-600" />;
      default:
        return <MedicalIcons.Attachment className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
          <div className="animate-pulse space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-200"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-500 mt-3">Chargement des fichiers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zone de téléchargement */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
          ${dragOver ? 'border-mediai-primary bg-blue-50' : 'border-gray-300'}
          ${disabled || !ficheId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-mediai-primary hover:bg-gray-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || !ficheId}
        />
        
        <div className="space-y-3">
          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${dragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <ActionIcons.Upload className={`w-6 h-6 ${dragOver ? 'text-mediai-primary' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">
              {!ficheId ? 'Sauvegardez d\'abord la fiche' : disabled ? 'Téléchargement désactivé' : dragOver ? 'Déposer les fichiers ici' : 'Cliquez ou glissez-déposez vos fichiers'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedTypes.join(', ')} • Max {maxSize}MB par fichier • {maxFiles} fichiers max
            </p>
          </div>
        </div>
      </div>

      {/* Erreurs */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <StatusIcons.Error className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Erreur de téléchargement</p>
              <p className="text-xs text-red-600 mt-1 whitespace-pre-line">{uploadError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Liste des fichiers */}
      {showPreview && files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">{label} ({files.length})</h4>
            {files.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer tous les fichiers ?')) {
                    // Supprimer tous les fichiers du backend
                    for (const file of files) {
                      if (file.backendId) {
                        try {
                          await attachmentService.delete(file.backendId);
                        } catch (error) {
                          console.error('Erreur suppression:', error);
                        }
                      }
                    }
                    setFiles([]);
                  }
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Tout supprimer
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex-shrink-0 mr-3">
                  {getFileIcon(file.name)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    {file.status === 'uploading' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-mediai-primary h-1 rounded-full transition-all duration-300" 
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-mediai-primary">{file.progress}%</span>
                      </div>
                    )}
                    {file.status === 'completed' && (
                      <span className="text-xs text-green-600 flex items-center">
                        <StatusIcons.Success className="w-3 h-3 mr-1" />
                        Téléchargé
                      </span>
                    )}
                    {file.status === 'error' && (
                      <span className="text-xs text-red-600 flex items-center">
                        <StatusIcons.Error className="w-3 h-3 mr-1" />
                        Erreur: {file.error}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.backendId && file.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadFile(file.backendId, file.name)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      title="Télécharger le fichier"
                    >
                      <ActionIcons.Download className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {file.status !== 'uploading' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(file.id, file.backendId)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      title="Supprimer le fichier"
                    >
                      <ActionIcons.Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;