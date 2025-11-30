/**
 * Utilitários de sanitização para prevenir XSS e outras vulnerabilidades
 */

/**
 * Escapa caracteres HTML para prevenir XSS
 */
export const escapeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Sanitiza string removendo caracteres perigosos
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Remove caracteres perigosos
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitiza objeto recursivamente
 */
export const sanitizeObject = (obj: any, deep: boolean = true): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deep ? sanitizeObject(item, deep) : item);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = deep ? sanitizeObject(obj[key], deep) : obj[key];
      }
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Valida e sanitiza email
 */
export const sanitizeEmail = (input: string): string | null => {
  if (typeof input !== 'string') {
    return null;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeString(input.toLowerCase().trim());
  
  if (!emailRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Valida e sanitiza número
 */
export const sanitizeNumber = (input: any): number | null => {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  return num;
};

/**
 * Sanitiza dados antes de enviar para API
 */
export const sanitizeForAPI = (data: any): any => {
  return sanitizeObject(data, true);
};

export default {
  escapeHTML,
  sanitizeString,
  sanitizeObject,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeForAPI,
};





