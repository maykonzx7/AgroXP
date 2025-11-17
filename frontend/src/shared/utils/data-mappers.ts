// Mappers para converter dados do frontend para o formato esperado pelo backend

export interface FrontendParcelData {
  id?: string;
  name: string;
  area?: number;
  crop?: string;
  status?: string;
  lastActivity?: string;
  soilType?: string;
  coordinates?: { lat: number; lng: number };
  irrigation?: string;
  photos?: string[];
  notes?: string;
  description?: string;
  location?: string;
  phLevel?: number;
  farmId?: string;
}

export interface BackendParcelData {
  name: string;
  description?: string;
  size: number;
  location?: string;
  soilType?: string;
  phLevel?: number;
  farmId?: string;
  status?: string;
}

export interface FrontendCropData {
  id?: string;
  name: string;
  variety?: string;
  plantingDate?: string;
  harvestDate?: string;
  expectedYield?: number;
  actualYield?: number;
  status?: string;
  fieldId?: string;
  crop?: string; // Campo legado
}

export interface BackendCropData {
  name: string;
  variety?: string;
  plantingDate?: string;
  harvestDate?: string;
  expectedYield?: number;
  actualYield?: number;
  status?: string;
  fieldId?: string;
}

/**
 * Converte dados de parcela do frontend para o formato do backend
 */
export const mapParcelToBackend = (data: FrontendParcelData): BackendParcelData => {
  return {
    name: data.name || 'Nova Parcela',
    description: data.notes || data.description || '',
    size: data.area || 0,
    location: data.location || '',
    soilType: data.soilType || '',
    phLevel: data.phLevel,
    farmId: data.farmId,
    status: data.status || 'active',
  };
};

/**
 * Converte dados de cultura do frontend para o formato do backend
 */
export const mapCropToBackend = (data: FrontendCropData): BackendCropData => {
  return {
    name: data.name || data.crop || 'Nova Cultura',
    variety: data.variety || '',
    plantingDate: data.plantingDate,
    harvestDate: data.harvestDate,
    expectedYield: data.expectedYield,
    actualYield: data.actualYield,
    status: data.status || 'PLANNED',
    fieldId: data.fieldId,
  };
};

/**
 * Converte dados de parcela do backend para o formato do frontend
 */
export const mapParcelFromBackend = (data: any): FrontendParcelData => {
  return {
    id: data.id,
    name: data.name,
    area: data.size,
    description: data.description,
    location: data.location,
    soilType: data.soilType,
    phLevel: data.phLevel,
    status: data.status || 'active',
    lastActivity: data.updatedAt || data.createdAt,
    notes: data.description,
    farmId: data.farmId,
    crop: data.crops?.[0]?.name || '',
  };
};

/**
 * Converte dados de cultura do backend para o formato do frontend
 */
export const mapCropFromBackend = (data: any): FrontendCropData => {
  return {
    id: data.id,
    name: data.name,
    variety: data.variety,
    plantingDate: data.plantingDate ? new Date(data.plantingDate).toISOString().split('T')[0] : undefined,
    harvestDate: data.harvestDate ? new Date(data.harvestDate).toISOString().split('T')[0] : undefined,
    expectedYield: data.expectedYield,
    actualYield: data.actualYield,
    status: data.status,
    fieldId: data.fieldId,
    crop: data.name, // Para compatibilidade
  };
};

