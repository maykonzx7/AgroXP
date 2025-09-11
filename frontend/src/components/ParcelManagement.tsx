import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  BarChart3, 
  Leaf, 
  TreePine, 
  Wheat, 
  Map, 
  Layers,
  Edit,
  Trash2,
  Save,
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
  Wallet
} from 'lucide-react';
import { EditableField } from '@/components/ui/editable-field';
import { useCRM } from '../contexts/CRMContext';
import ParcelTable from './parcels/ParcelTable';
import ParcelStats from './parcels/ParcelStats';
import ParcelMap from './ParcelMap';
import ParcelPhotoUpload from './parcels/ParcelPhotoUpload';
import { toast } from 'sonner';

// Tipos para as parcelas
interface ParcelData {
  id: number;
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

// Dados iniciais das parcelas
const initialParcelData: ParcelData[] = [
  { 
    id: 1, 
    name: 'Norte da Ilha Principal', 
    area: 12.5, 
    crop: 'Cana-de-açúcar', 
    status: 'active', 
    lastActivity: '2023-08-15', 
    soilType: 'Argilo-calcário', 
    coordinates: { lat: 16.3772, lng: -61.4483 },
    irrigation: 'Gotejamento',
    plantingDate: '2023-02-15',
    harvestDate: '2024-02-15',
    rainfall: 1200,
    photos: [
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1597568775807-c11e30e0b3d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    ]
  },
  { 
    id: 2, 
    name: 'Sul da Ilha Menor', 
    area: 8.3, 
    crop: 'Banana', 
    status: 'active', 
    lastActivity: '2023-08-10', 
    soilType: 'Vulcânico', 
    coordinates: { lat: 16.0220, lng: -61.7425 },
    irrigation: 'Aspersão',
    plantingDate: '2023-04-10',
    harvestDate: '2023-12-10',
    rainfall: 2500,
    photos: [
      'https://images.unsplash.com/photo-1598983069273-58f0c7b1c7a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    ]
  },
  { 
    id: 3, 
    name: 'Região Oeste', 
    area: 15.7, 
    crop: 'Abacaxi', 
    status: 'active', 
    lastActivity: '2023-08-05', 
    soilType: 'Vulcânico', 
    coordinates: { lat: 16.0504, lng: -61.5643 },
    irrigation: 'Gotejamento',
    plantingDate: '2023-05-20',
    harvestDate: '2024-01-20',
    rainfall: 2300
  },
  { 
    id: 4, 
    name: 'Ilha Vizinha', 
    area: 10.2, 
    crop: 'Taro', 
    status: 'inactive', 
    lastActivity: '2023-07-20', 
    soilType: 'Arenoso', 
    coordinates: { lat: 15.9412, lng: -61.2983 },
    irrigation: 'Manual',
    plantingDate: '2023-03-15',
    harvestDate: '2023-11-01',
    rainfall: 1100,
    photos: [
      'https://images.unsplash.com/photo-1600222584421-60d3f0a2a7c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1593118247621-91c8c7e2d0bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1597568775807-c11e30e0b3d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    ]
  },
  { 
    id: 5, 
    name: 'Norte da Ilha Principal', 
    area: 6.8, 
    crop: 'Inhame', 
    status: 'planned', 
    lastActivity: '2023-08-01', 
    soilType: 'Limono-argiloso', 
    coordinates: { lat: 16.3943, lng: -61.4789 },
    irrigation: 'Nenhuma',
    plantingDate: '2023-09-15',
    harvestDate: '2024-03-15',
    rainfall: 1400
  },
];

// Componente para a representação visual de uma parcela
const ParcelCard = ({ 
  parcel, 
  onSelect, 
  onEdit 
}: { 
  parcel: ParcelData, 
  onSelect: (parcel: ParcelData) => void,
  onEdit: (parcel: ParcelData) => void
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-agri-success';
      case 'inactive': return 'bg-agri-danger';
      case 'planned': return 'bg-agri-warning';
      default: return 'bg-gray-300';
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
      className="border rounded-xl p-4 bg-white hover:shadow-md transition-shadow cursor-pointer card-hover"
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
        <div className="col-span-2 mt-1 py-1 px-2 bg-agri-primary/5 rounded-md text-center">
          <span className="text-agri-primary font-medium">{parcel.crop}</span>
          {parcel.harvestDate && (
            <p className="text-xs mt-1">Colheita em: {calculateDays(parcel.harvestDate)} dias</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-2 pt-2 border-t border-border">
        <button 
          className="p-1.5 hover:bg-gray-100 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(parcel);
          }}
        >
          <Edit className="h-4 w-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded text-agri-danger">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const ParcelManagement = () => {
  const [parcels, setParcels] = useState<ParcelData[]>(initialParcelData);
  const [selectedParcel, setSelectedParcel] = useState<ParcelData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedParcel, setEditedParcel] = useState<ParcelData | null>(null);
  
  // Filtrar as parcelas com base nos critérios de pesquisa e no filtro
  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = parcel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parcel.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parcel.soilType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && parcel.status === filter;
  });

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
    const newId = Math.max(0, ...parcels.map(p => p.id)) + 1;
    const newParcel: ParcelData = {
      id: newId,
      name: 'Nova Parcela',
      area: 0,
      crop: '',
      status: 'planned',
      lastActivity: new Date().toISOString().split('T')[0],
      soilType: '',
      coordinates: { lat: 16.2650, lng: -61.5510 }, // Coordenadas de Pointe-à-Pitre
      irrigation: '',
      photos: []
    };
    setParcels([...parcels, newParcel]);
    setEditedParcel(newParcel);
    setSelectedParcel(newParcel);
    setIsEditMode(true);
    toast.success('Nova parcela criada');
  };

  const handleSaveEdit = () => {
    if (!editedParcel) return;
    
    setParcels(parcels.map(p => p.id === editedParcel.id ? editedParcel : p));
    setSelectedParcel(editedParcel);
    setIsEditMode(false);
    toast.success('Alterações salvas');
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
  
  return (
    <div className="p-6 animate-enter">
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da esquerda - Lista de parcelas */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="pl-10 pr-4 py-2 w-full border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select 
                className="appearance-none pl-3 pr-8 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
                <option value="planned">Planejada</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredParcels.length > 0 ? (
              filteredParcels.map(parcel => (
                <ParcelCard 
                  key={parcel.id} 
                  parcel={parcel} 
                  onSelect={handleSelectParcel}
                  onEdit={handleEditStart}
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

        {/* Coluna da direita - Mapa e detalhes */}
        <div className="lg:col-span-2">
          {selectedParcel ? (
            <div className="border rounded-xl overflow-hidden h-full">
              <div className="bg-agri-primary text-white p-4 flex justify-between items-center">
                {isEditMode ? (
                  <input 
                    type="text" 
                    value={editedParcel?.name || ''} 
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="px-2 py-1 bg-white/10 border border-white/30 rounded text-white text-xl w-full"
                  />
                ) : (
                  <h2 className="text-xl font-semibold">{selectedParcel.name}</h2>
                )}
                
                {isEditMode ? (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleSaveEdit}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full"
                    >
                      <Save className="h-5 w-5 text-white" />
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full"
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleEditStart(selectedParcel)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full"
                  >
                    <Edit className="h-5 w-5 text-white" />
                  </button>
                )}
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <ParcelPhotoUpload 
                    photos={selectedParcel.photos || []}
                    onPhotosChange={(photos) => {
                      if (isEditMode && editedParcel) {
                        setEditedParcel({...editedParcel, photos});
                      } else {
                        setSelectedParcel({...selectedParcel, photos});
                      }
                    }}
                    isEditing={isEditMode}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Cultura atual
                    </h3>
                    
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Cultura</label>
                          <input 
                            type="text" 
                            value={editedParcel?.crop || ''} 
                            onChange={(e) => handleInputChange('crop', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-sm text-muted-foreground">Data de plantio</label>
                            <input 
                              type="date" 
                              value={editedParcel?.plantingDate || ''} 
                              onChange={(e) => handleInputChange('plantingDate', e.target.value)}
                              className="w-full px-3 py-2 border border-input rounded-md mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Data de colheita</label>
                            <input 
                              type="date" 
                              value={editedParcel?.harvestDate || ''} 
                              onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                              className="w-full px-3 py-2 border border-input rounded-md mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Status</label>
                          <div className="flex space-x-2 mt-1">
                            <button 
                              className={`px-3 py-1.5 text-xs rounded-md ${editedParcel?.status === 'active' ? 'bg-agri-success text-white' : 'bg-muted'}`}
                              onClick={() => handleStatusChange('active')}
                            >
                              Ativa
                            </button>
                            <button 
                              className={`px-3 py-1.5 text-xs rounded-md ${editedParcel?.status === 'planned' ? 'bg-agri-warning text-white' : 'bg-muted'}`}
                              onClick={() => handleStatusChange('planned')}
                            >
                              Planejada
                            </button>
                            <button 
                              className={`px-3 py-1.5 text-xs rounded-md ${editedParcel?.status === 'inactive' ? 'bg-agri-danger text-white' : 'bg-muted'}`}
                              onClick={() => handleStatusChange('inactive')}
                            >
                              Inativa
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-agri-primary/10 rounded-lg p-3 text-center">
                        <span className="font-semibold text-agri-primary">{selectedParcel.crop}</span>
                        {selectedParcel.plantingDate && (
                          <p className="text-sm mt-1">Plantado em: {new Date(selectedParcel.plantingDate).toLocaleDateString()}</p>
                        )}
                        {selectedParcel.harvestDate && (
                          <p className="text-sm">Colheita prevista: {new Date(selectedParcel.harvestDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Layers className="h-4 w-4 mr-2" />
                      Características do solo
                    </h3>
                    
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Tipo de solo</label>
                          <input 
                            type="text" 
                            value={editedParcel?.soilType || ''} 
                            onChange={(e) => handleInputChange('soilType', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Irrigação</label>
                          <input 
                            type="text" 
                            value={editedParcel?.irrigation || ''} 
                            onChange={(e) => handleInputChange('irrigation', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Pluviosidade anual (mm)</label>
                          <input 
                            type="number" 
                            value={editedParcel?.rainfall || ''} 
                            onChange={(e) => handleInputChange('rainfall', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md mt-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Tipo:</span>
                          <span className="text-sm font-medium">{selectedParcel.soilType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Irrigação:</span>
                          <span className="text-sm font-medium">{selectedParcel.irrigation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Pluviosidade:</span>
                          <span className="text-sm font-medium">{selectedParcel.rainfall ? `${selectedParcel.rainfall} mm/ano` : 'Não especificado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Área:</span>
                          <span className="text-sm font-medium">{selectedParcel.area} ha</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded-lg p-4 md:col-span-2">
                    <h3 className="font-medium mb-3">Notas</h3>
                    
                    {isEditMode ? (
                      <textarea 
                        value={editedParcel?.notes || ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Adicione suas notas aqui..."
                        className="w-full px-3 py-2 border border-input rounded-md h-24 resize-none"
                      />
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg min-h-[80px]">
                        {selectedParcel.notes || <span className="text-muted-foreground italic">Nenhuma nota para esta parcela</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-xl bg-muted h-full flex flex-col items-center justify-center p-6">
              <MapPin className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">Selecione uma parcela</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Clique em uma parcela na lista à esquerda para exibir seus detalhes e acessar o mapa
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParcelManagement;