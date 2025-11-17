// Serviço unificado para operações de culturas
import { useCRM } from '@/contexts/CRMContext';

export interface CropData {
  id: string | number;
  name: string;
  variety?: string;
  scientificName?: string;
  family?: string;
  origin?: string;
  growingSeason?: string;
  soilType?: string;
  waterNeeds?: string;
  fertilization?: string;
  pests?: string;
  diseases?: string;
  notes?: string;
  type?: string;
  harvestPeriod?: string;
  yieldPerHectare?: string;
  plantingDate?: string;
  harvestDate?: string;
}

// Hook para operações de culturas
export const useCropService = () => {
  const crm = useCRM();

  return {
    // Buscar todas as culturas
    getAll: () => {
      return crm.getModuleData('cultures')?.items || [];
    },

    // Buscar cultura por ID
    getById: (id: string | number) => {
      return crm.findData<CropData>('cultures', id);
    },

    // Adicionar nova cultura
    create: async (data: Omit<CropData, 'id'>) => {
      await crm.addData('cultures', {
        ...data,
        id: Date.now(), // ID temporário, backend gera definitivo
      });
    },

    // Atualizar cultura
    update: async (id: string | number, updates: Partial<CropData>) => {
      await crm.updateData('cultures', id, updates);
    },

    // Deletar cultura
    delete: async (id: string | number) => {
      await crm.deleteData('cultures', id);
    },

    // Filtrar culturas
    filter: (predicate: (crop: CropData) => boolean) => {
      return crm.filterData<CropData>('cultures', predicate);
    },

    // Sincronizar dados
    sync: () => {
      crm.syncDataAcrossCRM();
    },

    // Estado de carregamento
    isLoading: crm.isRefreshing,
  };
};

