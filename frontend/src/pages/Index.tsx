
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  TreePine, 
  Wheat, 
  Map, 
  Layers,
  Edit,
  Trash2,
  Save,
  AlertCircle,
  PlusCircle,
  Upload,
  Download,
  FileUp,
  Camera,
  Sun,
  Moon,
  ChevronRight,
  Settings,
  Users,
  FileText,
  Menu,
  X,
  CloudRain,
  Wind,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Tractor,
  Carrot,
  CloudLightning,
  LineChart,
  PieChart,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Clock,
  Wallet,
  RefreshCw,
  Filter
} from "lucide-react";

import DashboardLayoutTemplate from "../components/templates/DashboardLayoutTemplate";
import { PageHeader } from "@/shared/components/layout";
import Dashboard from "../components/dashboard/MainDashboard";
import { TabContainer, type TabItem } from "@/shared/components/layout";
import HarvestTracking from "../components/HarvestTracking";
import WeatherAlerts from "../components/WeatherAlerts";
import TaskList from "../components/cultures/TaskList";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { EditableField } from "@/components/ui/editable-field";
import { useCRM } from "../contexts/CRMContext";
import usePageMetadata from "../hooks/use-page-metadata";
import useSpacing from "@/hooks/use-spacing";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "done";
}

const Index = () => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const spacing = useSpacing();
  const { 
    title, 
    description, 
    handleTitleChange, 
    handleDescriptionChange 
  } = usePageMetadata({
    defaultTitle: "Painel de Controle",
    defaultDescription: "Visão geral das atividades e indicadores da sua fazenda"
  });

  const [userName, setUserName] = useState("Operador");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedModules, setConnectedModules] = useState(["parcels", "crops", "livestock"]);
  
  const { syncDataAcrossCRM, getModuleData } = useCRM();
  
  // Get data from CRM modules
  const tasksData = getModuleData('tasks')?.items || [];
  const weatherData = getModuleData('weather')?.items || [];
  
  const [tasks, setTasks] = useState<Task[]>(tasksData);
  const [weatherAlerts, setWeatherAlerts] = useState(weatherData);

  useEffect(() => {
    const initialSync = setTimeout(() => {

    }, 1000);
    
    return () => clearTimeout(initialSync);
  }, []);

  const syncData = () => {
    setIsSyncing(true);

    
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncDate(new Date());
      syncDataAcrossCRM();

    }, 2000);
  };

  const handleExportData = () => {

  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    
    // Redefinir o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportConfirm = () => {
    if (selectedFile) {
      setImportDialogOpen(false);

      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {

    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-purple-100 text-purple-800";
      case "done": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const tabLabels = {
      dashboard: "Painel de Controle",
      harvest: "Acompanhamento de Colheitas",
      weather: "Alertas Meteorológicos",
      tasks: "Lista de Tarefas"
    };
    
    const label = tabLabels[value as keyof typeof tabLabels] || value;

  };

  const tabs: TabItem[] = [
    {
      value: "dashboard",
      label: "Painel de Controle",
      content: <Dashboard />
    },
    {
      value: "harvest",
      label: "Acompanhamento de Colheitas",
      content: <HarvestTracking />
    },
    {
      value: "weather",
      label: "Alertas Meteorológicos",
      content: <WeatherAlerts />
    },
    {
      value: "tasks",
      label: "Lista de Tarefas",
      content: <TaskList />
    }
  ];

  return (
    <DashboardLayoutTemplate breadcrumbItems={[{ label: "Início", path: "/", isCurrent: true }]}>
      <div className={spacing.getPageContainerClasses()}>
        <PageHeader 
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          actions={
            <div className={spacing.getActionButtonGroupClasses()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 transition-colors hover:bg-muted">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                  <DropdownMenuItem onClick={handleExportData} className="cursor-pointer">
                    <FileUp className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportData} className="cursor-pointer">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Exportar Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportData} className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 transition-colors hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    Importar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                  <DropdownMenuItem onClick={handleImportClick} className="cursor-pointer">
                    <FileUp className="h-4 w-4 mr-2" />
                    Importar um arquivo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {}} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar modelo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv,.xlsx,.xls" 
                className="hidden" 
              />
              
              <Button 
                variant="outline" 
                onClick={syncData}
                disabled={isSyncing}
                className="flex items-center gap-2 transition-colors hover:bg-muted"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Sincronizando..." : "Sincronizar"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {}}
                className="flex items-center gap-2 transition-colors hover:bg-muted"
              >
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
          }
          stats={
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="mr-2">Módulos conectados: {connectedModules.join(", ")}</span>
              <span>Última sincronização: {lastSyncDate.toLocaleString()}</span>
            </div>
          }
        />

        <TabContainer 
          tabs={tabs}
          defaultValue={activeTab}
          onValueChange={handleTabChange}
        />

        {/* Import Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Importar dados</DialogTitle>
              <DialogDescription>
                Selecione um arquivo para importar dados para o painel de controle
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground">
                Escolha o tipo de dados a serem importados:
              </p>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file">Arquivo</Label>
                <input 
                  id="file" 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
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
    </DashboardLayoutTemplate>
  );
};

export default Index;

