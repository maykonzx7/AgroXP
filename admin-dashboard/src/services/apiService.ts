// src/services/apiService.ts (corrected version)

import axios from 'axios';

// Criar uma instância do axios com configurações padrão
// Usar caminho relativo para que vá através do proxy do Vite
const api = axios.create({
  baseURL: '/api', // Caminho relativo - vai passar pelo proxy do Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido, fazer logout
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;