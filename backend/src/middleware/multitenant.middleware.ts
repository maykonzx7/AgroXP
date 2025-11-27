import { Request, Response, NextFunction } from "express";
import prisma from "../services/database.service.js";

/**
 * Middleware para garantir isolamento de dados multitenant
 * Verifica que o usuário só acessa dados de suas próprias fazendas
 */

/**
 * Verifica se uma fazenda pertence ao usuário
 */
export const verifyFarmOwnership = async (
  farmId: string,
  userId: string
): Promise<boolean> => {
  try {
    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        ownerId: userId,
      },
      select: { id: true },
    });
    return !!farm;
  } catch (error) {
    console.error('Erro ao verificar propriedade da fazenda:', error);
    return false;
  }
};

/**
 * Verifica se um campo pertence ao usuário
 */
export const verifyFieldOwnership = async (
  fieldId: string,
  userId: string
): Promise<boolean> => {
  try {
    const field = await prisma.field.findFirst({
      where: {
        id: fieldId,
        farm: {
          ownerId: userId,
        },
      },
      select: { id: true },
    });
    return !!field;
  } catch (error) {
    console.error('Erro ao verificar propriedade do campo:', error);
    return false;
  }
};

/**
 * Obtém IDs de fazendas do usuário
 */
export const getUserFarmIds = async (userId: string): Promise<string[]> => {
  try {
    const farms = await prisma.farm.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    return farms.map(f => f.id);
  } catch (error) {
    console.error('Erro ao obter fazendas do usuário:', error);
    return [];
  }
};

/**
 * Obtém IDs de campos do usuário
 */
export const getUserFieldIds = async (userId: string): Promise<string[]> => {
  try {
    const userFarmIds = await getUserFarmIds(userId);
    if (userFarmIds.length === 0) {
      return [];
    }
    
    const fields = await prisma.field.findMany({
      where: {
        farmId: {
          in: userFarmIds,
        },
      },
      select: { id: true },
    });
    return fields.map(f => f.id);
  } catch (error) {
    console.error('Erro ao obter campos do usuário:', error);
    return [];
  }
};

/**
 * Middleware para verificar propriedade de fazenda em parâmetros
 */
export const checkFarmOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const farmId = req.params.farmId || req.body.farmId || req.query.farmId;
    
    if (farmId) {
      const isOwner = await verifyFarmOwnership(farmId as string, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Acesso negado: fazenda não pertence ao usuário' });
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de verificação de fazenda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar propriedade de campo em parâmetros
 */
export const checkFieldOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const fieldId = req.params.fieldId || req.body.fieldId || req.query.fieldId;
    
    if (fieldId) {
      const isOwner = await verifyFieldOwnership(fieldId as string, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Acesso negado: campo não pertence ao usuário' });
      }
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de verificação de campo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para garantir que dados criados sejam associados ao usuário
 */
export const enforceTenantIsolation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Se o body contém farmId, verifica propriedade
    if (req.body.farmId) {
      const isOwner = await verifyFarmOwnership(req.body.farmId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Acesso negado: fazenda não pertence ao usuário' });
      }
    }

    // Se o body contém fieldId, verifica propriedade
    if (req.body.fieldId) {
      const isOwner = await verifyFieldOwnership(req.body.fieldId, userId);
      if (!isOwner) {
        return res.status(403).json({ error: 'Acesso negado: campo não pertence ao usuário' });
      }
    }

    // Garante que ownerId sempre seja o usuário autenticado (se aplicável)
    if (req.method === 'POST' && req.body.ownerId && req.body.ownerId !== userId) {
      return res.status(403).json({ error: 'Não é possível criar recursos para outro usuário' });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de isolamento de tenant:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export default {
  verifyFarmOwnership,
  verifyFieldOwnership,
  getUserFarmIds,
  getUserFieldIds,
  checkFarmOwnership,
  checkFieldOwnership,
  enforceTenantIsolation,
};

