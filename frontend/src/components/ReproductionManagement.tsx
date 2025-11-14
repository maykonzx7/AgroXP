import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit3, Trash2 } from 'lucide-react';
import { useCRM } from '@/contexts/CRMContext';

const ReproductionManagement = () => {
  const { getModuleData } = useCRM();
  const livestockData = getModuleData('livestock')?.items || [];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReproduction, setEditingReproduction] = useState(null);

  // Dados de exemplo para reprodução
  const reproductionData = [
    {
      id: 1,
      livestockId: 1,
      animalName: "Vaca 1",
      matingDate: "2023-05-15",
      expectedDeliveryDate: "2024-02-15",
      actualDeliveryDate: null,
      offspringCount: null,
      notes: "Inseminação artificial",
      status: "gestando"
    },
    {
      id: 2,
      livestockId: 3,
      animalName: "Ovelha 1",
      matingDate: "2023-04-10",
      expectedDeliveryDate: "2023-09-10",
      actualDeliveryDate: "2023-09-12",
      offspringCount: 2,
      notes: "Parto natural",
      status: "pariu"
    }
  ];

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'gestando':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'pariu':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'abortou':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleSaveReproduction = (e) => {
    e.preventDefault();
    // Lógica para salvar o registro de reprodução
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Reprodução</h2>
          <p className="text-muted-foreground">
            Registre e acompanhe o processo reprodutivo dos animais
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Reprodução
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Reprodução</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveReproduction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="livestock">Animal</Label>
                <select 
                  id="livestock" 
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  required
                >
                  <option value="">Selecione um animal</option>
                   {(Array.isArray(livestockData) ? livestockData : []).map((animal: any) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.nom} - {animal.categorie}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matingDate">Data de Cobrição</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="matingDate" 
                      type="date" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDeliveryDate">Previsão de Parto</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="expectedDeliveryDate" 
                      type="date" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actualDeliveryDate">Data Real do Parto</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="actualDeliveryDate" 
                      type="date" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offspringCount">Nº de Filhotes</Label>
                  <Input 
                    id="offspringCount" 
                    type="number" 
                    placeholder="Número de filhotes" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status" 
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="planejado">Planejado</option>
                  <option value="gestando">Gestando</option>
                  <option value="pariu">Pariu</option>
                  <option value="abortou">Abortou</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Observações sobre a reprodução" 
                />
              </div>
              
              <Button type="submit" className="w-full">
                Registrar Reprodução
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Registros de Reprodução</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Cobrição</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Parto Real</TableHead>
                <TableHead>Filhotes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reproductionData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.animalName}</TableCell>
                  <TableCell>{item.matingDate}</TableCell>
                  <TableCell>{item.expectedDeliveryDate}</TableCell>
                  <TableCell>{item.actualDeliveryDate}</TableCell>
                  <TableCell>{item.offspringCount}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{item.notes}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingReproduction(item);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReproductionManagement;