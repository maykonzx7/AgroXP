import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ParcelPhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  isEditing: boolean;
}

const ParcelPhotoUpload = ({ photos, onPhotosChange, isEditing }: ParcelPhotoUploadProps) => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // In a real implementation, you would upload the file to a server
      // For now, we'll just add a placeholder URL
      const newPhoto = URL.createObjectURL(selectedFile);
      onPhotosChange([...photos, newPhoto]);
      resetUpload();
      toast.success('Foto adicionada com sucesso');
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    const removedPhoto = newPhotos[index];
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
    
    // Clean up the object URL to avoid memory leaks
    if (removedPhoto.startsWith('blob:')) {
      URL.revokeObjectURL(removedPhoto);
    }
    
    toast.success('Foto removida');
  };

  const resetUpload = () => {
    setShowUpload(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clean up the preview URL to avoid memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleCancel = () => {
    resetUpload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium mb-0 flex items-center">
          <Camera className="h-4 w-4 mr-2" />
          Fotos da parcela
        </h3>
        {isEditing && (
          <button 
            className="text-sm flex items-center text-agri-primary hover:text-agri-primary-dark"
            onClick={() => setShowUpload(!showUpload)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar foto
          </button>
        )}
      </div>

      {showUpload && isEditing && (
        <div className="mb-4 p-4 border border-dashed rounded-lg">
          <div className="flex flex-col items-center justify-center">
            {previewUrl ? (
              <div className="relative mb-3">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="h-32 w-32 object-cover rounded-lg border"
                />
                <button 
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Camera className="h-12 w-12 text-muted-foreground mb-3" />
            )}
            
            <Input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="max-w-xs mb-3"
            />
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                Carregar
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel}
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="h-24 w-full bg-gray-100 rounded flex items-center justify-center border overflow-hidden">
                {photo.startsWith('http') || photo.startsWith('blob:') ? (
                  <img 
                    src={photo} 
                    alt={`Parcela ${index + 1}`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground text-center p-2">{photo}</span>
                )}
              </div>
              {isEditing && (
                <button 
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-muted/20 rounded-lg">
          <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            {isEditing 
              ? 'Nenhuma foto adicionada. Clique em "Adicionar foto" para incluir imagens da parcela.' 
              : 'Nenhuma foto disponível para esta parcela.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ParcelPhotoUpload;