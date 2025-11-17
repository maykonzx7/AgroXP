import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All harvest routes are protected
router.use(authenticate);

// Get all harvests - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { cropId } = req.query;
    
    // Get user's farm IDs for multi-tenant filtering
    const userFarms = await prisma.farm.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    
    const userFarmIds = userFarms.map(f => f.id);
    
    // Get user's field IDs
    const userFields = userFarmIds.length > 0
      ? await prisma.field.findMany({
          where: {
            farmId: {
              in: userFarmIds,
            },
          },
          select: { id: true },
        })
      : [];
    
    const userFieldIds = userFields.map(f => f.id);
    
    // Get user's crop IDs
    const userCrops = userFieldIds.length > 0
      ? await prisma.crop.findMany({
          where: {
            fieldId: {
              in: userFieldIds,
            },
          },
          select: { id: true },
        })
      : [];
    
    const userCropIds = userCrops.map(c => c.id);
    
    const orConditions: any[] = [
      { ownerId: userId },
    ];
    
    if (userCropIds.length > 0) {
      orConditions.push({
        cropId: {
          in: userCropIds,
        },
      });
    }
    
    const cropFilter =
      cropId && userCropIds.includes(cropId as string)
        ? { cropId: cropId as string }
        : null;
    
    const harvests = await prisma.harvest.findMany({
      where: cropFilter
        ? {
            AND: [
              cropFilter,
              { OR: orConditions },
            ],
          }
        : {
            OR: orConditions,
          },
      include: {
        cropRecord: {
          include: {
            field: {
              select: {
                id: true,
                name: true,
                farm: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    res.json(harvests);
  } catch (error: any) {
    console.error('Get harvests error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific harvest - Multi-tenant: verify ownership
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const harvest = await prisma.harvest.findUnique({
      where: { id },
      include: {
        cropRecord: {
          include: {
            field: {
              include: {
                farm: {
                  select: {
                    id: true,
                    name: true,
                    ownerId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    if (
      !harvest ||
      (harvest.ownerId !== userId &&
        (!harvest.cropId ||
          !harvest.cropRecord ||
          !harvest.cropRecord.field ||
          harvest.cropRecord.field.farm.ownerId !== userId))
    ) {
      return res.status(404).json({ message: 'Harvest not found' });
    }
    
    res.json(harvest);
  } catch (error: any) {
    console.error('Get harvest error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new harvest - Multi-tenant: verify crop belongs to user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { crop, date, yield: yieldValue, expectedYield, harvestArea, quality, cropId } = req.body;
    
    if (!crop || !date || !yieldValue || !expectedYield || !harvestArea || !quality) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate quality enum
    const validQualities = ['EXCELLENT', 'GOOD', 'AVERAGE', 'LOW'];
    if (!validQualities.includes(quality)) {
      return res.status(400).json({ message: 'Invalid quality. Must be one of: EXCELLENT, GOOD, AVERAGE, LOW' });
    }
    
    // If cropId is provided, verify it belongs to user
    let finalCropId = cropId || null;
    if (finalCropId) {
      const cropRecord = await prisma.crop.findUnique({
        where: { id: finalCropId },
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
      
      if (!cropRecord) {
        return res.status(404).json({ message: 'Crop not found' });
      }
      
      if (cropRecord.field.farm.ownerId !== userId) {
        return res.status(403).json({ message: 'Cannot create harvest for crop that does not belong to your farms' });
      }
    }
    
    const harvest = await prisma.harvest.create({
      data: {
        crop,
        date: new Date(date),
        yield: parseFloat(yieldValue),
        expectedYield: parseFloat(expectedYield),
        harvestArea: parseFloat(harvestArea),
        quality: quality as any,
        cropId: finalCropId,
        ownerId: userId,
      },
      include: {
        cropRecord: {
          include: {
            field: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    res.status(201).json(harvest);
  } catch (error: any) {
    console.error('Create harvest error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a harvest - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { crop, date, yield: yieldValue, expectedYield, harvestArea, quality, cropId } = req.body;
    
    const existingHarvest = await prisma.harvest.findUnique({
      where: { id },
      include: {
        cropRecord: {
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
    
    if (
      !existingHarvest ||
      (existingHarvest.ownerId !== userId &&
        (!existingHarvest.cropId ||
          !existingHarvest.cropRecord ||
          !existingHarvest.cropRecord.field ||
          existingHarvest.cropRecord.field.farm.ownerId !== userId))
    ) {
      return res.status(404).json({ message: 'Harvest not found' });
    }
    
    // If cropId is being changed, verify it belongs to user
    if (cropId !== undefined && cropId !== existingHarvest.cropId) {
      if (cropId) {
        const newCrop = await prisma.crop.findUnique({
          where: { id: cropId },
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
        
        if (!newCrop || newCrop.field.farm.ownerId !== userId) {
          return res.status(403).json({ message: 'Cannot move harvest to crop that does not belong to your farms' });
        }
      }
    }
    
    const updateData: any = {};
    if (crop !== undefined) updateData.crop = crop;
    if (date !== undefined) updateData.date = new Date(date);
    if (yieldValue !== undefined) updateData.yield = parseFloat(yieldValue);
    if (expectedYield !== undefined) updateData.expectedYield = parseFloat(expectedYield);
    if (harvestArea !== undefined) updateData.harvestArea = parseFloat(harvestArea);
    if (quality !== undefined) {
      const validQualities = ['EXCELLENT', 'GOOD', 'AVERAGE', 'LOW'];
      if (!validQualities.includes(quality)) {
        return res.status(400).json({ message: 'Invalid quality' });
      }
      updateData.quality = quality as any;
    }
    if (cropId !== undefined) updateData.cropId = cropId || null;
    
    const harvest = await prisma.harvest.update({
      where: { id },
      data: updateData,
      include: {
        cropRecord: {
          include: {
            field: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    res.json(harvest);
  } catch (error: any) {
    console.error('Update harvest error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a harvest - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const harvest = await prisma.harvest.findUnique({
      where: { id },
      include: {
        cropRecord: {
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
    
    if (
      !harvest ||
      (harvest.ownerId !== userId &&
        (!harvest.cropId ||
          !harvest.cropRecord ||
          !harvest.cropRecord.field ||
          harvest.cropRecord.field.farm.ownerId !== userId))
    ) {
      return res.status(404).json({ message: 'Harvest not found' });
    }
    
    await prisma.harvest.delete({
      where: { id },
    });
    
    res.json({ message: 'Harvest deleted successfully' });
  } catch (error: any) {
    console.error('Delete harvest error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

