// config.ts
// Arquivo de configuração central para URLs e outras configurações

const config = {
  // URL base para todas as requisições da API
  // Usando caminho relativo para garantir que vá pelo proxy do Vite
  API_BASE_URL: '/api',
  
  // Timeout padrão para requisições
  REQUEST_TIMEOUT: 10000,
  
  // Configurações de autenticação
  TOKEN_KEY: 'admin_token',
  
  // Configurações de ambiente
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;