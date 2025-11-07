import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Interface genérica para dados
export interface BaseDataItem {
  id: string | number;
  [key: string]: any;
}

// Interface para as opções do hook
export interface UseDataOperationsOptions<T> {
  initialData?: T[];
  storageKey?: string;
  idField?: string;
  dateField?: string;
  onAdd?: (item: T) => void;
  onUpdate?: (item: T) => void;
  onDelete?: (id: string | number) => void;
}

// Hook genérico para operações de dados
export const useDataOperations = <T extends BaseDataItem>({
  initialData = [],
  storageKey,
  idField = 'id',
  dateField = 'createdAt',
  onAdd,
  onUpdate,
  onDelete,
}: UseDataOperationsOptions<T>) => {
  const [data, setData] = useState<T[]>(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return initialData;
        }
      }
    }
    return initialData;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Salvar no localStorage quando os dados mudarem
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (err) {
        console.error('Erro ao salvar dados no localStorage:', err);
      }
    }
  }, [data, storageKey]);

  // Adicionar item
  const addItem = (item: Omit<T, 'id'> & Partial<Pick<T, 'id'>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newItem = {
        ...item,
        [idField]: item[idField] || Date.now().toString(),
        [dateField]: item[dateField] || new Date().toISOString(),
      } as T;
      
      setData(prev => [...prev, newItem]);
      onAdd?.(newItem);
      toast.success('Item adicionado com sucesso!');
    } catch (err) {
      setError('Erro ao adicionar item');
      toast.error('Erro ao adicionar item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar item
  const updateItem = (id: string | number, updates: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      setData(prev => {
        const updated = prev.map(item => 
          item[idField] === id ? { ...item, ...updates } : item
        );
        return updated;
      });
      
      const updatedItem = data.find(item => item[idField] === id);
      if (updatedItem) {
        const completeItem = { ...updatedItem, ...updates } as T;
        onUpdate?.(completeItem);
        toast.success('Item atualizado com sucesso!');
      }
    } catch (err) {
      setError('Erro ao atualizar item');
      toast.error('Erro ao atualizar item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Deletar item
  const deleteItem = (id: string | number) => {
    setLoading(true);
    setError(null);
    
    try {
      setData(prev => prev.filter(item => item[idField] !== id));
      onDelete?.(id);
      toast.success('Item removido com sucesso!');
    } catch (err) {
      setError('Erro ao remover item');
      toast.error('Erro ao remover item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar item por ID
  const findItem = (id: string | number): T | undefined => {
    return data.find(item => item[idField] === id);
  };

  // Filtrar itens
  const filterItems = (predicate: (item: T) => boolean): T[] => {
    return data.filter(predicate);
  };

  // Ordenar itens
  const sortItems = (key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...data].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
      
      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Limpar todos os dados
  const clearAll = () => {
    setData([]);
    toast.success('Todos os dados foram limpos');
  };

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    findItem,
    filterItems,
    sortItems,
    clearAll,
    setData, // Para casos especiais onde você precisa substituir todos os dados
  };
};

export default useDataOperations;