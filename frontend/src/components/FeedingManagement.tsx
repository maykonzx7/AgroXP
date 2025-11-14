import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit3, Trash2 } from 'lucide-react';
import { useCRM } from '@/contexts/CRMContext';
import { useToast } from '@/hooks/use-toast';

const FeedingManagement = () => {
  const { getModuleData, addData, updateData, deleteData } = useCRM();
  const { toast } = useToast();
  const livestockData = getModuleData('livestock')?.items || [];
  
  const [feedingRecords, setFeedingRecords] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeeding, setEditingFeeding] = useState<any>(null);
  const [formData, setFormData] = useState({
    livestockId: '',
    feedType: '',
    quantity: 0,
    unit: 'kg',
    feedingDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Load feeding records from CRM context
  useEffect(() => {
    const feedingData = getModuleData('feeding')?.items || [];
    setFeedingRecords(feedingData);
  }, [getModuleData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFeeding) {
        // Update existing feeding record
        await updateData('feeding', editingFeeding.id, formData);
        toast({
          title: "Registro atualizado",
          description: "O registro de alimentação foi atualizado com sucesso.",
        });
      } else {
        // Add new feeding record
        await addData('feeding', formData);
        toast({
          title: "Registro adicionado",
          description: "O registro de alimentação foi adicionado com sucesso.",
        });
      }
      
      // Refresh records from backend
      const updatedFeedingData = getModuleData('feeding')?.items || [];
      setFeedingRecords(updatedFeedingData);
      setIsDialogOpen(false);
      setEditingFeeding(null);
      setFormData({
        livestockId: '',
        feedType: '',
        quantity: 0,
        unit: 'kg',
        feedingDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o registro de alimentação.",
        variant: "destructive"
      });
    }
  };

  // Handle editing a feeding record
  const handleEdit = (feeding: any) => {
    const animal = (Array.isArray(livestockData) ? livestockData : []).find((item: any) => item.id === feeding.livestockId);
    setFormData({
      livestockId: feeding.livestockId,
      feedType: feeding.feedType,
      quantity: feeding.quantity,
      unit: feeding.unit,
      feedingDate: feeding.feedingDate,
      notes: feeding.notes
    });
    setEditingFeeding(feeding);
    setIsDialogOpen(true);
  };

  // Handle deleting a feeding record
  const handleDelete = async (id: string) => {
    try {
      await deleteData('feeding', id);
      toast({
        title: "Registro excluído",
        description: "O registro de alimentação foi excluído com sucesso.",
      });
      // Refresh records from backend
      const updatedFeedingData = getModuleData('feeding')?.items || [];
      setFeedingRecords(updatedFeedingData);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o registro de alimentação.",
        variant: "destructive"
      });
    }
  };

  // Populate animal names for records
  const feedingRecordsWithNames =  (Array.isArray(feedingRecords) ? feedingRecords : []).map(record => {
    const animal = (Array.isArray(livestockData) ? livestockData : []).find((item: any) => item.id === record.livestockId);
    return {
      ...record,
      animalName: animal ? animal.name || animal.nom || animal.animalName : 'Animal Desconhecido'
    };
  });

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
              <DialogTitle>
                {editingFeeding ? 'Editar Alimentação' : 'Registrar Alimentação'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="livestockId">Animal</Label>
                <select 
                  id="livestockId"
                  name="livestockId"
                  value={formData.livestockId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  required
                >
                  <option value="">Selecione um animal</option>
                   {(Array.isArray(livestockData) ? livestockData : []).map((animal: any) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name || animal.nom || animal.animalName} - {animal.breed || animal.race || animal.categorie}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedType">Tipo de Alimento</Label>
                <Input 
                  id="feedType"
                  name="feedType"
                  value={formData.feedType}
                  onChange={handleInputChange}
                  placeholder="Nome do alimento" 
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input 
                    id="quantity"
                    name="quantity"
                    type="number" 
                    step="0.1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Quantidade" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <select 
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
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
                    name="feedingDate"
                    type="date" 
                    value={formData.feedingDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Observações sobre a alimentação" 
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" className="flex-1">
                  {editingFeeding ? 'Atualizar' : 'Registrar'}
                </Button>
              </div>
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
              {feedingRecordsWithNames.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.animalName}</TableCell>
                  <TableCell>{item.feedType}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>{new Date(item.feedingDate).toLocaleDateString()}</TableCell>
                  <TableCell>{item.notes}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDelete(item.id)}
                      >
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