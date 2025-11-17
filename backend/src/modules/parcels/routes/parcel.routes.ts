import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All parcel routes are protected
router.use(authenticate);

// Get all parcels (fields) - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { farmId } = req.query;
    
    // Get user's farm IDs for multi-tenant filtering
    const userFarms = await prisma.farm.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    
    const userFarmIds = userFarms.map(f => f.id);
    
    if (userFarmIds.length === 0) {
      return res.json([]);
    }
    
    const where: any = {
      farmId: {
        in: userFarmIds,
      },
    };
    
    if (farmId && userFarmIds.includes(farmId as string)) {
      where.farmId = farmId;
    }
    
    const fields = await prisma.field.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        crops: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(fields);
  } catch (error: any) {
    console.error('Get parcels error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific parcel (field) - Multi-tenant: verify ownership
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const field = await prisma.field.findUnique({
      where: { id },
      include: {
        farm: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        crops: true,
        finances: true,
      },
    });
    
    if (!field) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    // Multi-tenant check: verify field belongs to user's farm
    if (field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Parcel does not belong to your farms' });
    }
    
    res.json(field);
  } catch (error: any) {
    console.error('Get parcel error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new parcel (field)
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name, description, size, location, soilType, phLevel, farmId, status } = req.body;
    
    // Log received data for debugging
    console.log('[Create parcel] Received data:', { name, size, location, soilType, farmId, status });
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Missing required field: name' });
    }
    
    if (size === undefined || size === null || size === '') {
      return res.status(400).json({ message: 'Missing required field: size' });
    }
    
    const parsedSize = parseFloat(size);
    if (isNaN(parsedSize) || parsedSize <= 0) {
      return res.status(400).json({ message: 'Size must be a positive number' });
    }
    
    // If farmId is not provided, get user's first farm
    let finalFarmId = farmId;
    if (!finalFarmId) {
      console.log('[Create parcel] No farmId provided, searching for user farm. UserId:', userId);
      const userFarm = await prisma.farm.findFirst({
        where: { ownerId: userId },
      });
      
      if (!userFarm) {
        console.log('[Create parcel] No farm found for user:', userId);
        return res.status(400).json({ 
          message: 'User must have at least one farm to create a parcel. Please create a farm first.' 
        });
      }
      
      finalFarmId = userFarm.id;
      console.log('[Create parcel] Using default farm:', finalFarmId);
    } else {
      // Verify that the specified farm belongs to the user
      const userFarm = await prisma.farm.findFirst({
        where: { 
          id: finalFarmId,
          ownerId: userId,
        },
      });
      
      if (!userFarm) {
        console.log('[Create parcel] Farm does not belong to user. FarmId:', finalFarmId, 'UserId:', userId);
        return res.status(403).json({ message: 'Cannot create parcel for farm that does not belong to user' });
      }
    }
    
    const field = await prisma.field.create({
      data: {
        name: name.trim(),
        description: description && description.trim() !== '' ? description.trim() : null,
        size: parsedSize,
        location: location && location.trim() !== '' ? location.trim() : null,
        soilType: soilType && soilType.trim() !== '' ? soilType.trim() : null,
        phLevel: phLevel ? parseFloat(phLevel) : null,
        farmId: finalFarmId,
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    console.log('[Create parcel] Successfully created field:', field.id);
    res.status(201).json(field);
  } catch (error: any) {
    console.error('Create parcel error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    res.status(400).json({ 
      message: error.message || 'Bad request',
      ...(process.env.NODE_ENV === 'development' && { details: error })
    });
  }
});

// Update a parcel (field) - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name, description, size, location, soilType, phLevel, farmId } = req.body;
    
    const existingField = await prisma.field.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });
    
    if (!existingField) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    // Multi-tenant check: verify field belongs to user's farm
    if (existingField.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Parcel does not belong to your farms' });
    }
    
    // If farmId is being changed, verify it belongs to user
    if (farmId && farmId !== existingField.farmId) {
      const newFarm = await prisma.farm.findFirst({
        where: {
          id: farmId,
          ownerId: userId,
        },
      });
      
      if (!newFarm) {
        return res.status(403).json({ message: 'Cannot move parcel to farm that does not belong to you' });
      }
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (size !== undefined) updateData.size = parseFloat(size);
    if (location !== undefined) updateData.location = location;
    if (soilType !== undefined) updateData.soilType = soilType;
    if (phLevel !== undefined) updateData.phLevel = phLevel ? parseFloat(phLevel) : null;
    if (farmId !== undefined) updateData.farmId = farmId;
    
    const field = await prisma.field.update({
      where: { id },
      data: updateData,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.json(field);
  } catch (error: any) {
    console.error('Update parcel error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a parcel (field) - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const field = await prisma.field.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });
    
    if (!field) {
      return res.status(404).json({ message: 'Parcel not found' });
    }
    
    // Multi-tenant check: verify field belongs to user's farm
    if (field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Parcel does not belong to your farms' });
    }
    
    await prisma.field.delete({
      where: { id },
    });
    
    res.json({ message: 'Parcel deleted successfully' });
  } catch (error: any) {
    console.error('Delete parcel error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

