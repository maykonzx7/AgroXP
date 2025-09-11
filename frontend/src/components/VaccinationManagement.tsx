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

const VaccinationManagement = () => {
  const { getModuleData } = useCRM();
  const livestockData = getModuleData('livestock')?.items || [];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState(null);

  // Dados de exemplo para vacinação
  const vaccinationData = [
    {
      id: 1,
      livestockId: 1,
      animalName: "Vaca 1",
      vaccineName: "Aftosa",
      vaccinationDate: "2023-06-15",
      nextVaccinationDate: "2024-06-15",
      veterinarian: "Dr. Silva",
      notes: "Vacinação em dia"
    },
    {
      id: 2,
      livestockId: 2,
      animalName: "Porco 1",
      vaccineName: "Aftosa",
      vaccinationDate: "2023-06-10",
      nextVaccinationDate: "2024-06-10",
      veterinarian: "Dr. Santos",
      notes: "Primeira dose"
    }
  ];

  const handleSaveVaccination = (e) => {
    e.preventDefault();
    // Lógica para salvar o registro de vacinação
    console.log("Salvando registro de vacinação");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Vacinação</h2>
          <p className="text-muted-foreground">
            Registre e acompanhe as vacinações dos animais
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Vacinação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Vacinação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveVaccination} className="space-y-4">
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
                <Label htmlFor="vaccineName">Vacina</Label>
                <Input 
                  id="vaccineName" 
                  placeholder="Nome da vacina" 
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vaccinationDate">Data da Vacinação</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="vaccinationDate" 
                      type="date" 
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextVaccinationDate">Próxima Vacinação</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="nextVaccinationDate" 
                      type="date" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="veterinarian">Veterinário</Label>
                <Input 
                  id="veterinarian" 
                  placeholder="Nome do veterinário" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Observações sobre a vacinação" 
                />
              </div>
              
              <Button type="submit" className="w-full">
                Registrar Vacinação
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Registros de Vacinação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Vacina</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Próxima</TableHead>
                <TableHead>Veterinário</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccinationData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.animalName}</TableCell>
                  <TableCell>{item.vaccineName}</TableCell>
                  <TableCell>{item.vaccinationDate}</TableCell>
                  <TableCell>{item.nextVaccinationDate}</TableCell>
                  <TableCell>{item.veterinarian}</TableCell>
                  <TableCell>{item.notes}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingVaccination(item);
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

export default VaccinationManagement;