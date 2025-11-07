
import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Plus, 
  Map, 
  BarChart3, 
  Download, 
  Upload, 
  Layers, 
  FileText,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  SlidersHorizontal
} from 'lucide-react';

import DashboardLayoutTemplate from '../components/templates/DashboardLayoutTemplate';
import ParcelManagement from '../components/ParcelManagement';
import PageHeader from '../components/layout/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';


import usePageMetadata from '../hooks/use-page-metadata';
import { useCRM } from '../contexts/CRMContext';
import useSpacing from '@/hooks/use-spacing';

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
  const { syncDataAcrossCRM, exportModuleData, importModuleData } = useCRM();
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 50]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [tempAreaRange, setTempAreaRange] = useState<[number, number]>([0, 50]);
  
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

  const handleExportData = async () => {
    try {
      const success = await exportModuleData('parcelles', 'excel');
      if (success) {
        console.log("Dados exportados com sucesso");
      } else {
        console.log("Erro ao exportar dados");
      }
    } catch (error) {
      console.error("Erro na exportação:", error);
    }
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

  const handleAreaRangeChange = (newValues: number[]) => {
    setTempAreaRange([newValues[0], newValues[1]]);
  };

  const applyAdvancedFilters = () => {
    setAreaRange(tempAreaRange);
    setIsAdvancedFiltersOpen(false);
  };

  // Action buttons component
  const ActionButtons = () => (
    <div className="flex flex-wrap items-center gap-2">
      {/* Main action button */}
      <Button 
        className="bg-green-600 hover:bg-green-700 text-white" 
        onClick={handleAddParcel}
      >
        <Plus className="mr-2 h-4 w-4" />
        Adicionar parcela
      </Button>
      
      {/* Secondary action buttons */}
      <Button 
        variant="outline" 
        onClick={() => setMapPreviewOpen(true)}
        className="bg-background border-input hover:bg-accent"
      >
        <Map className="mr-2 h-4 w-4 text-gray-600" />
        Mapa
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleGenerateStatistics}
        className="bg-background border-input hover:bg-accent"
      >
        <BarChart3 className="mr-2 h-4 w-4 text-gray-600" />
        Estatísticas
      </Button>
      
      {/* Auxiliary actions dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-background border-input hover:bg-accent"
          >
            Mais ações
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleExportData}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleImportData}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleOpenLayerManager}
            >
              <Layers className="mr-2 h-4 w-4" />
              Camadas
            </Button>
            
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Alerts button with badge */}
      {activeParcelAlerts.length > 0 && (
        <Popover open={weatherAlertsOpen} onOpenChange={setWeatherAlertsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="relative bg-white border-gray-200 hover:bg-gray-50"
            >
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeParcelAlerts.length}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <div className="p-4 border-b">
              <h4 className="font-semibold flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                Alertas nas parcelas
              </h4>
            </div>
            <div className="divide-y max-h-80 overflow-auto">
              {activeParcelAlerts.map(alert => (
                <div key={alert.id} className="p-3 hover:bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{alert.parcel}</span>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.type}</p>
                </div>
              ))}
            </div>
            <div className="p-2 border-t bg-muted/10">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setWeatherAlertsOpen(false)}>
                Fechar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );

  // Filter bar component
  const FilterBar = () => (
    <div className="flex flex-wrap gap-3 items-center bg-background p-4 rounded-lg border mb-6">
      {/* Search input */}
      <form onSubmit={handleSearch} className="flex">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Pesquisar uma parcela..."
            className="pl-9 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </form>
      
      <Separator orientation="vertical" className="h-8" />
      
      {/* Status filter */}
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="w-[160px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Parcelas ativas</SelectItem>
          <SelectItem value="fallow">Em pousio</SelectItem>
          <SelectItem value="planned">Planejadas</SelectItem>
          <SelectItem value="rented">Alugadas</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Type filter */}
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-[160px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="field">Campos</SelectItem>
          <SelectItem value="greenhouse">Estufas</SelectItem>
          <SelectItem value="orchard">Pomares</SelectItem>
          <SelectItem value="experimental">Experimentais</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Date range filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex gap-2">
            <Calendar className="h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                </>
              ) : (
                format(dateRange.from, 'dd/MM/yyyy')
              )
            ) : (
              "Selecionar datas"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={fr}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      {/* Advanced filters */}
      <Popover open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros avançados
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Superfície (hectares)</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{tempAreaRange[0]} ha</span>
                <span className="text-sm">{tempAreaRange[1]} ha</span>
              </div>
              <Slider
                defaultValue={tempAreaRange}
                min={0}
                max={50}
                step={1}
                onValueChange={handleAreaRangeChange}
              />
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button 
                type="button" 
                onClick={applyAdvancedFilters}
                className="bg-agri-primary hover:bg-agri-primary-dark text-white"
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <DashboardLayoutTemplate breadcrumbItems={[
      { label: "Início", path: "/" },
      { label: "Gestão", path: "/parcelas", isCurrent: true }
    ]}>
      <div className={spacing.getPageContainerClasses()}>
        <PageHeader 
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          actions={<ActionButtons />}
        />
        
        {/* Filter bar */}
        <FilterBar />
        
        {/* Statistics overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center mb-4">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-agri-primary" />
            <h2 className="text-lg font-medium">Visão geral das estatísticas de parcelas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow">
              <p className="text-sm text-muted-foreground">Área total</p>
              <p className="text-2xl font-semibold">128.5 ha</p>
            </div>
            <div className="p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow">
              <p className="text-sm text-muted-foreground">Parcelas ativas</p>
              <p className="text-2xl font-semibold">42</p>
            </div>
            <div className="p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow">
              <p className="text-sm text-muted-foreground">Rendimento médio</p>
              <p className="text-2xl font-semibold">7.2 t/ha</p>
            </div>
            <div className="p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow">
              <p className="text-sm text-muted-foreground">Culturas principais</p>
              <p className="text-xl font-semibold">Milho, Trigo, Colza</p>
            </div>
          </div>
        </motion.div>
        
        {/* Main parcel management content */}
        <ParcelManagement 
          searchTerm={searchTerm}
          filterStatus={filterStatus}
        />
        
        {/* Footer with last sync date */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Última sincronização com outros módulos: {lastSyncDate.toLocaleString()}
        </div>
      </div>
    </DashboardLayoutTemplate>
  );
};

export default ParcelsPage;
