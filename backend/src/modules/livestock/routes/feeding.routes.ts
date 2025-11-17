import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All feeding routes are protected
router.use(authenticate);

// Get all feedings - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { livestockId } = req.query;
    
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
    
    const feedings = await prisma.feeding.findMany({
      where,
      include: {
        livestock: {
          select: {
            id: true,
            name: true,
            category: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        feedingDate: 'desc',
      },
    });
    
    res.json(feedings);
  } catch (error: any) {
    console.error('Get feedings error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get feedings for a specific livestock - Multi-tenant: verify ownership
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
    
    const feedings = await prisma.feeding.findMany({
      where: { livestockId },
      include: {
        livestock: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        feedingDate: 'desc',
      },
    });
    
    res.json(feedings);
  } catch (error: any) {
    console.error('Get feedings by livestock error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new feeding - Multi-tenant: verify livestock belongs to user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { livestockId, feedType, quantity, unit, feedingDate, notes } = req.body;
    
    if (!livestockId || !feedType || !quantity || !unit || !feedingDate) {
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
      return res.status(403).json({ message: 'Cannot create feeding for livestock that does not belong to your farms' });
    }
    
    const feeding = await prisma.feeding.create({
      data: {
        livestockId,
        feedType,
        quantity: parseFloat(quantity),
        unit,
        feedingDate: new Date(feedingDate),
        notes: notes || null,
      },
      include: {
        livestock: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.status(201).json(feeding);
  } catch (error: any) {
    console.error('Create feeding error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a feeding - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { livestockId, feedType, quantity, unit, feedingDate, notes } = req.body;
    
    const existingFeeding = await prisma.feeding.findUnique({
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
    
    if (!existingFeeding) {
      return res.status(404).json({ message: 'Feeding record not found' });
    }
    
    // Multi-tenant check: verify feeding belongs to user's livestock
    if (existingFeeding.livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Feeding does not belong to your farms' });
    }
    
    // If livestockId is being changed, verify it belongs to user
    if (livestockId !== undefined && livestockId !== existingFeeding.livestockId) {
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
        return res.status(403).json({ message: 'Cannot move feeding to livestock that does not belong to your farms' });
      }
    }
    
    const updateData: any = {};
    if (livestockId !== undefined) updateData.livestockId = livestockId;
    if (feedType !== undefined) updateData.feedType = feedType;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (feedingDate !== undefined) updateData.feedingDate = new Date(feedingDate);
    if (notes !== undefined) updateData.notes = notes || null;
    
    const feeding = await prisma.feeding.update({
      where: { id },
      data: updateData,
      include: {
        livestock: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.json(feeding);
  } catch (error: any) {
    console.error('Update feeding error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a feeding - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const feeding = await prisma.feeding.findUnique({
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
    
    if (!feeding) {
      return res.status(404).json({ message: 'Feeding record not found' });
    }
    
    // Multi-tenant check: verify feeding belongs to user's livestock
    if (feeding.livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Feeding does not belong to your farms' });
    }
    
    await prisma.feeding.delete({
      where: { id },
    });
    
    res.status(204).end();
  } catch (error: any) {
    console.error('Delete feeding error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

