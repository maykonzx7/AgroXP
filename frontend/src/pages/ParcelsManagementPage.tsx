
import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';

import PageLayout from '../components/layout/PageLayout';
import ParcelManagement from '../components/ParcelManagement';
import PageHeader from '../components/layout/PageHeader';
import ParcelFilters from '../components/parcels/ParcelFilters';
import ParcelActionButtons from '../components/parcels/ParcelActionButtons';
import ParcelMapDialog from '../components/parcels/ParcelMapDialog';
import ParcelImportDialog from '../components/parcels/ParcelImportDialog';

import usePageMetadata from '../hooks/use-page-metadata';
import { useCRM } from '../contexts/CRMContext';
import useSpacing from '../hooks/use-spacing';

const ParcelsPage = () => {
  const { 
    title, 
    description, 
    handleTitleChange, 
    handleDescriptionChange 
  } = usePageMetadata({
    defaultTitle: 'Gerenciamento de Parcelas',
    defaultDescription: 'Gerencie, organize e otimize todas as suas parcelas agrícolas'
  });

  const spacing = useSpacing();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [mapPreviewOpen, setMapPreviewOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [layersDialogOpen, setLayersDialogOpen] = useState(false);
  const [weatherAlertsOpen, setWeatherAlertsOpen] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<Date>(new Date());
  const { syncDataAcrossCRM } = useCRM();
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 50]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [activeParcelAlerts, setActiveParcelAlerts] = useState([
    { id: 1, parcel: 'Parcela A12', type: 'Chuva intensa', severity: 'Alta' },
    { id: 2, parcel: 'Parcela B05', type: 'Seca', severity: 'Média' }
  ]);

  // Simular a sincronização de dados com outros módulos
  useEffect(() => {
    const syncWithOtherModules = () => {
      console.log("Sincronizando dados com os módulos de culturas e estatísticas");
      
      // Simula um atraso na sincronização
      const timer = setTimeout(() => {
        setLastSyncDate(new Date());
        syncDataAcrossCRM();
        console.log("Os dados das parcelas estão agora sincronizados com todos os módulos");
      }, 1500);
      
      return () => clearTimeout(timer);
    };
    
    syncWithOtherModules();
  }, [syncDataAcrossCRM]);

  const handleExportData = () => {
    console.log("A exportação de todos os dados das parcelas foi iniciada");
    console.log("Os dados exportados estão agora disponíveis no módulo de Estatísticas");
  };

  const handleImportData = () => {
    setImportDialogOpen(true);
  };
  
  const handleImportConfirm = (importType: string) => {
    setImportDialogOpen(false);
    console.log(`Os dados de ${importType} foram importados com sucesso`);
    console.log("Os módulos de Culturas e Estatísticas foram atualizados com os novos dados");
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      console.log(`Pesquisa realizada por "${searchTerm}"`);
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Baixa':
        return 'bg-green-100 text-green-800';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800';
      case 'Alta':
        return 'bg-orange-100 text-orange-800';
      case 'Extrema':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateStatistics = () => {
    setStatsDialogOpen(true);
    console.log("As estatísticas de suas parcelas foram geradas");
  };

  const handleOpenLayerManager = () => {
    setLayersDialogOpen(true);
    console.log("Gerenciador de camadas aberto");
  };

  const handleAddParcel = () => {
    console.log("Formulário de criação de parcela aberto");
  };

  return (
    <PageLayout>
      <div className={spacing.getPageContainerClasses()}>
        <div className={spacing.getSectionHeaderClasses()}>
          <div>
            <PageHeader 
              title={title}
              description={description}
              onTitleChange={handleTitleChange}
              onDescriptionChange={handleDescriptionChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Última sincronização com outros módulos: {lastSyncDate.toLocaleString()}
            </p>
          </div>
          
          <div className={spacing.getActionButtonGroupClasses()}>
            <ParcelFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterType={filterType}
              setFilterType={setFilterType}
              onSearch={handleSearch}
              dateRange={dateRange}
              setDateRange={setDateRange}
              areaRange={areaRange}
              setAreaRange={setAreaRange}
            />
            
            <ParcelActionButtons 
              onExportData={handleExportData}
              onImportData={handleImportData}
              onOpenMap={() => setMapPreviewOpen(true)}
              onAddParcel={handleAddParcel}
              onGenerateStatistics={handleGenerateStatistics}
              onOpenLayerManager={handleOpenLayerManager}
              activeParcelAlerts={activeParcelAlerts}
              weatherAlertsOpen={weatherAlertsOpen}
              setWeatherAlertsOpen={setWeatherAlertsOpen}
              getSeverityColor={getSeverityColor}
            />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={spacing.getCardContainerClasses()}
        >
          <div className="flex items-center mb-2">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-agri-primary" />
            <h2 className="text-lg font-medium">Visão geral das estatísticas de parcelas</h2>
          </div>
          <div className={spacing.getGridContainerClasses({ mobile: 1, tablet: 2, desktop: 4 })}>
            <div className="p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
              <p className="text-sm text-muted-foreground">Área total</p>
              <p className="text-2xl font-semibold">128.5 ha</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
              <p className="text-sm text-muted-foreground">Parcelas ativas</p>
              <p className="text-2xl font-semibold">42</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
              <p className="text-sm text-muted-foreground">Rendimento médio</p>
              <p className="text-2xl font-semibold">7.2 t/ha</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
              <p className="text-sm text-muted-foreground">Culturas principais</p>
              <p className="text-xl font-semibold">Milho, Trigo, Colza</p>
            </div>
          </div>
        </motion.div>

        <ParcelManagement />
        
        <ParcelMapDialog 
          isOpen={mapPreviewOpen} 
          onOpenChange={setMapPreviewOpen} 
        />
        
        <ParcelImportDialog 
          isOpen={importDialogOpen} 
          onOpenChange={setImportDialogOpen}
          onImportConfirm={handleImportConfirm}
        />
      </div>
    </PageLayout>
  );
};

export default ParcelsPage;
