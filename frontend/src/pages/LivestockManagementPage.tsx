import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Plus, Filter, RefreshCw, CalendarRange } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import PageLayout from '../components/layout/PageLayout';
import TabContainer, { TabItem } from '../components/layout/TabContainer';
import LivestockTracking from '../components/LivestockTracking';
import SpecificLivestock from '../components/SpecificLivestock';
import LivestockPlanning from '../components/LivestockPlanning';
import FeedingManagement from '../components/FeedingManagement';
import VaccinationManagement from '../components/VaccinationManagement';
import ReproductionManagement from '../components/ReproductionManagement';
import VeterinarySupplyManagement from '../components/VeterinarySupplyManagement';
import SupplyUsageManagement from '../components/SupplyUsageManagement';
import PreviewPrintButton from '@/components/common/PreviewPrintButton';

import { StatisticsProvider } from '../contexts/StatisticsContext';
import { CRMProvider, useCRM } from '../contexts/CRMContext';
import useSpacing from '@/hooks/use-spacing';


const LivestockPage = () => {
  const [activeTab, setActiveTab] = useState<string>('tracking');
  const { getModuleData } = useCRM();
  const spacing = useSpacing();
  
  // Obter dados de pecuária para visualização/impressão
  const livestockData = getModuleData('livestock').items || [];
  
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
                  onClick={() => console.log("Exportar CSV dos dados de pecuária")}
                  className="cursor-pointer"
                >
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => console.log("Exportar Excel dos dados de pecuária")}
                  className="cursor-pointer"
                >
                  Exportar Excel
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => console.log("Exportar PDF dos dados de pecuária")}
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
                console.log("Sincronizando dados de pecuária");
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Filtros aplicados aos dados de pecuária");
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
              data={getModuleData('livestock').items || []}
              moduleName="livestock-specific"
              title="Pecuária Específica"
              columns={printColumns.specific}
              variant="outline"
            />
            
            <Button 
              className="flex items-center gap-2 bg-agri-primary hover:bg-agri-primary-dark transition-colors"
              onClick={() => {
                console.log("Adicionando novo animal");
              }}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Exportando dados de pecuária específica");
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
                console.log("Planejando o calendário de pecuária");
              }}
            >
              <CalendarRange className="h-4 w-4" />
              Planejar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Adicionando nova tarefa de pecuária");
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
                console.log("Exportando dados de alimentação");
              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Adicionando novo registro de alimentação");
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
                console.log("Exportando dados de vacinação");
              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Adicionando nova vacinação");
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
                console.log("Exportando dados de reprodução");
              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Adicionando novo registro de reprodução");
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
                console.log("Exportando dados veterinários");
              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Adicionando novo produto veterinário");
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
                console.log("Exportando dados de insumos");
              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Adicionando novo uso de insumo");
              }}
            >
              <Plus className="h-4 w-4" />
              Registrar uso
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
      feeding: 'Alimentação',
      vaccination: 'Vacinação',
      reproduction: 'Reprodução',
      veterinary: 'Produtos Veterinários',
      supplies: 'Uso de Insumos'
    };
    
    const label = tabLabels[value as keyof typeof tabLabels] || value;
    console.log(`${label} ativado - Exibindo dados correspondentes`);
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
    <CRMProvider>
      <StatisticsProvider>
        <PageLayout>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={spacing.getPageContainerClasses()}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Gestão de Pecuária</h1>
                <p className="text-muted-foreground">
                  Gerencie seus animais e acompanhe sua saúde e produtividade
                </p>
              </div>
              {getTabActions()}
            </div>
            
            <TabContainer 
              tabs={tabs}
              defaultValue={activeTab}
              onValueChange={handleTabChange}
            />
          </motion.div>
        </PageLayout>
      </StatisticsProvider>
    </CRMProvider>
  );
};

export default LivestockPage;
