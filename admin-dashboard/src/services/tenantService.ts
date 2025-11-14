// src/services/tenantService.ts
import api from './api';
import { Tenant } from '../types/admin';

const basePath = '/tenants';

export const tenantService = {
  getAll: async (): Promise<Tenant[]> => {
    try {
      const response = await api.get(basePath);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tenants:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Tenant> => {
    try {
      const response = await api.get(`${basePath}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar tenant com ID ${id}:`, error);
      throw error;
    }
  },

  create: async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> => {
    try {
      const response = await api.post(basePath, tenantData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      throw error;
    }
  },

  update: async (id: string, tenantData: Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tenant> => {
    try {
      const response = await api.put(`${basePath}/${id}`, tenantData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar tenant com ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${basePath}/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar tenant com ID ${id}:`, error);
      throw error;
    }
  }
};