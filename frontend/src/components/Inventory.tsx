import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown,
  ChevronRight,
  X,
  Save,
  BarChart2,
  Trash2,
} from 'lucide-react';
import { EditableTable, Column } from '@/components/ui/editable-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { EditableField } from '@/components/ui/editable-field';
import ConfirmDialog from './inventory/ConfirmDialog';
import { 
  InventoryItem 
} from './inventory/ImportExportFunctions';
import InventoryStats from './inventory/InventoryStats';
import InventoryAlerts from './inventory/InventoryAlerts';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer 
} from 'recharts';
import { useCRM } from '@/contexts/CRMContext';

// Tipos para transações
interface Transaction {
  id: number;
  itemId: number;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  user: string;
  notes: string;
}

// Tipos para estatísticas de categoria
interface CategoryStat {
  name: string;
  value: number;
  fill: string;
}

interface InventoryProps {
  dateRange?: DateRange;
  searchTerm?: string;
  showAddForm?: boolean;
  setShowAddForm?: (show: boolean) => void;
}

const Inventory: React.FC<InventoryProps> = ({ 
  dateRange, 
  searchTerm: externalSearchTerm,
  showAddForm: externalShowAddForm,
  setShowAddForm: externalSetShowAddForm
}) => {
  const { getModuleData, syncDataAcrossCRM, isRefreshing, addData } = useCRM();
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  
  // Obter dados de inventário do contexto CRM
  const inventoryModuleData = getModuleData('inventaire').items || [];
  
  // Converter dados do backend para o formato esperado
  useEffect(() => {
    const convertedInventoryData = inventoryModuleData.map((item: any) => ({
      id: item.id,
      name: item.name || item.itemName,
      category: item.category || 'Não categorizado',
      quantity: item.quantity || 0,
      unit: item.unit || 'un',
      minQuantity: 0, // TODO: Obter do backend
      price: item.cost || item.price || 0,
      location: 'Não especificado', // TODO: Obter do backend
      lastUpdated: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));
    
    setInventoryData(convertedInventoryData);
    
    // Atualizar estatísticas de categoria
    const categories: Record<string, number> = {};
    const colors: Record<string, string> = {
      'Sementes': '#4CAF50',
      'Fertilizantes': '#8D6E63',
      'Fitossanitários': '#F44336',
      'Combustíveis': '#2196F3',
      'Lubrificantes': '#FFC107',
      'Consumíveis': '#9C27B0'
    };
    
    convertedInventoryData.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      categories[item.category] += item.quantity;
    });
    
    const newStats = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      fill: colors[name] || getRandomColor()
    }));
    
    setCategoryStats(newStats);
  }, [inventoryModuleData]);
  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // Usar searchTerm externo diretamente, sem estado interno
  const searchTerm = externalSearchTerm || '';
  const [internalShowAddForm, setInternalShowAddForm] = useState(false);
  
  // Usar showAddForm externo se fornecido, senão usar interno
  const showAddForm = externalShowAddForm !== undefined ? externalShowAddForm : internalShowAddForm;
  const setShowAddForm = externalSetShowAddForm || setInternalShowAddForm;
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    price: 0,
    location: '',
    notes: ''
  });
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [view, setView] = useState<'list' | 'detail' | 'stats'>('list');
  const [showTransactionForm, setShowTransactionForm] = useState<'in' | 'out' | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    quantity: 0,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [transactionDeleteConfirmOpen, setTransactionDeleteConfirmOpen] = useState(false);
  
  // searchTerm é controlado externamente via PageHeader
  
  const generateAlerts = () => {
    return inventoryData
      .filter(item => item.quantity <= item.minQuantity)
      .map(item => ({
        id: item.id,
        name: item.name,
        current: item.quantity,
        min: item.minQuantity,
        status: item.quantity < item.minQuantity * 0.5 ? 'critical' as const : 'warning' as const
      }));
  };
  
  const alerts = generateAlerts();
  
  const filteredItems = inventoryData
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (categoryFilter === 'all') return matchesSearch;
      return matchesSearch && item.category === categoryFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'quantity') {
        return sortOrder === 'asc' 
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' 
          ? a.price - b.price
          : b.price - a.price;
      } else if (sortBy === 'lastUpdated') {
        return sortOrder === 'asc'
          ? new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
          : new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
      return 0;
    });
  
  const categories = ['all', ...new Set(inventoryData.map(item => item.category))];
  
  // Importação e exportação são controladas externamente via PageHeader
  
  const updateCategoryStats = (items: typeof inventoryData) => {
    const categories: Record<string, number> = {};
    const colors: Record<string, string> = {};
    
    categoryStats.forEach(stat => {
      colors[stat.name] = stat.fill;
    });
    
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = 0;
        if (!colors[item.category]) {
          colors[item.category] = getRandomColor();
        }
      }
      categories[item.category] += item.quantity;
    });
    
    const newStats = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      fill: colors[name]
    }));
    
    setCategoryStats(newStats);
  };
  
  const confirmDeleteItem = (id: number) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  const handleDeleteItem = () => {
    if (itemToDelete === null) return;
    
    const itemToDeleteObj = inventoryData.find(item => item.id === itemToDelete);
    if (!itemToDeleteObj) return;
    
    setInventoryData(inventoryData.filter(item => item.id !== itemToDelete));
    
    setCategoryStats(categoryStats.map(stat => 
      stat.name === itemToDeleteObj.category 
        ? { ...stat, value: Math.max(0, stat.value - itemToDeleteObj.quantity) }
        : stat
    ));
    
    if (selectedItem && selectedItem.id === itemToDelete) {
      setSelectedItem(null);
    }
    
    toast.success(`${itemToDeleteObj.name} foi removido do inventário`);
    setItemToDelete(null);
    setDeleteConfirmOpen(false);
  };
  
  const confirmDeleteTransaction = (id: number) => {
    setTransactionToDelete(id);
    setTransactionDeleteConfirmOpen(true);
  };
  
  const handleDeleteTransaction = () => {
    if (transactionToDelete === null || !selectedItem) return;
    
    const transaction = transactionHistory.find(t => t.id === transactionToDelete);
    if (!transaction) return;
    
    const updatedTransactions = transactionHistory.filter(t => t.id !== transactionToDelete);
    setTransactionHistory(updatedTransactions);
    
    const quantityChange = transaction.type === 'in' 
      ? -transaction.quantity 
      : transaction.quantity;
    
    handleUpdateItem(
      selectedItem.id, 
      'quantity', 
      Math.max(0, selectedItem.quantity + quantityChange)
    );
    
    toast.success("Transação removida e estoque ajustado");
    setTransactionToDelete(null);
    setTransactionDeleteConfirmOpen(false);
  };
  
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.unit) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      // Preparar item para o backend
      const itemToAdd = {
        itemName: newItem.name,
        category: newItem.category,
        quantity: Number(newItem.quantity),
        unit: newItem.unit,
        cost: Number(newItem.price),
        minQuantity: Number(newItem.minQuantity),
        location: newItem.location || undefined,
        notes: newItem.notes || undefined,
      };
      
      // Adicionar via contexto CRM (que chama a API do backend)
      await addData('inventaire', itemToAdd);
      
      // Atualizar estatísticas localmente
      const existingCategoryStat = categoryStats.find(stat => stat.name === newItem.category);
      if (existingCategoryStat) {
        setCategoryStats(categoryStats.map(stat => 
          stat.name === newItem.category 
            ? { ...stat, value: stat.value + Number(newItem.quantity) }
            : stat
        ));
      } else {
        setCategoryStats([...categoryStats, { 
          name: newItem.category, 
          value: Number(newItem.quantity),
          fill: getRandomColor()
        }]);
      }
      
      // Resetar formulário e fechar
      setShowAddForm(false);
      setNewItem({
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        minQuantity: 0,
        price: 0,
        location: '',
        notes: ''
      });
      
      // Sincronizar dados após adicionar
      syncDataAcrossCRM();
      
      toast.success(`${newItem.name} foi adicionado ao inventário`);
    } catch (error) {
      console.error('Erro ao adicionar item ao inventário:', error);
      toast.error('Erro ao adicionar item ao inventário');
    }
  };
  
  const getRandomColor = () => {
    const colors = ['#4CAF50', '#8D6E63', '#F44336', '#2196F3', '#FFC107', '#9C27B0', '#FF5722', '#3F51B5'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const handleUpdateItem = (id: number, field: string, value: any) => {
    setInventoryData(inventoryData.map(item => {
      if (item.id !== id) return item;
      
      const updatedItem = { 
        ...item, 
        [field]: value,
        lastUpdated: new Date().toISOString().split('T')[0] 
      };
      
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(updatedItem);
      }
      
      return updatedItem;
    }));
    
    if (field === 'quantity') {
      const item = inventoryData.find(item => item.id === id);
      if (item) {
        const oldQuantity = item.quantity;
        const newQuantity = value;
        const diff = newQuantity - oldQuantity;
        
        setCategoryStats(categoryStats.map(stat => 
          stat.name === item.category 
            ? { ...stat, value: stat.value + diff }
            : stat
        ));
      }
    }
  };
  
  const handleAddTransaction = (type: 'in' | 'out') => {
    setShowTransactionForm(type);
  };
  
  const handleSubmitTransaction = () => {
    if (!selectedItem || !showTransactionForm || newTransaction.quantity <= 0) {
      toast.error("Por favor, especifique uma quantidade válida");
      return;
    }
    
    const newId = Math.max(...transactionHistory.map(t => t.id), 0) + 1;
    const transaction = {
      id: newId,
      itemId: selectedItem.id,
      type: showTransactionForm,
      quantity: newTransaction.quantity,
      date: newTransaction.date,
      user: 'Usuário Atual',
      notes: newTransaction.notes
    };
    
    setTransactionHistory([transaction, ...transactionHistory]);
    
    const updatedQuantity = showTransactionForm === 'in' 
      ? selectedItem.quantity + newTransaction.quantity 
      : Math.max(0, selectedItem.quantity - newTransaction.quantity);
    
    handleUpdateItem(selectedItem.id, 'quantity', updatedQuantity);
    
    setShowTransactionForm(null);
    setNewTransaction({
      quantity: 0,
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    toast.success(`${newTransaction.quantity} ${selectedItem.unit} ${showTransactionForm === 'in' ? 'adicionados' : 'removidos'} do inventário`);
  };
  
  const itemTransactions = selectedItem 
    ? transactionHistory.filter(t => t.itemId === selectedItem.id).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  const inventoryColumns: Column[] = [
    { id: 'name', header: 'Item', accessorKey: 'name', isEditable: true },
    { id: 'category', header: 'Categoria', accessorKey: 'category', isEditable: true },
    { id: 'quantity', header: 'Quantidade', accessorKey: 'quantity', type: 'number', isEditable: true },
    { id: 'price', header: 'Preço Unitário', accessorKey: 'price', type: 'number', isEditable: true },
    { id: 'value', header: 'Valor Total', accessorKey: 'value', type: 'text', isEditable: false },
    { id: 'status', header: 'Status', accessorKey: 'status', type: 'text', isEditable: false },
  ];

  const tableData = filteredItems.map(item => ({
    ...item,
    value: `R$ ${(item.quantity * item.price).toFixed(2)}`,
    status: item.quantity <= item.minQuantity 
      ? item.quantity < item.minQuantity * 0.5 ? 'critical' : 'warning'
      : 'normal'
  }));

  const handleTableUpdate = (rowIndex: number, columnId: string, value: any) => {
    const item = filteredItems[rowIndex];
    if (!item) return;
    
    handleUpdateItem(item.id, columnId, value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="animate-enter">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
          className="px-4 py-2"
        >
          Lista
        </Button>
        <Button 
          variant={view === 'stats' ? 'default' : 'outline'}
          onClick={() => setView('stats')}
          className="px-4 py-2"
        >
          <BarChart2 className="mr-2 h-4 w-4" />
          Estatísticas
        </Button>
      </div>

      <InventoryAlerts 
        alerts={alerts} 
        onQuantityChange={handleUpdateItem} 
      />

      {view === 'list' ? (
        selectedItem ? (
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
              <div className="flex items-center">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="mr-3 hover:bg-primary/10 p-1 rounded"
                  aria-label="Voltar para a lista"
                >
                  <ChevronRight className="h-5 w-5 transform rotate-180" />
                </button>
                <EditableField 
                  value={selectedItem.name}
                  onSave={(value) => handleUpdateItem(selectedItem.id, 'name', value)}
                  className="text-xl font-semibold"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-primary/10 hover:bg-primary/20 text-primary-foreground border-none"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-primary/10 hover:bg-primary/20 text-primary-foreground border-none"
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Importar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-primary/10 hover:bg-primary/20 text-primary-foreground border-none"
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Estatísticas
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-card rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Detalhes do Item</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Categoria:</span>
                      <EditableField
                        value={selectedItem.category}
                        onSave={(value) => handleUpdateItem(selectedItem.id, 'category', value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Quantidade:</span>
                      <div className="flex items-center">
                        <EditableField
                          value={selectedItem.quantity}
                          type="number"
                          onSave={(value) => handleUpdateItem(selectedItem.id, 'quantity', Number(value))}
                          className="font-medium"
                        />
                        <EditableField
                          value={selectedItem.unit}
                          onSave={(value) => handleUpdateItem(selectedItem.id, 'unit', value)}
                          className="ml-1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Nível Mínimo:</span>
                      <div className="flex items-center">
                        <EditableField
                          value={selectedItem.minQuantity}
                          type="number"
                          onSave={(value) => handleUpdateItem(selectedItem.id, 'minQuantity', Number(value))}
                        />
                        <span className="ml-1">{selectedItem.unit}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Preço Unitário:</span>
                      <div className="flex items-center">
                        <EditableField
                          value={selectedItem.price}
                          type="number"
                          onSave={(value) => handleUpdateItem(selectedItem.id, 'price', Number(value))}
                        />
                        <span className="ml-1">R$/{selectedItem.unit}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Valor Total:</span>
                      <span className="font-medium">R$ {(selectedItem.quantity * selectedItem.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Localização:</span>
                      <EditableField
                        value={selectedItem.location}
                        onSave={(value) => handleUpdateItem(selectedItem.id, 'location', value)}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Última Atualização:</span>
                      <span>{new Date(selectedItem.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Estatísticas</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Estoque Atual', value: selectedItem.quantity },
                          { name: 'Nível Mínimo', value: selectedItem.minQuantity }
                        ]}
                        margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} ${selectedItem.unit}`, '']} />
                        <Bar 
                          dataKey="value" 
                          fill="#4CAF50" 
                          radius={[4, 4, 0, 0]}
                          fillOpacity={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {showTransactionForm && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">
                      {showTransactionForm === 'in' ? 'Nova Entrada' : 'Nova Saída'}
                    </h3>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowTransactionForm(null)}
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantidade</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id="quantity"
                          type="number"
                          value={newTransaction.quantity}
                          onChange={(e) => setNewTransaction({
                            ...newTransaction,
                            quantity: parseInt(e.target.value) || 0
                          })}
                          min={0}
                        />
                        <span className="ml-2">{selectedItem.unit}</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({
                          ...newTransaction,
                          date: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notas</Label>
                      <Input
                        id="notes"
                        value={newTransaction.notes}
                        onChange={(e) => setNewTransaction({
                          ...newTransaction,
                          notes: e.target.value
                        })}
                        placeholder="Comentário..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowTransactionForm(null)}
                      className="mr-2"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmitTransaction}>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Histórico de Transações</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Data</th>
                        <th className="px-4 py-2 text-left">Tipo</th>
                        <th className="px-4 py-2 text-left">Quantidade</th>
                        <th className="px-4 py-2 text-left">Usuário</th>
                        <th className="px-4 py-2 text-left">Notas</th>
                        <th className="px-4 py-2 text-left">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t">
                          <td className="px-4 py-3">{new Date(transaction.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              transaction.type === 'in' 
                                ? 'bg-agri-success/10 text-agri-success' 
                                : 'bg-agri-warning/10 text-agri-warning'
                            }`}>
                              {transaction.type === 'in' ? (
                                <>
                                  <ArrowDown className="h-3 w-3 mr-1" />
                                  Entrada
                                </>
                              ) : (
                                <>
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                  Saída
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">{transaction.quantity} {selectedItem.unit}</td>
                          <td className="px-4 py-3">{transaction.user}</td>
                          <td className="px-4 py-3">
                            <EditableField
                              value={transaction.notes}
                              onSave={(value) => {
                                const updatedTransactions = [...transactionHistory];
                                const index = updatedTransactions.findIndex(t => t.id === transaction.id);
                                if (index !== -1) {
                                  updatedTransactions[index] = {
                                    ...updatedTransactions[index],
                                    notes: value.toString()
                                  };
                                  setTransactionHistory(updatedTransactions);
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => confirmDeleteTransaction(transaction.id)}
                              className="p-1.5 hover:bg-agri-danger/10 text-agri-danger rounded"
                              title="Remover transação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {itemTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground">
                            Nenhuma transação registrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EditableTable
              data={tableData}
              columns={inventoryColumns}
              onUpdate={handleTableUpdate}
              onDelete={(rowIndex) => confirmDeleteItem(filteredItems[rowIndex].id)}
              actions={[
                { 
                  icon: <ChevronRight className="h-4 w-4" />,
                  label: "Ver detalhes",
                  onClick: (rowIndex) => setSelectedItem(filteredItems[rowIndex])
                }
              ]}
              className="mb-6"
              sortable={true}
            />
            
            {showAddForm && (
              <div className="border rounded-xl p-6 bg-muted/5 animate-enter">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Adicionar Novo Item</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Item*</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="mt-1"
                      placeholder="Ex: Sementes de Trigo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria*</Label>
                    <Input
                      id="category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="mt-1"
                      list="categories-list"
                      placeholder="Ex: Sementes"
                    />
                    <datalist id="categories-list">
                      {categories
                        .filter(cat => cat !== 'all')
                        .map((category) => (
                          <option key={category} value={category} />
                        ))}
                    </datalist>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantidade Inicial*</Label>
                    <div className="flex mt-1">
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity === '' || newItem.quantity === null || newItem.quantity === undefined ? '' : newItem.quantity}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? newItem.quantity : Number(e.target.value));
                          setNewItem({ ...newItem, quantity: val });
                        }}
                        min={0}
                      />
                      <Input
                        className="w-24 ml-2"
                        placeholder="Unidade"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="minQuantity">Nível Mínimo de Alerta</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      value={newItem.minQuantity === '' || newItem.minQuantity === null || newItem.minQuantity === undefined ? '' : newItem.minQuantity}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? newItem.minQuantity : Number(e.target.value));
                        setNewItem({ ...newItem, minQuantity: val });
                      }}
                      className="mt-1"
                      min={0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Preço Unitário (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newItem.price === '' || newItem.price === null || newItem.price === undefined ? '' : newItem.price}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? newItem.price : Number(e.target.value));
                        setNewItem({ ...newItem, price: val });
                      }}
                      className="mt-1"
                      min={0}
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={newItem.location}
                      onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                      className="mt-1"
                      placeholder="Ex: Armazém Principal"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label htmlFor="notes">Notas Adicionais</Label>
                    <Textarea
                      id="notes"
                      value={newItem.notes || ''}
                      onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                      className="mt-1"
                      placeholder="Informações adicionais sobre o item..."
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)} 
                    className="mr-2"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <InventoryStats 
          inventoryData={inventoryData} 
          categoryStats={categoryStats} 
        />
      )}

      <ConfirmDialog 
        open={deleteConfirmOpen} 
        title="Remover Item" 
        description="Você tem certeza que deseja remover este item? Esta ação é irreversível."
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={handleDeleteItem}
        onOpenChange={() => setDeleteConfirmOpen(false)}
      />

      <ConfirmDialog 
        open={transactionDeleteConfirmOpen} 
        title="Remover Transação" 
        description="Você tem certeza que deseja remover esta transação? O estoque será ajustado de acordo."
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={handleDeleteTransaction}
        onOpenChange={() => setTransactionDeleteConfirmOpen(false)}
      />
    </div>
  );
};

export default Inventory;