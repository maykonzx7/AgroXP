// apiService.ts
import { useAuth } from '@/contexts/AuthContext';

// Base API URL
const API_BASE_URL = 'http://localhost:3001/api';

// Generic fetch function with authentication
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { token } = useAuth();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Parcels API
export const parcelsApi = {
  getAll: () => fetchWithAuth('/parcels'),
  getById: (id: string) => fetchWithAuth(`/parcels/${id}`),
  create: (data: any) => fetchWithAuth('/parcels', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/parcels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/parcels/${id}`, {
    method: 'DELETE',
  }),
};

// Crops API
export const cropsApi = {
  getAll: () => fetchWithAuth('/crops'),
  getById: (id: string) => fetchWithAuth(`/crops/${id}`),
  create: (data: any) => fetchWithAuth('/crops', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/crops/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/crops/${id}`, {
    method: 'DELETE',
  }),
};

// Livestock API
export const livestockApi = {
  getAll: () => fetchWithAuth('/livestock'),
  getById: (id: string) => fetchWithAuth(`/livestock/${id}`),
  create: (data: any) => fetchWithAuth('/livestock', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/livestock/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/livestock/${id}`, {
    method: 'DELETE',
  }),
};

// Inventory API
export const inventoryApi = {
  getAll: () => fetchWithAuth('/inventory'),
  getById: (id: string) => fetchWithAuth(`/inventory/${id}`),
  create: (data: any) => fetchWithAuth('/inventory', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/inventory/${id}`, {
    method: 'DELETE',
  }),
};

// Finance API
export const financeApi = {
  getAll: () => fetchWithAuth('/finance'),
  getById: (id: string) => fetchWithAuth(`/finance/${id}`),
  create: (data: any) => fetchWithAuth('/finance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithAuth(`/finance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithAuth(`/finance/${id}`, {
    method: 'DELETE',
  }),
};