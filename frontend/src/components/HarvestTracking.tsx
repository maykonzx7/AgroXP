
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Filter, Download, BarChart3, Leaf, Tractor, Carrot, ArrowUp, ArrowDown, MapPin } from 'lucide-react';
import { EditableField } from '@/components/ui/editable-field';
import { EditableTable, Column } from '@/components/ui/editable-table';
import { useCRM } from '../contexts/CRMContext';
import PreviewPrintButton from '@/components/common/PreviewPrintButton';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface HarvestData {
  id: string;
  crop: string;
  date: string;
  yield: number;
  expectedYield: number;
  harvestArea: number;
  quality: 'Excelente' | 'Boa' | 'Média' | 'Baixa';
}

const HarvestTracking = () => {
  const { getModuleData, addData, updateData, deleteData } = useCRM();
  const [title, setTitle] = useState('Acompanhamento de Colheitas');
  const [description, setDescription] = useState('Acompanhe os rendimentos e a qualidade das colheitas para as principais culturas');
  
  // Load harvest data from CRM context
  const [harvestData, setHarvestData] = useState<HarvestData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  // Load data from CRM on component mount
  useEffect(() => {
    const data = getModuleData('harvest')?.items || [];
    setHarvestData(data);
  }, [getModuleData]);
  
  // Update chart data based on harvest data
  useEffect(() => {
    // Prepare chart data aggregated by month
    const monthlyData: any = {};
    harvestData.forEach(item => {
      const month = new Date(item.date).toLocaleString('pt-BR', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { name: month };
      }
      // Group by crop type, in a real app you'd aggregate by crop
      const cropKey = item.crop.toLowerCase().replace(/\s+/g, '');
      if (!monthlyData[month][cropKey]) {
        monthlyData[month][cropKey] = 0;
      }
      monthlyData[month][cropKey] += item.yield;
    });
    
    setChartData(Object.values(monthlyData));
    
    // Prepare pie chart data by crop distribution
    const cropDistribution: any = {};
    harvestData.forEach(item => {
      if (!cropDistribution[item.crop]) {
        cropDistribution[item.crop] = 0;
      }
      cropDistribution[item.crop] += item.harvestArea;
    });
    
    setPieData(Object.entries(cropDistribution).map(([name, value]) => ({ name, value })));
  }, [harvestData]);

  const columns: Column[] = [
    { id: 'crop', header: 'Cultura', accessorKey: 'crop', isEditable: true },
    { id: 'date', header: 'Data da Colheita', accessorKey: 'date', isEditable: true },
    { id: 'yield', header: 'Rendimento (t/ha)', accessorKey: 'yield', type: 'number', isEditable: true },
    { id: 'expectedYield', header: 'Esperado (t/ha)', accessorKey: 'expectedYield', type: 'number', isEditable: true },
    { id: 'harvestArea', header: 'Área Colhida (ha)', accessorKey: 'harvestArea', type: 'number', isEditable: true },
    { 
      id: 'quality', 
      header: 'Qualidade', 
      accessorKey: 'quality', 
      type: 'select',
      options: ['Excelente', 'Boa', 'Média', 'Baixa'],
      isEditable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'Excelente' ? 'bg-green-100 text-green-800' :
          value === 'Boa' ? 'bg-blue-100 text-blue-800' :
          value === 'Média' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const handleUpdate = async (rowIndex: number, columnId: string, value: any) => {
    try {
      // Get the actual harvest record to update by ID
      const harvestRecord = harvestData[rowIndex];
      if (harvestRecord) {
        await updateData('harvest', harvestRecord.id, { [columnId]: value });
        // Refresh data from CRM
        const updatedData = getModuleData('harvest')?.items || [];
        setHarvestData(updatedData);
      }
    } catch (error) {
      console.error("Error updating harvest data:", error);
    }
  };

  const handleDelete = async (rowIndex: number) => {
    try {
      // Get the actual harvest record to delete by ID
      const harvestRecord = harvestData[rowIndex];
      if (harvestRecord) {
        await deleteData('harvest', harvestRecord.id);
        // Refresh data from CRM
        const updatedData = getModuleData('harvest')?.items || [];
        setHarvestData(updatedData);
      }
    } catch (error) {
      console.error("Error deleting harvest data:", error);
    }
  };

  const handleAdd = async (newRow: Record<string, any>) => {
    try {
      // Validar campos obrigatórios antes de adicionar
      const crop = String(newRow.crop || '').trim();
      if (!crop) {
        alert('Por favor, preencha o campo "Cultura" antes de adicionar.');
        return;
      }

      const yieldValue = Number(newRow.yield || 0);
      const expectedYieldValue = Number(newRow.expectedYield || 0);
      const harvestAreaValue = Number(newRow.harvestArea || 0);

      if (harvestAreaValue <= 0) {
        alert('Por favor, preencha a área colhida (deve ser maior que zero).');
        return;
      }

      const newHarvestData = {
        crop: crop,
        date: String(newRow.date || new Date().toISOString().split('T')[0]),
        yield: yieldValue > 0 ? yieldValue : expectedYieldValue, // Usar expectedYield como fallback
        expectedYield: expectedYieldValue > 0 ? expectedYieldValue : yieldValue, // Usar yield como fallback
        harvestArea: harvestAreaValue,
        quality: newRow.quality || 'Média'
      };
      
      await addData('harvest', newHarvestData);
      // Refresh data from CRM
      const updatedData = getModuleData('harvest')?.items || [];
      setHarvestData(updatedData);
    } catch (error) {
      console.error("Error adding harvest data:", error);
      alert(`Erro ao adicionar colheita: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleTitleChange = (value: string | number) => {
    setTitle(String(value));
  };

  const handleDescriptionChange = (value: string | number) => {
    setDescription(String(value));
  };

  // Função para calcular totais
  const calculateTotals = () => {
    return harvestData.reduce((acc, item) => {
      acc.totalYield += item.yield;
      acc.totalArea += item.harvestArea;
      acc.averageQuality = Math.round((acc.averageQuality * (harvestData.length - 1) + 
        (item.quality === 'Excelente' ? 4 : item.quality === 'Boa' ? 3 : item.quality === 'Média' ? 2 : 1)) / harvestData.length);
      return acc;
    }, { totalYield: 0, totalArea: 0, averageQuality: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">
              <EditableField
                value={title}
                onSave={handleTitleChange}
                className="inline-block"
                asSpan={true}
              />
            </h2>
            <p className="text-muted-foreground">
              <EditableField
                value={description}
                onSave={handleDescriptionChange}
                className="inline-block"
                asSpan={true}
              />
            </p>
          </div>
          <PreviewPrintButton
            data={harvestData}
            moduleName="harvest-tracking"
            title="Acompanhamento de Colheitas"
            columns={columns}
            variant="outline"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-muted-foreground">Rendimento Total</p>
                <p className="text-2xl font-bold">{totals.totalYield.toFixed(1)} t</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-500 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-muted-foreground">Área Colhida</p>
                <p className="text-2xl font-bold">{totals.totalArea.toFixed(1)} ha</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-muted-foreground">Qualidade Média</p>
                <p className="text-2xl font-bold">
                  {totals.averageQuality === 4 ? 'Excelente' : 
                   totals.averageQuality === 3 ? 'Boa' : 
                   totals.averageQuality === 2 ? 'Média' : 'Baixa'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Rendimento por Cultura</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {/* Dynamically render bars for each crop type found in the data */}
                {chartData.length > 0 && Object.keys(chartData[0])
                  .filter(key => key !== 'name')
                  .map((cropKey, index) => {
                    const colors = ['#4CAF50', '#FFC107', '#795548', '#FF9800', '#8BC34A', '#2196F3', '#E91E63', '#9C27B0'];
                    return (
                      <Bar 
                        key={cropKey} 
                        dataKey={cropKey} 
                        name={cropKey.charAt(0).toUpperCase() + cropKey.slice(1)} 
                        fill={colors[index % colors.length]} 
                      />
                    );
                  })
                }
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Área</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} ha`, 'Área']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Previsão de Colheita</h3>
          <EditableTable
            data={harvestData}
            columns={columns}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAdd={handleAdd}
            requiredFields={['crop']}
          />
        </div>
      </div>
    </div>
  );
};

export default HarvestTracking;
