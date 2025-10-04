import React, { useState, useRef } from 'react';
import { ActionIcons, MedicalIcons, StatusIcons } from './Icons';
import Button from './Button';

/**
 * Composant de téléchargement de fichiers avec prévisualisation
 * @param {Array} files - Liste des fichiers existants
 * @param {function} onFilesChange - Callback lors du changement de fichiers
 * @param {Array} acceptedTypes - Types de fichiers acceptés
 * @param {number} maxSize - Taille max en MB
 * @param {number} maxFiles - Nombre max de fichiers
 * @param {boolean} showPreview - Afficher la prévisualisation
 */
const FileUpload = ({ 
  files = [], 
  onFilesChange, 
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxSize = 10, // 10MB
  maxFiles = 5,
  showPreview = true,
  disabled = false,
  label = "Pièces jointes"
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (selectedFiles) => {
    setUploadError('');

    if (!selectedFiles || selectedFiles.length === 0) return;

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
        validFiles.push({
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
          url: null // Sera rempli après l'upload
        });
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join('\\n'));
      return;
    }

    // Ajouter les fichiers valides
    const newFiles = [...files, ...validFiles];
    onFilesChange && onFilesChange(newFiles);

    // Simuler l'upload pour chaque fichier
    validFiles.forEach((fileData, index) => {
      simulateUpload(fileData.id);
    });
  };

  const simulateUpload = (fileId) => {
    const interval = setInterval(() => {
      onFilesChange && onFilesChange(prevFiles => 
        prevFiles.map(file => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + 10, 100);
            return {
              ...file,
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : 'uploading'
            };
          }
          return file;
        })
      );
    }, 200);

    // Arrêter la simulation après 2 secondes
    setTimeout(() => {
      clearInterval(interval);
    }, 2000);
  };

  const removeFile = (fileId) => {
    const newFiles = files.filter(file => file.id !== fileId);
    onFilesChange && onFilesChange(newFiles);
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

  return (
    <div className="space-y-4">
      {/* Zone de téléchargement */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
          ${dragOver ? 'border-mediai-primary bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-mediai-primary hover:bg-gray-50'}
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
          disabled={disabled}
        />
        
        <div className="space-y-3">
          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${dragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <ActionIcons.Upload className={`w-6 h-6 ${dragOver ? 'text-mediai-primary' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">
              {disabled ? 'Téléchargement désactivé' : dragOver ? 'Déposer les fichiers ici' : 'Cliquez ou glissez-déposez vos fichiers'}
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
                onClick={() => onFilesChange && onFilesChange([])}
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
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.url, '_blank')}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <ActionIcons.Eye className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <ActionIcons.Trash className="w-4 h-4" />
                  </Button>
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