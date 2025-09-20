import React, { useState, useEffect } from 'react';
import { EditableField } from '@/components/ui/editable-field';
import { EditableTable, Column } from '@/components/ui/editable-table';
import { MapPin, Calendar, Leaf, TreePine, Wheat, Map, Search, Plus, Filter, Trash2, Check } from 'lucide-react';
import { useCRM } from '../contexts/CRMContext';
import { 
  Input 
} from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Button 
} from '@/components/ui/button';
import { useParams } from 'react-router-dom';

interface ParcelDetail {
  id: string;
  name: string;
  location: string;
  surface: number;
  soilType: string;
  crops: { crop: string; variety: string; plantingDate: string; harvestDate: string; status: string }[];
  irrigationSystem: string;
  notes: string;
  owner: string;
  lastInspection: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: string[];
}

interface TaskData {
  id: number;
  task: string;
  dueDate: string;
  assignedTo: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'A fazer' | 'Em andamento' | 'Concluída';
}

const parcelData: ParcelDetail = {
  id: '1',
  name: 'Parcela das Palmeiras Altas',
  location: 'Região Norte - Morne-à-l\'Eau',
  surface: 8.5,
  soilType: 'Argilo-calcário',
  crops: [
    {
      crop: 'Cana-de-açúcar', 
      variety: 'R579', 
      plantingDate: '2023-02-10', 
      harvestDate: '2024-02-15',
      status: 'Em crescimento'
    },
    {
      crop: 'Inhame', 
      variety: 'Pacala', 
      plantingDate: '2023-05-20', 
      harvestDate: '2023-12-10',
      status: 'Colhido'
    }
  ],
  irrigationSystem: 'Gotejamento com captação de água da chuva',
  notes: 'Parcela em conversão orgânica desde 2022. Exposição Sudeste favorável.',
  owner: 'Cooperativa Agrícola da Região Norte',
  lastInspection: '2023-11-15',
  coordinates: {
    latitude: 16.3312,
    longitude: -61.3844
  },
  images: [
    'parcela1_vista1.jpg',
    'parcela1_irrigacao.jpg'
  ]
};

const initialTasks: TaskData[] = [
  {
    id: 1, 
    task: 'Fertilização da cana', 
    dueDate: '2023-09-25', 
    assignedTo: 'João da Silva', 
    priority: 'Alta',
    status: 'A fazer'
  },
  {
    id: 2, 
    task: 'Tratamento contra cercosporiose', 
    dueDate: '2023-09-28', 
    assignedTo: 'Maria Oliveira', 
    priority: 'Média',
    status: 'Em andamento'
  },
  {
    id: 3, 
    task: 'Inspeção de crescimento do abacaxi', 
    dueDate: '2023-09-30', 
    assignedTo: 'Pedro Santos', 
    priority: 'Baixa',
    status: 'A fazer'
  },
  {
    id: 4,
    task: 'Capina da parcela de taro',
    dueDate: '2023-10-05',
    assignedTo: 'Sofia Martins',
    priority: 'Média',
    status: 'A fazer'
  },
  {
    id: 5,
    task: 'Preparação para o corte da cana',
    dueDate: '2024-01-10',
    assignedTo: 'João da Silva',
    priority: 'Alta',
    status: 'A fazer'
  }
];

const taskColumns: Column[] = [
  { id: 'task', header: 'Tarefa', accessorKey: 'task', isEditable: true },
  { id: 'assignedTo', header: 'Atribuído a', accessorKey: 'assignedTo', isEditable: true },
  { id: 'dueDate', header: 'Data', accessorKey: 'dueDate', isEditable: true, width: '120px' },
  { id: 'priority', header: 'Prioridade', accessorKey: 'priority', isEditable: true, width: '120px' },
  { id: 'status', header: 'Status', accessorKey: 'status', isEditable: true, width: '100px' }
];

