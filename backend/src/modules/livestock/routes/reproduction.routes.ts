import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All reproduction routes are protected
router.use(authenticate);

// Get all reproductions - Multi-tenant: only user's farms
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
    
    const reproductions = await prisma.reproduction.findMany({
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
        createdAt: 'desc',
      },
    });
    
    res.json(reproductions);
  } catch (error: any) {
    console.error('Get reproductions error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get reproductions for a specific livestock - Multi-tenant: verify ownership
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
    
    const reproductions = await prisma.reproduction.findMany({
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
        createdAt: 'desc',
      },
    });
    
    res.json(reproductions);
  } catch (error: any) {
    console.error('Get reproductions by livestock error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new reproduction - Multi-tenant: verify livestock belongs to user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { livestockId, matingDate, expectedDeliveryDate, actualDeliveryDate, offspringCount, notes, status } = req.body;
    
    if (!livestockId) {
      return res.status(400).json({ message: 'Missing required field: livestockId' });
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
      return res.status(403).json({ message: 'Cannot create reproduction for livestock that does not belong to your farms' });
    }
    
    const reproduction = await prisma.reproduction.create({
      data: {
        livestockId,
        matingDate: matingDate ? new Date(matingDate) : null,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        actualDeliveryDate: actualDeliveryDate ? new Date(actualDeliveryDate) : null,
        offspringCount: offspringCount ? parseInt(offspringCount) : null,
        notes: notes || null,
        status: status || 'PLANNED',
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
    
    res.status(201).json(reproduction);
  } catch (error: any) {
    console.error('Create reproduction error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a reproduction - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { livestockId, matingDate, expectedDeliveryDate, actualDeliveryDate, offspringCount, notes, status } = req.body;
    
    const existingReproduction = await prisma.reproduction.findUnique({
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
    
    if (!existingReproduction) {
      return res.status(404).json({ message: 'Reproduction record not found' });
    }
    
    // Multi-tenant check: verify reproduction belongs to user's livestock
    if (existingReproduction.livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Reproduction does not belong to your farms' });
    }
    
    // If livestockId is being changed, verify it belongs to user
    if (livestockId !== undefined && livestockId !== existingReproduction.livestockId) {
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
        return res.status(403).json({ message: 'Cannot move reproduction to livestock that does not belong to your farms' });
      }
    }
    
    const updateData: any = {};
    if (livestockId !== undefined) updateData.livestockId = livestockId;
    if (matingDate !== undefined) updateData.matingDate = matingDate ? new Date(matingDate) : null;
    if (expectedDeliveryDate !== undefined) updateData.expectedDeliveryDate = expectedDeliveryDate ? new Date(expectedDeliveryDate) : null;
    if (actualDeliveryDate !== undefined) updateData.actualDeliveryDate = actualDeliveryDate ? new Date(actualDeliveryDate) : null;
    if (offspringCount !== undefined) updateData.offspringCount = offspringCount ? parseInt(offspringCount) : null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (status !== undefined) updateData.status = status;
    
    const reproduction = await prisma.reproduction.update({
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
    
    res.json(reproduction);
  } catch (error: any) {
    console.error('Update reproduction error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a reproduction - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const reproduction = await prisma.reproduction.findUnique({
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
    
    if (!reproduction) {
      return res.status(404).json({ message: 'Reproduction record not found' });
    }
    
    // Multi-tenant check: verify reproduction belongs to user's livestock
    if (reproduction.livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Reproduction does not belong to your farms' });
    }
    
    await prisma.reproduction.delete({
      where: { id },
    });
    
    res.status(204).end();
  } catch (error: any) {
    console.error('Delete reproduction error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

