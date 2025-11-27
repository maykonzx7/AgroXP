import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  InputWithLabelMolecule, 
  TextareaWithLabelMolecule, 
  SelectWithLabelMolecule, 
  FormActionsMolecule 
} from '@/components/molecules/FormMolecules';
import { useCRM } from '@/contexts/CRMContext';
import { 
  MapPin, 
  Layers, 
  Calendar, 
  Edit, 
  FileText,
  Sun,
  Droplets,
  Ruler,
  Wheat
} from 'lucide-react';

// Define the parcel data type
interface ParcelData {
  id: string;
  name: string;
  area: number;
  crop: string;
  status: 'active' | 'inactive' | 'planned';
  lastActivity: string;
  soilType: string;
  coordinates: { lat: number; lng: number };
  irrigation: string;
  plantingDate?: string;
  harvestDate?: string;
  rainfall?: number;
  notes?: string;
  photos?: string[];
}

interface ParcelDetailsOrganismProps {
  parcel: ParcelData | null;
  isEditing: boolean;
  editedParcel: ParcelData | null;
  onEditStart: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFieldChange: (field: keyof ParcelData, value: any) => void;
}

const ParcelDetailsOrganism: React.FC<ParcelDetailsOrganismProps> = ({
  parcel,
  isEditing,
  editedParcel,
  onEditStart,
  onSave,
  onCancel,
  onFieldChange
}) => {
  const { getModuleData } = useCRM();
  const cropsData = getModuleData('cultures')?.items || [];
  
  if (!parcel) {
    return (
      <div className="border rounded-xl bg-muted h-full flex flex-col items-center justify-center p-6">
        <MapPin className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">Selecione uma parcela</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Clique em uma parcela na lista à esquerda para exibir seus detalhes e acessar o mapa
        </p>
      </div>
    );
  }

  const currentParcel = isEditing && editedParcel ? editedParcel : parcel;
  
  // Preparar opções de culturas para o select
  // Usar ID como valor para garantir unicidade, mesmo se houver culturas com o mesmo nome
  const cropOptions = cropsData.map((crop: any) => ({
    value: crop.id || `crop-${Math.random()}`, // Sempre usar ID único
    label: `${crop.name || 'Cultura sem nome'}${crop.variety ? ` - ${crop.variety}` : ''}`
  }));
  
  // Encontrar o ID da cultura atual baseado no nome (para compatibilidade com dados existentes)
  const getCurrentCropId = (): string | undefined => {
    if (!currentParcel?.crop) return undefined;
    // Primeiro, tenta encontrar por ID (caso já esteja usando ID)
    const cropById = cropsData.find((c: any) => c.id === currentParcel.crop);
    if (cropById) return cropById.id;
    // Se não encontrar, tenta encontrar por nome
    const cropByName = cropsData.find((c: any) => c.name === currentParcel.crop);
    return cropByName?.id || undefined;
  };
  
  // Garantir que o valor do Select seja sempre uma string ou undefined (nunca null ou string vazia)
  const currentCropId = getCurrentCropId() || undefined;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-agri-success';
      case 'inactive': return 'bg-destructive';
      case 'planned': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    // Normalizar status para lowercase para garantir compatibilidade
    const normalizedStatus = status?.toLowerCase() || 'active';
    switch (normalizedStatus) {
      case 'active': return 'Ativa';
      case 'inactive': return 'Inativa';
      case 'planned': return 'Planejada';
      default: {
        console.warn('Status desconhecido:', status, 'normalizado para:', normalizedStatus);
        return 'Desconhecido';
      }
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden h-full flex flex-col">
      <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        {isEditing ? (
          <InputWithLabelMolecule
            id="parcel-name"
            label=""
            value={currentParcel.name || ''}
            onChange={(value) => onFieldChange('name', value)}
            type="text"
            placeholder="Nome da parcela"
          />
        ) : (
          <h2 className="text-xl font-semibold">{currentParcel.name}</h2>
        )}
        
        {!isEditing ? (
          <button
            onClick={onEditStart}
            className="p-1.5 bg-muted/10 hover:bg-muted/20 rounded-full"
          >
            <Edit className="h-5 w-5 text-foreground" />
          </button>
        ) : (
          <FormActionsMolecule
            onSave={onSave}
            onCancel={onCancel}
            saveLabel="Salvar"
            cancelLabel="Cancelar"
          />
        )}
      </div>
      
      <div className="p-4 overflow-y-auto flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Cultura information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wheat className="h-5 w-5" />
                Cultura Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  {cropOptions.length > 0 ? (
                    <SelectWithLabelMolecule
                      id="crop-name"
                      label="Cultura"
                      value={currentCropId}
                      onChange={(value) => {
                        // Encontrar a cultura pelo ID e salvar o nome para compatibilidade
                        const selectedCrop = cropsData.find((c: any) => c.id === value);
                        onFieldChange('crop', selectedCrop?.name || value);
                      }}
                      options={cropOptions}
                      placeholder="Selecione uma cultura"
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Cultura</label>
                      <p className="text-sm text-muted-foreground">
                        Nenhuma cultura cadastrada. Por favor, cadastre uma cultura primeiro.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <InputWithLabelMolecule
                      id="planting-date"
                      label="Data de plantio"
                      value={currentParcel.plantingDate || ''}
                      onChange={(value) => onFieldChange('plantingDate', value)}
                      type="date"
                    />
                    <InputWithLabelMolecule
                      id="harvest-date"
                      label="Data de colheita"
                      value={currentParcel.harvestDate || ''}
                      onChange={(value) => onFieldChange('harvestDate', value)}
                      type="date"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <span className="font-semibold text-agri-primary">{currentParcel.crop || 'Não especificado'}</span>
                  {currentParcel.plantingDate && (
                    <p className="text-sm mt-1">Plantado em: {new Date(currentParcel.plantingDate).toLocaleDateString()}</p>
                  )}
                  {currentParcel.harvestDate && (
                    <p className="text-sm">Colheita prevista: {new Date(currentParcel.harvestDate).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Soil information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Características do Solo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <InputWithLabelMolecule
                    id="soil-type"
                    label="Tipo de solo"
                    value={currentParcel.soilType || ''}
                    onChange={(value) => onFieldChange('soilType', value)}
                    placeholder="Tipo de solo"
                  />
                  <InputWithLabelMolecule
                    id="irrigation"
                    label="Irrigação"
                    value={currentParcel.irrigation || ''}
                    onChange={(value) => onFieldChange('irrigation', value)}
                    placeholder="Sistema de irrigação"
                  />
                  <InputWithLabelMolecule
                    id="rainfall"
                    label="Pluviosidade anual (mm)"
                    value={currentParcel.rainfall?.toString() || ''}
                    onChange={(value) => onFieldChange('rainfall', parseFloat(value) || 0)}
                    type="number"
                    placeholder="mm por ano"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tipo:</span>
                    <span className="text-sm font-medium">{currentParcel.soilType || 'Não especificado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Irrigação:</span>
                    <span className="text-sm font-medium">{currentParcel.irrigation || 'Não especificado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pluviosidade:</span>
                    <span className="text-sm font-medium">{currentParcel.rainfall ? `${currentParcel.rainfall} mm/ano` : 'Não especificado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Área:</span>
                    <span className="text-sm font-medium">{currentParcel.area} ha</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Status information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <SelectWithLabelMolecule
                  id="status"
                  label="Status"
                  value={currentParcel.status}
                  onChange={(value: 'active' | 'inactive' | 'planned') => onFieldChange('status', value)}
                  options={[
                    { value: 'active', label: 'Ativa' },
                    { value: 'planned', label: 'Planejada' },
                    { value: 'inactive', label: 'Inativa' }
                  ]}
                />
              ) : (
                <div className="flex items-center">
                  <Badge className={`${getStatusColor(currentParcel.status || 'active')} text-foreground`}>
                    {getStatusLabel(currentParcel.status || 'active')}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Notes section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <TextareaWithLabelMolecule
                  id="notes"
                  label="Notas"
                  value={currentParcel.notes || ''}
                  onChange={(value) => onFieldChange('notes', value)}
                  placeholder="Adicione suas notas aqui..."
                />
              ) : (
                <div className="p-3 bg-muted/30 rounded-lg min-h-[100px]">
                  {currentParcel.notes || <span className="text-muted-foreground italic">Nenhuma nota para esta parcela</span>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParcelDetailsOrganism;