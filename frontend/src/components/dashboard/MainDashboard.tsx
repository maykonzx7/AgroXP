import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowDown,
  RefreshCw
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

const Dashboard = () => {
  const { getModuleData, syncDataAcrossCRM, exportModuleData, importModuleData, isRefreshing } = useCRM();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  // Get data from CRM modules
  const financeData = getModuleData('finances')?.items || [];
  const parcelData = getModuleData('parcelles')?.items || [];
  const cropData = getModuleData('cultures')?.items || [];
  const livestockData = getModuleData('livestock')?.items || [];
  const inventoryData = getModuleData('inventaire')?.items || [];
  
  // Generate revenue data based on actual financial data
  const generateRevenueData = (finances) => {
    // Create an array with the last 12 months
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const revenueData = [];
    
    // Initialize with zero values for all months
    for (let i = 0; i < 12; i++) {
      revenueData.push({
        month: months[i],
        revenue: 0
      });
    }
    
    // Process financial data to populate monthly revenue
    finances.forEach(transaction => {
      if (transaction.type === 'income' || transaction.type === 'revenue') {
        const date = new Date(transaction.date);
        const monthIndex = date.getMonth(); // 0-11
        
        if (monthIndex < 12) {
          revenueData[monthIndex].revenue += transaction.amount || 0;
        }
      }
    });
    
    return revenueData;
  };
  
  // Generate production data based on actual crop and livestock data
  const generateProductionData = (crops, livestock) => {
    const productionData = [];
    
    // Process crop data
    const cropTypes = {};
    crops.forEach(crop => {
      const type = crop.name || 'Outros';
      cropTypes[type] = (cropTypes[type] || 0) + (crop.quantity || 0);
    });
    
    // Process livestock data
    const livestockTypes = {};
    livestock.forEach(animal => {
      const type = animal.name || 'Outros';
      livestockTypes[type] = (livestockTypes[type] || 0) + (animal.quantity || 0);
    });
    
    // Combine and format data
    Object.entries(cropTypes).forEach(([name, value]) => {
      productionData.push({ name, value });
    });
    
    Object.entries(livestockTypes).forEach(([name, value]) => {
      productionData.push({ name, value });
    });
    
    return productionData;
  };
  
  // State for editable content
  const [title, setTitle] = useState('Olá, Agricultor Brasileiro');
  const [description, setDescription] = useState('Este é um resumo da sua fazenda');
  const [currentMonth, setCurrentMonth] = useState(new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));
  
  // Stats cards
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [cultivatedArea, setCultivatedArea] = useState(0);
  const [parcelsCount, setParcelsCount] = useState(0);
  const [averageYield, setAverageYield] = useState(0);
  const [yieldGrowth, setYieldGrowth] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  
  // Charts data
  const [revenueData, setRevenueData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  
  // Tasks and alerts (these can remain as initial data since they're not from CRM)
  const [upcomingTasks, setUpcomingTasks] = useState([
    { id: 1, title: 'Colheita da soja', due: 'Hoje', priority: 'high', status: 'pending' },
    { id: 2, title: 'Comprar sementes de milho', due: 'Amanhã', priority: 'medium', status: 'pending' },
    { id: 3, title: 'Manutenção do trator', due: '28/08', priority: 'low', status: 'pending' },
    { id: 4, title: 'Irrigação da lavoura de café', due: '30/08', priority: 'medium', status: 'pending' },
  ]);
  
  const [alerts, setAlerts] = useState([
    { id: 1, message: 'Nível baixo de sementes de milho', type: 'warning' },
    { id: 2, message: 'Risco de geada para a próxima semana', type: 'danger' },
    { id: 3, message: 'Prazo de financiamento agrícola se aproximando', type: 'info' },
  ]);
  
  const [weatherAlerts, setWeatherAlerts] = useState([
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
  ]);
  
  // Harvest tracking
  const [harvestData, setHarvestData] = useState([
    { id: 1, crop: 'Soja', quantity: 1200, unit: 'toneladas', date: '2024-08-15', status: 'completed' },
    { id: 2, crop: 'Milho', quantity: 850, unit: 'toneladas', date: '2024-08-20', status: 'in_progress' },
    { id: 3, crop: 'Café', quantity: 420, unit: 'sacas', date: '2024-09-05', status: 'pending' },
  ]);
  
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
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  
  // Update data when CRM data changes
  useEffect(() => {
    // Update revenue data
    const newRevenueData = generateRevenueData(financeData);
    setRevenueData(newRevenueData);
    
    // Calculate monthly revenue
    const currentMonthIndex = new Date().getMonth();
    const currentMonthRevenue = newRevenueData[currentMonthIndex]?.revenue || 0;
    setMonthlyRevenue(currentMonthRevenue);
    
    // Calculate revenue growth (simplified)
    const previousMonthRevenue = currentMonthIndex > 0 ? 
      newRevenueData[currentMonthIndex - 1]?.revenue || 0 : 
      newRevenueData[11]?.revenue || 0;
    
    if (previousMonthRevenue > 0) {
      const growth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
      setRevenueGrowth(parseFloat(growth.toFixed(1)));
    } else {
      setRevenueGrowth(0);
    }
    
    // Update production data
    const newProductionData = generateProductionData(cropData, livestockData);
    setProductionData(newProductionData);
    
    // Update parcel stats
    setCultivatedArea(parcelData.reduce((total, parcel) => total + (parcel.size || 0), 0));
    setParcelsCount(parcelData.length);
    
    // Update yield stats (simplified)
    const totalYield = cropData.reduce((total, crop) => total + (crop.yield || 0), 0);
    const average = cropData.length > 0 ? totalYield / cropData.length : 0;
    setAverageYield(parseFloat(average.toFixed(1)));
    
    // Update alerts count
    setAlertsCount(alerts.length + weatherAlerts.length);
  }, [financeData, parcelData, cropData, livestockData, alerts, weatherAlerts]);
  
  // Handle changes
  const handleTitleChange = (value) => {
    setTitle(String(value));
    toast.success('Título atualizado');
  };
  
  const handleDescriptionChange = (value) => {
    setDescription(String(value));
    toast.success('Descrição atualizada');
  };
  
  const handleMonthChange = (value) => {
    setCurrentMonth(String(value));
    toast.success('Mês atualizado');
  };
  
  // Task management
  const handleEditTask = (taskId) => {
    const task = upcomingTasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setEditedTaskTitle(task.title);
    }
  };
  
  const handleSaveTask = (taskId) => {
    if (editedTaskTitle.trim() === '') return;
    
    setUpcomingTasks(upcomingTasks.map(task => 
      task.id === taskId ? { ...task, title: editedTaskTitle } : task
    ));
    setEditingTask(null);
    toast.success('Tarefa atualizada');
  };
  
  const handleDeleteTask = (taskId) => {
    setUpcomingTasks(upcomingTasks.filter(task => task.id !== taskId));
    toast.success('Tarefa removida');
  };
  
  const handleAddTask = () => {
    const newId = Math.max(0, ...upcomingTasks.map(t => t.id)) + 1;
    const newTask = {
      id: newId,
      title: 'Nova tarefa',
      due: new Date().toLocaleDateString('pt-BR'),
      priority: 'medium',
      status: 'pending'
    };
    
    setUpcomingTasks([...upcomingTasks, newTask]);
    toast.success('Nova tarefa adicionada');
  };
  
  const handleCompleteTask = (taskId) => {
    setUpcomingTasks(upcomingTasks.map(task => 
      task.id === taskId ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } : task
    ));
    toast.success('Status da tarefa atualizado');
  };
  
  // Alert management
  const handleEditAlert = (id, message) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, message } : alert
    ));
    toast.success('Alerta atualizado');
  };
  
  const handleDeleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    setAlertsCount(prev => prev - 1);
    toast.success('Alerta removido');
  };
  
  // Weather alert management
  const handleDeleteWeatherAlert = (id) => {
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
  
  // Harvest tracking
  const handleAddHarvest = () => {
    const newId = Math.max(...harvestData.map(h => h.id), 0) + 1;
    const newHarvest = {
      id: newId,
      crop: 'Nova colheita',
      quantity: 0,
      unit: 'toneladas',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    
    setHarvestData([...harvestData, newHarvest]);
    toast.success('Registro de colheita adicionado');
  };
  
  const handleUpdateHarvest = (id, field, value) => {
    setHarvestData(harvestData.map(harvest => 
      harvest.id === id ? { ...harvest, [field]: value } : harvest
    ));
  };
  
  const handleDeleteHarvest = (id) => {
    setHarvestData(harvestData.filter(harvest => harvest.id !== id));
    toast.success('Registro de colheita removido');
  };
  
  // Add transaction handler (navigate to finances page)
  const handleAddTransaction = () => {
    // Navigate to the finance page
    navigate('/financas');
  };
  
  // Export data handler
  const handleExportData = async () => {
    try {
      // Export all modules
      const modules = ['finances', 'parcelles', 'cultures', 'livestock', 'inventaire'];
      let successCount = 0;
      
      for (const module of modules) {
        const success = await exportModuleData(module, 'csv');
        if (success) successCount++;
      }
      
      if (successCount > 0) {
        toast.success(`Dados exportados com sucesso (${successCount}/${modules.length} módulos)`);
      } else {
        toast.error('Falha ao exportar dados');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar dados');
    }
  };
  
  // Import data handler
  const handleImportData = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // For simplicity, we'll import to the finances module
        // In a real app, you might want to detect the module based on file content
        const success = await importModuleData('finances', file);
        
        if (success) {
          toast.success('Dados importados com sucesso');
          // Refresh data
          syncDataAcrossCRM();
        } else {
          toast.error('Falha ao importar dados');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Erro ao importar dados');
      } finally {
        // Reset input
        event.target.value = '';
      }
    }
  };
  
  // Sync data handler
  const handleSyncData = () => {
    syncDataAcrossCRM();
    toast.success('Dados sincronizados com sucesso');
  };
  
  // Get priority color for tasks
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status color for harvest
  const getHarvestStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportData}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center"
            >
              <Upload className="h-4 w-4 mr-1" />
              Importar
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleImportData}
                className="hidden"
              />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSyncData}
              disabled={isRefreshing}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          </div>
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
              <span className="inline-block font-bold">{monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
            <span className={`text-sm font-medium flex items-center ${revenueGrowth >= 0 ? 'text-agri-success' : 'text-agri-danger'}`}>
              {revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="stat-card card-hover">
          <p className="stat-label">Área Cultivada</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value flex items-baseline">
              <span className="inline-block font-bold">{cultivatedArea.toFixed(2)}</span>&nbsp;ha
            </p>
            <span className="text-agri-primary text-sm font-medium flex items-baseline">
              {parcelsCount}&nbsp;talhões
            </span>
          </div>
        </div>
        
        <div className="stat-card card-hover">
          <p className="stat-label">Rendimento Médio</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value flex items-baseline">
              <span className="inline-block font-bold">{averageYield.toFixed(2)}</span>&nbsp;t/ha
            </p>
            <span className={`text-sm font-medium flex items-center ${yieldGrowth >= 0 ? 'text-agri-success' : 'text-agri-danger'}`}>
              {yieldGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {yieldGrowth >= 0 ? '+' : ''}{yieldGrowth.toFixed(1)}%
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

      {/* Harvest Tracking Section */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Acompanhamento de Colheita</h2>
          <Button 
            onClick={handleAddHarvest}
            className="bg-agri-primary hover:bg-agri-primary-dark"
          >
            <Plus size={16} className="mr-2" /> Adicionar Colheita
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Registre e acompanhe suas colheitas em tempo real
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Cultura</th>
                <th className="px-4 py-3 text-left">Quantidade</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {harvestData.map((harvest) => (
                <tr key={harvest.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={harvest.crop}
                      onChange={(e) => handleUpdateHarvest(harvest.id, 'crop', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent hover:border-muted-foreground focus:border-agri-primary focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={harvest.quantity}
                        onChange={(e) => handleUpdateHarvest(harvest.id, 'quantity', Number(e.target.value))}
                        className="w-20 bg-transparent border-b border-transparent hover:border-muted-foreground focus:border-agri-primary focus:outline-none"
                      />
                      <select
                        value={harvest.unit}
                        onChange={(e) => handleUpdateHarvest(harvest.id, 'unit', e.target.value)}
                        className="ml-2 bg-transparent border-b border-transparent hover:border-muted-foreground focus:border-agri-primary focus:outline-none"
                      >
                        <option value="toneladas">toneladas</option>
                        <option value="sacas">sacas</option>
                        <option value="quilos">quilos</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={harvest.date}
                      onChange={(e) => handleUpdateHarvest(harvest.id, 'date', e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-muted-foreground focus:border-agri-primary focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={harvest.status}
                      onChange={(e) => handleUpdateHarvest(harvest.id, 'status', e.target.value)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getHarvestStatusColor(harvest.status)}`}
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em andamento</option>
                      <option value="completed">Concluído</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteHarvest(harvest.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {harvestData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                    Nenhum registro de colheita disponível
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              {weatherAlerts.map((alert) => (
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
            <div className="flex space-x-2">
              <button 
                onClick={handleAddTask}
                className="text-xs text-agri-primary hover:underline flex items-center"
              >
                <Plus size={14} className="mr-1" /> Adicionar
              </button>
              <button className="text-xs text-agri-primary hover:underline">Ver todas</button>
            </div>
          </div>
          
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center p-2 rounded-lg hover:bg-muted ${task.status === 'completed' ? 'opacity-70' : ''}`}
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
                      <div className="flex items-center">
                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                          {task.title}
                        </p>
                        {task.status === 'completed' && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Concluído
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Prazo: {task.due}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex">
                  {editingTask !== task.id && (
                    <>
                      <button 
                        className="p-1.5 hover:bg-muted rounded" 
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        <Check className={`h-4 w-4 ${task.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`} />
                      </button>
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