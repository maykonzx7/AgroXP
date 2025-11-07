import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userService from '../services/user.service';

// Middleware de autenticação
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obter token do header de autorização
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação necessário' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agroxp_secret_key') as any;
    
    // Validar sessão
    const user = await userService.validateSession(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada' });
    }
    
    // Adicionar informações do usuário ao request
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    
    res.status(500).json({ error: 'Erro de autenticação' });
  }
};

// Middleware para autorizar apenas administradores
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  
  next();
};

// Middleware para autorizar apenas super administradores
export const authorizeSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Acesso restrito a super administradores' });
  }
  
  next();
};

export default {
  authenticate,
  authorizeAdmin,
  authorizeSuperAdmin
};