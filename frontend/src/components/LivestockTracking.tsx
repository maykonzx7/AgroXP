import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/contexts/CRMContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const LivestockTracking = () => {
  const { getModuleData, syncDataAcrossCRM, isRefreshing } = useCRM();
  const livestockData = getModuleData('livestock')?.items || [];
  
  const [localLivestockData, setLocalLivestockData] = useState(Array.isArray(livestockData) ? livestockData : []);

  // Atualizar dados quando o contexto CRM mudar
  React.useEffect(() => {
    setLocalLivestockData(Array.isArray(livestockData) ? livestockData : []);
  }, [livestockData]);

  const handleRefresh = () => {
    syncDataAcrossCRM();
    toast.success('Dados de pecuária atualizados');
  };

  // Função para obter cor do badge baseado no status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ativo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'sold':
      case 'vendido':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'dead':
      case 'morto':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'transferred':
      case 'transferido':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-end">
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>
      
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Acompanhamento de Animais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localLivestockData.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name || item.nom}</TableCell>
                  <TableCell>{item.breed || item.race}</TableCell>
                  <TableCell>{item.quantity || item.quantite}</TableCell>
                  <TableCell>{item.category || item.categorie}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status || item.statut)}>
                      {item.status || item.statut}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg">Produção de Leite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {localLivestockData
                .filter(item => item.category?.toLowerCase().includes('leite') || item.categorie?.toLowerCase().includes('leite'))
                .reduce((total, item) => total + (item.quantity || item.quantite || 0), 0)} L/dia
            </div>
            <p className="text-sm text-muted-foreground">Produção atual</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg">Produção de Carne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {localLivestockData
                .filter(item => item.category?.toLowerCase().includes('carne') || item.categorie?.toLowerCase().includes('carne'))
                .reduce((total, item) => total + (item.quantity || item.quantite || 0), 0)} kg/mês
            </div>
            <p className="text-sm text-muted-foreground">Produção atual</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg">Produção de Ovos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {localLivestockData
                .filter(item => item.category?.toLowerCase().includes('ovo') || item.categorie?.toLowerCase().includes('ovo'))
                .reduce((total, item) => total + (item.quantity || item.quantite || 0), 0)} unid/mês
            </div>
            <p className="text-sm text-muted-foreground">Produção atual</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LivestockTracking;