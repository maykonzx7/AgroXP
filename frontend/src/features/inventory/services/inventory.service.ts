// Serviço unificado para operações de inventário
import { useCRM } from '@/contexts/CRMContext';

export interface InventoryItem {
  id: string | number;
  name: string;
  itemName?: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity?: number;
  maxQuantity?: number;
  price?: number;
  supplier?: string;
  location?: string;
  notes?: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Hook para operações de inventário
export const useInventoryService = () => {
  const crm = useCRM();

  return {
    // Buscar todos os itens
    getAll: () => {
      return crm.getModuleData('inventaire')?.items || [];
    },

    // Buscar item por ID
    getById: (id: string | number) => {
      return crm.findData<InventoryItem>('inventaire', id);
    },

    // Adicionar novo item
    create: async (data: Omit<InventoryItem, 'id'>) => {
      await crm.addData('inventaire', {
        ...data,
        id: Date.now(), // ID temporário, backend gera definitivo
      });
    },

    // Atualizar item
    update: async (id: string | number, updates: Partial<InventoryItem>) => {
      await crm.updateData('inventaire', id, updates);
    },

    // Deletar item
    delete: async (id: string | number) => {
      await crm.deleteData('inventaire', id);
    },

    // Filtrar itens
    filter: (predicate: (item: InventoryItem) => boolean) => {
      return crm.filterData<InventoryItem>('inventaire', predicate);
    },

    // Sincronizar dados
    sync: () => {
      crm.syncDataAcrossCRM();
    },

    // Estado de carregamento
    isLoading: crm.isRefreshing,
  };
};

