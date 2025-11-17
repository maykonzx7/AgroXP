import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All crop routes are protected
router.use(authenticate);

// Get all crops - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { fieldId, status } = req.query;
    
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
    
    if (userFieldIds.length === 0) {
      return res.json([]);
    }
    
    const where: any = {
      fieldId: {
        in: userFieldIds,
      },
    };
    
    if (fieldId && userFieldIds.includes(fieldId as string)) {
      where.fieldId = fieldId;
    }
    if (status) where.status = status as string;
    
    const crops = await prisma.crop.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(crops);
  } catch (error: any) {
    console.error('Get crops error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific crop - Multi-tenant: verify ownership
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const crop = await prisma.crop.findUnique({
      where: { id },
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
        treatments: true,
        harvests: true,
      },
    });
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    // Multi-tenant check: verify crop belongs to user's farm
    if (crop.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Crop does not belong to your farms' });
    }
    
    res.json(crop);
  } catch (error: any) {
    console.error('Get crop error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new crop - Multi-tenant: verify field belongs to user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name, variety, plantingDate, harvestDate, expectedYield, actualYield, status, fieldId } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }
    
    // Se fieldId foi fornecido, verificar que pertence ao usuário
    let finalFieldId = fieldId || null;
    if (fieldId) {
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
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
        return res.status(404).json({ message: 'Field not found' });
      }
      
      if (field.farm.ownerId !== userId) {
        return res.status(403).json({ message: 'Access denied: Field does not belong to your farms' });
      }
    } else {
      // Se não forneceu fieldId, usar a primeira parcela do usuário como padrão
      const userFarm = await prisma.farm.findFirst({
        where: { ownerId: userId },
        include: {
          fields: {
            take: 1,
          },
        },
      });
      
      if (userFarm && userFarm.fields.length > 0) {
        finalFieldId = userFarm.fields[0].id;
      }
      // Se não houver parcela, a cultura será criada sem fieldId (template)
    }
    
    const crop = await prisma.crop.create({
      data: {
        name,
        variety,
        plantingDate: plantingDate ? new Date(plantingDate) : null,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        expectedYield: expectedYield ? parseFloat(expectedYield) : null,
        actualYield: actualYield ? parseFloat(actualYield) : null,
        status: status || 'PLANNED',
        fieldId: finalFieldId,
      },
      include: {
        field: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.status(201).json(crop);
  } catch (error: any) {
    console.error('Create crop error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a crop - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name, variety, plantingDate, harvestDate, expectedYield, actualYield, status, fieldId } = req.body;
    
    const existingCrop = await prisma.crop.findUnique({
      where: { id },
      include: {
        field: {
          include: {
            farm: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });
    
    if (!existingCrop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    // Multi-tenant check: verify crop belongs to user's farm
    if (existingCrop.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Crop does not belong to your farms' });
    }
    
    // If fieldId is being changed, verify it belongs to user
    if (fieldId && fieldId !== existingCrop.fieldId) {
      const newField = await prisma.field.findUnique({
        where: { id: fieldId },
        include: {
          farm: {
            select: {
              ownerId: true,
            },
          },
        },
      });
      
      if (!newField || newField.farm.ownerId !== userId) {
        return res.status(403).json({ message: 'Cannot move crop to field that does not belong to your farms' });
      }
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (variety !== undefined) updateData.variety = variety;
    if (plantingDate !== undefined) updateData.plantingDate = plantingDate ? new Date(plantingDate) : null;
    if (harvestDate !== undefined) updateData.harvestDate = harvestDate ? new Date(harvestDate) : null;
    if (expectedYield !== undefined) updateData.expectedYield = expectedYield ? parseFloat(expectedYield) : null;
    if (actualYield !== undefined) updateData.actualYield = actualYield ? parseFloat(actualYield) : null;
    if (status !== undefined) updateData.status = status;
    if (fieldId !== undefined) updateData.fieldId = fieldId;
    
    const crop = await prisma.crop.update({
      where: { id },
      data: updateData,
      include: {
        field: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.json(crop);
  } catch (error: any) {
    console.error('Update crop error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a crop - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const crop = await prisma.crop.findUnique({
      where: { id },
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
    
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    
    // Multi-tenant check: verify crop belongs to user's farm
    if (crop.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Crop does not belong to your farms' });
    }
    
    await prisma.crop.delete({
      where: { id },
    });
    
    res.json({ message: 'Crop deleted successfully' });
  } catch (error: any) {
    console.error('Delete crop error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

