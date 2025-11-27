import { Request, Response, NextFunction } from "express";

/**
 * Middleware de segurança para sanitização e validação de dados
 * Protege contra SQL Injection, XSS e outras vulnerabilidades
 */

/**
 * Remove caracteres perigosos que podem ser usados em SQL Injection
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Remove caracteres perigosos para SQL
  return input
    .replace(/['";\\]/g, '') // Remove aspas e ponto e vírgula
    .replace(/--/g, '') // Remove comentários SQL
    .replace(/\/\*/g, '') // Remove comentários SQL
    .replace(/\*\//g, '') // Remove comentários SQL
    .replace(/xp_/gi, '') // Remove stored procedures perigosas
    .replace(/sp_/gi, '') // Remove stored procedures perigosas
    .trim();
};

/**
 * Sanitiza HTML para prevenir XSS
 */
export const sanitizeHTML = (input: string): string => {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
};

/**
 * Valida e sanitiza números
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
 * Sanitiza objeto recursivamente
 */
export const sanitizeObject = (obj: any, deep: boolean = true): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number') {
    return isNaN(obj) || !isFinite(obj) ? null : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deep ? sanitizeObject(item, deep) : item);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitiza a chave também
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = deep ? sanitizeObject(obj[key], deep) : obj[key];
      }
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Middleware para sanitizar body, query e params
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitiza query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query, false) as any;
    }
    
    // Sanitiza route parameters
    if (req.params) {
      req.params = sanitizeObject(req.params, false) as any;
    }
    
    // Sanitiza body (mas preserva estrutura para validação)
    if (req.body && typeof req.body === 'object') {
      // Para campos específicos, aplica sanitização apropriada
      if (req.body.email) {
        req.body.email = sanitizeEmail(req.body.email) || req.body.email;
      }
      
      // Sanitiza strings no body
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          // Não sanitiza senhas (serão hasheadas)
          if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
            continue;
          }
          req.body[key] = sanitizeString(req.body[key]);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Erro na sanitização:', error);
    res.status(400).json({ error: 'Dados inválidos' });
  }
};

/**
 * Middleware para validar tipos de dados básicos
 */
export const validateInputTypes = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validateValue = (value: any, path: string): boolean => {
      // Valida que não há objetos ou arrays aninhados muito profundos
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 1000) {
            return false; // Limita arrays grandes
          }
          return value.every((item, index) => validateValue(item, `${path}[${index}]`));
        } else {
          const keys = Object.keys(value);
          if (keys.length > 100) {
            return false; // Limita objetos grandes
          }
          return keys.every(key => validateValue(value[key], `${path}.${key}`));
        }
      }
      
      // Valida tamanho de strings
      if (typeof value === 'string' && value.length > 10000) {
        return false; // Limita strings muito grandes
      }
      
      return true;
    };
    
    if (req.body && !validateValue(req.body, 'body')) {
      return res.status(400).json({ error: 'Dados inválidos: estrutura muito complexa ou muito grande' });
    }
    
    if (req.query && !validateValue(req.query, 'query')) {
      return res.status(400).json({ error: 'Parâmetros de query inválidos' });
    }
    
    next();
  } catch (error) {
    console.error('Erro na validação de tipos:', error);
    res.status(400).json({ error: 'Erro na validação de dados' });
  }
};

/**
 * Middleware para prevenir NoSQL Injection (se usar MongoDB no futuro)
 */
export const preventNoSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  try {
    const dangerousPatterns = [
      /\$where/i,
      /\$ne/i,
      /\$gt/i,
      /\$lt/i,
      /\$gte/i,
      /\$lte/i,
      /\$regex/i,
      /\$exists/i,
      /\$in/i,
      /\$nin/i,
      /\$or/i,
      /\$and/i,
      /\$not/i,
      /\$nor/i,
    ];
    
    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return !dangerousPatterns.some(pattern => pattern.test(value));
      }
      
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          return value.every(checkValue);
        }
        return Object.values(value).every(checkValue);
      }
      
      return true;
    };
    
    if (req.body && !checkValue(req.body)) {
      return res.status(400).json({ error: 'Dados contêm padrões perigosos' });
    }
    
    if (req.query && !checkValue(req.query)) {
      return res.status(400).json({ error: 'Parâmetros de query contêm padrões perigosos' });
    }
    
    next();
  } catch (error) {
    console.error('Erro na prevenção de NoSQL Injection:', error);
    res.status(400).json({ error: 'Erro na validação de segurança' });
  }
};

/**
 * Middleware combinado de segurança
 */
export const securityMiddleware = [
  validateInputTypes,
  preventNoSQLInjection,
  sanitizeInput,
];

export default {
  sanitizeString,
  sanitizeHTML,
  sanitizeNumber,
  sanitizeEmail,
  sanitizeObject,
  sanitizeInput,
  validateInputTypes,
  preventNoSQLInjection,
  securityMiddleware,
};

