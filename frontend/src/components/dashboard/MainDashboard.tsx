import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Wheat, 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  LineChart, 
  MapPin, 
  Users, 
  Clock, 
  Filter, 
  Wallet, 
  Plus,
  CloudRain,
  Wind,
  Trash2,
  Check,
  X,
  Edit,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Upload,
  FileUp,
  Download,
  Camera,
  Layers,
  Save,
  Tractor,
  Carrot,
  CloudLightning,
  PlusCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { EditableField } from '@/components/ui/editable-field';
import { Button } from '@/components/ui/button';
import { useCRM } from '../../contexts/CRMContext';
import { 
  Input 
} from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ResponsiveContainer, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Area, 
  BarChart, 
  Bar, 
  Line, 
  Legend 
} from 'recharts';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import PreviewPrintButton from '@/components/common/PreviewPrintButton';

// Dados de exemplo para gráficos - Adaptado para o Brasil
const revenueData = [
  { month: 'Jan', revenue: 15000 },
  { month: 'Fev', revenue: 22000 },
  { month: 'Mar', revenue: 25000 },
  { month: 'Abr', revenue: 28000 },
  { month: 'Mai', revenue: 32000 },
  { month: 'Jun', revenue: 35000 },
  { month: 'Jul', revenue: 40000 },
];

const productionData = [
  { name: 'Soja', value: 40 },
  { name: 'Milho', value: 25 },
  { name: 'Café', value: 15 },
  { name: 'Algodão', value: 10 },
  { name: 'Outros', value: 10 },
];

// Lista de tarefas adaptada ao contexto brasileiro
const initialUpcomingTasks = [
  { id: 1, title: 'Colheita da soja', due: 'Hoje', priority: 'high' },
  { id: 2, title: 'Comprar sementes de milho', due: 'Amanhã', priority: 'medium' },
  { id: 3, title: 'Manutenção do trator', due: '28/08', priority: 'low' },
  { id: 4, title: 'Irrigação da lavoura de café', due: '30/08', priority: 'medium' },
];

// Alertas para agricultores no Brasil
const initialAlerts = [
  { id: 1, message: 'Nível baixo de sementes de milho', type: 'warning' },
  { id: 2, message: 'Risco de geada para a próxima semana', type: 'danger' },
  { id: 3, message: 'Prazo de financiamento agrícola se aproximando', type: 'info' },
];

// Dados de alertas meteorológicos
const initialWeatherAlerts = [
  { 
    id: 1, 
    type: 'Geada', 
    region: 'Sul e Sudeste', 
    startDate: '2024-07-10', 
    endDate: '2024-07-12', 
    severity: 'crítica', 
    description: 'Risco de geada forte em áreas de baixada' 
  },
  { 
    id: 2, 
    type: 'Chuva Forte', 
    region: 'Centro-Oeste', 
    startDate: '2024-09-20', 
    endDate: '2024-09-23', 
    severity: 'moderada', 
    description: 'Precipitação intensa esperada, com risco de alagamentos' 
  }
];

