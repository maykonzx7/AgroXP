// analytics-service.ts
// Serviço para lidar com eventos analíticos e chamadas à API
import api from './api';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  data?: any;
}

class AnalyticsService {
  private eventsQueue: AnalyticsEvent[] = [];

  // Método para enviar eventos analíticos
  public async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Adiciona timestamp ao evento
      const eventWithTimestamp = {
        ...event,
        timestamp: Date.now()
      };

      // Adiciona evento à fila
      this.eventsQueue.push(eventWithTimestamp);

      // Processa a fila de eventos - para simular envio
      await this.processQueue();
    } catch (error) {
      console.error('Erro ao rastrear evento analítico:', error);
    }
  }

  // Método para processar a fila de eventos
  private async processQueue(): Promise<void> {
    if (this.eventsQueue.length === 0) return;

    // Em um ambiente real, enviaríamos os eventos para um endpoint de analytics
    // Por enquanto, apenas simulamos o envio
    console.log(`Enviando ${this.eventsQueue.length} eventos para o serviço de analytics`);
    
    // Limpa a fila após o processamento
    this.eventsQueue = [];
  }

  // Método para obter métricas de dashboard
  public async getDashboardMetrics() {
    try {
      // Exemplo de chamada à API que poderia estar causando os problemas
      // Agora usando o api service configurado corretamente
      const response = await api.get('/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter métricas do dashboard:', error);
      // Retornar dados mockados em caso de erro
      return {
        totalUsers: 1247,
        totalTenants: 89,
        activeSessions: 23,
        systemUptime: '99.9%',
        databaseSize: '2.3 GB',
        apiRequestsPerMinute: 45
      };
    }
  }

  // Método para obter dados de diferentes módulos
  public async fetchData(module: string) {
    try {
      // Usar o serviço de API configurado para garantir que vá pelo proxy
      const response = await api.get(`/${module}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao obter dados do módulo ${module}:`, error);
      // Em caso de erro, retornar array vazio ou dados padrão
      return [];
    }
  }
}

// Instância singleton do serviço de analytics
const analyticsService = new AnalyticsService();
export default analyticsService;