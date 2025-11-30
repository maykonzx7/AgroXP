// api-config.ts
// Configuração global para todas as requisições HTTP no admin dashboard

import axios from 'axios';
import config from '../config';

// Configurar axios globalmente para usar o proxy do Vite
// Isso garante que todas as requisições passem pelo proxy do Vite
axios.defaults.baseURL = config.API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = config.REQUEST_TIMEOUT;

// Interceptor para adicionar o token de autenticação automaticamente
axios.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem(config.TOKEN_KEY);
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    // Certificar que as requisições usam caminhos relativos para o proxy
    if (requestConfig.url && !requestConfig.url.startsWith('/')) {
      requestConfig.url = `/${requestConfig.url}`;
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas de erro
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido, fazer logout
      localStorage.removeItem(config.TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;