import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  Edit,
  BarChart3, 
  Leaf, 
  TreePine, 
  Wheat, 
  Map, 
  Layers,
  Trash2,
  AlertCircle,
  PlusCircle,
  Upload,
  Download,
  FileUp,
  Camera,
  Sun,
  Moon,
  ChevronRight,
  Settings,
  Users,
  FileText,
  Menu,
  X,
  CloudRain,
  Wind,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Tractor,
  Carrot,
  CloudLightning,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Clock,
  Wallet,
  RefreshCw
} from 'lucide-react';
import { EditableField } from '@/components/ui/editable-field';
import { useCRM } from '@/contexts/CRMContext';
import ParcelTable from './parcels/ParcelTable';
import ParcelMap from './ParcelMap';
import ParcelPhotoUpload from './parcels/ParcelPhotoUpload';
import { toast } from 'sonner';
import ParcelDetailsOrganism from './ParcelDetailsOrganism';

// Tipos para as parcelas
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
  owner?: string;
  rainfall?: number;
  notes?: string;
  photos?: string[];
}

interface ParcelManagementProps {
  searchTerm?: string;
  filterStatus?: string;
};

// Componente para a representação visual de uma parcela
const ParcelCard = ({ 
  parcel, 
  onSelect, 
  onEdit,
  onDelete
}: { 
  parcel: ParcelData, 
  onSelect: (parcel: ParcelData) => void,
  onEdit: (parcel: ParcelData) => void,
  onDelete: (id: string) => void
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-agri-success';
      case 'inactive': return 'bg-agri-danger';
      case 'planned': return 'bg-agri-warning';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'inactive': return 'Inativa';
      case 'planned': return 'Planejada';
      default: return 'Desconhecido';
    }
  };

  const calculateDays = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div 
      className="border rounded-xl p-4 bg-card hover:shadow-md transition-shadow cursor-pointer card-hover"
      onClick={() => onSelect(parcel)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{parcel.name}</h3>
        <div className={`flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusColor(parcel.status)} bg-opacity-10 text-foreground`}>
          <span className={`w-2 h-2 rounded-full ${getStatusColor(parcel.status)} mr-1.5`}></span>
          {getStatusLabel(parcel.status)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground mb-3">
        <div className="flex items-center">
          <Layers className="h-4 w-4 mr-1.5" />
          <span>{parcel.area} ha</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1.5" />
          <span>{new Date(parcel.lastActivity).toLocaleDateString()}</span>
        </div>
        <div className="col-span-2 mt-1 py-1 px-2 bg-primary/5 rounded-md text-center">
          <span className="text-agri-primary font-medium">{parcel.crop}</span>
          {parcel.harvestDate && (
            <p className="text-xs mt-1">Colheita em: {calculateDays(parcel.harvestDate)} dias</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-2 pt-2 border-t border-border">
        <button 
          className="p-1.5 hover:bg-muted rounded"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(parcel);
          }}
        >
          <Edit className="h-4 w-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 hover:bg-muted rounded">
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </button>
        <button 
          className="p-1.5 hover:bg-muted rounded text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(parcel.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const ParcelManagementOrganism = ({ searchTerm = '', filterStatus = 'all' }: ParcelManagementProps) => {
  const { getModuleData, syncDataAcrossCRM, isRefreshing } = useCRM();
  
  // Buscar dados de parcelas do contexto CRM
  const parcelsData = getModuleData('parcelles')?.items || [];
  const isLoading = isRefreshing;
  const isError = false;
  
  // Converter dados do backend para o formato esperado
  const parcels = parcelsData.map((parcel: any) => ({
    id: parcel.id,
    name: parcel.name,
    area: parcel.size || parcel.area,
    crop: parcel.crop || parcel.crops?.[0]?.name || 'Não especificado',
    status: parcel.status || 'planned',
    lastActivity: parcel.updatedAt ? new Date(parcel.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    soilType: parcel.soilType || 'Não especificado',
    coordinates: parcel.coordinates || { lat: 16.265, lng: -61.551 },
    irrigation: parcel.irrigation || 'Não especificado',
    plantingDate: parcel.plantingDate || parcel.crops?.[0]?.plantingDate ? new Date(parcel.crops[0].plantingDate).toISOString().split('T')[0] : undefined,
    harvestDate: parcel.harvestDate || parcel.crops?.[0]?.harvestDate ? new Date(parcel.crops[0].harvestDate).toISOString().split('T')[0] : undefined,
    rainfall: parcel.rainfall,
    notes: parcel.notes || parcel.description || '',
    photos: parcel.photos || []
  }));
  
  // Função para refetch (sincronizar)
  const refetch = () => {
    syncDataAcrossCRM();
  };
  
  const [selectedParcel, setSelectedParcel] = useState<ParcelData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedParcel, setEditedParcel] = useState<ParcelData | null>(null);

  const { addData, updateData, deleteData } = useCRM();

  // Create parcel - usando contexto CRM (sincronização automática)
  const createParcelMutation = {
    mutate: async (newParcel: Omit<ParcelData, 'id'>) => {
      try {
        await addData('parcelles', newParcel);
        toast.success('Parcela criada com sucesso');
      } catch (error) {
        toast.error('Erro ao criar parcela: ' + (error as Error).message);
        throw error;
      }
    }
  };

  // Update parcel - usando contexto CRM (sincronização automática)
  const updateParcelMutation = {
    mutate: async ({ id, data }: { id: string; data: Partial<ParcelData> }) => {
      try {
        await updateData('parcelles', id, data);
        toast.success('Parcela atualizada com sucesso');
      } catch (error) {
        toast.error('Erro ao atualizar parcela: ' + (error as Error).message);
        throw error;
      }
    }
  };

  // Delete parcel - usando contexto CRM (sincronização automática)
  const deleteParcelMutation = {
    mutate: async (id: string) => {
      try {
        await deleteData('parcelles', id);
        toast.success('Parcela excluída com sucesso');
        if (selectedParcel?.id === id) {
          setSelectedParcel(null);
        }
      } catch (error) {
        toast.error('Erro ao excluir parcela: ' + (error as Error).message);
        throw error;
      }
    }
  };

  // Filtrar as parcelas com base nos critérios de pesquisa e no filtro
  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = parcel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parcel.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parcel.soilType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && parcel.status === filterStatus;
  });

  const handleRefresh = () => {
    refetch();
    syncDataAcrossCRM();
    toast.success('Dados das parcelas atualizados');
  };

  const handleSelectParcel = (parcel: ParcelData) => {
    setSelectedParcel(parcel);
    setIsEditMode(false);
  };

  const handleEditStart = (parcel: ParcelData) => {
    setEditedParcel({...parcel});
    setSelectedParcel(parcel);
    setIsEditMode(true);
  };

  const handleAddParcel = () => {
    // Validar que existe pelo menos uma cultura cadastrada
    const cropsData = getModuleData('cultures')?.items || [];
    if (cropsData.length === 0) {
      toast.error('Por favor, cadastre pelo menos uma cultura antes de criar uma parcela.');
      return;
    }
    
    // Usar a primeira cultura como padrão
    const defaultCrop = cropsData[0]?.name || '';
    
    const newParcel: Omit<ParcelData, 'id'> = {
      name: 'Nova Parcela',
      area: 0,
      crop: defaultCrop,
      status: 'planned',
      lastActivity: new Date().toISOString().split('T')[0],
      soilType: '',
      coordinates: { lat: 16.2650, lng: -61.5510 },
      irrigation: '',
      photos: [],
      notes: ''
    };
    createParcelMutation.mutate(newParcel);
  };

  const handleSaveEdit = () => {
    if (!editedParcel) return;
    
    // Validar que uma cultura foi selecionada
    if (!editedParcel.crop || editedParcel.crop.trim() === '') {
      toast.error('Por favor, selecione uma cultura para a parcela.');
      return;
    }
    
    updateParcelMutation.mutate({
      id: editedParcel.id,
      data: editedParcel
    });
    
    setSelectedParcel(editedParcel);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedParcel(null);
  };

  const handleInputChange = (field: keyof ParcelData, value: string | number | string[]) => {
    if (!editedParcel) return;
    
    setEditedParcel(prev => {
      if (!prev) return null;
      
      if (field === 'area' || field === 'rainfall') {
        return { ...prev, [field]: Number(value) };
      }
      
      if (field === 'coordinates') {
        return prev; // Gerenciar separadamente, se necessário
      }

      return { ...prev, [field]: value };
    });
  };

  const handleStatusChange = (status: 'active' | 'inactive' | 'planned') => {
    if (!editedParcel) return;
    setEditedParcel({...editedParcel, status});
  };
  
  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-agri-primary"></div>
      </div>
    );
  }

  // Show error state if there's an error
  if (isError) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar dados</h3>
        <p className="text-muted-foreground mb-4">Não foi possível carregar as informações das parcelas</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 animate-enter">
      {/* Header with refresh button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || createParcelMutation.isPending || updateParcelMutation.isPending}
          className="flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da esquerda - Lista de parcelas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredParcels.length > 0 ? (
              filteredParcels.map(parcel => (
                <ParcelCard 
                  key={parcel.id} 
                  parcel={parcel} 
                  onSelect={handleSelectParcel}
                  onEdit={handleEditStart}
                  onDelete={deleteParcelMutation.mutate}
                />
              ))
            ) : (
              <div className="text-center py-8 px-4 border border-dashed rounded-lg">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma parcela encontrada com esses critérios</p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna da direita - Detalhes da parcela */}
        <div className="lg:col-span-2">
          <ParcelDetailsOrganism
            parcel={selectedParcel}
            isEditing={isEditMode}
            editedParcel={editedParcel}
            onEditStart={() => selectedParcel && handleEditStart(selectedParcel)}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            onFieldChange={(field, value) => handleInputChange(field, value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ParcelManagementOrganism;