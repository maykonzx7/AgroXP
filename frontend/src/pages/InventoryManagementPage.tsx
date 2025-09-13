import React, { useState, useRef } from 'react';
import PageLayout from '../components/layout/PageLayout';
import PageHeader from '../components/layout/PageHeader';
import TabContainer, { TabItem } from '../components/layout/TabContainer';
import Inventory from '../components/Inventory';
import SpecificCrops from '../components/SpecificCrops';
import HarvestTracking from '../components/HarvestTracking';
import WeatherAlerts from '../components/WeatherAlerts';
import { Button } from '../components/ui/button';
import { Download, Plus, Upload, FileUp, FileDown, BarChart2, Calendar, Package } from 'lucide-react';
import { CalendarDateRangePicker } from '../components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { useToast } from "@/hooks/use-toast";
import usePageMetadata from '../hooks/use-page-metadata';
import { downloadInventoryTemplate } from '../components/inventory/ImportExportFunctions';
import { StatisticsProvider } from '../contexts/StatisticsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import useSpacing from '@/hooks/use-spacing';

const InventoryPage = () => {
  const { toast: shadowToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('inventory');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    title, 
    description, 
    handleTitleChange, 
    handleDescriptionChange 
  } = usePageMetadata({
    defaultTitle: 'Gestão de Estoques e Colheitas',
    defaultDescription: 'Gerencie seu inventário e acompanhe os níveis de estoque de suas culturas'
  });
  
  const spacing = useSpacing();

  const handleExportData = () => {
    if (activeTab === 'inventory') {
      console.log("Exportação de dados do inventário iniciada");
    } else if (activeTab === 'crops') {
      console.log("Exportação de dados de culturas");
    } else if (activeTab === 'weather') {
      console.log("Exportação de dados meteorológicos");
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`Importando o arquivo ${file.name}`);
    
    // Redefinir o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddItem = () => {
    const actionText = activeTab === 'inventory' ? 'estoque' : 
                      activeTab === 'crops' ? 'cultura' : 
                      activeTab === 'weather' ? 'alerta' : 'item';
                      
    console.log(`Funcionalidade de adicionar ${actionText} ativada`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Passar o termo de pesquisa para o componente ativo usando contexto ou props
  };

  const handleDownloadTemplate = () => {
    downloadInventoryTemplate();
    console.log("Baixando o modelo de inventário");
  };

  const renderTabActions = () => {
    return (
      <div className={spacing.getActionButtonGroupClasses()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap transition-colors hover:bg-gray-100">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border shadow-lg">
            <DropdownMenuItem onClick={handleExportData} className="cursor-pointer">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportData} className="cursor-pointer">
              <BarChart2 className="mr-2 h-4 w-4" />
              Exportar PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap transition-colors hover:bg-gray-100">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border shadow-lg">
            <DropdownMenuItem onClick={handleImportClick} className="cursor-pointer">
              <FileUp className="mr-2 h-4 w-4" />
              Importar um arquivo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDownloadTemplate} className="cursor-pointer">
              <Package className="mr-2 h-4 w-4" />
              Baixar modelo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv"
          className="hidden" 
        />
        
        <Button 
          onClick={handleAddItem} 
          className="whitespace-nowrap transition-colors hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === 'inventory' ? 'Adicionar estoque' : 
           activeTab === 'crops' ? 'Adicionar cultura' : 
           activeTab === 'weather' ? 'Adicionar alerta' : 'Adicionar'}
        </Button>
      </div>
    );
  };

  const renderFilterArea = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-3 w-full"
      >
        <div className="relative flex-grow">
          <Input 
            placeholder={`Pesquisar em ${activeTab === 'inventory' ? 'inventário' : activeTab === 'crops' ? 'culturas' : 'alertas'}`} 
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="w-full md:w-[300px]">
          <CalendarDateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            placeholderText="Filtrar por data"
          />
        </div>
      </motion.div>
    );
  };

  const cropsContent = (
    <StatisticsProvider>
      <div className="space-y-8">
        <SpecificCrops />
        <HarvestTracking />
      </div>
    </StatisticsProvider>
  );

  const tabs: TabItem[] = [
    {
      value: 'inventory',
      label: 'Inventário',
      content: <Inventory dateRange={dateRange} searchTerm={searchTerm} />
    },
    {
      value: 'crops',
      label: 'Culturas',
      content: cropsContent
    },
    {
      value: 'weather',
      label: 'Meteorologia',
      content: <WeatherAlerts />
    }
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const tabLabels = {
      inventory: 'o Inventário',
      crops: 'as Culturas',
      weather: 'os Alertas Meteorológicos'
    };
    
    console.log(`Você está agora visualizando ${tabLabels[value as keyof typeof tabLabels] || value}`);
  };

  return (
    <PageLayout>
      <div className={spacing.getPageContainerClasses()}>
        <PageHeader 
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          actions={renderTabActions()}
          icon={<Package className="h-6 w-6" />}
          filterArea={renderFilterArea()}
        />

        <TabContainer 
          tabs={tabs} 
          defaultValue={activeTab} 
          onValueChange={handleTabChange} 
        />
      </div>
    </PageLayout>
  );
};

export default InventoryPage;
