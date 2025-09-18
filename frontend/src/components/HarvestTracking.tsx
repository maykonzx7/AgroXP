
import React, { useState } from 'react';
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
  id: number;
  crop: string;
  date: string;
  yield: number;
  expectedYield: number;
  harvestArea: number;
  quality: 'Excelente' | 'Boa' | 'Média' | 'Baixa';
}

const HarvestTracking = () => {
  const [title, setTitle] = useState('Acompanhamento de Colheitas');
  const [description, setDescription] = useState('Acompanhe os rendimentos e a qualidade das colheitas para as principais culturas');
  
  // Mock data for charts
  const [chartData, setChartData] = useState([
    { name: 'Jan', cana: 72, banana: 14, cafe: 1.9, milho: 8.2, soja: 3.1 },
    { name: 'Fev', cana: 74, banana: 14.5, cafe: 2.0, milho: 8.5, soja: 3.2 },
    { name: 'Mar', cana: 75, banana: 15, cafe: 2.1, milho: 8.7, soja: 3.4 },
    { name: 'Abr', cana: 76, banana: 15.2, cafe: 2.1, milho: 8.8, soja: 3.4 },
    { name: 'Mai', cana: 75.5, banana: 15.3, cafe: 2.1, milho: 8.7, soja: 3.4 },
    { name: 'Jun', cana: 75.2, banana: 15.3, cafe: 2.1, milho: 8.7, soja: 3.4 }
  ]);

  const [pieData, setPieData] = useState([
    { name: 'Canas de Açúcar', value: 12.5 },
    { name: 'Bananas', value: 8.3 },
    { name: 'Café', value: 5.2 },
    { name: 'Milho', value: 6.8 },
    { name: 'Soja', value: 4.5 }
  ]);

  // Converter os dados de rendimento para se adaptarem ao formato esperado
  const [harvestData, setHarvestData] = useState<HarvestData[]>([
    { id: 1, crop: 'Canas de Açúcar', date: '2023-06-15', yield: 75.2, expectedYield: 80.5, harvestArea: 12.5, quality: 'Boa' },
    { id: 2, crop: 'Bananas', date: '2023-06-18', yield: 15.3, expectedYield: 16.8, harvestArea: 8.3, quality: 'Excelente' },
    { id: 3, crop: 'Café', date: '2023-06-20', yield: 2.1, expectedYield: 2.3, harvestArea: 5.2, quality: 'Média' },
    { id: 4, crop: 'Milho', date: '2023-06-22', yield: 8.7, expectedYield: 9.2, harvestArea: 6.8, quality: 'Boa' },
    { id: 5, crop: 'Soja', date: '2023-06-25', yield: 3.4, expectedYield: 3.6, harvestArea: 4.5, quality: 'Excelente' }
  ]);

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

  const handleUpdate = (rowIndex: number, columnId: string, value: any) => {
    const newData = [...harvestData];
    const row = newData[rowIndex];
    newData[rowIndex] = { ...row, [columnId]: value };
    setHarvestData(newData);
  };

  const handleDelete = (rowIndex: number) => {
    const newData = [...harvestData];
    newData.splice(rowIndex, 1);
    setHarvestData(newData);
  };

  const handleAdd = (newRow: Record<string, any>) => {
    const newId = Math.max(...harvestData.map(item => item.id), 0) + 1;
    const typedRow: HarvestData = {
      id: newId,
      crop: String(newRow.crop || ''),
      date: String(newRow.date || new Date().toISOString().split('T')[0]),
      yield: Number(newRow.yield || 0),
      expectedYield: Number(newRow.expectedYield || 0),
      harvestArea: Number(newRow.harvestArea || 0),
      quality: newRow.quality || 'Média'
    };
    setHarvestData([...harvestData, typedRow]);
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">
              <EditableField
                value={title}
                onSave={handleTitleChange}
                className="inline-block"
              />
            </h2>
            <p className="text-muted-foreground">
              <EditableField
                value={description}
                onSave={handleDescriptionChange}
                className="inline-block"
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
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Rendimento por Cultura</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cana" name="Canas de Açúcar" fill="#4CAF50" />
                <Bar dataKey="banana" name="Bananas" fill="#FFC107" />
                <Bar dataKey="cafe" name="Café" fill="#795548" />
                <Bar dataKey="milho" name="Milho" fill="#FF9800" />
                <Bar dataKey="soja" name="Soja" fill="#8BC34A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
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

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Dados de Colheita</h3>
          <EditableTable
            data={harvestData}
            columns={columns}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </div>
      </div>
    </div>
  );
};

export default HarvestTracking;
