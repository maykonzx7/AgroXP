// src/pages/Dashboard.tsx (corrected version)

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import useApi from '../hooks/useApi';
import { dashboardService } from '../services/dashboardService';
import {
  Users,
  Building,
  Activity,
  Shield,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Interface para métricas do dashboard
interface DashboardStats {
  totalUsers: number;
  totalTenants: number;
  activeSessions: number;
  systemUptime: string;
  apiRequestsPerMinute: number;
}

const Dashboard: React.FC = () => {
  // Usar o hook useApi para buscar métricas
  const { 
    data: stats, 
    loading, 
    error, 
    refetch 
  } = useApi<DashboardStats>(() => dashboardService.getStats(), []);

  // Usar dados mockados se não estiver carregando nem houver erro
  const displayStats = stats || {
    totalUsers: 1247,
    totalTenants: 89,
    activeSessions: 23,
    systemUptime: '99.9%',
    apiRequestsPerMinute: 45
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    console.error('Erro no dashboard:', error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral do sistema e métricas em tempo real
        </p>
      </div>

      {/* Métricas do Sistema */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% desde o último mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fazendas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.totalTenants}</div>
            <p className="text-xs text-muted-foreground">+8% desde o último mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">+5% desde o último mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Métricas Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Uptime do Sistema</span>
                <span className="font-medium">{displayStats.systemUptime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Requisições/min</span>
                <span className="font-medium">{displayStats.apiRequestsPerMinute}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-primary-500 mr-2" />
                    <span>Sistema Operacional</span>
                  </div>
                  <span className="text-primary-600 font-medium">Normal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-primary-500 mr-2" />
                    <span>Banco de Dados</span>
                  </div>
                  <span className="text-primary-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="h-5 w-5 text-yellow-500 mr-2" />
                    <span>Backup Automático</span>
                  </div>
                  <span className="text-yellow-600 font-medium">Em Execução</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Nova fazenda registrada
                    </p>
                    <p className="text-sm text-gray-500">
                      Fazenda Verde Vale - João Silva
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      há 2 minutos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;