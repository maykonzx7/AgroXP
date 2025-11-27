import React, { useState } from 'react';
import { Calendar, Plus, X, Edit, Trash2, Save, Leaf, Wheat, TreePine, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { EditableField } from '@/components/ui/editable-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'A fazer' | 'Em andamento' | 'Concluída';
  cropId?: number;
}

interface Crop {
  id: number;
  name: string;
  variety: string;
  plantingDate: string;
  harvestDate: string;
  status: string;
  surface: number;
  expectedYield: number;
  notes: string;
}

interface DayInfo {
  day: number | null;
  isCurrentMonth: boolean;
  date: Date;
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Preparar solo para plantio de cana-de-açúcar',
    description: 'Preparar e nivelar o solo da parcela A12 para o plantio de cana-de-açúcar',
    assignee: 'João Silva',
    dueDate: '2023-09-15',
    priority: 'Alta',
    status: 'Em andamento',
    cropId: 1
  },
  {
    id: 2,
    title: 'Colher bananas da parcela B05',
    description: 'Colher as bananas maduras da parcela B05 e transportar para o armazém',
    assignee: 'Maria Oliveira',
    dueDate: '2023-09-10',
    priority: 'Média',
    status: 'A fazer',
    cropId: 2
  },
  {
    id: 3,
    title: 'Aplicar fertilizante na parcela C08',
    description: 'Aplicar fertilizante NPK na parcela C08 para melhorar o rendimento',
    assignee: 'Pedro Santos',
    dueDate: '2023-09-20',
    priority: 'Baixa',
    status: 'A fazer',
    cropId: 1
  },
  {
    id: 4,
    title: 'Verificar sistema de irrigação',
    description: 'Verificar e reparar possíveis vazamentos no sistema de irrigação',
    assignee: 'Ana Costa',
    dueDate: '2023-09-05',
    priority: 'Urgente',
    status: 'Concluída'
  }
];

const initialCrops: Crop[] = [
  {
    id: 1,
    name: 'Cana-de-açúcar',
    variety: 'R579',
    plantingDate: '2023-02-10',
    harvestDate: '2025-02-15',
    status: 'Em crescimento',
    surface: 12.5,
    expectedYield: 85,
    notes: 'Parcela em conversão orgânica'
  },
  {
    id: 2,
    name: 'Banana',
    variety: 'Pacala',
    plantingDate: '2023-05-20',
    harvestDate: '2023-12-10',
    status: 'Colhendo',
    surface: 3.2,
    expectedYield: 45,
    notes: 'Monitorar pragas'
  }
];

