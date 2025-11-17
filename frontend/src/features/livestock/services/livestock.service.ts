// Serviço unificado para operações de gado
import { useCRM } from '@/contexts/CRMContext';

export interface LivestockData {
  id: string | number;
  name: string;
  type: string;
  breed?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  weight?: number;
  status?: 'active' | 'sold' | 'deceased';
  location?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Hook para operações de gado
export const useLivestockService = () => {
  const crm = useCRM();

  return {
    // Buscar todo o gado
    getAll: () => {
      return crm.getModuleData('livestock')?.items || [];
    },

    // Buscar animal por ID
    getById: (id: string | number) => {
      return crm.findData<LivestockData>('livestock', id);
    },

    // Adicionar novo animal
    create: async (data: Omit<LivestockData, 'id'>) => {
      await crm.addData('livestock', {
        ...data,
        id: Date.now(), // ID temporário, backend gera definitivo
      });
    },

    // Atualizar animal
    update: async (id: string | number, updates: Partial<LivestockData>) => {
      await crm.updateData('livestock', id, updates);
    },

    // Deletar animal
    delete: async (id: string | number) => {
      await crm.deleteData('livestock', id);
    },

    // Filtrar animais
    filter: (predicate: (animal: LivestockData) => boolean) => {
      return crm.filterData<LivestockData>('livestock', predicate);
    },

    // Sincronizar dados
    sync: () => {
      crm.syncDataAcrossCRM();
    },

    // Estado de carregamento
    isLoading: crm.isRefreshing,
  };
};

