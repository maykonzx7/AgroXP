import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All livestock supply usage routes are protected
router.use(authenticate);

// Get all supply usages - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { livestockId, supplyId } = req.query;
    
    // Get user's farm IDs for multi-tenant filtering
    const userFarms = await prisma.farm.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    
    const userFarmIds = userFarms.map(f => f.id);
    
    if (userFarmIds.length === 0) {
      return res.json([]);
    }
    
    // Get user's field IDs
    const userFields = await prisma.field.findMany({
      where: {
        farmId: {
          in: userFarmIds,
        },
      },
      select: { id: true },
    });
    
    const userFieldIds = userFields.map(f => f.id);
    
    // Get user's livestock IDs
    const userLivestock = await prisma.livestock.findMany({
      where: {
        fieldId: {
          in: userFieldIds,
        },
      },
      select: { id: true },
    });
    
    const userLivestockIds = userLivestock.map(l => l.id);
    
    if (userLivestockIds.length === 0) {
      return res.json([]);
    }
    
    const where: any = {
      livestockId: {
        in: userLivestockIds,
      },
    };
    
    if (livestockId && userLivestockIds.includes(livestockId as string)) {
      where.livestockId = livestockId;
    }
    if (supplyId) where.supplyId = supplyId as string;
    
    const usages = await prisma.livestockSupplyUsage.findMany({
      where,
      include: {
        livestock: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        supply: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        usageDate: 'desc',
      },
    });
    
    res.json(usages);
  } catch (error: any) {
    console.error('Get supply usages error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get usages for a specific livestock - Multi-tenant: verify ownership
router.get('/livestock/:livestockId', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { livestockId } = req.params;
    
    // Verify livestock belongs to user
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
      return res.status(404).json({ message: 'Livestock not found' });
    }
    
    if (livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Livestock does not belong to your farms' });
    }
    
    const usages = await prisma.livestockSupplyUsage.findMany({
      where: { livestockId },
      include: {
        livestock: {
          select: {
            id: true,
            name: true,
          },
        },
        supply: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        usageDate: 'desc',
      },
    });
    
    res.json(usages);
  } catch (error: any) {
    console.error('Get supply usages by livestock error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get usages for a specific supply - Multi-tenant: only user's livestock
router.get('/supply/:supplyId', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { supplyId } = req.params;
    
    // Get user's livestock IDs
    const userFarms = await prisma.farm.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    
    const userFarmIds = userFarms.map(f => f.id);
    
    if (userFarmIds.length === 0) {
      return res.json([]);
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
    
    const userLivestockIds = userLivestock.map(l => l.id);
    
    if (userLivestockIds.length === 0) {
      return res.json([]);
    }
    
    const usages = await prisma.livestockSupplyUsage.findMany({
      where: {
        supplyId,
        livestockId: {
          in: userLivestockIds,
        },
      },
      include: {
        livestock: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        supply: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        usageDate: 'desc',
      },
    });
    
    res.json(usages);
  } catch (error: any) {
    console.error('Get supply usages by supply error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new supply usage - Multi-tenant: verify livestock belongs to user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { livestockId, supplyId, quantityUsed, unit, usageDate, notes } = req.body;
    
    if (!livestockId || !supplyId || !quantityUsed || !unit || !usageDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Verify livestock belongs to user
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
      return res.status(404).json({ message: 'Livestock not found' });
    }
    
    if (livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Cannot create supply usage for livestock that does not belong to your farms' });
    }
    
    const usage = await prisma.livestockSupplyUsage.create({
      data: {
        livestockId,
        supplyId,
        quantityUsed: parseFloat(quantityUsed),
        unit,
        usageDate: new Date(usageDate),
        notes: notes || null,
      },
      include: {
        livestock: {
          select: {
            id: true,
            name: true,
          },
        },
        supply: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.status(201).json(usage);
  } catch (error: any) {
    console.error('Create supply usage error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a supply usage - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { livestockId, supplyId, quantityUsed, unit, usageDate, notes } = req.body;
    
    const existingUsage = await prisma.livestockSupplyUsage.findUnique({
      where: { id },
      include: {
        livestock: {
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
        },
      },
    });
    
    if (!existingUsage) {
      return res.status(404).json({ message: 'Supply usage not found' });
    }
    
    // Multi-tenant check: verify usage belongs to user's livestock
    if (existingUsage.livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Supply usage does not belong to your farms' });
    }
    
    // If livestockId is being changed, verify it belongs to user
    if (livestockId !== undefined && livestockId !== existingUsage.livestockId) {
      const newLivestock = await prisma.livestock.findUnique({
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
      
      if (!newLivestock || newLivestock.field.farm.ownerId !== userId) {
        return res.status(403).json({ message: 'Cannot move supply usage to livestock that does not belong to your farms' });
      }
    }
    
    const updateData: any = {};
    if (livestockId !== undefined) updateData.livestockId = livestockId;
    if (supplyId !== undefined) updateData.supplyId = supplyId;
    if (quantityUsed !== undefined) updateData.quantityUsed = parseFloat(quantityUsed);
    if (unit !== undefined) updateData.unit = unit;
    if (usageDate !== undefined) updateData.usageDate = new Date(usageDate);
    if (notes !== undefined) updateData.notes = notes || null;
    
    const usage = await prisma.livestockSupplyUsage.update({
      where: { id },
      data: updateData,
      include: {
        livestock: {
          select: {
            id: true,
            name: true,
          },
        },
        supply: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.json(usage);
  } catch (error: any) {
    console.error('Update supply usage error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a supply usage - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const usage = await prisma.livestockSupplyUsage.findUnique({
      where: { id },
      include: {
        livestock: {
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
        },
      },
    });
    
    if (!usage) {
      return res.status(404).json({ message: 'Supply usage not found' });
    }
    
    // Multi-tenant check: verify usage belongs to user's livestock
    if (usage.livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Supply usage does not belong to your farms' });
    }
    
    await prisma.livestockSupplyUsage.delete({
      where: { id },
    });
    
    res.status(204).end();
  } catch (error: any) {
    console.error('Delete supply usage error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

