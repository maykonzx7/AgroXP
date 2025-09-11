import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit3, Trash2 } from 'lucide-react';

const VeterinarySupplyManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);

  // Dados de exemplo para insumos veterinários
  const supplyData = [
    {
      id: 1,
      name: "Vacina Aftosa",
      description: "Vacina contra a febre aftosa",
      quantity: 50,
      unit: "doses",
      supplier: "Lab Veterinário",
      expirationDate: "2024-12-31",
      batchNumber: "VA2023001",
      category: "vacina"
    },
    {
      id: 2,
      name: "Ração Premium",
      description: "Ração para lactação",
      quantity: 1000,
      unit: "kg",
      supplier: "Agro Nutrição",
      expirationDate: "2024-06-30",
      batchNumber: "RP2023001",
      category: "ração"
    }
  ];

  // Função para obter cor da categoria
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vacina':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'medicamento':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'suplemento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'ração':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleSaveSupply = (e) => {
    e.preventDefault();
    // Lógica para salvar o insumo veterinário
    console.log("Salvando insumo veterinário");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Insumos Veterinários</h2>
          <p className="text-muted-foreground">
            Gerencie medicamentos, vacinas e suplementos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Insumo Veterinário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveSupply} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  placeholder="Nome do insumo" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descrição do insumo" 
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
                  <Input 
                    id="unit" 
                    placeholder="Unidade (kg, l, doses, etc.)" 
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select 
                  id="category" 
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="vacina">Vacina</option>
                  <option value="medicamento">Medicamento</option>
                  <option value="suplemento">Suplemento</option>
                  <option value="ração">Ração</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input 
                  id="supplier" 
                  placeholder="Nome do fornecedor" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Validade</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="expirationDate" 
                      type="date" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Lote</Label>
                  <Input 
                    id="batchNumber" 
                    placeholder="Número do lote" 
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Adicionar Insumo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Insumos Veterinários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplyData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>{item.expirationDate}</TableCell>
                  <TableCell>{item.batchNumber}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingSupply(item);
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

export default VeterinarySupplyManagement;