
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Plus, Filter, RefreshCw, CalendarRange, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import PageLayout from '../components/layout/PageLayout';
import PageHeader from '../components/layout/PageHeader';
import TabContainer, { TabItem } from '../components/layout/TabContainer';
import LivestockTracking from '../components/LivestockTracking';
import SpecificLivestock from '../components/SpecificLivestock';
import LivestockPlanning from '../components/LivestockPlanning';
import FeedingManagement from '../components/FeedingManagement';
import VaccinationManagement from '../components/VaccinationManagement';
import ReproductionManagement from '../components/ReproductionManagement';
import VeterinarySupplyManagement from '../components/VeterinarySupplyManagement';
import SupplyUsageManagement from '../components/SupplyUsageManagement';
import BatchLivestockRegistration from '../components/BatchLivestockRegistration';
import PreviewPrintButton from '@/components/common/PreviewPrintButton';

import { useCRM } from '../contexts/CRMContext';
import usePageMetadata from '../hooks/use-page-metadata';
import useSpacing from '@/hooks/use-spacing';


const LivestockPage = () => {
  const [activeTab, setActiveTab] = useState<string>('tracking');
  const { getModuleData } = useCRM();
  const spacing = useSpacing();
  
  const { 
    title, 
    description, 
    handleTitleChange, 
    handleDescriptionChange 
  } = usePageMetadata({
    defaultTitle: 'Gestão de Pecuária',
    defaultDescription: 'Gerencie seus animais e acompanhe o progresso'
  });
  
  // Obter dados de pecuária para visualização/impressão
  const livestockData = getModuleData('livestock')?.items || [];
  
  // Colunas de impressão para diferentes abas
  const printColumns = {
    tracking: [
      { key: "nome", header: "Animal" },
      { key: "categoria", header: "Categoria" },
      { key: "quantidade", header: "Quantidade" },
      { key: "peso", header: "Peso Médio (kg)" }
    ],
    specific: [
      { key: "nome", header: "Nome" },
      { key: "raca", header: "Raça" },
      { key: "idade", header: "Idade" },
      { key: "status", header: "Status" }
    ],
    planning: [
      { key: "nome", header: "Atividade" },
      { key: "descricao", header: "Descrição" },
      { key: "dataInicio", header: "Data de início" },
      { key: "dataFim", header: "Data de término" },
      { key: "status", header: "Status" }
    ]
  };

  // Ações com base na aba ativa
  const getTabActions = () => {
    switch (activeTab) {
      case 'tracking':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <PreviewPrintButton 
              data={livestockData}
              moduleName="livestock"
              title="Acompanhamento de Pecuária"
              columns={printColumns.tracking}
              variant="outline"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 transition-colors">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                <DropdownMenuItem 
                  onClick={() => {}}
                  className="cursor-pointer"
                >
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {}}
                  className="cursor-pointer"
                >
                  Exportar Excel
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {}}
                  className="cursor-pointer"
                >
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
        );
      case 'specific':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <PreviewPrintButton 
              data={getModuleData('livestock')?.items || []}
              moduleName="livestock-specific"
              title="Pecuária Específica"
              columns={printColumns.specific}
              variant="outline"
            />
            
            <Button 
              className="flex items-center gap-2 bg-agri-primary hover:bg-agri-primary-dark transition-colors"
              onClick={() => {

              }}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        );
      case 'planning':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <PreviewPrintButton 
              data={[]}
              moduleName="livestock-planning"
              title="Planejamento de Pecuária"
              columns={printColumns.planning}
              variant="outline"
            />
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <CalendarRange className="h-4 w-4" />
              Planejar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Plus className="h-4 w-4" />
              Nova tarefa
            </Button>
          </div>
        );
      case 'feeding':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Plus className="h-4 w-4" />
              Registrar alimentação
            </Button>
          </div>
        );
      case 'vaccination':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Plus className="h-4 w-4" />
              Registrar vacinação
            </Button>
          </div>
        );
      case 'reproduction':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Plus className="h-4 w-4" />
              Registrar reprodução
            </Button>
          </div>
        );
      case 'veterinary':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Plus className="h-4 w-4" />
              Adicionar produto
            </Button>
          </div>
        );
      case 'supplies':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Plus className="h-4 w-4" />
              Registrar uso
            </Button>
          </div>
        );
      case 'batch':
        return (
          <div className={spacing.getActionButtonGroupClasses()}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Download className="h-4 w-4" />
              Exportar Template
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {

              }}
            >
              <Upload className="h-4 w-4" />
              Importar CSV
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const tabLabels = {
      tracking: 'Acompanhamento de Pecuária',
      specific: 'Pecuária Específica',
      planning: 'Planejamento',
      batch: 'Cadastro em Lote',
      feeding: 'Alimentação',
      vaccination: 'Vacinação',
      reproduction: 'Reprodução',
      veterinary: 'Produtos Veterinários',
      supplies: 'Uso de Insumos'
    };
    
    const label = tabLabels[value as keyof typeof tabLabels] || value;

  };

  const tabs: TabItem[] = [
    {
      value: 'tracking',
      label: 'Acompanhamento',
      content: <LivestockTracking />
    },
    {
      value: 'specific',
      label: 'Animais Específicos',
      content: <SpecificLivestock />
    },
    {
      value: 'planning',
      label: 'Planejamento',
      content: <LivestockPlanning />
    },
    {
      value: 'batch',
      label: 'Cadastro em Lote',
      content: <BatchLivestockRegistration />
    },
    {
      value: 'feeding',
      label: 'Alimentação',
      content: <FeedingManagement />
    },
    {
      value: 'vaccination',
      label: 'Vacinação',
      content: <VaccinationManagement />
    },
    {
      value: 'reproduction',
      label: 'Reprodução',
      content: <ReproductionManagement />
    },
    {
      value: 'veterinary',
      label: 'Produtos Veterinários',
      content: <VeterinarySupplyManagement />
    },
    {
      value: 'supplies',
      label: 'Uso de Insumos',
      content: <SupplyUsageManagement />
    }
  ];

  return (
    <PageLayout>
      <div className={spacing.getPageContainerClasses()}>
        <PageHeader 
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          actions={getTabActions()}
          
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

export default LivestockPage;

