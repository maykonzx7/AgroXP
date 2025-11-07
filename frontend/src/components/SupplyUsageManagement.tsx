import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Edit3, Trash2 } from 'lucide-react';
import { useCRM } from '@/contexts/CRMContext';
import { id } from 'date-fns/locale';

const SupplyUsageManagement = () => {
  const { getModuleData } = useCRM();
  const livestockData = getModuleData('livestock')?.items || [];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsage, setEditingUsage] = useState(null);

  // Dados de exemplo para uso de insumos
  const usageData = [
    {
      id: 1,
      livestockId: 1,
      animalName: "Vaca 1",
      supplyId: 1,
      supplyName: "Vacina Aftosa",
      quantityUsed: 1,
      unit: "dose",
      usageDate: "2023-06-15",
      notes: "Vacinação de rotina"
    },
    {
      id: 2,
      livestockId: 2,
      animalName: "Porco 1",
      supplyId: 2,
      supplyName: "Ração Premium",
      quantityUsed: 8.2,
      unit: "kg",
      usageDate: "2023-06-15",
      notes: "Alimentação diária"
    },
    {
      id: 3,
      livestockId: 3,
      animalName: "Galinha da angola",
      supplyId: 3,
      supplyName: "Ração Premium",
      quantityUsed: 8.2,
      unit: "kg",
      usageDate: "2023-06-15",
      notes: "Alimentação diária"
    }
  ];

  const handleSaveUsage = (e) => {
    e.preventDefault();
    // Lógica para salvar o uso de insumo
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Uso de Insumos</h2>
          <p className="text-muted-foreground">
            Registre o uso de medicamentos, vacinas e suplementos nos animais
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Uso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Uso de Insumo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveUsage} className="space-y-4">
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
                <Label htmlFor="supply">Insumo</Label>
                <select 
                  id="supply" 
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  required
                >
                  <option value="">Selecione um insumo</option>
                  <option value="1">Vacina Aftosa</option>
                  <option value="2">Ração Premium</option>
                  <option value="3">Suplemento Mineral</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantityUsed">Quantidade Usada</Label>
                  <Input 
                    id="quantityUsed" 
                    type="number" 
                    step="0.1"
                    placeholder="Quantidade" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Input 
                    id="unit" 
                    placeholder="Unidade (kg, l, doses, etc.)" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usageDate">Data de Uso</Label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="usageDate" 
                    type="date" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <textarea 
                  id="notes" 
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Observações sobre o uso do insumo"
                />
              </div>
              
              <Button type="submit" className="w-full">
                Registrar Uso
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Registros de Uso de Insumos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Insumo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.animalName}</TableCell>
                  <TableCell>{item.supplyName}</TableCell>
                  <TableCell>{item.quantityUsed} {item.unit}</TableCell>
                  <TableCell>{item.usageDate}</TableCell>
                  <TableCell>{item.notes}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingUsage(item);
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

export default SupplyUsageManagement;