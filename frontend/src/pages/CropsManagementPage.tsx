
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
import HarvestTracking from '../components/HarvestTracking';
import SpecificCrops from '../components/SpecificCrops';
import CropPlanning from '../components/cultures/CropPlanningForm';
import PreviewPrintButton from '@/components/common/PreviewPrintButton';

import { useCRM } from '../contexts/CRMContext';


const CropsPage = () => {
  const [activeTab, setActiveTab] = useState<string>('harvest');
  const { getModuleData } = useCRM();
  
  // Obter dados da colheita para visualização/impressão
  const harvestData = getModuleData('cultures')?.items || [];
  
  // Colunas de impressão para diferentes abas
  const printColumns = {
    harvest: [
      { key: "nome", header: "Cultura" },
      { key: "rendimento", header: "Rendimento (t/ha)" },
      { key: "superficie", header: "Área (ha)" },
      { key: "data", header: "Data da colheita" }
    ],
    specific: [
      { key: "nome", header: "Nome" },
      { key: "variedade", header: "Variedade" },
      { key: "dataInicio", header: "Data de início" },
      { key: "dataFim", header: "Data de término" }
    ],
    planning: [
      { key: "nome", header: "Cultura" },
      { key: "atividade", header: "Atividade" },
      { key: "dataInicio", header: "Data de início" },
      { key: "dataFim", header: "Data de término" },
      { key: "status", header: "Status" }
    ]
  };

  // Ações com base na aba ativa
  const getTabActions = () => {
    switch (activeTab) {
      case 'harvest':
        return (
          <div className="flex flex-wrap gap-2">
            <PreviewPrintButton 
              data={harvestData}
              moduleName="harvest"
              title="Acompanhamento de Colheitas"
              columns={printColumns.harvest}
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
                  onClick={() => console.log("Exportar CSV dos dados da colheita")}
                  className="cursor-pointer"
                >
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => console.log("Exportar Excel dos dados da colheita")}
                  className="cursor-pointer"
                >
                  Exportar Excel
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => console.log("Exportar PDF dos dados da colheita")}
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
                console.log("Sincronizando dados da colheita");
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Filtros aplicados aos dados da colheita");
              }}
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
        );
      case 'specific':
        return (
          <div className="flex flex-wrap gap-2">
            <PreviewPrintButton 
              data={getModuleData('cultures')?.items || []}
              moduleName="cultures"
              title="Culturas Específicas"
              columns={printColumns.specific}
              variant="outline"
            />
            
            <Button 
              className="flex items-center gap-2 bg-agri-primary hover:bg-agri-primary-dark transition-colors"
              onClick={() => {
                console.log("Adicionando nova cultura");
              }}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Exportando dados das culturas");
              }}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        );
      case 'planning':
        return (
          <div className="flex flex-wrap gap-2">
            <PreviewPrintButton 
              data={[]}
              moduleName="planning"
              title="Planejamento de Culturas"
              columns={printColumns.planning}
              variant="outline"
            />
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Planejando o calendário de culturas");
              }}
            >
              <CalendarRange className="h-4 w-4" />
              Planejar
            </Button>
            <Button 
              className="flex items-center gap-2 transition-colors"
              onClick={() => {
                console.log("Adicionando nova tarefa de cultura");
              }}
            >
              <Plus className="h-4 w-4" />
              Nova tarefa
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
      harvest: 'Acompanhamento de Colheitas',
      specific: 'Culturas Específicas',
      planning: 'Planejamento'
    };
    
    const label = tabLabels[value as keyof typeof tabLabels] || value;
    console.log(`${label} ativado - Exibindo dados correspondentes`);
  };

  const tabs: TabItem[] = [
    {
      value: 'harvest',
      label: 'Acompanhamento de Colheitas',
      content: <HarvestTracking />
    },
    {
      value: 'specific',
      label: 'Culturas Específicas',
      content: <SpecificCrops />
    },
    {
      value: 'planning',
      label: 'Planejamento',
      content: <CropPlanning />
    }
  ];

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Culturas</h1>
          <p className="text-muted-foreground">Gerencie suas culturas e acompanhe o progresso</p>
        </div>
        <div className="flex space-x-2">
          {getTabActions()}
        </div>
      </div>
      
      <TabContainer 
        tabs={tabs}
        defaultValue={activeTab}
        onValueChange={handleTabChange}
      />
    </PageLayout>
  );
};

export default CropsPage;
