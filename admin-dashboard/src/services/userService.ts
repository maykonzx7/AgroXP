// src/services/userService.ts
import api from './api';
import { User } from '../types/admin';

const basePath = '/users';

export const userService = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await api.get(basePath);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`${basePath}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuário com ID ${id}:`, error);
      throw error;
    }
  },

  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    try {
      const response = await api.post(basePath, userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  update: async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> => {
    try {
      const response = await api.put(`${basePath}/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${basePath}/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar usuário com ID ${id}:`, error);
      throw error;
    }
  },

  changeRole: async (id: string, role: string): Promise<User> => {
    try {
      const response = await api.patch(`${basePath}/${id}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`Erro ao alterar papel do usuário com ID ${id}:`, error);
      throw error;
    }
  },

  toggleActive: async (id: string): Promise<User> => {
    try {
      const response = await api.patch(`${basePath}/${id}/toggle-active`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao alternar status do usuário com ID ${id}:`, error);
      throw error;
    }
  }
};