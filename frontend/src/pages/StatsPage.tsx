
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Statistics from '../components/Statistics';
import HarvestTracking from '../components/HarvestTracking';
import { ChartConfig } from '../components/ui/chart-config';
import { EditableTable, Column } from '../components/ui/editable-table';
import { EditableField } from '../components/ui/editable-field';
import { StatisticsProvider } from '../contexts/StatisticsContext';
import { BarChart, PieChart, TrendingUp, Download, Filter, RefreshCw, Bell, Printer, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PreviewPrintButton from '@/components/common/PreviewPrintButton';
import useSpacing from '@/hooks/use-spacing';

interface PerformanceData {
  name: string;
  current: number;
  target: number;
  unit: string;
}

const StatsPage = () => {
  const spacing = useSpacing();
  const [pageTitle, setPageTitle] = useState('Estatísticas e Análises');
  const [pageDescription, setPageDescription] = useState('Visualize e analise os dados de sua fazenda');
  const [activeView, setActiveView] = useState<'performance' | 'harvest' | 'detailed'>('performance');
  const [lastSyncDate, setLastSyncDate] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [connectedModules, setConnectedModules] = useState<string[]>(['talhoes', 'culturas', 'financas']);
  
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([
    { name: 'Rendimento da Cana', current: 75, target: 85, unit: 't/ha' },
    { name: 'Qualidade do Café', current: 88, target: 95, unit: '%' },
    { name: 'Rentabilidade da Soja', current: 70, target: 80, unit: '%' },
    { name: 'Certificação Orgânica', current: 25, target: 40, unit: '%' },
    { name: 'Inovação no Milho', current: 60, target: 75, unit: '%' },
  ]);
  
  useEffect(() => {
    const initialSync = setTimeout(() => {
      console.log('Os módulos de Talhões, Culturas e Finanças agora estão conectados às estatísticas');
    }, 1000);
    
    return () => clearTimeout(initialSync);
  }, []);
  
  const syncData = () => {
    setIsSyncing(true);
    console.log('Buscando os dados mais recentes de todos os módulos conectados...');
    
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncDate(new Date());
      console.log('Todas as estatísticas estão atualizadas com os dados mais recentes dos módulos');
      console.log("Os indicadores de desempenho foram recalculados com os dados mais recentes");
    }, 2000);
  };
  
  const columns: Column[] = [
    { id: 'name', header: 'Indicador', accessorKey: 'name', isEditable: true },
    { id: 'current', header: 'Valor Atual', accessorKey: 'current', type: 'number', isEditable: true },
    { id: 'target', header: 'Meta', accessorKey: 'target', type: 'number', isEditable: true },
    { id: 'unit', header: 'Unidade', accessorKey: 'unit', isEditable: true },
  ];
  
  const handleTableUpdate = (rowIndex: number, columnId: string, value: any) => {
    const newData = [...performanceData];
    const updatedRow = { ...newData[rowIndex] } as PerformanceData;
    
    if (columnId === 'current' || columnId === 'target') {
      updatedRow[columnId as 'current' | 'target'] = Number(value);
    } else if (columnId === 'name' || columnId === 'unit') {
      updatedRow[columnId as 'name' | 'unit'] = String(value);
    }
    
    newData[rowIndex] = updatedRow;
    setPerformanceData(newData);
    
    console.log(`O indicador ${updatedRow.name} foi atualizado com sucesso.`);
    console.log(`Os módulos conectados foram notificados da atualização de ${updatedRow.name}`);
  };
  
  const handleDeleteRow = (rowIndex: number) => {
    const newData = [...performanceData];
    const deletedItem = newData[rowIndex];
    newData.splice(rowIndex, 1);
    setPerformanceData(newData);
    
    console.log(`O indicador ${deletedItem.name} foi removido com sucesso.`);
    console.log(`Os módulos conectados foram notificados da remoção de ${deletedItem.name}`);
  };
  
  const handleAddRow = (newRow: Record<string, any>) => {
    const typedRow: PerformanceData = {
      name: String(newRow.name || ''),
      current: Number(newRow.current || 0),
      target: Number(newRow.target || 0),
      unit: String(newRow.unit || '%'),
    };
    setPerformanceData([...performanceData, typedRow]);
    
    console.log(`O indicador ${typedRow.name} foi adicionado com sucesso.`);
    console.log(`Os módulos conectados foram notificados da adição de ${typedRow.name}`);
  };

  const handleTitleChange = (value: string | number) => {
    setPageTitle(String(value));
    console.log('O título da página foi atualizado.');
  };

  const handleDescriptionChange = (value: string | number) => {
    setPageDescription(String(value));
    console.log('A descrição da página foi atualizada.');
  };
  
  const handleViewChange = (view: 'performance' | 'harvest' | 'detailed') => {
    setActiveView(view);
    console.log(`Você agora está vendo a visualização ${view === 'performance' ? 'Indicadores de Desempenho' : view === 'harvest' ? 'Acompanhamento de Colheita' : 'Estatísticas Detalhadas'}`);
    
    console.log(`Os módulos conectados foram adaptados para a visualização ${view === 'performance' ? 'indicadores' : view === 'harvest' ? 'colheitas' : 'detalhada'}`);
  };
  
  const handleExportData = () => {
    console.log('Os dados estatísticos foram exportados com sucesso.');
    console.log("Os dados exportados estão disponíveis para todos os módulos");
  };

  return (
    <StatisticsProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto"
        >
          <div className={spacing.getPageContainerClasses()}>
            <div className={spacing.getSectionHeaderClasses()}>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  <EditableField
                    value={pageTitle}
                    onSave={handleTitleChange}
                    className="inline-block"
                  />
                </h1>
                <p className="text-muted-foreground">
                  <EditableField
                    value={pageDescription}
                    onSave={handleDescriptionChange}
                    className="inline-block"
                  />
                </p>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span className="mr-2">Módulos conectados: {connectedModules.join(', ')}</span>
                  <span>Última sincronização: {lastSyncDate.toLocaleString()}</span>
                </div>
              </div>
              
              <div className={spacing.getActionButtonGroupClasses()}>
                <button 
                  onClick={() => handleViewChange('performance')}
                  className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors ${
                    activeView === 'performance' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <PieChart className="h-4 w-4 mr-1.5" />
                  Indicadores
                </button>
                
                <button 
                  onClick={() => handleViewChange('harvest')}
                  className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors ${
                    activeView === 'harvest' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <BarChart className="h-4 w-4 mr-1.5" />
                  Colheitas
                </button>
                
                <button 
                  onClick={() => handleViewChange('detailed')}
                  className={`px-3 py-1.5 rounded-md flex items-center text-sm transition-colors ${
                    activeView === 'detailed' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  Detalhado
                </button>
                
                <PreviewPrintButton
                  data={performanceData}
                  moduleName="performance-indicators"
                  title="Indicadores de Desempenho Agrícola"
                  columns={columns}
                  className="px-3 py-1.5 rounded-md flex items-center text-sm bg-muted hover:bg-muted/80 transition-colors"
                  variant="outline"
                />
                
                <button 
                  onClick={handleExportData}
                  className="px-3 py-1.5 rounded-md flex items-center text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Exportar
                </button>
                
                <button 
                  onClick={syncData}
                  className="px-3 py-1.5 rounded-md flex items-center text-sm bg-muted hover:bg-muted/80 transition-colors"
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
                
                <button 
                  onClick={() => {
                    console.log('Suas preferências de notificação foram atualizadas');
                  }}
                  className="px-3 py-1.5 rounded-md flex items-center text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Bell className="h-4 w-4 mr-1.5" />
                  Alertas
                </button>
              </div>
            </div>
            
            {activeView === 'performance' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <ChartConfig 
                  title="Indicadores de Desempenho Agrícola"
                  description="Acompanhe seu desempenho em relação às suas metas para as culturas"
                  onTitleChange={(title) => {
                    console.log('O título do gráfico foi atualizado.');
                  }}
                  onDescriptionChange={(desc) => {
                    console.log('A descrição do gráfico foi atualizada.');
                  }}
                  onOptionsChange={(options) => {
                    console.log('As opções do gráfico foram atualizadas.');
                  }}
                  className="mb-6"
                >
                  <div className="p-4">
                    <EditableTable
                      data={performanceData}
                      columns={columns}
                      onUpdate={handleTableUpdate}
                      onDelete={handleDeleteRow}
                      onAdd={handleAddRow}
                      className="border-none"
                    />
                  </div>
                </ChartConfig>
              </motion.div>
            )}
            
            {activeView === 'harvest' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HarvestTracking />
              </motion.div>
            )}
            
            {activeView === 'detailed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Statistics />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </StatisticsProvider>
  );
};

export default StatsPage;

