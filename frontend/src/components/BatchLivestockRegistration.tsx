import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface LivestockItem {
  id: number;
  name: string;
  breed: string;
  quantity: number;
  category: string;
  age?: number;
  weight?: number;
  parcelId?: number;
}

const BatchLivestockRegistration = () => {
  const [livestockItems, setLivestockItems] = useState<LivestockItem[]>([
    { id: Date.now(), name: '', breed: '', quantity: 1, category: 'bovino' }
  ]);
  const [csvData, setCsvData] = useState<string>('');

  // Adicionar novo item à lista
  const addLivestockItem = () => {
    setLivestockItems([
      ...livestockItems,
      { id: Date.now(), name: '', breed: '', quantity: 1, category: 'bovino' }
    ]);
  };

  // Remover item da lista
  const removeLivestockItem = (id: number) => {
    if (livestockItems.length > 1) {
      setLivestockItems(livestockItems.filter(item => item.id !== id));
    } else {
      toast.warning('Não é possível remover o último item');
    }
  };

  // Atualizar um item
  const updateLivestockItem = (id: number, field: keyof LivestockItem, value: string | number) => {
    setLivestockItems(livestockItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Parse CSV data
  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim());
    const newItems: LivestockItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 4) {
        newItems.push({
          id: Date.now() + i,
          name: values[0] || '',
          breed: values[1] || '',
          quantity: parseInt(values[2]) || 1,
          category: values[3] || 'bovino',
          age: values[4] ? parseInt(values[4]) : undefined,
          weight: values[5] ? parseFloat(values[5]) : undefined
        });
      }
    }

    setLivestockItems(newItems);
    toast.success(`${newItems.length} animais adicionados do CSV`);
  };

  // Registrar todos os animais em lote
  const registerBatch = async () => {
    // Validar dados
    const invalidItems = livestockItems.filter(item => 
      !item.name || !item.breed || item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/livestock/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ animals: livestockItems }),
      });

      if (response.ok) {
        toast.success('Animais registrados com sucesso em lote', {
          description: `${livestockItems.length} animais foram adicionados ao sistema.`
        });
        // Limpar o formulário após o registro
        setLivestockItems([{ id: Date.now(), name: '', breed: '', quantity: 1, category: 'bovino' }]);
      } else {
        const errorData = await response.json();
        toast.error('Erro ao registrar animais', {
          description: errorData.error || 'Não foi possível registrar os animais em lote.'
        });
      }
    } catch (error) {
      toast.error('Erro de conexão', {
        description: 'Não foi possível conectar ao servidor.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Cadastro em Lote de Animais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Área para importação CSV */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Importar via CSV</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => parseCSV(csvData)}
                  disabled={!csvData}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Processar CSV
                </Button>
              </div>
              <Textarea
                placeholder="Cole seus dados CSV aqui (nome,raça,quantidade,categoria,idade,peso)
Exemplo:
Vaca 1,Angus,10,bovino,3,650
Porco 1,Large White,20,suíno,2,120"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows={5}
              />
              <p className="text-sm text-muted-foreground">
                Formato esperado: nome,raça,quantidade,categoria,idade(opcional),peso(opcional)
              </p>
            </div>

            {/* Formulário de cadastro em lote */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Cadastro Manual</h3>
                <Button onClick={addLivestockItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Raça</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Idade (opcional)</TableHead>
                      <TableHead>Peso (opcional)</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {livestockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.name}
                            onChange={(e) => updateLivestockItem(item.id, 'name', e.target.value)}
                            placeholder="Nome do animal"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.breed}
                            onChange={(e) => updateLivestockItem(item.id, 'breed', e.target.value)}
                            placeholder="Raça"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLivestockItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </TableCell>
                        <TableCell>
                          <select
                            value={item.category}
                            onChange={(e) => updateLivestockItem(item.id, 'category', e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                          >
                            <option value="bovino">Bovino</option>
                            <option value="suíno">Suíno</option>
                            <option value="ovino">Ovino</option>
                            <option value="caprino">Caprino</option>
                            <option value="avícola">Avícola</option>
                            <option value="equino">Equino</option>
                            <option value="outros">Outros</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={item.age || ''}
                            onChange={(e) => updateLivestockItem(item.id, 'age', parseInt(e.target.value) || undefined)}
                            placeholder="Idade"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={item.weight || ''}
                            onChange={(e) => updateLivestockItem(item.id, 'weight', parseFloat(e.target.value) || undefined)}
                            placeholder="Peso (kg)"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeLivestockItem(item.id)}
                            disabled={livestockItems.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={registerBatch} size="lg">
                  Registrar {livestockItems.length} Animais
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchLivestockRegistration;