import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useCRM } from '@/contexts/CRMContext';
import { useAuth } from '@/contexts/AuthContext';
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
import MainCropsCard from '@/components/organisms/crops/MainCropsCard';

const Dashboard = () => {
  const { getModuleData, syncDataAcrossCRM, exportModuleData, importModuleData, addData, updateData, deleteData, updateModuleData, isRefreshing } = useCRM();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Get data from CRM modules - memoized to prevent infinite loops
  // Create stable comparison keys based on content (IDs and length)
  const financeDataRaw = getModuleData('finances')?.items || [];
  const parcelDataRaw = getModuleData('parcelles')?.items || [];
  const cropDataRaw = getModuleData('cultures')?.items || [];
  const livestockDataRaw = getModuleData('livestock')?.items || [];
  const inventoryDataRaw = getModuleData('inventaire')?.items || [];
  const harvestDataRaw = getModuleData('harvest')?.items || [];

  // Create stable keys for comparison
  const financeKey = financeDataRaw.length === 0 ? 'empty' : `${financeDataRaw.length}-${financeDataRaw.map(item => item.id || item._id || '').filter(Boolean).sort().join(',')}`;
  const parcelKey = parcelDataRaw.length === 0 ? 'empty' : `${parcelDataRaw.length}-${parcelDataRaw.map(item => item.id || item._id || '').filter(Boolean).sort().join(',')}`;
  const cropKey = cropDataRaw.length === 0 ? 'empty' : `${cropDataRaw.length}-${cropDataRaw.map(item => item.id || item._id || '').filter(Boolean).sort().join(',')}`;
  const livestockKey = livestockDataRaw.length === 0 ? 'empty' : `${livestockDataRaw.length}-${livestockDataRaw.map(item => item.id || item._id || '').filter(Boolean).sort().join(',')}`;
  const inventoryKey = inventoryDataRaw.length === 0 ? 'empty' : `${inventoryDataRaw.length}-${inventoryDataRaw.map(item => item.id || item._id || '').filter(Boolean).sort().join(',')}`;
  const harvestKey = harvestDataRaw.length === 0 ? 'empty' : `${harvestDataRaw.length}-${harvestDataRaw.map(item => item.id || item._id || '').filter(Boolean).sort().join(',')}`;

  const financeData = useMemo(() => financeDataRaw, [financeKey]);
  const parcelData = useMemo(() => parcelDataRaw, [parcelKey]);
  const cropData = useMemo(() => cropDataRaw, [cropKey]);
  const livestockData = useMemo(() => livestockDataRaw, [livestockKey]);
  const inventoryData = useMemo(() => inventoryDataRaw, [inventoryKey]);
  const harvestDataFromCRM = useMemo(() => harvestDataRaw, [harvestKey]);

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
    (Array.isArray(crops) ? crops : []).forEach(crop => {
      const type = crop.name || 'Outros';
      cropTypes[type] = (cropTypes[type] || 0) + (crop.quantity || 0);
    });

    // Process livestock data
    const livestockTypes = {};
    (Array.isArray(livestock) ? livestock : []).forEach(animal => {
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
  const [description, setDescription] = useState('Este é um resumo da sua fazenda');
  const [currentMonth, setCurrentMonth] = useState(new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));

  // Título sempre baseado no nome do usuário (não editável)
  const title = `Olá, ${user?.name || 'Agricultor Brasileiro'}`;

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

  // Tasks and alerts - loaded from API
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [harvestData, setHarvestData] = useState([]);

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

    // Update yield stats (incluindo dados de colheitas)
    const cropYieldTotal = cropData.reduce((total, crop) => total + (crop.yield || 0), 0);
    const harvestYieldTotal = harvestDataFromCRM.reduce((total, harvest) => total + (harvest.yield || harvest.quantity || 0), 0);
    const totalYield = cropYieldTotal + harvestYieldTotal;
    const totalRecords = cropData.length + harvestDataFromCRM.length;
    const average = totalRecords > 0 ? totalYield / totalRecords : 0;
    setAverageYield(parseFloat(average.toFixed(1)));

    // Update harvest data with actual harvest records from crop data
    // Only if we don't have dedicated harvest module data
    // This prevents overwriting harvest data loaded from the harvest module
    setHarvestData(prev => {
      // Check if we have harvest data from the harvest module (has real IDs, not generated)
      const hasHarvestModuleData = prev.length > 0 && prev.some(h => {
        const id = h.id?.toString() || '';
        // Real IDs from backend are usually UUIDs or cuid, not 'harvest-{number}'
        return id && !id.startsWith('harvest-') && id.length > 10;
      });
      
      // If we have harvest module data, don't overwrite with crop data
      if (hasHarvestModuleData) {
        return prev;
      }
      
      // Otherwise, use crop data as fallback
      const harvestFromCrops = cropData
        .filter(crop => crop.type === 'harvest' || crop.harvestDate)
        .map((crop, index) => ({
          id: crop.id || `harvest-${index}`,
          crop: crop.name || crop.crop || crop.nom || 'Cultura Desconhecida',
          quantity: crop.quantity || crop.quantite || crop.yield || 0,
          unit: crop.unit || 'toneladas',
          date: crop.harvestDate || crop.date || crop.dateRecolte || new Date().toISOString().split('T')[0],
          status: crop.harvestStatus || crop.status || crop.statutRecolte || 'completed'
        }));
      
      // Only update if data actually changed
      const prevIds = prev.map(h => h.id).sort().join(',');
      const newIds = harvestFromCrops.map(h => h.id).sort().join(',');
      if (prevIds !== newIds || prev.length !== harvestFromCrops.length) {
        return harvestFromCrops;
      }
      return prev;
    });
  }, [financeData, parcelData, cropData, livestockData]);

  // Update alerts count separately to avoid dependency issues
  useEffect(() => {
    setAlertsCount(alerts.length + weatherAlerts.length);
  }, [alerts.length, weatherAlerts.length]);

  // Initialize and update harvest data from CRM when data changes
  useEffect(() => {
    if (harvestDataFromCRM && harvestDataFromCRM.length > 0) {
      const harvestRecords = harvestDataFromCRM
        .map((harvest, index) => {
          // Format date properly - handle both Date objects and strings
          let formattedDate = new Date().toISOString().split('T')[0];
          if (harvest.date) {
            if (harvest.date instanceof Date) {
              formattedDate = harvest.date.toISOString().split('T')[0];
            } else if (typeof harvest.date === 'string') {
              // If it's already a string, use it directly (assuming YYYY-MM-DD format)
              formattedDate = harvest.date.split('T')[0]; // Remove time if present
            }
          } else if (harvest.harvestDate) {
            if (harvest.harvestDate instanceof Date) {
              formattedDate = harvest.harvestDate.toISOString().split('T')[0];
            } else if (typeof harvest.harvestDate === 'string') {
              formattedDate = harvest.harvestDate.split('T')[0];
            }
          }

          return {
            id: harvest.id || `harvest-${index}`,
            crop: harvest.crop || harvest.name || 'Cultura Desconhecida',
            quantity: harvest.yield || harvest.quantity || harvest.quantite || 0,
            unit: harvest.unit || 'toneladas',
            date: formattedDate,
            status: harvest.status || 'completed'
          };
        });
      
      // Only update if data actually changed to avoid infinite loops
      setHarvestData(prev => {
        const prevIds = prev.map(h => h.id).sort().join(',');
        const newIds = harvestRecords.map(h => h.id).sort().join(',');
        if (prevIds !== newIds || prev.length !== harvestRecords.length) {
          return harvestRecords;
        }
        return prev;
      });
    } else if (harvestDataFromCRM && harvestDataFromCRM.length === 0) {
      // Clear harvest data if CRM data is empty
      setHarvestData([]);
    }
  }, [harvestKey, harvestDataFromCRM]);

  // Handle changes
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

  const handleCompleteTask = (taskId) => {
    setUpcomingTasks(upcomingTasks.map(task =>
      task.id === taskId ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } : task
    ));
    toast.success('Status da tarefa atualizado');
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

  // State for harvest form
  const [showAddHarvestDialog, setShowAddHarvestDialog] = useState(false);
  const [newHarvest, setNewHarvest] = useState({
    crop: '',
    quantity: 0,
    unit: 'toneladas',
    date: new Date().toISOString().split('T')[0],
    quality: 'Média', // Qualidade em português para exibição
    harvestArea: 1 // Área de colheita em hectares (obrigatório pelo backend)
  });

  // Harvest tracking
  const handleAddHarvest = async () => {
    // Validation
    if (!newHarvest.crop || newHarvest.quantity <= 0 || !newHarvest.harvestArea || newHarvest.harvestArea <= 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios (cultura, quantidade e área)');
      return;
    }

    try {
      // Mapear qualidade de português para inglês (formato esperado pelo backend)
      const qualityMap: Record<string, string> = {
        'Excelente': 'EXCELLENT',
        'Boa': 'GOOD',
        'Média': 'AVERAGE',
        'Baixa': 'LOW'
      };
      
      // Criar um objeto de colheita com os campos apropriados para o modelo Harvest
      // O backend espera: crop, date, yield, expectedYield, harvestArea, quality (em inglês)
      const harvestRecord = {
        crop: newHarvest.crop,
        date: newHarvest.date,
        yield: newHarvest.quantity,
        expectedYield: newHarvest.quantity, // Assuming same as actual yield for now
        harvestArea: newHarvest.harvestArea || 1, // Área em hectares (obrigatório, mínimo 0.01)
        quality: qualityMap[newHarvest.quality || 'Média'] || 'AVERAGE' // Convert to English enum
      };

      // Adicionar ao módulo de colheita
      const savedHarvest = await addData('harvest', harvestRecord);

      // Sincronizar dados do CRM para garantir que os dados atualizados sejam carregados
      syncDataAcrossCRM();
      
      setShowAddHarvestDialog(false);
      setNewHarvest({
        crop: '',
        quantity: 0,
        unit: 'toneladas',
        date: new Date().toISOString().split('T')[0],
        quality: 'Média',
        harvestArea: 1
      });
      toast.success('Registro de colheita adicionado e salvo no banco de dados');
    } catch (error) {
      console.error('Erro ao salvar colheita:', error);
      toast.error('Erro ao salvar o registro de colheita no banco de dados');
    }
  };

  const handleHarvestInputChange = (field, value) => {
    setNewHarvest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateHarvest = async (id, field, value) => {
    try {
      // Update the item in the CRM context (sincronização automática)
      await updateData('harvest', id, { [field]: value });
    } catch (error) {
      console.error('Erro ao atualizar colheita:', error);
      toast.error('Erro ao atualizar o registro de colheita no banco de dados');
    }
  };

  const handleDeleteHarvest = async (id) => {
    try {
      // Delete the item from the CRM context (sincronização automática)
      await deleteData('harvest', id);
      toast.success('Registro de colheita removido do banco de dados');
    } catch (error) {
      console.error('Erro ao deletar colheita:', error);
      toast.error('Erro ao remover o registro de colheita do banco de dados');
    }
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
  const handleSyncData = async () => {
    try {
      await syncDataAcrossCRM();
      toast.success('Dados sincronizados com sucesso');
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast.error('Erro ao sincronizar dados');
    }
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

  // Calculate parcel statistics for dashboard
  const calculateParcelStats = () => {
    const activeParcels = parcelData.filter(parcel => parcel.status === 'active').length;
    const totalArea = parcelData.reduce((total, parcel) => {
      const size = parcel.size || parcel.area || 0;
      // Ensure size is a number
      const numSize = typeof size === 'number' ? size : parseFloat(size) || 0;
      return total + numSize;
    }, 0);
    const totalParcels = parcelData.length;

    // Obter culturas principais
    const cropCounts = {};
    parcelData.forEach(parcel => {
      const cropName = parcel.crop || parcel.culture || 'Não especificado';
      cropCounts[cropName] = (cropCounts[cropName] || 0) + 1;
    });

    // Obter as 3 culturas mais comuns
    const mainCrops = Object.entries(cropCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([crop, count]) => ({ name: crop, count }));

    // Calcular rendimento médio (usando dados de culturas e colheitas)
    // Primeiro, somar rendimentos do módulo de culturas
    const cropYieldTotal = cropData.reduce((total, crop) => {
      const yieldVal = crop.yield || crop.quantity || 0;
      const numYield = typeof yieldVal === 'number' ? yieldVal : parseFloat(yieldVal) || 0;
      return total + numYield;
    }, 0);
    
    // Depois, somar rendimentos do módulo de colheitas (harvest)
    const harvestYieldTotal = harvestDataFromCRM.reduce((total, harvest) => {
      const yieldVal = harvest.yield || harvest.quantity || 0;
      const numYield = typeof yieldVal === 'number' ? yieldVal : parseFloat(yieldVal) || 0;
      return total + numYield;
    }, 0);
    
    // Calcular média considerando ambos os módulos
    const totalYield = cropYieldTotal + harvestYieldTotal;
    const totalRecords = cropData.length + harvestDataFromCRM.length;
    const avgYield = totalRecords > 0 ? totalYield / totalRecords : 0;

    return {
      totalArea: Number(totalArea).toFixed(2),
      activeParcels,
      totalParcels,
      avgYield: Number(avgYield).toFixed(2),
      mainCrops
    };
  };

  const parcelStats = calculateParcelStats();

  return (
    <div className="p-6 space-y-6 animate-enter">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {title}
          </h1>
          <p className="text-muted-foreground">
            <EditableField
              value={description}
              onSave={handleDescriptionChange}
              className="inline-block"
              showEditIcon={true}
              asSpan={true}
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

      {/* Quick Stats Row - Com estatísticas atualizadas e personalizadas */}
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
          <p className="stat-label">Área Total</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value flex items-baseline">
              <span className="inline-block font-bold">{parcelStats.totalArea}</span>&nbsp;ha
            </p>
            <span className="text-agri-primary text-sm font-medium flex items-baseline">
              {parcelStats.totalParcels}&nbsp;talhões
            </span>
          </div>
        </div>

        <div className="stat-card card-hover">
          <p className="stat-label">Parcelas Ativas</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">{parcelStats.activeParcels}</p>
            <span className="text-agri-success text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />&nbsp;12%
            </span>
          </div>
        </div>

        <div className="stat-card card-hover">
          <p className="stat-label">Cultura Principal</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="stat-value">
              {parcelStats.mainCrops.length > 0 ? parcelStats.mainCrops[0]?.name : 'Nenhuma'}
            </p>
            <span className="text-agri-warning text-sm font-medium flex items-center">
              {parcelStats.mainCrops.length > 0 ? `(${parcelStats.mainCrops[0]?.count} talhões)` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Principais Culturas Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MainCropsCard maxCrops={5} showArea={true} />
        </div>
        <div className="lg:col-span-2">
          {/* Espaço para futuras expansões ou outros componentes */}
        </div>
      </div>

      {/* Harvest Tracking Section */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Acompanhamento de Colheita</h2>
          <Button
            onClick={() => setShowAddHarvestDialog(true)}
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
                        value={harvest.quantity === null || harvest.quantity === undefined ? '' : harvest.quantity}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? harvest.quantity : Number(e.target.value));
                          handleUpdateHarvest(harvest.id, 'quantity', val);
                        }}
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
          Acompanhe os alertas meteorológicos e proteja sua produção
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
              <button className="text-xs px-3 py-1.5 bg-muted rounded-md text-foreground">2025</button>
              <button className="text-xs px-3 py-1.5 text-muted-foreground hover:bg-muted rounded-md">2025</button>
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

      {/* Add Harvest Dialog */}
      <Dialog open={showAddHarvestDialog} onOpenChange={setShowAddHarvestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Registro de Colheita</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="crop" className="text-right">
                Cultura
              </Label>
              <Input
                id="crop"
                value={newHarvest.crop}
                onChange={(e) => handleHarvestInputChange('crop', e.target.value)}
                className="col-span-3"
                placeholder="Nome da cultura"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantidade
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={newHarvest.quantity}
                onChange={(e) => handleHarvestInputChange('quantity', parseFloat(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unidade
              </Label>
              <select
                id="unit"
                value={newHarvest.unit}
                onChange={(e) => handleHarvestInputChange('unit', e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="toneladas">toneladas</option>
                <option value="sacas">sacas</option>
                <option value="quilos">quilos</option>
                <option value="gramas">gramas</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={newHarvest.date}
                onChange={(e) => handleHarvestInputChange('date', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="harvestArea" className="text-right">
                Área (ha)
              </Label>
              <Input
                id="harvestArea"
                type="number"
                step="0.01"
                min="0.01"
                value={newHarvest.harvestArea}
                onChange={(e) => handleHarvestInputChange('harvestArea', parseFloat(e.target.value) || 1)}
                className="col-span-3"
                placeholder="Área colhida em hectares"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quality" className="text-right">
                Qualidade
              </Label>
              <select
                id="quality"
                value={newHarvest.quality}
                onChange={(e) => handleHarvestInputChange('quality', e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Excelente">Excelente</option>
                <option value="Boa">Boa</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddHarvestDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddHarvest}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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