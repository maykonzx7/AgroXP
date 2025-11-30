/**
 * Utilitário para logs seguros que não expõem dados sensíveis
 */

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'authToken',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'apikey',
  'authorization',
  'creditCard',
  'cvv',
  'ssn',
  'cpf',
  'cnpj',
];

/**
 * Remove dados sensíveis de um objeto recursivamente
 */
const sanitizeForLog = (obj: any, depth: number = 0): any => {
  // Limita profundidade para evitar loops infinitos
  if (depth > 10) {
    return '[Max Depth Reached]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Se for muito longo, trunca
    if (obj.length > 500) {
      return obj.substring(0, 500) + '...[truncated]';
    }
    return obj;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) => {
      if (index > 20) {
        return '[Array truncated]';
      }
      return sanitizeForLog(item, depth + 1);
    });
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const lowerKey = key.toLowerCase();
        
        // Remove campos sensíveis
        if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
          sanitized[key] = '[REDACTED]';
          continue;
        }

        // Sanitiza valores sensíveis em objetos aninhados
        sanitized[key] = sanitizeForLog(obj[key], depth + 1);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Log seguro que remove dados sensíveis
 */
export const safeLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, apenas loga mensagens sem dados sensíveis
    console.log(message);
    return;
  }

  // Em desenvolvimento, loga com dados sanitizados
  if (data) {
    const sanitized = sanitizeForLog(data);
    console.log(message, sanitized);
  } else {
    console.log(message);
  }
};

/**
 * Log de erro seguro
 */
export const safeError = (message: string, error?: any) => {
  if (error) {
    const sanitizedError = {
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: error.code,
      // Remove dados sensíveis do erro
      ...sanitizeForLog(error),
    };
    console.error(message, sanitizedError);
  } else {
    console.error(message);
  }
};

/**
 * Log de requisição HTTP seguro
 */
export const safeRequestLog = (method: string, url: string, data?: any) => {
  const sanitizedData = data ? sanitizeForLog(data) : undefined;
  safeLog(`[${method}] ${url}`, sanitizedData);
};

/**
 * Log de resposta HTTP seguro
 */
export const safeResponseLog = (status: number, url: string, data?: any) => {
  const sanitizedData = data ? sanitizeForLog(data) : undefined;
  safeLog(`[${status}] ${url}`, sanitizedData);
};

export default {
  safeLog,
  safeError,
  safeRequestLog,
  safeResponseLog,
  sanitizeForLog,
};




