
import React, { useState } from 'react';
import { PlusCircle, Download, Filter, RefreshCw, Upload, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PageLayout from '../components/layout/PageLayout';
import Dashboard from '../components/dashboard/MainDashboard';
import TabContainer, { TabItem } from '../components/layout/TabContainer';
import HarvestTracking from '../components/HarvestTracking';
import WeatherAlerts from '../components/WeatherAlerts';
import TaskList from '../components/cultures/TaskList';

import { StatisticsProvider } from '../contexts/StatisticsContext';
import { useCRM } from '../contexts/CRMContext';
import useSpacing from '../hooks/use-spacing';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userName, setUserName] = useState('Operador');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const spacing = useSpacing();
  
  // Usar o contexto do CRM
  const { 
    lastSync,
    isRefreshing,
    syncDataAcrossCRM,
    exportModuleData,
    importModuleData,
    printModuleData
  } = useCRM();

  // Ações baseadas na aba ativa
  const getTabActions = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={syncDataAcrossCRM}
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => exportModuleData('dashboard', 'pdf')}
            >
              <Download className="h-4 w-4 text-gray-600" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => printModuleData('dashboard')}
            >
              <Printer className="h-4 w-4 text-gray-600" />
              Imprimir
            </Button>
          </div>
        );
      case 'harvest':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => exportModuleData('harvest', 'csv')}
            >
              <Download className="h-4 w-4 text-gray-600" />
              Exportar CSV
            </Button>
            <Button
              className="flex items-center gap-2 bg-agri-primary hover:bg-agri-primary-dark transition-colors"
              onClick={() => console.log('Adicionando novo registro de colheita')}
            >
              <PlusCircle className="h-4 w-4" />
              Nova colheita
            </Button>
          </div>
        );
      case 'weather':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => console.log('Atualizando alertas meteorológicos')}
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => exportModuleData('weather', 'pdf')}
            >
              <Download className="h-4 w-4 text-gray-600" />
              Exportar alertas
            </Button>
          </div>
        );
      case 'tasks':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => console.log('Filtrando tarefas')}
            >
              <Filter className="h-4 w-4 text-gray-600" />
              Filtrar
            </Button>
            <Button
              className="flex items-center gap-2 bg-agri-primary hover:bg-agri-primary-dark transition-colors"
              onClick={() => console.log('Adicionando nova tarefa')}
            >
              <PlusCircle className="h-4 w-4" />
              Nova tarefa
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportConfirm = () => {
    if (selectedFile) {
      importModuleData('dashboard', selectedFile);
      setImportDialogOpen(false);
      setSelectedFile(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    console.log(`Aba "${value}" selecionada`);
  };

  const tabs: TabItem[] = [
    {
      value: 'dashboard',
      label: 'Painel de Controle',
      content: (
        <StatisticsProvider>
          <Dashboard />
        </StatisticsProvider>
      )
    },
    {
      value: 'harvest',
      label: 'Acompanhamento de Colheitas',
      content: <HarvestTracking />
    },
    {
      value: 'weather',
      label: 'Alertas Meteorológicos',
      content: <WeatherAlerts />
    },
    {
      value: 'tasks',
      label: 'Lista de Tarefas',
      content: <TaskList />
    }
  ];

  return (
    <PageLayout>
      <div className={spacing.getPageContainerClasses()}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bem-vindo, {userName}</h1>
            <p className="text-muted-foreground">
              Aqui está um resumo das atividades da sua propriedade
            </p>
          </div>
          {getTabActions()}
        </div>

        <TabContainer 
          tabs={tabs}
          defaultValue={activeTab}
          onValueChange={handleTabChange}
        />

        {/* Import Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar dados</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">
                Selecione um arquivo para importar dados para o dashboard:
              </p>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file">Arquivo</Label>
                <input 
                  id="file" 
                  type="file" 
                  onChange={handleFileChange}
                  className="border rounded p-2"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImportConfirm} disabled={!selectedFile}>
                Importar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Index;

