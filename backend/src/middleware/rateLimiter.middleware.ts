import { Request, Response, NextFunction } from "express";

/**
 * Rate Limiter simples em memória
 * Em produção, considere usar Redis para rate limiting distribuído
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Limpa entradas expiradas do store periodicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000); // Limpa a cada minuto

/**
 * Obtém chave única para rate limiting baseada em IP e rota
 */
const getRateLimitKey = (req: Request): string => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const route = req.path;
  return `${ip}:${route}`;
};

/**
 * Rate limiter genérico
 */
export const createRateLimiter = (
  windowMs: number = 60000, // 1 minuto
  maxRequests: number = 100 // 100 requisições por minuto
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = getRateLimitKey(req);
    const now = Date.now();
    
    // Limpa entrada expirada
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }
    
    // Inicializa ou incrementa contador
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }
    
    // Verifica limite
    if (store[key].count >= maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: 'Muitas requisições',
        message: `Limite de ${maxRequests} requisições por ${windowMs / 1000} segundos excedido. Tente novamente em ${retryAfter} segundos.`,
        retryAfter,
      });
    }
    
    // Incrementa contador
    store[key].count++;
    next();
  };
};

/**
 * Rate limiter específico para autenticação (mais restritivo)
 */
export const authRateLimiter = createRateLimiter(900000, 5); // 5 tentativas a cada 15 minutos

/**
 * Rate limiter para endpoints de criação (moderado)
 */
export const createRateLimiter_middle = createRateLimiter(60000, 30); // 30 requisições por minuto

/**
 * Rate limiter padrão (mais permissivo)
 */
export const defaultRateLimiter = createRateLimiter(60000, 100); // 100 requisições por minuto

export default {
  createRateLimiter,
  authRateLimiter,
  createRateLimiter_middle,
  defaultRateLimiter,
};

