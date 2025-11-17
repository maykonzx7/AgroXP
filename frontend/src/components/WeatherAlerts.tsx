import React, { useState, useEffect } from 'react';
import { EditableField } from '@/components/ui/editable-field';
import { EditableTable, Column } from '@/components/ui/editable-table';
import { CloudRain, Sun, Wind, Thermometer, Droplets, Eye, AlertTriangle, Calendar, Filter, CloudLightning, PlusCircle, ArrowUp, ArrowDown } from 'lucide-react';
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

interface WeatherAlert {
  id: number;
  date: string;
  type: 'Chuva intensa' | 'Tempestade tropical' | 'Seca' | 'Calor excessivo' | 'Inundação';
  region: string;
  severity: 'Baixa' | 'Média' | 'Alta' | 'Extrema';
  impactCrops: 'Baixo' | 'Moderado' | 'Severo';
  description: string;
  recommendation: string;
  status: 'Ativo' | 'Concluído' | 'Previsto';
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
  const [expandedAlertId, setExpandedAlertId] = useState<number | null>(null);
  
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
  
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([
    {
      id: 1,
      date: '2025-06-15',
      type: 'Chuva forte',
      region: 'Região Sul',
      severity: 'Alta',
      impactCrops: 'Moderado',
      description: 'Fortes chuvas esperadas por 48 horas com risco de inundação em áreas de baixa altitude.',
      recommendation: 'Verificar a drenagem das parcelas e proteger as mudas jovens. Suspender temporariamente a irrigação.',
      status: 'Ativo'
    },
    {
      id: 2,
      date: '2025-06-20',
      type: 'Tempestade tropical',
      region: 'Região Norte',
      severity: 'Extrema',
      impactCrops: 'Severo',
      description: 'Tempestade tropical Emily se aproximando com ventos que podem exceder 120 km/h e fortes chuvas.',
      recommendation: 'Colher preventivamente as culturas maduras. Reforçar os tutores dos bananeirais. Proteger os equipamentos agrícolas.',
      status: 'Previsto'
    },
    {
      id: 3,
      date: '2025-05-25',
      type: 'Seca',
      region: 'Região Norte',
      severity: 'Média',
      impactCrops: 'Moderado',
      description: 'Período prolongado sem chuvas significativas causando estresse hídrico para algumas culturas.',
      recommendation: 'Priorizar a irrigação de culturas sensíveis. Usar cobertura morta para conservar a umidade do solo.',
      status: 'Concluído'
    },
    {
      id: 4,
      date: '2025-07-05',
      type: 'Calor excessivo',
      region: 'Arquipélago',
      severity: 'Média',
      impactCrops: 'Moderado',
      description: 'Onda de calor com temperaturas acima de 35°C por vários dias consecutivos.',
      recommendation: 'Sombrear culturas sensíveis. Aumentar a frequência da irrigação, preferencialmente de manhã cedo ou no final da tarde.',
      status: 'Previsto'
    },
    {
      id: 5,
      date: '2025-06-10',
      type: 'Inundação',
      region: 'Região Sul',
      severity: 'Alta',
      impactCrops: 'Severo',
      description: 'Transbordamento de rios após chuvas intensas nos últimos dias, afetando parcelas em áreas baixas.',
      recommendation: 'Evacuar as culturas que podem ser colhidas. Preparar os pedidos de indenização. Monitorar doenças fúngicas.',
      status: 'Concluído'
    }
  ]);
  
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
  
  const filteredAlerts = weatherAlerts.filter(alert => {
    const matchesSearch = 
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.recommendation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    
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
  
  const onSubmit = (data: z.infer<typeof alertFormSchema>) => {
    const newId = Math.max(0, ...weatherAlerts.map(item => item.id)) + 1;
    
    const newAlert: WeatherAlert = {
      id: newId,
      date: data.date,
      type: data.type,
      region: data.region,
      severity: data.severity,
      impactCrops: data.impactCrops,
      description: data.description,
      recommendation: data.recommendation,
      status: data.status
    };
    
    setWeatherAlerts([...weatherAlerts, newAlert]);
    setDialogOpen(false);
    form.reset();
    
    toast({
      title: "Alerta adicionado",
      description: `Novo alerta meteorológico adicionado para ${data.region}`
    });
  };
  
  const handleExpandAlert = (id: number) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Chuva intensa':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'Tempestade tropical':
        return <Wind className="h-6 w-6 text-purple-500" />;
      case 'Seca':
        return <Sun className="h-6 w-6 text-orange-500" />;
      case 'Calor excessivo':
        return <Thermometer className="h-6 w-6 text-red-500" />;
      case 'Inundação':
        return <CloudLightning className="h-6 w-6 text-indigo-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-500" />;
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-blue-100 text-blue-800';
      case 'Concluído':
        return 'bg-gray-100 text-gray-800';
      case 'Previsto':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          {filteredAlerts.length === 0 ? (
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
                      <h3 className="font-semibold">{alert.type} - {alert.region}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(alert.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Badge className={getStatusColor(alert.status)}>
                      {alert.status}
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
                        <h4 className="text-sm font-semibold mb-1">Recomendações</h4>
                        <p className="text-sm">{alert.recommendation}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-1">Impacto nas culturas</h4>
                      <Badge className={alert.impactCrops === 'Severo' ? 'bg-red-100 text-red-800' : 
                                      alert.impactCrops === 'Moderado' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-green-100 text-green-800'}>
                        {alert.impactCrops}
                      </Badge>
                    </div>
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