const cropColumns: Column[] = [
  { id: 'crop', header: 'Cultura', accessorKey: 'crop', isEditable: true },
  { id: 'variety', header: 'Variedade', accessorKey: 'variety', isEditable: true },
  { id: 'plantingDate', header: 'Data de plantio', accessorKey: 'plantingDate', isEditable: true },
  { id: 'harvestDate', header: 'Data de colheita prevista', accessorKey: 'harvestDate', isEditable: true },
  { id: 'status', header: 'Status', accessorKey: 'status', isEditable: true },
];

const ParcelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [parcel, setParcel] = useState<ParcelDetail>(parcelData);
  const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<'info' | 'crops' | 'tasks'>('info');
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleParcelUpdate = (field: keyof ParcelDetail, value: string | number) => {
    setParcel({
      ...parcel,
      [field]: value
    });
    toast.success(`${field} atualizado`);
  };

  const handleTaskUpdate = (rowIndex: number, columnId: string, value: any) => {
    const updatedTasks = [...tasks];
    const updatedTask = { ...updatedTasks[rowIndex] };
    
    (updatedTask as any)[columnId] = value;
    updatedTasks[rowIndex] = updatedTask;
    
    setTasks(updatedTasks);
    toast.success('Tarefa atualizada');
  };

  const handleCropUpdate = (rowIndex: number, columnId: string, value: any) => {
    const updatedParcel = { ...parcel };
    const updatedCrops = [...updatedParcel.crops];
    const updatedCrop = { ...updatedCrops[rowIndex] };
    
    (updatedCrop as any)[columnId] = value;
    updatedCrops[rowIndex] = updatedCrop;

    updatedParcel.crops = updatedCrops;
    setParcel(updatedParcel);
    toast.success('Cultura atualizada');
  };

  const handleAddTask = (newRow: Record<string, any>) => {
    const newId = Math.max(0, ...tasks.map(t => t.id)) + 1;
    
    const newTask: TaskData = {
      id: newId,
      task: String(newRow.task || ''),
      dueDate: String(newRow.dueDate || new Date().toISOString().split('T')[0]),
      assignedTo: String(newRow.assignedTo || ''),
      priority: (newRow.priority as TaskData['priority']) || 'Média',
      status: (newRow.status as TaskData['status']) || 'A fazer'
    };
    
    setTasks([...tasks, newTask]);
    toast.success('Nova tarefa adicionada');
  };

  const handleAddCrop = (newRow: Record<string, any>) => {
    const updatedParcel = { ...parcel };
    
    const newCrop = {
      crop: String(newRow.crop || ''),
      variety: String(newRow.variety || ''),
      plantingDate: String(newRow.plantingDate || new Date().toISOString().split('T')[0]),
      harvestDate: String(newRow.harvestDate || ''),
      status: String(newRow.status || 'Planejado')
    };
    
    updatedParcel.crops = [...updatedParcel.crops, newCrop];
    setParcel(updatedParcel);
    toast.success('Nova cultura adicionada');
  };

  const handleDeleteTask = (rowIndex: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(rowIndex, 1);
    setTasks(updatedTasks);
    toast.success('Tarefa excluída');
  };

  const handleDeleteCrop = (rowIndex: number) => {
    const updatedParcel = { ...parcel };
    const updatedCrops = [...updatedParcel.crops];
    updatedCrops.splice(rowIndex, 1);
    updatedParcel.crops = updatedCrops;
    setParcel(updatedParcel);
    toast.success('Cultura excluída');
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-agri-primary" />
              <EditableField
                value={parcel.name}
                onSave={(value) => handleParcelUpdate('name', value)}
                className="inline-block"
              />
            </h2>
            <p className="text-muted-foreground flex items-center mt-1">
              <Map className="h-4 w-4 mr-1.5" />
              <EditableField
                value={parcel.location}
                onSave={(value) => handleParcelUpdate('location', value)}
                className="inline-block"
              />
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 lg:mt-0">
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === 'info' ? 'bg-agri-primary text-white' : 'bg-muted'}`}
              onClick={() => setActiveTab('info')}
            >
              Informações
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === 'crops' ? 'bg-agri-primary text-white' : 'bg-muted'}`}
              onClick={() => setActiveTab('crops')}
            >
              Culturas
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === 'tasks' ? 'bg-agri-primary text-white' : 'bg-muted'}`}
              onClick={() => setActiveTab('tasks')}
            >
              Tarefas
            </button>
          </div>
        </div>
        
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Área</h3>
                <div className="flex items-center">
                  <EditableField
                    value={parcel.surface}
                    type="number"
                    onSave={(value) => handleParcelUpdate('surface', value)}
                    className="text-xl font-bold"
                  />
                  <span className="ml-1 text-xl">ha</span>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tipo de solo</h3>
                <EditableField
                  value={parcel.soilType}
                  onSave={(value) => handleParcelUpdate('soilType', value)}
                  className="text-xl font-bold"
                />
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Última inspeção</h3>
                <EditableField
                  value={parcel.lastInspection}
                  onSave={(value) => handleParcelUpdate('lastInspection', value)}
                  className="text-xl font-bold"
                />
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Sistema de irrigação</h3>
              <EditableField
                value={parcel.irrigationSystem}
                onSave={(value) => handleParcelUpdate('irrigationSystem', value)}
                className="text-lg"
              />
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Notas</h3>
              <EditableField
                value={parcel.notes}
                onSave={(value) => handleParcelUpdate('notes', value)}
                className="text-lg"
              />
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Proprietário</h3>
              <EditableField
                value={parcel.owner}
                onSave={(value) => handleParcelUpdate('owner', value)}
                className="text-lg"
              />
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Fotos da parcela</h3>
                <button 
                  className="text-sm flex items-center text-agri-primary hover:text-agri-primary-dark"
                  onClick={() => setShowImageUpload(!showImageUpload)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar uma foto
                </button>
              </div>
              
              {showImageUpload && (
                <div className="mb-4 p-3 border border-dashed rounded-lg">
                  <div className="flex flex-col items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Arraste uma imagem ou clique para procurar</p>
                    <Input type="file" className="max-w-xs" />
                    <div className="flex space-x-2 mt-2">
                      <button className="px-3 py-1 text-sm bg-agri-primary text-white rounded">Carregar</button>
                      <button 
                        className="px-3 py-1 text-sm border rounded"
                        onClick={() => setShowImageUpload(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {parcel.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="h-24 w-full bg-gray-100 rounded flex items-center justify-center border">
                      <span className="text-xs text-muted-foreground">{image}</span>
                    </div>
                    <button className="absolute top-1 right-1 hidden group-hover:flex p-1 bg-red-100 rounded-full text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'crops' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Culturas nesta parcela</h3>
            <EditableTable
              data={parcel.crops}
              columns={cropColumns}
              onUpdate={handleCropUpdate}
              onDelete={handleDeleteCrop}
              onAdd={handleAddCrop}
              className="border-none"
            />
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Próximas tarefas</h3>
              <Button 
                onClick={() => toast.success('Redirecionando para a página de tarefas')}
                variant="outline"
                className="text-sm"
              >
                Ver todas as tarefas
              </Button>
            </div>
            
            <EditableTable
              data={tasks}
              columns={taskColumns}
              onUpdate={handleTaskUpdate}
              onDelete={handleDeleteTask}
              onAdd={handleAddTask}
              className="border-none"
              actions={[
                {
                  icon: <Check className="h-4 w-4 text-green-600" />,
                  label: "Marcar como concluída",
                  onClick: (rowIndex) => {
                    toast.success(`Tarefa "${tasks[rowIndex].task}" marcada como concluída`);
                    const updatedTasks = [...tasks];
                    updatedTasks[rowIndex].status = 'Concluída';
                    setTasks(updatedTasks);
                  }
                }
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ParcelDetail;
