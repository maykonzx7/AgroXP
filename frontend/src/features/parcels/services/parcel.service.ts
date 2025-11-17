// Serviço unificado para operações de parcelas
import { useCRM } from '@/contexts/CRMContext';

export interface ParcelData {
  id: string | number;
  name: string;
  area?: number;
  size?: number;
  crop?: string;
  status?: 'active' | 'inactive' | 'planned';
  lastActivity?: string;
  soilType?: string;
  coordinates?: { lat: number; lng: number };
  irrigation?: string;
  plantingDate?: string;
  harvestDate?: string;
  owner?: string;
  rainfall?: number;
  notes?: string;
  description?: string;
  photos?: string[];
  crops?: Array<{ name: string; plantingDate?: string; harvestDate?: string }>;
  updatedAt?: string;
}

// Hook para operações de parcelas
export const useParcelService = () => {
  const crm = useCRM();

  return {
    // Buscar todas as parcelas
    getAll: () => {
      return crm.getModuleData('parcelles')?.items || [];
    },

    // Buscar parcela por ID
    getById: (id: string | number) => {
      return crm.findData<ParcelData>('parcelles', id);
    },

    // Adicionar nova parcela
    create: async (data: Omit<ParcelData, 'id'>) => {
      await crm.addData('parcelles', {
        ...data,
        id: Date.now(), // ID temporário, backend gera definitivo
      });
    },

    // Atualizar parcela
    update: async (id: string | number, updates: Partial<ParcelData>) => {
      await crm.updateData('parcelles', id, updates);
    },

    // Deletar parcela
    delete: async (id: string | number) => {
      await crm.deleteData('parcelles', id);
    },

    // Filtrar parcelas
    filter: (predicate: (parcel: ParcelData) => boolean) => {
      return crm.filterData<ParcelData>('parcelles', predicate);
    },

    // Sincronizar dados
    sync: () => {
      crm.syncDataAcrossCRM();
    },

    // Estado de carregamento
    isLoading: crm.isRefreshing,
  };
};