const Dashboard = () => {
  // State for editable content
  const [title, setTitle] = useState('Olá, Agricultor Brasileiro');
  const [description, setDescription] = useState('Este é um resumo da sua fazenda');
  const [currentMonth, setCurrentMonth] = useState('Agosto 2024');
  
  // Stats cards
  const [monthlyRevenue, setMonthlyRevenue] = useState(15450);
  const [revenueGrowth, setRevenueGrowth] = useState(8.5);
  const [cultivatedArea, setCultivatedArea] = useState(35);
  const [parcelsCount, setParcelsCount] = useState(5);
  const [averageYield, setAverageYield] = useState(75);
  const [yieldGrowth, setYieldGrowth] = useState(5.2);
  const [alertsCount, setAlertsCount] = useState(3);
  
  // Tasks and alerts
  const [upcomingTasks, setUpcomingTasks] = useState(initialUpcomingTasks);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [weatherAlerts, setWeatherAlerts] = useState(initialWeatherAlerts);
  
  // New alert dialog
  const [showAddAlertDialog, setShowAddAlertDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'Geada',
    region: '',
    startDate: '',
    endDate: '',
    severity: 'moderada',
    description: ''
  });
  
  // Task editing state
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  
  // Handle changes
  const handleTitleChange = (value: string | number) => {
    setTitle(String(value));
    toast.success('Título atualizado');
  };
  
  const handleDescriptionChange = (value: string | number) => {
    setDescription(String(value));
    toast.success('Descrição atualizada');
  };
  
  const handleMonthChange = (value: string | number) => {
    setCurrentMonth(String(value));
    toast.success('Mês atualizado');
  };
  
  // Stat card updates
  const handleRevenueChange = (value: string | number) => {
    setMonthlyRevenue(Number(value));
    toast.success('Receita mensal atualizada');
  };
  
  const handleRevenueGrowthChange = (value: string | number) => {
    setRevenueGrowth(Number(value));
    toast.success('Crescimento da receita atualizado');
  };
  
  const handleAreaChange = (value: string | number) => {
    setCultivatedArea(Number(value));
    toast.success('Área cultivada atualizada');
  };
  
  const handleParcelsCountChange = (value: string | number) => {
    setParcelsCount(Number(value));
    toast.success('Número de talhões atualizado');
  };
  
  const handleYieldChange = (value: string | number) => {
    setAverageYield(Number(value));
    toast.success('Rendimento médio atualizado');
  };
  
  const handleYieldGrowthChange = (value: string | number) => {
    setYieldGrowth(Number(value));
    toast.success('Crescimento do rendimento atualizado');
  };
  
  // Task management
  const handleEditTask = (taskId: number) => {
    const task = upcomingTasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditedTaskTitle(task.title);
    }
  };
  
  const handleSaveTask = (taskId: number) => {
    if (editedTaskTitle.trim() === '') return;
    
    setUpcomingTasks(upcomingTasks.map(task => 
      task.id === taskId ? { ...task, title: editedTaskTitle } : task
    ));
    setEditingTask(null);
    toast.success('Tarefa atualizada');
  };
  
  const handleDeleteTask = (taskId: number) => {
    setUpcomingTasks(upcomingTasks.filter(task => task.id !== taskId));
    toast.success('Tarefa removida');
  };
  
  // Alert management
  const handleEditAlert = (id: number, message: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, message } : alert
    ));
    toast.success('Alerta atualizado');
  };
  
  const handleDeleteAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    setAlertsCount(prev => prev - 1);
    toast.success('Alerta removido');
  };
  
  // Weather alert management
  const handleDeleteWeatherAlert = (id: number) => {
    setWeatherAlerts(weatherAlerts.filter(alert => alert.id !== id));
    toast.success('Alerta meteorológico removido');
  };
  
  const handleAddWeatherAlert = () => {
    // Validation
    if (!newAlert.region || !newAlert.startDate || !newAlert.endDate || !newAlert.description) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    const newId = Math.max(...weatherAlerts.map(a => a.id), 0) + 1;
    const alertToAdd = {
      id: newId,
      ...newAlert
    };
    
    setWeatherAlerts([...weatherAlerts, alertToAdd]);
    setShowAddAlertDialog(false);
    setNewAlert({
      type: 'Geada',
      region: '',
      startDate: '',
      endDate: '',
      severity: 'moderada',
      description: ''
    });
    
    toast.success('Novo alerta meteorológico adicionado');
  };
  
  // Add transaction handler (placeholder for future implementation)
  const handleAddTransaction = () => {
    toast.info('Redirecionando para a página de finanças');
    // In a real app, this would navigate to the finance page
  };
  
  return (
    <div className="p-6 space-y-6 animate-enter">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            <EditableField
              value={title}
              onSave={handleTitleChange}
              className="inline-block"
              showEditIcon={true}
            />
          </h1>
          <p className="text-muted-foreground">
            <EditableField
              value={description}
              onSave={handleDescriptionChange}
              className="inline-block"
              showEditIcon={true}
            />
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm text-agri-primary font-medium bg-agri-primary/10 rounded-lg hover:bg-agri-primary/20 transition-colors">
            <Calendar className="h-4 w-4 inline mr-2" />
            <EditableField
              value={currentMonth}
              onSave={handleMonthChange}
              className="inline-block"
            />
          </button>
          <button 
            className="px-4 py-2 text-sm bg-agri-primary text-white rounded-lg hover:bg-agri-primary-dark transition-colors"
            onClick={handleAddTransaction}
          >
            <Wallet className="h-4 w-4 inline mr-2" />
            Adicionar Transação
          </button>
        </div>
      </header>

      {/* Quick Stats Row - Adaptado à agricultura brasileira */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card card-hover">
          <p className="stat-label">Receita Mensal</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value flex items-baseline">
              R$&nbsp;
              <EditableField
                value={monthlyRevenue}
                type="number"
                onSave={handleRevenueChange}
                className="inline-block font-bold"
              />
            </p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +
              <EditableField
                value={revenueGrowth}
                type="number"
                onSave={handleRevenueGrowthChange}
                className="inline-block"
              />%
            </span>
          </div>
        </div>
        
        <div className="stat-card card-hover">
          <p className="stat-label">Área Cultivada</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value flex items-baseline">
              <EditableField
                value={cultivatedArea}
                type="number"
                onSave={handleAreaChange}
                className="inline-block font-bold"
              />&nbsp;ha
            </p>
            <span className="text-agri-primary text-sm font-medium flex items-baseline">
              <EditableField
                value={parcelsCount}
                type="number"
                onSave={handleParcelsCountChange}
                className="inline-block"
              />&nbsp;talhões
            </span>
          </div>
        </div>
        
        <div className="stat-card card-hover">
          <p className="stat-label">Rendimento Médio</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value flex items-baseline">
              <EditableField
                value={averageYield}
                type="number"
                onSave={handleYieldChange}
                className="inline-block font-bold"
              />&nbsp;t/ha
            </p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +
              <EditableField
                value={yieldGrowth}
                type="number"
                onSave={handleYieldGrowthChange}
                className="inline-block"
              />%
            </span>
          </div>
        </div>
        
        <div className="stat-card card-hover">
          <p className="stat-label">Alertas</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{alertsCount}</p>
            <span className="text-agri-warning text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" /> Recentes
            </span>
          </div>
        </div>
      </div>

      {/* Weather alerts section */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Alertas Meteorológicos</h2>
          <Button 
            onClick={() => setShowAddAlertDialog(true)}
            className="bg-agri-primary hover:bg-agri-primary-dark"
          >
            <Plus size={16} className="mr-2" /> Adicionar Alerta
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Acompanhe os alertas meteorológicos que impactam a agricultura no Brasil
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Região</th>
                <th className="px-4 py-3 text-left">Período</th>
                <th className="px-4 py-3 text-left">Severidade</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {weatherAlerts.map(alert => (
                <tr key={alert.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 flex items-center">
                    {alert.type === 'Geada' ? (
                      <span className="flex items-center text-blue-500">
                        <CloudRain size={16} className="mr-1" /> {alert.type}
                      </span>
                    ) : alert.type === 'Chuva Forte' ? (
                      <span className="flex items-center text-blue-500">
                        <CloudRain size={16} className="mr-1" /> {alert.type}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Wind size={16} className="mr-1" /> {alert.type}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <EditableField
                      value={alert.region}
                      onSave={(value) => {
                        setWeatherAlerts(weatherAlerts.map(a => 
                          a.id === alert.id ? { ...a, region: String(value) } : a
                        ));
                        toast.success('Região atualizada');
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div>
                        <span className="text-xs text-muted-foreground">Início:</span>
                        <EditableField
                          value={alert.startDate}
                          type="date"
                          onSave={(value) => {
                            setWeatherAlerts(weatherAlerts.map(a => 
                              a.id === alert.id ? { ...a, startDate: String(value) } : a
                            ));
                            toast.success('Data de início atualizada');
                          }}
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Fim:</span>
                        <EditableField
                          value={alert.endDate}
                          type="date"
                          onSave={(value) => {
                            setWeatherAlerts(weatherAlerts.map(a => 
                              a.id === alert.id ? { ...a, endDate: String(value) } : a
                            ));
                            toast.success('Data de fim atualizada');
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      alert.severity === 'crítica' 
                        ? 'bg-red-100 text-red-800' 
                        : alert.severity === 'moderada'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      <EditableField
                        value={alert.severity}
                        onSave={(value) => {
                          setWeatherAlerts(weatherAlerts.map(a => 
                            a.id === alert.id ? { ...a, severity: String(value) } : a
                          ));
                          toast.success('Severidade atualizada');
                        }}
                      />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EditableField
                      value={alert.description}
                      onSave={(value) => {
                        setWeatherAlerts(weatherAlerts.map(a => 
                          a.id === alert.id ? { ...a, description: String(value) } : a
                        ));
                        toast.success('Descrição atualizada');
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteWeatherAlert(alert.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {weatherAlerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">
                    Nenhum alerta meteorológico disponível
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="dashboard-card col-span-full lg:col-span-2 card-hover">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Receita Mensal</h3>
            <div className="flex space-x-2">
              <button className="text-xs px-3 py-1.5 bg-muted rounded-md text-foreground">2024</button>
              <button className="text-xs px-3 py-1.5 text-muted-foreground hover:bg-muted rounded-md">2023</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value/1000}k`} />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4CAF50" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 8 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Production Distribution - Adaptado às culturas brasileiras */}
        <div className="dashboard-card card-hover">
          <h3 className="font-semibold mb-4">Distribuição da Produção</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productionData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={80} 
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                <Bar 
                  dataKey="value" 
                  fill="#8D6E63" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks - Adaptado ao contexto agrícola brasileiro */}
        <div className="dashboard-card card-hover">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Próximas Tarefas</h3>
            <button className="text-xs text-agri-primary hover:underline">Ver todas</button>
          </div>
          
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center p-2 rounded-lg hover:bg-muted"
              >
                <div 
                  className={`w-2 h-2 rounded-full mr-3 ${
                    task.priority === 'high' 
                      ? 'bg-agri-danger' 
                      : task.priority === 'medium' 
                        ? 'bg-agri-warning' 
                        : 'bg-agri-success'
                  }`}
                />
                <div className="flex-1">
                  {editingTask === task.id ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editedTaskTitle}
                        onChange={(e) => setEditedTaskTitle(e.target.value)}
                        className="border rounded px-2 py-1 text-sm w-full"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleSaveTask(task.id)}
                        className="ml-2 p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setEditingTask(null)}
                        className="ml-1 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Prazo: {task.due}</p>
                    </>
                  )}
                </div>
                <div className="flex">
                  {editingTask !== task.id && (
                    <>
                      <button 
                        className="p-1.5 hover:bg-muted rounded" 
                        onClick={() => handleEditTask(task.id)}
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-muted rounded text-red-500" 
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhuma tarefa futura</p>
            )}
          </div>
        </div>
        
        {/* Alerts - Adaptado à agricultura no Brasil */}
        <div className="dashboard-card card-hover">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Alertas</h3>
            <button className="text-xs text-agri-primary hover:underline">Gerenciar Alertas</button>
          </div>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg ${
                  alert.type === 'danger' 
                    ? 'bg-agri-danger/10 border-l-4 border-agri-danger dark:bg-agri-danger/20 dark:border-agri-danger' 
                    : alert.type === 'warning' 
                      ? 'bg-agri-warning/10 border-l-4 border-agri-warning dark:bg-agri-warning/20 dark:border-agri-warning' 
                      : 'bg-agri-info/10 border-l-4 border-agri-info dark:bg-agri-info/20 dark:border-agri-info'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <AlertTriangle className={`h-5 w-5 mr-2 ${
                      alert.type === 'danger' 
                        ? 'text-agri-danger' 
                        : alert.type === 'warning' 
                          ? 'text-agri-warning' 
                          : 'text-agri-info'
                    }`} />
                    <EditableField 
                      value={alert.message} 
                      onSave={(value) => handleEditAlert(alert.id, String(value))}
                      className="text-sm"
                    />
                  </div>
                  <button 
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Nenhum alerta ativo</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Weather Alert Dialog */}
      <Dialog open={showAddAlertDialog} onOpenChange={setShowAddAlertDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Alerta Meteorológico</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="alertType" className="text-right">
                Tipo
              </Label>
              <select
                id="alertType"
                value={newAlert.type}
                onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Geada">Geada</option>
                <option value="Chuva Forte">Chuva Forte</option>
                <option value="Seca">Seca</option>
                <option value="Vento Forte">Vento Forte</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Região
              </Label>
              <Input
                id="region"
                value={newAlert.region}
                onChange={(e) => setNewAlert({...newAlert, region: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Data de Início
              </Label>
              <Input
                id="startDate"
                type="date"
                value={newAlert.startDate}
                onChange={(e) => setNewAlert({...newAlert, startDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Data de Fim
              </Label>
              <Input
                id="endDate"
                type="date"
                value={newAlert.endDate}
                onChange={(e) => setNewAlert({...newAlert, endDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="severity" className="text-right">
                Severidade
              </Label>
              <select
                id="severity"
                value={newAlert.severity}
                onChange={(e) => setNewAlert({...newAlert, severity: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="baixa">Baixa</option>
                <option value="moderada">Moderada</option>
                <option value="crítica">Crítica</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                value={newAlert.description}
                onChange={(e) => setNewAlert({...newAlert, description: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAlertDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddWeatherAlert}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;