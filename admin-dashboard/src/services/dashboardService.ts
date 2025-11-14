// src/services/dashboardService.ts
import { DashboardStats } from '../types/admin';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    // Simulando chamada à API - em um ambiente real, isso seria uma chamada real
    try {
      // Em uma implementação real, faríamos:
      // const response = await api.get('/admin/dashboard/stats');
      // return response.data;
      
      // Por enquanto, retornando dados mockados
      return Promise.resolve({
        totalUsers: 1247,
        totalTenants: 89,
        activeSessions: 23,
        systemUptime: '99.9%',
        apiRequestsPerMinute: 45
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      // Em caso de erro, retornar valores padrão
      return {
        totalUsers: 0,
        totalTenants: 0,
        activeSessions: 0,
        systemUptime: '0%',
        apiRequestsPerMinute: 0
      };
    }
  }
};