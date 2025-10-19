
import React, { useState, useRef } from 'react';
import PageLayout from '../components/layout/PageLayout';
import PageHeader from '../components/layout/PageHeader';
import TabContainer, { TabItem } from '../components/layout/TabContainer';
import { Button } from '../components/ui/button';
import { Download, Plus, Upload, FileUp, FileDown, BarChart2, Calendar, Package, Leaf } from 'lucide-react';
import { CalendarDateRangePicker } from '../components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { useToast } from "@/hooks/use-toast";
import usePageMetadata from '../hooks/use-page-metadata';
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
import SpecificCrops from '@/components/SpecificCrops';
import CropPlanning from '@/components/cultures/CropPlanningForm';
import TaskList from '@/components/cultures/TaskList';
import { useCRM } from '../contexts/CRMContext';

const CropsManagementPage = () => {
  const { toast: shadowToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('specific');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    title, 
    description, 
    handleTitleChange, 
    handleDescriptionChange,
    exportModuleData,
    importModuleData
  } = usePageMetadata({
    defaultTitle: 'Gestão de Culturas',
    defaultDescription: 'Gerencie suas culturas, planeje o calendário agrícola e acompanhe as tarefas'
  });
  
  const spacing = useSpacing();

  const handleExportData = async () => {
    try {
      const success = await exportModuleData('cultures', 'excel');
      if (success) {
        console.log("Dados exportados com sucesso");
      } else {
        console.log("Erro ao exportar dados");
      }
    } catch (error) {
      console.error("Erro na exportação:", error);
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
    const actionText = activeTab === 'specific' ? 'cultura' : 
                      activeTab === 'planning' ? 'planejamento' : 
                      'tarefa';
                      
    console.log(`Funcionalidade de adicionar ${actionText} ativada`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Passar o termo de pesquisa para o componente ativo usando contexto ou props
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
          {activeTab === 'specific' ? 'Adicionar Cultura' : 
           activeTab === 'planning' ? 'Novo Planejamento' : 
           'Nova Tarefa'}
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
            placeholder={`Pesquisar ${activeTab === 'specific' ? 'culturas' : activeTab === 'planning' ? 'planejamentos' : 'tarefas'}`} 
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

  const tabs: TabItem[] = [
    {
      value: 'specific',
      label: 'Culturas Específicas',
      content: <SpecificCrops searchTerm={searchTerm} dateRange={dateRange} />
    },
    {
      value: 'planning',
      label: 'Planejamento',
      content: <CropPlanning />
    },
    {
      value: 'tasks',
      label: 'Lista de Tarefas',
      content: <TaskList />
    }
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const tabLabels = {
      specific: 'as Culturas Específicas',
      planning: 'o Planejamento',
      tasks: 'a Lista de Tarefas'
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
          icon={<Leaf className="h-6 w-6" />}
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

export default CropsManagementPage;