const CropPlanningForm = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'Média' as 'Baixa' | 'Média' | 'Alta' | 'Urgente',
    status: 'A fazer' as 'A fazer' | 'Em andamento' | 'Concluída'
  });
  const [newCrop, setNewCrop] = useState({
    name: '',
    variety: '',
    plantingDate: '',
    harvestDate: '',
    status: 'Planejado',
    surface: 0,
    expectedYield: 0,
    notes: ''
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCropForm, setShowCropForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const getDaysInMonth = (date: Date): DayInfo[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
    
    const days: DayInfo[] = [];
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = lastDayOfPrevMonth - i;
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month - 1, day)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Next month days
    const totalCells = 42; // 6 weeks * 7 days
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (dayInfo: DayInfo) => {
    if (!dayInfo.isCurrentMonth) return;
    
    const clickedDate = dayInfo.date;
    setSelectedDate(clickedDate);
    
    const dateStr = clickedDate.toISOString().split('T')[0];
    const tasksForDate = tasks.filter(task => task.dueDate === dateStr);
    setTasksForSelectedDate(tasksForDate);
    setShowTaskDetail(true);
  };

  const handleAddTask = () => {
    if (!newTask.title) {
      toast.error('Por favor, preencha o título da tarefa');
      return;
    }
    
    const taskToAdd = {
      ...newTask,
      id: Math.max(0, ...tasks.map(t => t.id)) + 1
    };
    
    setTasks([...tasks, taskToAdd]);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'Média',
      status: 'A fazer'
    });
    setShowTaskForm(false);
    toast.success('Tarefa adicionada com sucesso');
  };

  const handleUpdateTask = (id: number, field: keyof Task, value: any) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
    toast.success('Tarefa atualizada');
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Tarefa excluída');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status
    });
    setShowTaskForm(true);
  };

  const handleUpdateEditedTask = () => {
    if (!editingTask) return;
    
    if (!newTask.title) {
      toast.error('Por favor, preencha o título da tarefa');
      return;
    }
    
    setTasks(tasks.map(task => 
      task.id === editingTask.id ? { ...task, ...newTask } : task
    ));
    
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'Média',
      status: 'A fazer'
    });
    setShowTaskForm(false);
    toast.success('Tarefa atualizada com sucesso');
  };

  const handleAddCrop = () => {
    if (!newCrop.name) {
      toast.error('Por favor, preencha o nome da cultura');
      return;
    }
    
    const cropToAdd = {
      ...newCrop,
      id: Math.max(0, ...crops.map(c => c.id)) + 1,
      surface: Number(newCrop.surface),
      expectedYield: Number(newCrop.expectedYield)
    };
    
    setCrops([...crops, cropToAdd]);
    setNewCrop({
      name: '',
      variety: '',
      plantingDate: '',
      harvestDate: '',
      status: 'Planejado',
      surface: 0,
      expectedYield: 0,
      notes: ''
    });
    setShowCropForm(false);
    toast.success('Cultura adicionada com sucesso');
  };

  const handleUpdateCrop = (id: number, field: keyof Crop, value: any) => {
    setCrops(crops.map(crop => 
      crop.id === id ? { ...crop, [field]: value } : crop
    ));
    toast.success('Cultura atualizada');
  };

  const handleDeleteCrop = (id: number) => {
    setCrops(crops.filter(crop => crop.id !== id));
    toast.success('Cultura excluída');
  };

  const handleEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setNewCrop({
      name: crop.name,
      variety: crop.variety,
      plantingDate: crop.plantingDate,
      harvestDate: crop.harvestDate,
      status: crop.status,
      surface: crop.surface,
      expectedYield: crop.expectedYield,
      notes: crop.notes
    });
    setShowCropForm(true);
  };

  const handleUpdateEditedCrop = () => {
    if (!editingCrop) return;
    
    if (!newCrop.name) {
      toast.error('Por favor, preencha o nome da cultura');
      return;
    }
    
    setCrops(crops.map(crop => 
      crop.id === editingCrop.id ? { 
        ...crop, 
        ...newCrop,
        surface: Number(newCrop.surface),
        expectedYield: Number(newCrop.expectedYield)
      } : crop
    ));
    
    setEditingCrop(null);
    setNewCrop({
      name: '',
      variety: '',
      plantingDate: '',
      harvestDate: '',
      status: 'Planejado',
      surface: 0,
      expectedYield: 0,
      notes: ''
    });
    setShowCropForm(false);
    toast.success('Cultura atualizada com sucesso');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Baixa': return 'bg-green-100 text-green-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'A fazer': return 'bg-blue-100 text-blue-800';
      case 'Em andamento': return 'bg-purple-100 text-purple-800';
      case 'Concluída': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-4 bg-card hover:shadow-md transition-shadow card-hover">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Planejamento de Culturas</h2>
            <p className="text-muted-foreground">Organize suas tarefas e culturas ao longo do tempo</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => {
                setEditingTask(null);
                setNewTask({
                  title: '',
                  description: '',
                  assignee: '',
                  dueDate: '',
                  priority: 'Média',
                  status: 'A fazer'
                });
                setShowTaskForm(true);
              }}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Tarefa
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setEditingCrop(null);
                setNewCrop({
                  name: '',
                  variety: '',
                  plantingDate: '',
                  harvestDate: '',
                  status: 'Planejado',
                  surface: 0,
                  expectedYield: 0,
                  notes: ''
                });
                setShowCropForm(true);
              }}
              className="flex items-center"
            >
              <Leaf className="mr-2 h-4 w-4" />
              Adicionar Cultura
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Calendário de Tarefas</h3>
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-muted p-4 flex justify-between items-center">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full hover:bg-background"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h4 className="font-medium">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h4>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 rounded-full hover:bg-background"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 bg-muted/50">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7">
                {days.map((dayInfo, index) => {
                  const dateStr = dayInfo.date.toISOString().split('T')[0];
                  const hasTasks = tasks.some(task => task.dueDate === dateStr);
                  
                  return (
                    <div 
                      key={index}
                      className={`min-h-24 p-1 border cursor-pointer transition-colors ${
                        dayInfo.isCurrentMonth 
                          ? 'bg-card hover:bg-muted/50' 
                          : 'bg-muted/30 text-muted-foreground'
                      } ${selectedDate && dayInfo.date.getTime() === selectedDate.getTime() ? 'ring-2 ring-agri-primary' : ''}`}
                      onClick={() => handleDateClick(dayInfo)}
                    >
                      <div className="flex justify-between">
                        <span className={`text-sm p-1 rounded ${
                          dayInfo.isCurrentMonth ? 'font-medium' : ''
                        }`}>
                          {dayInfo.day}
                        </span>
                        {hasTasks && dayInfo.isCurrentMonth && (
                          <span className="w-2 h-2 bg-agri-primary rounded-full mt-1"></span>
                        )}
                      </div>
                      <div className="mt-1 space-y-1">
                        {tasks
                          .filter(task => task.dueDate === dateStr)
                          .slice(0, 2)
                          .map(task => (
                            <div 
                              key={task.id}
                              className={`text-xs p-1 rounded truncate ${
                                task.priority === 'Alta' || task.priority === 'Urgente' 
                                  ? 'bg-red-100 text-red-800' 
                                  : task.priority === 'Média' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                              }`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                        {tasks.filter(task => task.dueDate === dateStr).length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{tasks.filter(task => task.dueDate === dateStr).length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Tarefas Pendentes</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {tasks
                .filter(task => task.status !== 'Concluída')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map(task => (
                  <div key={task.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleEditTask(task)}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-muted px-2 py-1 rounded">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      {task.assignee && (
                        <span className="bg-muted px-2 py-1 rounded">
                          {task.assignee}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTask(task.id, 'status', e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="A fazer">A fazer</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluída">Concluída</option>
                      </select>
                    </div>
                  </div>
                ))}
              {tasks.filter(task => task.status !== 'Concluída').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Leaf className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma tarefa pendente</p>
                  <p className="text-sm mt-1">Adicione uma nova tarefa para começar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border rounded-xl p-6 bg-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Culturas Ativas</h3>
          <Button 
            variant="outline"
            onClick={() => {
              setEditingCrop(null);
              setNewCrop({
                name: '',
                variety: '',
                plantingDate: '',
                harvestDate: '',
                status: 'Planejado',
                surface: 0,
                expectedYield: 0,
                notes: ''
              });
              setShowCropForm(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Cultura
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map(crop => (
            <div key={crop.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium flex items-center">
                    {crop.name}
                    {crop.status === 'Em crescimento' && (
                      <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">{crop.variety}</p>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditCrop(crop)}
                    className="p-1 rounded hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCrop(crop.id)}
                    className="p-1 rounded hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plantio:</span>
                  <span>{new Date(crop.plantingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Colheita:</span>
                  <span>{new Date(crop.harvestDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área:</span>
                  <span>{crop.surface} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rendimento:</span>
                  <span>{crop.expectedYield} t/ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    crop.status === 'Colhendo' ? 'bg-green-100 text-green-800' :
                    crop.status === 'Em crescimento' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {crop.status}
                  </span>
                </div>
              </div>
              
              {crop.notes && (
                <div className="mt-3 pt-2 border-t text-sm">
                  <p className="text-muted-foreground">{crop.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {crops.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Leaf className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma cultura cadastrada</p>
            <p className="text-sm mt-1">Adicione uma nova cultura para começar</p>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {(showTaskForm || editingTask) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingTask ? 'Editar Tarefa' : 'Adicionar Tarefa'}
              </h2>
              <button 
                onClick={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                  setNewTask({
                    title: '',
                    description: '',
                    assignee: '',
                    dueDate: '',
                    priority: 'Média',
                    status: 'A fazer'
                  });
                }}
                className="p-1 rounded hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-title">Título*</Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Ex: Preparar solo para plantio"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="task-description">Descrição</Label>
                <Textarea
                  id="task-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Detalhes da tarefa..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="task-assignee">Responsável</Label>
                <Input
                  id="task-assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  placeholder="Nome do responsável"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-due-date">Data de Vencimento</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="task-priority">Prioridade</Label>
                  <select
                    id="task-priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full mt-1 border rounded px-3 py-2 text-sm"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowTaskForm(false);
                    setEditingTask(null);
                    setNewTask({
                      title: '',
                      description: '',
                      assignee: '',
                      dueDate: '',
                      priority: 'Média',
                      status: 'A fazer'
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={editingTask ? handleUpdateEditedTask : handleAddTask}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingTask ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop Form Modal */}
      {(showCropForm || editingCrop) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingCrop ? 'Editar Cultura' : 'Adicionar Cultura'}
              </h2>
              <button 
                onClick={() => {
                  setShowCropForm(false);
                  setEditingCrop(null);
                  setNewCrop({
                    name: '',
                    variety: '',
                    plantingDate: '',
                    harvestDate: '',
                    status: 'Planejado',
                    surface: 0,
                    expectedYield: 0,
                    notes: ''
                  });
                }}
                className="p-1 rounded hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="crop-name">Nome da Cultura*</Label>
                <Input
                  id="crop-name"
                  value={newCrop.name}
                  onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                  placeholder="Ex: Cana-de-açúcar"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="crop-variety">Variedade</Label>
                <Input
                  id="crop-variety"
                  value={newCrop.variety}
                  onChange={(e) => setNewCrop({...newCrop, variety: e.target.value})}
                  placeholder="Ex: R579"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planting-date">Data de Plantio</Label>
                  <Input
                    id="planting-date"
                    type="date"
                    value={newCrop.plantingDate}
                    onChange={(e) => setNewCrop({...newCrop, plantingDate: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="harvest-date">Data de Colheita</Label>
                  <Input
                    id="harvest-date"
                    type="date"
                    value={newCrop.harvestDate}
                    onChange={(e) => setNewCrop({...newCrop, harvestDate: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crop-surface">Área (ha)</Label>
                  <Input
                    id="crop-surface"
                    type="number"
                    value={newCrop.surface === null || newCrop.surface === undefined ? '' : newCrop.surface}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? newCrop.surface : Number(e.target.value));
                      setNewCrop({...newCrop, surface: val});
                    }}
                    placeholder="0.0"
                    className="mt-1"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="expected-yield">Rendimento Esperado (t/ha)</Label>
                  <Input
                    id="expected-yield"
                    type="number"
                    value={newCrop.expectedYield === null || newCrop.expectedYield === undefined ? '' : newCrop.expectedYield}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? newCrop.expectedYield : Number(e.target.value));
                      setNewCrop({...newCrop, expectedYield: val});
                    }}
                    placeholder="0.0"
                    className="mt-1"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="crop-status">Status</Label>
                <select
                  id="crop-status"
                  value={newCrop.status}
                  onChange={(e) => setNewCrop({...newCrop, status: e.target.value})}
                  className="w-full mt-1 border rounded px-3 py-2 text-sm"
                >
                  <option value="Planejado">Planejado</option>
                  <option value="Plantado">Plantado</option>
                  <option value="Em crescimento">Em crescimento</option>
                  <option value="Colhendo">Colhendo</option>
                  <option value="Colhido">Colhido</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="crop-notes">Notas</Label>
                <Textarea
                  id="crop-notes"
                  value={newCrop.notes}
                  onChange={(e) => setNewCrop({...newCrop, notes: e.target.value})}
                  placeholder="Informações adicionais..."
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowCropForm(false);
                    setEditingCrop(null);
                    setNewCrop({
                      name: '',
                      variety: '',
                      plantingDate: '',
                      harvestDate: '',
                      status: 'Planejado',
                      surface: 0,
                      expectedYield: 0,
                      notes: ''
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={editingCrop ? handleUpdateEditedCrop : handleAddCrop}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingCrop ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Tarefas para {selectedDate.toLocaleDateString()}
              </h2>
              <button 
                onClick={() => setShowTaskDetail(false)}
                className="p-1 rounded hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasksForSelectedDate.length > 0 ? (
                tasksForSelectedDate.map(task => (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleEditTask(task)}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded hover:bg-muted"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex flex-wrap gap-1 text-xs">
                      <span className={`px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      {task.assignee && (
                        <span className="bg-muted px-2 py-0.5 rounded">
                          {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhuma tarefa para esta data</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => {
                  setEditingTask(null);
                  setNewTask({
                    title: '',
                    description: '',
                    assignee: '',
                    dueDate: selectedDate.toISOString().split('T')[0],
                    priority: 'Média',
                    status: 'A fazer'
                  });
                  setShowTaskForm(true);
                  setShowTaskDetail(false);
                }}
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Tarefa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropPlanningForm;

