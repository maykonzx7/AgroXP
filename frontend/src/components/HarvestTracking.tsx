
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Filter, Download, BarChart3, Leaf, Tractor, Carrot, ArrowUp, ArrowDown } from 'lucide-react';
import { EditableField } from '@/components/ui/editable-field';
import { EditableTable, Column } from '@/components/ui/editable-table';
import { useCRM } from '../contexts/CRMContext';
import { useStatistics } from '../contexts/StatisticsContext';
import HarvestChart from './dashboard/HarvestChart';
import PreviewPrintButton from '@/components/common/PreviewPrintButton';
import { 
  ResponsiveContainer, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar 
} from 'recharts';

interface HarvestData {
  crop: string;
  currentYield: number;
  previousYield: number;
  unit: string;
  harvestArea: number;
  quality: 'Excelente' | 'Boa' | 'Média' | 'Baixa';
}

const HarvestTracking = () => {
  const { yieldData } = useStatistics();
  const [title, setTitle] = useState('Acompanhamento de Colheitas');
  const [description, setDescription] = useState('Acompanhe os rendimentos e a qualidade das colheitas para as principais culturas');
  
  // Converter os dados de rendimento para se adaptarem ao formato esperado
  const [harvestData, setHarvestData] = useState<HarvestData[]>(
    yieldData.map(item => ({
      crop: item.name,
      currentYield: item.current,
      previousYield: item.previous,
      unit: item.unit,
      harvestArea: item.name === 'Cana de açúcar' ? 12500 :
                   item.name === 'Banana' ? 2300 :
                   item.name === 'Abacaxi' ? 350 :
                   item.name === 'Inhame' ? 420 : 180,
      quality: item.name === 'Banana' ? 'Excelente' :
               item.name === 'Abacaxi' || item.name === 'Cana de açúcar' || item.name === 'Taro' ? 'Boa' : 'Média'
    }))
  );
  
  // Colunas para a tabela editável
  const columns: Column[] = [
    { id: 'crop', header: 'Cultura', accessorKey: 'crop', isEditable: true },
    { id: 'currentYield', header: 'Rendimento atual', accessorKey: 'currentYield', type: 'number', isEditable: true },
    { id: 'previousYield', header: 'Rendimento anterior', accessorKey: 'previousYield', type: 'number', isEditable: true },
    { id: 'unit', header: 'Unidade', accessorKey: 'unit', isEditable: true },
    { id: 'harvestArea', header: 'Área (ha)', accessorKey: 'harvestArea', type: 'number', isEditable: true },
    { id: 'quality', header: 'Qualidade', accessorKey: 'quality', isEditable: true }
  ];
  
  // Handlers
  const handleTitleChange = (value: string | number) => {
    setTitle(String(value));
  };
  
  const handleDescriptionChange = (value: string | number) => {
    setDescription(String(value));
  };
  
  const handleTableUpdate = (rowIndex: number, columnId: string, value: any) => {
    const newData = [...harvestData];
    const updatedRow = { ...newData[rowIndex] };
    
    if (columnId === 'currentYield' || columnId === 'previousYield' || columnId === 'harvestArea') {
      (updatedRow as any)[columnId] = Number(value);
    } else if (columnId === 'crop' || columnId === 'unit' || columnId === 'quality') {
      (updatedRow as any)[columnId] = String(value);
    }
    
    newData[rowIndex] = updatedRow as HarvestData;
    setHarvestData(newData);
    console.log('Dados de colheita atualizados');
  };
  
  const handleDeleteRow = (rowIndex: number) => {
    const newData = [...harvestData];
    newData.splice(rowIndex, 1);
    setHarvestData(newData);
    console.log('Cultura removida do acompanhamento');
  };
  
  const handleAddRow = (newRow: Record<string, any>) => {
    const typedRow: HarvestData = {
      crop: String(newRow.crop || ''),
      currentYield: Number(newRow.currentYield || 0),
      previousYield: Number(newRow.previousYield || 0),
      unit: String(newRow.unit || 't/ha'),
      harvestArea: Number(newRow.harvestArea || 0),
      quality: (newRow.quality as HarvestData['quality']) || 'Média'
    };
    setHarvestData([...harvestData, typedRow]);
    console.log('Nova cultura adicionada ao acompanhamento');
  };
  
  // Dados para o gráfico comparativo
  const chartData = harvestData.map(item => ({
    name: item.crop,
    atual: item.currentYield,
    anterior: item.previousYield,
    diferenca: item.currentYield - item.previousYield,
    unidade: item.unit
  }));

  // Preparar dados para visualização/impressão
  const printData = harvestData.map(item => ({
    cultura: item.crop,
    rendimento_atual: `${item.currentYield} ${item.unit}`,
    rendimento_anterior: `${item.previousYield} ${item.unit}`,
    superficie: `${item.harvestArea} ha`,
    qualidade: item.quality,
    evolucao: `${item.currentYield > item.previousYield ? '+' : ''}${(item.currentYield - item.previousYield)} ${item.unit}`
  }));
  
  // Colunas para visualização/impressão
  const printColumns = [
    { key: "cultura", header: "Cultura" },
    { key: "rendimento_atual", header: "Rendimento atual" },
    { key: "rendimento_anterior", header: "Rendimento anterior" },
    { key: "superficie", header: "Área (ha)" },
    { key: "qualidade", header: "Qualidade" },
    { key: "evolucao", header: "Evolução" }
  ];
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <Tractor className="h-6 w-6 mr-2 text-agri-primary" />
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
            data={printData} 
            moduleName="dados_colheita"
            title={title}
            columns={printColumns}
            variant="outline"
          />
        </div>
        
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === 'diferenca') {
                    return [`${Number(value) > 0 ? '+' : ''}${value} ${props.payload.unidade}`, 'Evolução'];
                  }
                  return [`${value} ${props.payload.unidade}`, name];
                }}
              />
              <Legend />
              <Bar name="Rendimento atual" dataKey="atual" fill="#4CAF50" />
              <Bar name="Rendimento anterior" dataKey="anterior" fill="#8D6E63" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {harvestData.map(item => {
            const change = item.currentYield - item.previousYield;
            const changePercent = ((change / item.previousYield) * 100).toFixed(1);
            const isPositive = change >= 0;
            
            return (
              <div key={item.crop} className="bg-muted/30 rounded-lg p-4 border">
                <h3 className="font-medium mb-1 flex items-center">
                  <Carrot className="h-4 w-4 mr-1.5 text-agri-primary" />
                  {item.crop}
                </h3>
                <div className="text-2xl font-bold">{item.currentYield} {item.unit}</div>
                <div className={`text-sm flex items-center ${isPositive ? 'text-agri-success' : 'text-agri-danger'}`}>
                  {isPositive ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{isPositive ? '+' : ''}{change} {item.unit} ({isPositive ? '+' : ''}{changePercent}%)</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Qualidade: <span className="font-medium">{item.quality}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <EditableTable
          data={harvestData}
          columns={columns}
          onUpdate={handleTableUpdate}
          onDelete={handleDeleteRow}
          onAdd={handleAddRow}
          className="border-none"
        />
      </div>
    </div>
  );
};

export default HarvestTracking;
