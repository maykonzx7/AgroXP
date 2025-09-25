import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Leaf, Calendar, Filter, Download, Upload, FileUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCRM } from '../contexts/CRMContext';
import CultureDetailTable from './cultures/CropDetailsTable';
import { 
  Input 
} from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';
import PreviewPrintButton from './common/PreviewPrintButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const SpecificCrops = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { exportModuleData, importModuleData, getModuleData, syncDataAcrossCRM, isRefreshing } = useCRM();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Obter dados de culturas para visualização/impressão
  const culturesData = getModuleData('cultures').items || [];

  const handleAddCulture = () => {
    setShowAddForm(true);
    console.log("Abrindo o formulário de adição de cultura");
  };

  const handleExportData = async (format: 'csv' | 'pdf' = 'csv') => {
    console.log(`Exportando no formato ${format}...`);
    const success = await exportModuleData('cultures', format);
    
    if (success) {
      console.log(`Os dados das culturas foram exportados em ${format.toUpperCase()}`);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`Importando ${file.name}...`);
      const success = await importModuleData('cultures', file);
      
      if (success) {
        console.log("Importação bem-sucedida - Os dados das culturas foram atualizados");
        toast({
          title: "Importação bem-sucedida",
          description: "Os dados das culturas foram atualizados",
        });
      } else {
        toast({
          title: "Erro na importação",
          description: "Não foi possível importar os dados das culturas",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefresh = () => {
    syncDataAcrossCRM();
    toast({
      title: "Dados atualizados",
      description: "Os dados das culturas foram atualizados com sucesso",
    });
  };

  const filterOptions = [
    { value: 'all', label: 'Todas as culturas' },
    { value: 'fruits', label: 'Frutas' },
    { value: 'vegetables', label: 'Legumes' },
    { value: 'tubers', label: 'Tubérculos' },
    { value: 'cash', label: 'Culturas de rendimento' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Culturas Específicas</h2>
          <p className="text-muted-foreground">Gerencie as informações sobre suas culturas locais</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="transition-colors hover:bg-gray-100"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          
          <PreviewPrintButton 
            data={culturesData}
            moduleName="cultures"
            title="Culturas Específicas"
            columns={[
              { key: "name", header: "Nome" },
              { key: "variety", header: "Variedade" },
              { key: "plantingDate", header: "Data de início" },
              { key: "harvestDate", header: "Data de término" }
            ]}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="transition-colors hover:bg-gray-100">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border shadow-lg">
              <DropdownMenuItem onClick={() => handleExportData('csv')} className="cursor-pointer">
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData('pdf')} className="cursor-pointer">
                Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="transition-colors hover:bg-gray-100">
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border shadow-lg">
              <DropdownMenuItem onClick={handleImportClick} className="cursor-pointer">
                <FileUp className="mr-2 h-4 w-4" />
                Selecionar um arquivo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
          />
          
          <Button 
            onClick={handleAddCulture} 
            className="transition-colors hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar uma cultura
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Pesquisar uma cultura..." 
            className="pl-10 transition-all focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas as culturas" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border p-6 mb-6 shadow-sm"
      >
        <CultureDetailTable 
          showAddForm={showAddForm} 
          setShowAddForm={setShowAddForm} 
          searchTerm={searchTerm}
          filterType={filterType}
        />
      </motion.div>
    </motion.div>
  );
};

export default SpecificCrops;
