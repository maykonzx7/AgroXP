// Serviço unificado para operações financeiras
import { useCRM } from '@/contexts/CRMContext';

export interface FinanceTransaction {
  id: string | number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  date: string;
  fieldId?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
}

// Hook para operações financeiras
export const useFinanceService = () => {
  const crm = useCRM();

  return {
    // Buscar todas as transações
    getAll: () => {
      return crm.getModuleData('finances')?.items || [];
    },

    // Buscar transação por ID
    getById: (id: string | number) => {
      return crm.findData<FinanceTransaction>('finances', id);
    },

    // Adicionar nova transação
    create: async (data: Omit<FinanceTransaction, 'id'>) => {
      await crm.addData('finances', {
        ...data,
        id: Date.now(), // ID temporário, backend gera definitivo
      });
    },

    // Atualizar transação
    update: async (id: string | number, updates: Partial<FinanceTransaction>) => {
      await crm.updateData('finances', id, updates);
    },

    // Deletar transação
    delete: async (id: string | number) => {
      await crm.deleteData('finances', id);
    },

    // Filtrar transações
    filter: (predicate: (transaction: FinanceTransaction) => boolean) => {
      return crm.filterData<FinanceTransaction>('finances', predicate);
    },

    // Sincronizar dados
    sync: () => {
      crm.syncDataAcrossCRM();
    },

    // Estado de carregamento
    isLoading: crm.isRefreshing,
  };
};

