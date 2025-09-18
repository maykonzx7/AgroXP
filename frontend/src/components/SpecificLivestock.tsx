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
  const { getModuleData, updateModuleData } = useCRM();
  const livestockData = getModuleData('livestock')?.items || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<{
    id: number;
    name: string;
    breed?: string;
    category?: string;
    quantity?: number;
  } | null>(null);

  // Filtrar dados com base no termo de busca
  const filteredData = livestockData.filter((item: any) =>
    item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.race.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para registrar óbito de um animal
  const handleRegisterDeath = async (deathData: any) => {
    try {
      // In a real application, you would send this data to your backend
      // For now, we'll just update the local state
      
      // Find the animal group in the livestock data and update its quantity
      const updatedLivestockData = livestockData.map((animalGroup: any) => {
        if (animalGroup.id === deathData.animalId) {
          // Calculate the new quantity after deaths
          const newQuantity = (animalGroup.quantite || 0) - deathData.numberOfDeaths;
          
          // If all animals in the group have died, mark the group as dead
          const newStatus = newQuantity === 0 ? 'morto' : 'ativo';
          
          // Add death tracking information
          const deathRecord = {
            date: deathData.deathDate,
            reason: deathData.deathReason,
            description: deathData.deathDescription,
            veterinaryReport: deathData.veterinaryReport,
            numberOfDeaths: deathData.numberOfDeaths,
            timestamp: deathData.timestamp
          };
          
          // Add to death history or create new array
          const updatedDeathHistory = animalGroup.deathHistory 
            ? [...animalGroup.deathHistory, deathRecord]
            : [deathRecord];
          
          return {
            ...animalGroup,
            quantite: newQuantity,
            statut: newStatus,
            dateMort: newQuantity === 0 ? deathData.deathDate : animalGroup.dateMort,
            raisonMort: newQuantity === 0 ? deathData.deathReason : animalGroup.raisonMort,
            descriptionMort: newQuantity === 0 ? deathData.deathDescription : animalGroup.descriptionMort,
            rapportVeterinaire: newQuantity === 0 ? deathData.veterinaryReport : animalGroup.rapportVeterinaire,
            deathHistory: updatedDeathHistory
          };
        }
        return animalGroup;
      });
      
      // Update the CRM context with the new data
      updateModuleData('livestock', {
        items: updatedLivestockData
      });
      
      toast.success('Óbito registrado com sucesso', {
        description: deathData.numberOfDeaths === 1 
          ? `O óbito de 1 animal do grupo ${deathData.animalName} foi registrado.`
          : `Foram registrados ${deathData.numberOfDeaths} óbitos do grupo ${deathData.animalName}.`
      });
    } catch (error) {
      toast.error('Erro ao registrar óbito', {
        description: 'Não foi possível registrar o óbito do animal.'
      });
    }
  };

  const openDeathModal = (animal: any) => {
    setSelectedAnimal({
      id: animal.id,
      name: animal.nom,
      breed: animal.race,
      category: animal.categorie,
      quantity: animal.quantite
    });
    setIsDeathModalOpen(true);
  };

  // Function to get death history for an animal group
  const getDeathHistory = (animal: any) => {
    if (!animal.deathHistory || animal.deathHistory.length === 0) {
      return 'Nenhum registro de óbito';
    }
    
    const totalDeaths = animal.deathHistory.reduce((sum: number, record: any) => sum + record.numberOfDeaths, 0);
    return `${totalDeaths} óbito(s) registrado(s)`;
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
              {filteredData.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nom}</TableCell>
                  <TableCell>{item.race}</TableCell>
                  <TableCell>{item.quantite}</TableCell>
                  <TableCell>{item.categorie}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.statut === 'ativo' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : item.statut === 'morto'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {item.statut}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <History className="h-4 w-4 mr-1 text-muted-foreground" />
                      {getDeathHistory(item)}
                    </div>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    {item.statut === 'ativo' && item.quantite > 0 && (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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