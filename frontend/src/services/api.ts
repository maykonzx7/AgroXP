// api.ts
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function for API requests
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
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Parcel API functions
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

// Crop API functions
export const cropApi = {
  getAll: () => apiRequest('/crops'),
  getById: (id: string) => apiRequest(`/crops/${id}`),
  create: (data: any) => apiRequest('/crops', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/crops/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/crops/${id}`, {
    method: 'DELETE',
  }),
};

// Livestock API functions
export const livestockApi = {
  getAll: () => apiRequest('/livestock'),
  getById: (id: string) => apiRequest(`/livestock/${id}`),
  create: (data: any) => apiRequest('/livestock', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/livestock/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/livestock/${id}`, {
    method: 'DELETE',
  }),
};

// Inventory API functions
export const inventoryApi = {
  getAll: () => apiRequest('/inventory'),
  getById: (id: string) => apiRequest(`/inventory/${id}`),
  create: (data: any) => apiRequest('/inventory', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/inventory/${id}`, {
    method: 'DELETE',
  }),
};

// Finance API functions
export const financeApi = {
  getAll: () => apiRequest('/finance'),
  getById: (id: string) => apiRequest(`/finance/${id}`),
  create: (data: any) => apiRequest('/finance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/finance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/finance/${id}`, {
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
  register: (name: string, email: string, phone: string, farmName: string, password: string) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, farmName, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
  getCurrentUser: () => apiRequest('/auth/me'),
};