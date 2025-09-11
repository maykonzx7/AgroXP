import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/contexts/CRMContext';

const LivestockTracking = () => {
  const { getModuleData } = useCRM();
  const livestockData = getModuleData('livestock')?.items || [];

  // Função para obter cor do badge baseado no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'vendido':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'morto':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'transferido':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
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
              {livestockData.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nom}</TableCell>
                  <TableCell>{item.race}</TableCell>
                  <TableCell>{item.quantite}</TableCell>
                  <TableCell>{item.categorie}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.statut)}>
                      {item.statut}
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
            <div className="text-3xl font-bold">1.250 L/dia</div>
            <p className="text-sm text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg">Produção de Carne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">850 kg/mês</div>
            <p className="text-sm text-muted-foreground">+8% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg">Produção de Ovos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.000 unid/mês</div>
            <p className="text-sm text-muted-foreground">+5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LivestockTracking;