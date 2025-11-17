import prisma from '../services/database.service.js';

/**
 * Helper functions for multi-tenant operations
 */

/**
 * Get user's livestock IDs based on their farms
 */
export async function getUserLivestockIds(userId: string): Promise<string[]> {
  const userFarms = await prisma.farm.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });
  
  const userFarmIds = userFarms.map(f => f.id);
  
  if (userFarmIds.length === 0) {
    return [];
  }
  
  const userFields = await prisma.field.findMany({
    where: {
      farmId: {
        in: userFarmIds,
      },
    },
    select: { id: true },
  });
  
  const userFieldIds = userFields.map(f => f.id);
  
  const userLivestock = await prisma.livestock.findMany({
    where: {
      fieldId: {
        in: userFieldIds,
      },
    },
    select: { id: true },
  });
  
  return userLivestock.map(l => l.id);
}

/**
 * Verify if livestock belongs to user
 */
export async function verifyLivestockOwnership(
  livestockId: string,
  userId: string
): Promise<{ valid: boolean; livestock?: any }> {
  const livestock = await prisma.livestock.findUnique({
    where: { id: livestockId },
    include: {
      field: {
        include: {
          farm: {
            select: {
              ownerId: true,
            },
          },
        },
      },
    },
  });
  
  if (!livestock) {
    return { valid: false };
  }
  
  if (livestock.field.farm.ownerId !== userId) {
    return { valid: false };
  }
  
  return { valid: true, livestock };
}

