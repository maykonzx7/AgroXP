// api.ts - DEPRECATED: Este arquivo está sendo descontinuado
// Por favor, use apiService.ts ou o contexto CRM (useCRM) para novas implementações
// Mantido apenas para compatibilidade com código legado

// Re-exportar de apiService.ts para manter compatibilidade
export {
  parcelsApi,
  cropsApi as cropApi,
  livestockApi,
  inventoryApi,
  financeApi,
} from './apiService';

// APIs adicionais que não estão em apiService.ts
// TODO: Migrar para apiService.ts ou usar contexto CRM

const API_BASE_URL = 'http://localhost:3001/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Tasks API functions
export const tasksApi = {
  getAll: (params?: { status?: string; priority?: string; farmId?: string; fieldId?: string; cropId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.farmId) queryParams.append('farmId', params.farmId);
    if (params?.fieldId) queryParams.append('fieldId', params.fieldId);
    if (params?.cropId) queryParams.append('cropId', params.cropId);
    const query = queryParams.toString();
    return apiRequest(`/tasks${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiRequest(`/tasks/${id}`),
  create: (data: any) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  }),
};

// Weather API functions
export const weatherApi = {
  getAll: (params?: { type?: string; severity?: string; isActive?: boolean; farmId?: string; fieldId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.farmId) queryParams.append('farmId', params.farmId);
    if (params?.fieldId) queryParams.append('fieldId', params.fieldId);
    const query = queryParams.toString();
    return apiRequest(`/weather${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiRequest(`/weather/${id}`),
  create: (data: any) => apiRequest('/weather', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/weather/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/weather/${id}`, {
    method: 'DELETE',
  }),
};

// Alerts API functions
export const alertsApi = {
  getAll: (params?: { type?: string; severity?: string; isRead?: boolean; isActive?: boolean; farmId?: string; fieldId?: string; cropId?: string; livestockId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.isRead !== undefined) queryParams.append('isRead', String(params.isRead));
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.farmId) queryParams.append('farmId', params.farmId);
    if (params?.fieldId) queryParams.append('fieldId', params.fieldId);
    if (params?.cropId) queryParams.append('cropId', params.cropId);
    if (params?.livestockId) queryParams.append('livestockId', params.livestockId);
    const query = queryParams.toString();
    return apiRequest(`/alerts${query ? `?${query}` : ''}`);
  },
  getUnreadCount: () => apiRequest('/alerts/unread/count'),
  getById: (id: string) => apiRequest(`/alerts/${id}`),
  create: (data: any) => apiRequest('/alerts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  markAsRead: (id: string) => apiRequest(`/alerts/${id}/read`, {
    method: 'PATCH',
  }),
  markAllAsRead: () => apiRequest('/alerts/read-all', {
    method: 'PATCH',
  }),
  delete: (id: string) => apiRequest(`/alerts/${id}`, {
    method: 'DELETE',
  }),
};

// Auth API functions
export const authApi = {
  login: (email: string, password: string) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  register: (
    name: string, 
    email: string, 
    phone: string, 
    farmName: string, 
    password: string,
    farmLocation?: string,
    farmDescription?: string,
    farmSize?: number
  ) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        email, 
        phone, 
        farmName, 
        password,
        farmLocation,
        farmDescription,
        farmSize
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
  getCurrentUser: () => apiRequest('/auth/me'),
};

// Exportar parcelApi como alias para parcelsApi (compatibilidade)
export const parcelApi = {
  getAll: () => apiRequest('/parcels'),
  getById: (id: string) => apiRequest(`/parcels/${id}`),
  create: (data: any) => apiRequest('/parcels', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/parcels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/parcels/${id}`, {
    method: 'DELETE',
  }),
};
