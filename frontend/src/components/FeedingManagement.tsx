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

const FeedingManagement = () => {
  const { getModuleData } = useCRM();
  const livestockData = getModuleData('livestock')?.items || [];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeeding, setEditingFeeding] = useState(null);

  // Dados de exemplo para alimentação
  const feedingData = [
    {
      id: 1,
      livestockId: 1,
      animalName: "Vaca 1",
      feedType: "Ração Premium",
      quantity: 15.5,
      unit: "kg",
      feedingDate: "2023-06-15",
      notes: "Ração para lactação"
    },
    {
      id: 2,
      livestockId: 2,
      animalName: "Porco 1",
      feedType: "Ração Crescimento",
      quantity: 8.2,
      unit: "kg",
      feedingDate: "2023-06-15",
      notes: "Ração para crescimento"
    }
  ];

  const handleSaveFeeding = (e) => {
    e.preventDefault();
    // Lógica para salvar o registro de alimentação
    console.log("Salvando registro de alimentação");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Alimentação</h2>
          <p className="text-muted-foreground">
            Registre e acompanhe a alimentação dos animais
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Alimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Alimentação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveFeeding} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="livestock">Animal</Label>
                <select 
                  id="livestock" 
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  required
                >
                  <option value="">Selecione um animal</option>
                  {livestockData.map((animal: any) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.nom} - {animal.categorie}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedType">Tipo de Alimento</Label>
                <Input 
                  id="feedType" 
                  placeholder="Nome do alimento" 
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    step="0.1"
                    placeholder="Quantidade" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <select 
                    id="unit" 
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                    required
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedingDate">Data</Label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="feedingDate" 
                    type="date" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Observações sobre a alimentação" 
                />
              </div>
              
              <Button type="submit" className="w-full">
                Registrar Alimentação
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Registros de Alimentação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Alimento</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedingData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.animalName}</TableCell>
                  <TableCell>{item.feedType}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>{item.feedingDate}</TableCell>
                  <TableCell>{item.notes}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingFeeding(item);
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

export default FeedingManagement;