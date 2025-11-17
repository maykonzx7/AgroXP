
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
import { toast } from 'sonner';

import DashboardLayoutTemplate from '../components/templates/DashboardLayoutTemplate';
import { ParcelManagement } from '@/features/parcels';
import ParcelStats from '../components/organisms/parcels/ParcelStats';
import { PageHeader } from '@/shared/components/layout';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
      // Simula um atraso na sincronização
      const timer = setTimeout(() => {
        setLastSyncDate(new Date());
        syncDataAcrossCRM();
      }, 1500);
      
      return () => clearTimeout(timer);
    };
    
    syncWithOtherModules();
  }, [syncDataAcrossCRM]);

  const handleExportData = async () => {
    try {
      const success = await exportModuleData('parcelles', 'excel');
      if (!success) {
        // Tratar caso de falha na exportação se necessário
      }
    } catch (error) {
      // Tratar erro na exportação se necessário
    }
  };

  const handleImportData = () => {
    setImportDialogOpen(true);
  };
  
  const handleImportConfirm = (importType: string) => {
    setImportDialogOpen(false);
    // Atualizar módulos de Culturas e Estatísticas com novos dados se necessário
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Pesquisa realizada com o termo searchTerm
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
  };

  const handleOpenLayerManager = () => {
    setLayersDialogOpen(true);
  };

  const [showAddParcelDialog, setShowAddParcelDialog] = useState(false);
  const [newParcelData, setNewParcelData] = useState({
    name: '',
    size: 1,
    location: '',
    soilType: '',
    status: 'active'
  });

  const handleAddParcel = async () => {
    setShowAddParcelDialog(true);
  };

  const { addData } = useCRM(); // Use the CRM context for data operations

  const handleSaveParcel = async () => {
    if (!newParcelData.name.trim()) {
      toast.error('Por favor, preencha o nome da parcela');
      return;
    }
    
    try {
      // Create a new parcel object with user-provided values
      const newParcel = {
        name: newParcelData.name,
        size: parseFloat(newParcelData.size) || 1,
        location: newParcelData.location || 'Localização não informada',
        soilType: newParcelData.soilType || 'Não especificado',
        status: newParcelData.status
      };
      
      // Add the new parcel via CRM context (which will call the backend API)
      await addData('parcelles', newParcel);
      
      // Reset form and close dialog
      setNewParcelData({
        name: '',
        size: 1,
        location: '',
        soilType: '',
        status: 'active'
      });
      setShowAddParcelDialog(false);
      
      // Show success message
      toast.success('Parcela adicionada com sucesso');
    } catch (error) {
      console.error('Error adding parcel:', error);
      toast.error('Erro ao adicionar parcela');
    }
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
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
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
    <div className="flex flex-wrap gap-3 items-center bg-card p-4 rounded-lg border border-border shadow-sm mb-6">
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
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
          <ParcelStats searchTerm={searchTerm} />
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

      {/* Modal for adding new parcel */}
      <Dialog open={showAddParcelDialog} onOpenChange={setShowAddParcelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Parcela</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Nome
              </label>
              <Input
                id="name"
                value={newParcelData.name}
                onChange={(e) => setNewParcelData({...newParcelData, name: e.target.value})}
                className="col-span-3"
                placeholder="Nome da parcela"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="size" className="text-right text-sm font-medium">
                Área (ha)
              </label>
              <Input
                id="size"
                type="number"
                value={newParcelData.size}
                onChange={(e) => setNewParcelData({...newParcelData, size: parseFloat(e.target.value) || 0})}
                className="col-span-3"
                placeholder="Área em hectares"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="location" className="text-right text-sm font-medium">
                Localização
              </label>
              <Input
                id="location"
                value={newParcelData.location}
                onChange={(e) => setNewParcelData({...newParcelData, location: e.target.value})}
                className="col-span-3"
                placeholder="Localização da parcela"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="soilType" className="text-right text-sm font-medium">
                Tipo de Solo
              </label>
              <Input
                id="soilType"
                value={newParcelData.soilType}
                onChange={(e) => setNewParcelData({...newParcelData, soilType: e.target.value})}
                className="col-span-3"
                placeholder="Tipo de solo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                value={newParcelData.status}
                onChange={(e) => setNewParcelData({...newParcelData, status: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
                <option value="planned">Planejada</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddParcelDialog(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveParcel}>
              Adicionar Parcela
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayoutTemplate>
  );
};

export default ParcelsPage;
