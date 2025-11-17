import React, { useState, useEffect } from 'react';
import { EditableField } from '@/components/ui/editable-field';
import { EditableTable, Column } from '@/components/ui/editable-table';
import { CloudRain, Sun, Wind, Thermometer, Droplets, Eye, AlertTriangle, Calendar, Filter, CloudLightning, PlusCircle, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
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
import { Badge } from "./ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import PreviewPrintButton from '@/components/common/PreviewPrintButton';
import { weatherApi } from '@/services/api';

interface WeatherAlert {
  id: string;
  date: string;
  type: string;
  region?: string;
  severity: string;
  description: string;
  title: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

const alertFormSchema = z.object({
  date: z.string().min(1, { message: "A data é obrigatória" }),
  type: z.enum(['Chuva intensa', 'Tempestade tropical', 'Seca', 'Calor excessivo', 'Inundação']),
  region: z.string().min(1, { message: "A região é obrigatória" }),
  severity: z.enum(['Baixa', 'Média', 'Alta', 'Extrema']),
  impactCrops: z.enum(['Baixo', 'Moderado', 'Severo']),
  description: z.string().min(5, { message: "Descrição muito curta" }),
  recommendation: z.string().min(5, { message: "Recomendação muito curta" }),
  status: z.enum(['Ativo', 'Concluído', 'Previsto']),
});

const WeatherAlerts = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('Alertas Meteorológicos');
  const [description, setDescription] = useState('Acompanhe os alertas meteorológicos que afetam as culturas e prepare suas ações preventivas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<z.infer<typeof alertFormSchema>>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      type: 'Chuva intensa',
      region: 'Região Sul',
      severity: 'Média',
      impactCrops: 'Moderado',
      description: '',
      recommendation: '',
      status: 'Ativo',
    },
  });

  // Carregar alertas da API
  useEffect(() => {
    loadWeatherAlerts();
  }, []);

  const loadWeatherAlerts = async () => {
    try {
      setIsLoading(true);
      const alerts = await weatherApi.getAll();
      // Mapear dados da API para o formato do componente
      const mappedAlerts: WeatherAlert[] = alerts.map((alert: any) => ({
        id: alert.id,
        date: alert.startDate ? new Date(alert.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        type: alert.type || 'OTHER',
        region: alert.region || alert.field?.name || 'N/A',
        severity: alert.severity || 'MEDIUM',
        description: alert.description || '',
        title: alert.title || '',
        startDate: alert.startDate || new Date().toISOString(),
        endDate: alert.endDate,
        isActive: alert.isActive !== undefined ? alert.isActive : true,
      }));
      setWeatherAlerts(mappedAlerts);
    } catch (error) {
      console.error('Erro ao carregar alertas meteorológicos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas meteorológicos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const columns: Column[] = [
    { id: 'date', header: 'Data', accessorKey: 'date', isEditable: true },
    { id: 'type', header: 'Tipo de alerta', accessorKey: 'type', isEditable: true },
    { id: 'region', header: 'Região', accessorKey: 'region', isEditable: true },
    { id: 'severity', header: 'Severidade', accessorKey: 'severity', isEditable: true },
    { id: 'status', header: 'Status', accessorKey: 'status', isEditable: true },
  ];
  
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
  
  const formatSeverity = (severity: string) => {
    const map: Record<string, string> = {
      'LOW': 'Baixa',
      'MEDIUM': 'Média',
      'HIGH': 'Alta',
      'CRITICAL': 'Extrema',
    };
    return map[severity.toUpperCase()] || severity;
  };
  
  const filteredAlerts = weatherAlerts.filter(alert => {
    const matchesSearch = 
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.region && alert.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.title && alert.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSeverity = filterSeverity === 'all' || 
      formatSeverity(alert.severity).toLowerCase() === filterSeverity.toLowerCase();
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'Ativo' && alert.isActive) ||
      (filterStatus === 'Concluído' && !alert.isActive);
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });
  
  const handleTableUpdate = (rowIndex: number, columnId: string, value: any) => {
    const newData = [...weatherAlerts];
    const itemId = filteredAlerts[rowIndex].id;
    const dataIndex = newData.findIndex(item => item.id === itemId);
    
    if (dataIndex !== -1) {
      const updatedItem = { ...newData[dataIndex], [columnId]: value };
      newData[dataIndex] = updatedItem;
      setWeatherAlerts(newData);
      
      toast({
        title: "Alerta atualizado",
        description: `As informações do alerta foram atualizadas`
      });
    }
  };
  
  const handleDeleteRow = (rowIndex: number) => {
    const itemId = filteredAlerts[rowIndex].id;
    const newData = weatherAlerts.filter(item => item.id !== itemId);
    setWeatherAlerts(newData);
    
    toast({
      title: "Alerta excluído",
      description: "O alerta foi excluído com sucesso"
    });
  };
  
  const onSubmit = async (data: z.infer<typeof alertFormSchema>) => {
    try {
      // Mapear tipo do formulário para o enum do backend
      const typeMap: Record<string, string> = {
        'Chuva intensa': 'HEAVY_RAIN',
        'Tempestade tropical': 'STORM',
        'Seca': 'DROUGHT',
        'Calor excessivo': 'HEAT_WAVE',
        'Inundação': 'HEAVY_RAIN',
      };
      
      // Mapear severidade
      const severityMap: Record<string, string> = {
        'Baixa': 'LOW',
        'Média': 'MEDIUM',
        'Alta': 'HIGH',
        'Extrema': 'CRITICAL',
      };

      const alertData = {
        type: typeMap[data.type] || 'OTHER',
        severity: severityMap[data.severity] || 'MEDIUM',
        title: `${data.type} - ${data.region}`,
        description: data.description,
        startDate: new Date(data.date).toISOString(),
        region: data.region,
        isActive: data.status === 'Ativo',
      };

      await weatherApi.create(alertData);
      await loadWeatherAlerts();
      setDialogOpen(false);
      form.reset();
      
      toast({
        title: "Alerta adicionado",
        description: `Novo alerta meteorológico adicionado para ${data.region}`
      });
    } catch (error: any) {
      console.error('Erro ao criar alerta:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o alerta",
        variant: "destructive"
      });
    }
  };
  
  const handleExpandAlert = (id: string) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };
  
  const getAlertIcon = (type: string) => {
    const upperType = type.toUpperCase();
    if (upperType.includes('RAIN') || upperType.includes('HEAVY_RAIN')) {
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    } else if (upperType.includes('STORM') || upperType.includes('WIND')) {
      return <Wind className="h-6 w-6 text-purple-500" />;
    } else if (upperType.includes('DROUGHT') || upperType.includes('SECA')) {
      return <Sun className="h-6 w-6 text-orange-500" />;
    } else if (upperType.includes('HEAT') || upperType.includes('HEAT_WAVE')) {
      return <Thermometer className="h-6 w-6 text-red-500" />;
    } else if (upperType.includes('FROST') || upperType.includes('HAIL')) {
      return <CloudLightning className="h-6 w-6 text-indigo-500" />;
    }
    return <AlertTriangle className="h-6 w-6 text-gray-500" />;
  };
  
  const getSeverityColor = (severity: string) => {
    const upperSeverity = severity.toUpperCase();
    if (upperSeverity === 'LOW' || upperSeverity === 'BAIXA') {
      return 'bg-green-100 text-green-800';
    } else if (upperSeverity === 'MEDIUM' || upperSeverity === 'MÉDIA') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (upperSeverity === 'HIGH' || upperSeverity === 'ALTA') {
      return 'bg-orange-100 text-orange-800';
    } else if (upperSeverity === 'CRITICAL' || upperSeverity === 'EXTREMA') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };
  
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <CloudLightning className="h-6 w-6 mr-2 text-purple-500" />
            <EditableField
              value={title}
              onSave={handleTitleChange}
              className="inline-block"
              asSpan={true}
            />
          </h2>
          <p className="text-muted-foreground">
            <EditableField
              value={description}
              onSave={handleDescriptionChange}
              className="inline-block"
              asSpan={true}
            />
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="relative flex-grow max-w-sm">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar um alerta..."
              className="pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[150px]">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Extrema">Extrema</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Previsto">Previsto</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="ml-auto">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo alerta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Adicionar um novo alerta meteorológico</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de alerta</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Chuva intensa">Chuva intensa</SelectItem>
                                <SelectItem value="Tempestade tropical">Tempestade tropical</SelectItem>
                                <SelectItem value="Seca">Seca</SelectItem>
                                <SelectItem value="Calor excessivo">Calor excessivo</SelectItem>
                                <SelectItem value="Inundação">Inundação</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="region"
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
                                <SelectItem value="Região Sul">Região Sul</SelectItem>
                                <SelectItem value="Região Norte">Região Norte</SelectItem>
                                <SelectItem value="Ilha Vizinha">Ilha Vizinha</SelectItem>
                                <SelectItem value="Arquipélago">Arquipélago</SelectItem>
                                <SelectItem value="Ilha Desejada">Ilha Desejada</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="severity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Severidade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma severidade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Baixa">Baixa</SelectItem>
                                <SelectItem value="Média">Média</SelectItem>
                                <SelectItem value="Alta">Alta</SelectItem>
                                <SelectItem value="Extrema">Extrema</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="impactCrops"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impacto nas culturas</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um impacto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Baixo">Baixo</SelectItem>
                                <SelectItem value="Moderado">Moderado</SelectItem>
                                <SelectItem value="Severo">Severo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Ativo">Ativo</SelectItem>
                                <SelectItem value="Concluído">Concluído</SelectItem>
                                <SelectItem value="Previsto">Previsto</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recommendation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recomendação</FormLabel>
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
        
        <div className="space-y-4 mb-6">
          {isLoading ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <Loader2 className="h-10 w-10 mx-auto text-muted-foreground mb-2 animate-spin" />
              <p className="text-muted-foreground">Carregando alertas meteorológicos...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum alerta corresponde aos critérios de pesquisa</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div 
                key={alert.id} 
                className="border rounded-lg overflow-hidden hover:border-blue-200 transition-all"
              >
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => handleExpandAlert(alert.id)}
                >
                  <div className="flex items-center space-x-4">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h3 className="font-semibold">{alert.title || alert.type} {alert.region && `- ${alert.region}`}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(alert.startDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {formatSeverity(alert.severity)}
                    </Badge>
                    <Badge className={getStatusColor(alert.isActive)}>
                      {alert.isActive ? 'Ativo' : 'Concluído'}
                    </Badge>
                    {expandedAlertId === alert.id ? (
                      <ArrowUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {expandedAlertId === alert.id && (
                  <div className="p-4 bg-muted/20 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Descrição</h4>
                        <p className="text-sm">{alert.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Período</h4>
                        <p className="text-sm">
                          {new Date(alert.startDate).toLocaleDateString('pt-BR')}
                          {alert.endDate && ` até ${new Date(alert.endDate).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                    </div>
                    {alert.region && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-1">Região</h4>
                        <p className="text-sm">{alert.region}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <h3 className="text-lg font-semibold p-4 bg-muted/20 border-b">Gerenciar alertas</h3>
          <EditableTable
            data={filteredAlerts}
            columns={columns}
            onUpdate={handleTableUpdate}
            onDelete={handleDeleteRow}
            sortable={true}
            className="border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default WeatherAlerts;
