// Mappers para converter dados do frontend para o formato esperado pelo backend

export interface FrontendParcelData {
  id?: string;
  name: string;
  area?: number;
  size?: number | string; // Support both number and string (from form inputs)
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
  // Handle both 'size' and 'area' fields (for compatibility)
  const sizeValue = data.size !== undefined ? data.size : (data.area !== undefined ? data.area : 0);
  
  // Ensure size is a valid positive number
  const parsedSize = typeof sizeValue === 'string' 
    ? parseFloat(sizeValue) 
    : (typeof sizeValue === 'number' ? sizeValue : 0);
  
  // Validate that size is a positive number
  if (isNaN(parsedSize) || parsedSize <= 0) {
    console.warn('Invalid size value:', sizeValue, 'defaulting to 1');
  }
  
  // Mapear status do frontend (active, inactive, planned) para o backend (ACTIVE, INACTIVE, PLANNED)
  const statusMap: { [key: string]: string } = {
    'active': 'ACTIVE',
    'inactive': 'INACTIVE',
    'planned': 'PLANNED'
  };
  const backendStatus = data.status 
    ? (statusMap[data.status.toLowerCase()] || data.status.toUpperCase())
    : 'ACTIVE';
  
  return {
    name: data.name || 'Nova Parcela',
    description: data.notes || data.description || '',
    size: (isNaN(parsedSize) || parsedSize <= 0) ? 1 : parsedSize, // Default to 1 if invalid
    location: data.location || '',
    soilType: data.soilType || '',
    phLevel: data.phLevel,
    farmId: data.farmId,
    status: backendStatus,
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
  // Mapear status do backend (ACTIVE, INACTIVE, PLANNED) para o frontend (active, inactive, planned)
  const statusMap: { [key: string]: string } = {
    'ACTIVE': 'active',
    'INACTIVE': 'inactive',
    'PLANNED': 'planned'
  };
  const backendStatus = data.status?.toUpperCase() || 'ACTIVE';
  const frontendStatus = statusMap[backendStatus] || backendStatus.toLowerCase() || 'active';
  
  // Log para debug
  if (process.env.NODE_ENV === 'development' && data.status) {
    console.log('[mapParcelFromBackend] Status mapping:', {
      original: data.status,
      backend: backendStatus,
      frontend: frontendStatus
    });
  }
  
  return {
    id: data.id,
    name: data.name,
    area: data.size,
    description: data.description,
    location: data.location,
    soilType: data.soilType,
    phLevel: data.phLevel,
    status: frontendStatus as 'active' | 'inactive' | 'planned',
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

export interface FrontendHarvestData {
  id?: string;
  crop: string;
  date: string;
  yield: number;
  expectedYield: number;
  harvestArea: number;
  quality: 'Excelente' | 'Boa' | 'Média' | 'Baixa';
  cropId?: string;
}

export interface BackendHarvestData {
  crop: string;
  date: string; // ISO string
  yield: number;
  expectedYield: number;
  harvestArea: number;
  quality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'LOW';
  cropId?: string | null;
}

/**
 * Mapeia qualidade do português para inglês
 */
const mapQualityToBackend = (quality: string): 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'LOW' => {
  const qualityMap: Record<string, 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'LOW'> = {
    'Excelente': 'EXCELLENT',
    'Boa': 'GOOD',
    'Média': 'AVERAGE',
    'Baixa': 'LOW',
  };
  return qualityMap[quality] || 'AVERAGE';
};

/**
 * Mapeia qualidade do inglês para português
 */
const mapQualityFromBackend = (quality: string): 'Excelente' | 'Boa' | 'Média' | 'Baixa' => {
  const qualityMap: Record<string, 'Excelente' | 'Boa' | 'Média' | 'Baixa'> = {
    'EXCELLENT': 'Excelente',
    'GOOD': 'Boa',
    'AVERAGE': 'Média',
    'LOW': 'Baixa',
  };
  return qualityMap[quality] || 'Média';
};

/**
 * Converte dados de colheita do frontend para o formato do backend
 */
export const mapHarvestToBackend = (data: FrontendHarvestData): BackendHarvestData => {
  // Garantir que a data está no formato ISO
  let dateISO = data.date;
  if (dateISO && !dateISO.includes('T')) {
    // Se for apenas data (YYYY-MM-DD), converter para ISO
    dateISO = new Date(dateISO + 'T00:00:00Z').toISOString();
  } else if (!dateISO) {
    dateISO = new Date().toISOString();
  }

  // Garantir que todos os campos obrigatórios estão presentes
  const crop = String(data.crop || '').trim();
  const yieldValue = Number(data.yield);
  const expectedYieldValue = Number(data.expectedYield);
  const harvestAreaValue = Number(data.harvestArea);

  // Validar campos obrigatórios
  if (!crop) {
    throw new Error('Campo "crop" é obrigatório');
  }
  if (isNaN(yieldValue) || yieldValue < 0) {
    throw new Error('Campo "yield" deve ser um número válido');
  }
  if (isNaN(expectedYieldValue) || expectedYieldValue < 0) {
    throw new Error('Campo "expectedYield" deve ser um número válido');
  }
  if (isNaN(harvestAreaValue) || harvestAreaValue < 0) {
    throw new Error('Campo "harvestArea" deve ser um número válido');
  }

  return {
    crop,
    date: dateISO,
    yield: yieldValue,
    expectedYield: expectedYieldValue,
    harvestArea: harvestAreaValue,
    quality: mapQualityToBackend(data.quality || 'Média'),
    cropId: data.cropId || null,
  };
};

/**
 * Converte dados de colheita do backend para o formato do frontend
 */
export const mapHarvestFromBackend = (data: any): FrontendHarvestData => {
  return {
    id: data.id,
    crop: data.crop || '',
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    yield: data.yield || 0,
    expectedYield: data.expectedYield || 0,
    harvestArea: data.harvestArea || 0,
    quality: mapQualityFromBackend(data.quality || 'AVERAGE'),
    cropId: data.cropId,
  };
};

