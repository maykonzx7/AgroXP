// src/services/reportService.ts
import api from './api';
import { Report } from '../types/admin';

const basePath = '/reports';

export const reportService = {
  getAll: async (): Promise<Report[]> => {
    try {
      const response = await api.get(basePath);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Report> => {
    try {
      const response = await api.get(`${basePath}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar relatório com ID ${id}:`, error);
      throw error;
    }
  },

  create: async (reportData: Omit<Report, 'id' | 'createdAt' | 'lastGenerated'>): Promise<Report> => {
    try {
      const response = await api.post(basePath, reportData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      throw error;
    }
  },

  update: async (id: string, reportData: Partial<Omit<Report, 'id' | 'createdAt' | 'lastGenerated'>>): Promise<Report> => {
    try {
      const response = await api.put(`${basePath}/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar relatório com ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${basePath}/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar relatório com ID ${id}:`, error);
      throw error;
    }
  },

  generate: async (id: string): Promise<any> => {
    try {
      const response = await api.post(`${basePath}/${id}/generate`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao gerar relatório com ID ${id}:`, error);
      throw error;
    }
  }
};