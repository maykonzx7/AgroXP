import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Skull, History } from 'lucide-react';
import { useCRM } from '@/contexts/CRMContext';
import { toast } from 'sonner';
import { DeathRegistrationModal } from './livestock';

const SpecificLivestock = () => {
  const { getModuleData, updateModuleData, updateData, syncDataAcrossCRM } = useCRM();
  const livestockDataRaw = getModuleData('livestock')?.items || [];
  
  // Ensure deathHistory is properly parsed from JSON if it comes as a string
  const livestockData = livestockDataRaw.map((item: any) => {
    if (item.deathHistory) {
      // If deathHistory is a string, parse it
      if (typeof item.deathHistory === 'string') {
        try {
          item.deathHistory = JSON.parse(item.deathHistory);
        } catch (e) {
          console.warn('Failed to parse deathHistory:', e);
        }
      }
    }
    return item;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<{
    id: number | string;
    name: string;
    breed?: string;
    category?: string;
    quantity?: number;
    age?: number;
    weight?: number;
    status?: string;
    fieldId?: string;
  } | null>(null);

  // Filtrar dados com base no termo de busca
  const filteredData = (Array.isArray(livestockData) ? livestockData : []).filter((item: any) => {
    const name = item.name || item.nom || '';
    const breed = item.breed || item.race || '';
    const searchLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchLower) || breed.toLowerCase().includes(searchLower);
  });

  // Função para registrar óbito de um animal
  const handleRegisterDeath = async (deathData: any) => {
    try {
      // Find the animal group in the livestock data
      const animalGroup = livestockData.find((item: any) => item.id === deathData.animalId);
      
      if (!animalGroup) {
        toast.error('Animal não encontrado');
        return;
      }
      
      // Calculate the new quantity after deaths
      const currentQuantity = animalGroup.quantity || animalGroup.quantite || 0;
      const newQuantity = currentQuantity - deathData.numberOfDeaths;
      
      if (newQuantity < 0) {
        toast.error('Número de óbitos inválido', {
          description: `Não é possível registrar ${deathData.numberOfDeaths} óbitos. O grupo tem apenas ${currentQuantity} animais.`
        });
        return;
      }
      
      // If all animals in the group have died, mark the group as dead
      const newStatus = newQuantity === 0 ? 'DEAD' : 'ACTIVE';
      
      // Prepare death history data
      const deathRecord = {
        date: deathData.deathDate,
        reason: deathData.deathReason,
        description: deathData.deathDescription,
        veterinaryReport: deathData.veterinaryReport,
        numberOfDeaths: deathData.numberOfDeaths,
        timestamp: deathData.timestamp
      };
      
      // Get existing death history or create new array
      const existingDeathHistory = animalGroup.deathHistory || [];
      const updatedDeathHistory = [...existingDeathHistory, deathRecord];
      
      // Prepare update data for backend
      // Store death history in the deathHistory JSON field
      const livestockUpdateData: any = {
        quantity: newQuantity,
        status: newStatus,
        deathHistory: updatedDeathHistory, // Store as JSON in the database
      };
      
      // Update description to include a summary of the last death
      const currentDescription = animalGroup.description || '';
      const deathSummary = `[Óbito registrado em ${new Date(deathData.deathDate).toLocaleDateString('pt-BR')}] ${deathData.deathReason}${deathData.deathDescription ? ': ' + deathData.deathDescription : ''}`;
      const updatedDescription = currentDescription 
        ? `${currentDescription}\n${deathSummary}`
        : deathSummary;
      
      livestockUpdateData.description = updatedDescription;
      
      // Update in backend
      const updatedLivestock = await updateData('livestock', deathData.animalId.toString(), livestockUpdateData);
      
      // Also update local state for immediate UI feedback
      // Use the data returned from backend to ensure consistency
      const updatedLivestockData = livestockData.map((item: any) => {
        if (item.id === deathData.animalId) {
          // Use backend data if available, otherwise use calculated values
          const finalQuantity = updatedLivestock?.quantity ?? newQuantity;
          const finalStatus = updatedLivestock?.status ?? newStatus;
          const finalDescription = updatedLivestock?.description ?? updatedDescription;
          const finalDeathHistory = updatedLivestock?.deathHistory ?? updatedDeathHistory;
          
          return {
            ...item,
            quantity: finalQuantity,
            quantite: finalQuantity,
            status: finalStatus,
            statut: finalStatus,
            description: finalDescription,
            deathHistory: finalDeathHistory,
            dateMort: finalQuantity === 0 ? deathData.deathDate : item.dateMort,
            raisonMort: finalQuantity === 0 ? deathData.deathReason : item.raisonMort,
            descriptionMort: finalQuantity === 0 ? deathData.deathDescription : item.descriptionMort,
            rapportVeterinaire: finalQuantity === 0 ? deathData.veterinaryReport : item.rapportVeterinaire,
          };
        }
        return item;
      });
      
      updateModuleData('livestock', {
        items: updatedLivestockData
      });
      
      // Sync data to ensure consistency
      setTimeout(() => {
        syncDataAcrossCRM();
      }, 500);
      
      toast.success('Óbito registrado com sucesso', {
        description: deathData.numberOfDeaths === 1 
          ? `O óbito de 1 animal do grupo ${deathData.animalName} foi registrado.`
          : `Foram registrados ${deathData.numberOfDeaths} óbitos do grupo ${deathData.animalName}.`
      });
    } catch (error: any) {
      console.error('Error registering death:', error);
      toast.error('Erro ao registrar óbito', {
        description: error.message || 'Não foi possível registrar o óbito do animal.'
      });
    }
  };

  const openDeathModal = (animal: any) => {
    setSelectedAnimal({
      id: animal.id,
      name: animal.name || animal.nom || '',
      breed: animal.breed || animal.race || '',
      category: animal.category || animal.categorie || '',
      quantity: animal.quantity || animal.quantite || 0
    });
    setIsDeathModalOpen(true);
  };

  const openEditDialog = (animal: any) => {
    setSelectedAnimal({
      id: animal.id,
      name: animal.name || animal.nom || '',
      breed: animal.breed || animal.race || '',
      category: animal.category || animal.categorie || '',
      quantity: animal.quantity || animal.quantite || 0,
      age: animal.age || null,
      weight: animal.weight || null,
      status: animal.status || animal.statut || 'ACTIVE',
      fieldId: animal.fieldId || null,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    const formData = new FormData(e.currentTarget);
    const updates: any = {
      name: formData.get('name') as string,
      breed: formData.get('breed') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string) || 0,
      age: formData.get('age') ? parseInt(formData.get('age') as string) : null,
      weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : null,
      status: formData.get('status') as string,
    };

    try {
      await updateData('livestock', selectedAnimal.id.toString(), updates);
      toast.success('Animal atualizado com sucesso!');
      setIsEditDialogOpen(false);
      setSelectedAnimal(null);
      setTimeout(() => {
        syncDataAcrossCRM();
      }, 500);
    } catch (error: any) {
      console.error('Error updating livestock:', error);
      toast.error('Erro ao atualizar animal: ' + (error.message || 'Erro desconhecido'));
    }
  };

  // Function to get death history for an animal group
  const getDeathHistory = (animal: any) => {
    // Handle both JSON field and parsed object
    let deathHistory = animal.deathHistory;
    
    // If deathHistory is a string, try to parse it
    if (typeof deathHistory === 'string') {
      try {
        deathHistory = JSON.parse(deathHistory);
      } catch (e) {
        // If parsing fails, check if it's in the description
        deathHistory = null;
      }
    }
    
    if (!deathHistory || (Array.isArray(deathHistory) && deathHistory.length === 0)) {
      return 'Nenhum registro de óbito';
    }
    
    if (Array.isArray(deathHistory)) {
      const totalDeaths = deathHistory.reduce((sum: number, record: any) => sum + (record.numberOfDeaths || 1), 0);
      return `${totalDeaths} óbito(s) registrado(s)`;
    }
    
    // If it's an object with deathHistory property
    if (deathHistory.deathHistory && Array.isArray(deathHistory.deathHistory)) {
      const totalDeaths = deathHistory.deathHistory.reduce((sum: number, record: any) => sum + (record.numberOfDeaths || 1), 0);
      return `${totalDeaths} óbito(s) registrado(s)`;
    }
    
    return 'Nenhum registro de óbito';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar animais..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Animal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Animal</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Nome do animal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Raça</Label>
                <Input id="breed" placeholder="Raça do animal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input id="quantity" type="number" placeholder="Quantidade" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select id="category" className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700">
                  <option value="bovino">Bovino</option>
                  <option value="suíno">Suíno</option>
                  <option value="ovino">Ovino</option>
                  <option value="caprino">Caprino</option>
                  <option value="avícola">Avícola</option>
                  <option value="equino">Equino</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Adicionar Animal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Animais Específicos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Óbitos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item: any) => {
                  const name = item.name || item.nom || 'Sem nome';
                  const breed = item.breed || item.race || 'Não especificado';
                  const quantity = item.quantity || item.quantite || 0;
                  const category = item.category || item.categorie || 'Não especificado';
                  const status = item.status || item.statut || 'ACTIVE';
                  const isActive = status === 'ACTIVE' || status === 'ativo' || status === 'active';
                  const isDead = status === 'DEAD' || status === 'morto' || status === 'dead';
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>{breed}</TableCell>
                      <TableCell>{quantity}</TableCell>
                      <TableCell>{category}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : isDead
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {isActive ? 'Ativo' : isDead ? 'Morto' : status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <History className="h-4 w-4 mr-1 text-muted-foreground" />
                          {getDeathHistory(item)}
                        </div>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          Editar
                        </Button>
                        {isActive && quantity > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openDeathModal(item)}
                          >
                            <Skull className="h-4 w-4 mr-1" />
                            Registrar Óbito
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum animal encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Animal</DialogTitle>
          </DialogHeader>
          {selectedAnimal && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome *</Label>
                  <Input 
                    id="edit-name" 
                    name="name"
                    placeholder="Nome do animal" 
                    defaultValue={selectedAnimal.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-breed">Raça</Label>
                  <Input 
                    id="edit-breed" 
                    name="breed"
                    placeholder="Raça do animal" 
                    defaultValue={selectedAnimal.breed || ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantidade *</Label>
                  <Input 
                    id="edit-quantity" 
                    name="quantity"
                    type="number" 
                    min="0"
                    placeholder="Quantidade" 
                    defaultValue={selectedAnimal.quantity || 0}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria *</Label>
                  <select 
                    id="edit-category" 
                    name="category"
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                    defaultValue={selectedAnimal.category || 'bovino'}
                    required
                  >
                    <option value="bovino">Bovino</option>
                    <option value="suíno">Suíno</option>
                    <option value="ovino">Ovino</option>
                    <option value="caprino">Caprino</option>
                    <option value="avícola">Avícola</option>
                    <option value="equino">Equino</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-age">Idade (meses)</Label>
                  <Input 
                    id="edit-age" 
                    name="age"
                    type="number" 
                    min="0"
                    placeholder="Idade em meses" 
                    defaultValue={selectedAnimal.age || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Peso (kg)</Label>
                  <Input 
                    id="edit-weight" 
                    name="weight"
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="Peso em kg" 
                    defaultValue={selectedAnimal.weight || ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <select 
                  id="edit-status" 
                  name="status"
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  defaultValue={selectedAnimal.status || 'ACTIVE'}
                  required
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="DEAD">Morto</option>
                  <option value="SOLD">Vendido</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedAnimal(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <DeathRegistrationModal
        isOpen={isDeathModalOpen}
        onClose={() => setIsDeathModalOpen(false)}
        animal={selectedAnimal}
        onRegisterDeath={handleRegisterDeath}
      />
    </div>
  );
};

export default SpecificLivestock;