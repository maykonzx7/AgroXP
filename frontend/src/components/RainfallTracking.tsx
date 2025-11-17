import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Filter, Download, Droplets, CloudRain, Sun, Wind } from 'lucide-react';
import { EditableField } from '@/components/ui/editable-field';
import { EditableTable, Column } from '@/components/ui/editable-table';
import { useCRM } from '../contexts/CRMContext';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface RainfallData {
  id: number;
  month: string;
  year: number;
  amount: number;
  location: string;
  impact: 'Positivo' | 'Neutro' | 'Negativo';
  notes?: string;
}

const formSchema = z.object({
  month: z.string().min(1, { message: "O mês é obrigatório" }),
  year: z.coerce.number().min(2000, { message: "Ano inválido" }).max(2100),
  amount: z.coerce.number().min(0, { message: "Valor inválido" }),
  location: z.string().min(1, { message: "A região é obrigatória" }),
  impact: z.enum(['Positivo', 'Neutro', 'Negativo']),
  notes: z.string().optional(),
});

const RainfallTracking = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('Acompanhamento de Precipitação');
  const [description, setDescription] = useState('Visualização de dados pluviométricos para otimizar o manejo das culturas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: "Janeiro",
      year: new Date().getFullYear(),
      amount: 0,
      location: "Região Sul",
      impact: "Neutro",
      notes: "",
    },
  });
  
  const [rainfallData, setRainfallData] = useState<RainfallData[]>([
    { id: 1, month: 'Janeiro', year: 2023, amount: 210, location: 'Região Sul', impact: 'Positivo', notes: 'Bom começo para as culturas' },
    { id: 2, month: 'Fevereiro', year: 2023, amount: 180, location: 'Região Sul', impact: 'Positivo' },
    { id: 3, month: 'Março', year: 2023, amount: 150, location: 'Região Sul', impact: 'Neutro' },
    { id: 4, month: 'Abril', year: 2023, amount: 120, location: 'Região Sul', impact: 'Neutro' },
    { id: 5, month: 'Maio', year: 2023, amount: 90, location: 'Região Sul', impact: 'Negativo', notes: 'Início de seca' },
    { id: 6, month: 'Junho', year: 2023, amount: 60, location: 'Região Sul', impact: 'Negativo' },
    { id: 7, month: 'Julho', year: 2023, amount: 45, location: 'Região Sul', impact: 'Negativo' },
    { id: 8, month: 'Agosto', year: 2023, amount: 70, location: 'Região Sul', impact: 'Neutro' },
    { id: 9, month: 'Setembro', year: 2023, amount: 90, location: 'Região Sul', impact: 'Neutro' },
    { id: 10, month: 'Outubro', year: 2023, amount: 140, location: 'Região Sul', impact: 'Positivo' },
    { id: 11, month: 'Novembro', year: 2023, amount: 190, location: 'Região Sul', impact: 'Positivo' },
    { id: 12, month: 'Dezembro', year: 2023, amount: 230, location: 'Região Sul', impact: 'Positivo' },
    { id: 13, month: 'Janeiro', year: 2023, amount: 90, location: 'Região Norte', impact: 'Neutro' },
    { id: 14, month: 'Fevereiro', year: 2023, amount: 85, location: 'Região Norte', impact: 'Neutro' },
    { id: 15, month: 'Março', year: 2023, amount: 75, location: 'Região Norte', impact: 'Neutro' },
    { id: 16, month: 'Abril', year: 2023, amount: 65, location: 'Região Norte', impact: 'Negativo' },
    { id: 17, month: 'Maio', year: 2023, amount: 50, location: 'Região Norte', impact: 'Negativo' },
    { id: 18, month: 'Junho', year: 2023, amount: 40, location: 'Região Norte', impact: 'Negativo' },
    { id: 19, month: 'Julho', year: 2023, amount: 30, location: 'Região Norte', impact: 'Negativo', notes: 'Seca severa' },
    { id: 20, month: 'Agosto', year: 2023, amount: 45, location: 'Região Norte', impact: 'Negativo' },
    { id: 21, month: 'Setembro', year: 2023, amount: 60, location: 'Região Norte', impact: 'Neutro' },
    { id: 22, month: 'Outubro', year: 2023, amount: 80, location: 'Região Norte', impact: 'Neutro' },
    { id: 23, month: 'Novembro', year: 2023, amount: 95, location: 'Região Norte', impact: 'Positivo' },
    { id: 24, month: 'Dezembro', year: 2023, amount: 110, location: 'Região Norte', impact: 'Positivo' },
    { id: 25, month: 'Janeiro', year: 2025, amount: 215, location: 'Região Sul', impact: 'Positivo' },
    { id: 26, month: 'Fevereiro', year: 2025, amount: 185, location: 'Região Sul', impact: 'Positivo' },
    { id: 27, month: 'Março', year: 2025, amount: 160, location: 'Região Sul', impact: 'Positivo' },
    { id: 28, month: 'Janeiro', year: 2025, amount: 95, location: 'Região Norte', impact: 'Neutro' },
    { id: 29, month: 'Fevereiro', year: 2025, amount: 90, location: 'Região Norte', impact: 'Neutro' },
    { id: 30, month: 'Março', year: 2025, amount: 80, location: 'Região Norte', impact: 'Neutro' },
  ]);
  
  // Colunas para a tabela editável
  const columns: Column[] = [
    { id: 'month', header: 'Mês', accessorKey: 'month', isEditable: true },
    { id: 'year', header: 'Ano', accessorKey: 'year', type: 'number', isEditable: true },
    { id: 'amount', header: 'Precipitação (mm)', accessorKey: 'amount', type: 'number', isEditable: true },
    { id: 'location', header: 'Região', accessorKey: 'location', isEditable: true },
    { id: 'impact', header: 'Impacto', accessorKey: 'impact', isEditable: true, options: ['Positivo', 'Neutro', 'Negativo'] },
    { id: 'notes', header: 'Notas', accessorKey: 'notes', isEditable: true }
  ];
  
  // Handlers
  const handleTitleChange = (value: string | number) => {
    setTitle(String(value));
    toast({
      title: "Título atualizado",
      description: "O título do módulo foi modificado com sucesso"
    });
  };
  
  const handleDescriptionChange = (value: string | number) => {
    setDescription(String(value));
    toast({
      title: "Descrição atualizada",
      description: "A descrição do módulo foi modificada com sucesso"
    });
  };
  
  // Filtrar os dados
  const filteredData = rainfallData.filter(item => {
    const matchesSearch = 
      item.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesYear = filterYear === 'all' || item.year === Number(filterYear);
    const matchesLocation = filterLocation === 'all' || item.location === filterLocation;
    
    return matchesSearch && matchesYear && matchesLocation;
  });
  
  // Preparar os dados para o gráfico
  const uniqueMonths = Array.from(new Set(filteredData.map(item => item.month)));
  const uniqueLocations = Array.from(new Set(filteredData.map(item => item.location)));
  
  // Criar os dados agregados por mês para o gráfico
  const chartData = uniqueMonths.map(month => {
    const dataPoint: any = { month };
    
    uniqueLocations.forEach(location => {
      const matchingData = filteredData.find(item => item.month === month && item.location === location);
      dataPoint[location] = matchingData ? matchingData.amount : 0;
    });
    
    return dataPoint;
  });
  
  // Gerenciar as atualizações da tabela
  const handleTableUpdate = (rowIndex: number, columnId: string, value: any) => {
    const newData = [...rainfallData];
    const itemId = filteredData[rowIndex].id;
    const dataIndex = newData.findIndex(item => item.id === itemId);
    
    if (dataIndex !== -1) {
      const updatedItem = { ...newData[dataIndex] };
      
      if (columnId === 'year' || columnId === 'amount') {
        updatedItem[columnId] = Number(value);
      } else {
        updatedItem[columnId] = value;
      }
      
      newData[dataIndex] = updatedItem;
      setRainfallData(newData);
      
      toast({
        title: "Dados atualizados",
        description: `Registro de precipitação para ${updatedItem.month} ${updatedItem.year} atualizado`
      });
    }
  };
  
  // Gestão de exclusão
  const handleDeleteRow = (rowIndex: number) => {
    const itemId = filteredData[rowIndex].id;
    const newData = rainfallData.filter(item => item.id !== itemId);
    setRainfallData(newData);
    
    toast({
      title: "Dados excluídos",
      description: "Registro excluído com sucesso"
    });
  };
  
  // Adicionar uma nova linha
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const newId = Math.max(0, ...rainfallData.map(item => item.id)) + 1;
    
    const newRow: RainfallData = {
      id: newId,
      month: data.month,
      year: data.year,
      amount: data.amount,
      location: data.location,
      impact: data.impact,
      notes: data.notes
    };
    
    setRainfallData([...rainfallData, newRow]);
    setDialogOpen(false);
    form.reset();
    
    toast({
      title: "Dados adicionados",
      description: `Novo registro adicionado para ${newRow.month} ${newRow.year}`
    });
  };
  
  // Baixar os dados
  const handleDownloadData = () => {
    // Criar um conteúdo CSV
    const headers = columns.map(col => col.header).join(',');
    const rows = rainfallData.map(item => {
      return `${item.month},${item.year},${item.amount},${item.location},${item.impact},${item.notes || ''}`;
    }).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Criar um link e clicar nele para baixar
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `precipitacao_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download concluído",
      description: "Exportação dos dados de precipitação em formato CSV bem-sucedida"
    });
  };
  
  // Importar dados CSV
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result as string;
      const lines = contents.split('\n');
      
      // Ignorar o cabeçalho
      const dataLines = lines.slice(1);
      
      const importedData: RainfallData[] = [];
      let lastId = Math.max(0, ...rainfallData.map(item => item.id));
      
      dataLines.forEach(line => {
        if (!line.trim()) return;
        
        const values = line.split(',');
        if (values.length >= 5) {
          lastId++;
          importedData.push({
            id: lastId,
            month: values[0],
            year: parseInt(values[1], 10),
            amount: parseFloat(values[2]),
            location: values[3],
            impact: values[4] as 'Positivo' | 'Neutro' | 'Negativo',
            notes: values[5]
          });
        }
      });
      
      if (importedData.length > 0) {
        setRainfallData([...rainfallData, ...importedData]);
        toast({
          title: "Importação bem-sucedida",
          description: `${importedData.length} registros foram importados com sucesso`
        });
      } else {
        toast({
          title: "Nenhum dado importado",
          description: "O arquivo não contém dados válidos"
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Redefinir o input
  };
  
  // Calcular as estatísticas
  const calculateStatistics = () => {
    if (filteredData.length === 0) return { avg: 0, max: 0, min: 0, total: 0 };
    
    const amounts = filteredData.map(item => item.amount);
    const sum = amounts.reduce((acc, val) => acc + val, 0);
    
    return {
      avg: Math.round(sum / amounts.length),
      max: Math.max(...amounts),
      min: Math.min(...amounts),
      total: sum
    };
  };
  
  const stats = calculateStatistics();
  
  // Anos únicos para o filtro
  const uniqueYears = Array.from(new Set(rainfallData.map(item => item.year))).sort((a, b) => b - a);
  
  // Obter a classe CSS para o impacto
  const getImpactClass = (impact: string) => {
    switch (impact) {
      case 'Positivo': return 'text-agri-success';
      case 'Negativo': return 'text-agri-danger';
      default: return 'text-muted-foreground';
    }
  };

  // Cores para o gráfico
  const locationColors: {[key: string]: string} = {
    'Região Sul': '#4CAF50',
    'Região Norte': '#2196F3',
    'Ilha Vizinha': '#FFC107',
    'Arquipélago': '#9C27B0'
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <CloudRain className="h-6 w-6 mr-2 text-blue-500" />
            <EditableField
              value={title}
              onSave={handleTitleChange}
              className="inline-block"
            />
          </h2>
          <p className="text-muted-foreground">
            <EditableField
              value={description}
              onSave={handleDescriptionChange}
              className="inline-block"
            />
          </p>
        </div>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-4 border flex items-center space-x-3 hover:border-blue-200 transition-all">
            <Droplets className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Média</div>
              <div className="text-2xl font-bold">{stats.avg} mm</div>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border flex items-center space-x-3 hover:border-green-200 transition-all">
            <Droplets className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">Máximo</div>
              <div className="text-2xl font-bold">{stats.max} mm</div>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border flex items-center space-x-3 hover:border-red-200 transition-all">
            <Droplets className="h-8 w-8 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Mínimo</div>
              <div className="text-2xl font-bold">{stats.min} mm</div>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border flex items-center space-x-3 hover:border-purple-200 transition-all">
            <Droplets className="h-8 w-8 text-purple-500" />
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{stats.total} mm</div>
            </div>
          </div>
        </div>
        
        {/* Filtros e pesquisa */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-grow max-w-sm">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar..."
              className="pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {uniqueYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-[180px]">
              <CloudRain className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as regiões</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2 ml-auto">
            <input
              type="file"
              id="csv-import"
              accept=".csv"
              className="hidden"
              onChange={handleImportData}
            />
            <label htmlFor="csv-import">
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Importar CSV
                </span>
              </Button>
            </label>
            
            <Button variant="outline" size="sm" onClick={handleDownloadData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar um novo registro</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="month"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mês</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um mês" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 
                                  'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map(month => (
                                  <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ano</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precipitação (mm)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Região</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma região" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {uniqueLocations.map(location => (
                                  <SelectItem key={location} value={location}>{location}</SelectItem>
                                ))}
                                <SelectItem value="Ilha Vizinha">Ilha Vizinha</SelectItem>
                                <SelectItem value="Arquipélago">Arquipélago</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="impact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Impacto</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um impacto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Positivo">Positivo</SelectItem>
                              <SelectItem value="Neutro">Neutro</SelectItem>
                              <SelectItem value="Negativo">Negativo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Salvar</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Tipo de gráfico */}
        <Tabs value={chartType} onValueChange={setChartType} className="mb-6">
          <TabsList>
            <TabsTrigger value="bar">
              <BarChart className="h-4 w-4 mr-2" />
              Histograma
            </TabsTrigger>
            <TabsTrigger value="line">
              <LineChartIcon className="h-4 w-4 mr-2" />
              Curvas
            </TabsTrigger>
            <TabsTrigger value="area">
              <CloudRain className="h-4 w-4 mr-2" />
              Áreas
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Gráficos */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} mm`, '']} />
                <Legend />
                {uniqueLocations.map(location => (
                  <Bar 
                    key={location} 
                    dataKey={location} 
                    name={location} 
                    fill={locationColors[location] || '#8884d8'} 
                  />
                ))}
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} mm`, '']} />
                <Legend />
                {uniqueLocations.map(location => (
                  <Line 
                    key={location} 
                    type="monotone" 
                    dataKey={location} 
                    name={location} 
                    stroke={locationColors[location] || '#8884d8'} 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} mm`, '']} />
                <Legend />
                {uniqueLocations.map(location => (
                  <Area 
                    key={location} 
                    type="monotone" 
                    dataKey={location} 
                    name={location} 
                    fill={locationColors[location] || '#8884d8'} 
                    stroke={locationColors[location] || '#8884d8'} 
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Tabela de dados */}
        <EditableTable
          data={filteredData}
          columns={columns}
          onUpdate={handleTableUpdate}
          onDelete={handleDeleteRow}
          sortable={true}
        />
      </div>
    </div>
  );
};

export default RainfallTracking;
