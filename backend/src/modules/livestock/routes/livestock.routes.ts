import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All livestock routes are protected
router.use(authenticate);

// Get all livestock - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { fieldId, category } = req.query;
    
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
    if (category) where.category = category as string;
    
    const livestock = await prisma.livestock.findMany({
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
    
    res.json(livestock);
  } catch (error: any) {
    console.error('Get livestock error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific livestock - Multi-tenant: verify ownership
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const livestock = await prisma.livestock.findUnique({
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
      },
    });
    
    if (!livestock) {
      return res.status(404).json({ message: 'Livestock not found' });
    }
    
    // Multi-tenant check: verify livestock belongs to user's farm
    if (livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Livestock does not belong to your farms' });
    }
    
    res.json(livestock);
  } catch (error: any) {
    console.error('Get livestock error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new livestock - Multi-tenant: verify field belongs to user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name, category, breed, quantity, age, weight, status, fieldId } = req.body;
    
    if (!name || !category || !quantity || !breed) {
      return res.status(400).json({ message: 'Missing required fields: name, category, breed, quantity' });
    }
    
    // Verify field belongs to user's farm
    let finalFieldId = fieldId;
    if (!finalFieldId) {
      // Get user's first field
      const userFarms = await prisma.farm.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      
      if (userFarms.length === 0) {
        return res.status(400).json({ message: 'User must have at least one farm with a field to create livestock' });
      }
      
      const userField = await prisma.field.findFirst({
        where: {
          farmId: {
            in: userFarms.map(f => f.id),
          },
        },
      });
      
      if (!userField) {
        return res.status(400).json({ message: 'User must have at least one field to create livestock' });
      }
      
      finalFieldId = userField.id;
    } else {
      const field = await prisma.field.findUnique({
        where: { id: finalFieldId },
        include: {
          farm: {
            select: {
              ownerId: true,
            },
          },
        },
      });
      
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }
      
      if (field.farm.ownerId !== userId) {
        return res.status(403).json({ message: 'Cannot create livestock for field that does not belong to your farms' });
      }
    }
    
    const livestock = await prisma.livestock.create({
      data: {
        name,
        category: category as any,
        breed,
        quantity: parseInt(quantity),
        age: age ? parseInt(age) : null,
        weight: weight ? parseFloat(weight) : null,
        status: status || 'ACTIVE',
        fieldId: finalFieldId,
      },
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
    });
    
    res.status(201).json(livestock);
  } catch (error: any) {
    console.error('Create livestock error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a livestock - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name, category, breed, quantity, age, weight, status, fieldId, description, deathHistory } = req.body;
    
    const existingLivestock = await prisma.livestock.findUnique({
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
    
    if (!existingLivestock) {
      return res.status(404).json({ message: 'Livestock not found' });
    }
    
    // Multi-tenant check: verify livestock belongs to user's farm
    if (existingLivestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Livestock does not belong to your farms' });
    }
    
    // If fieldId is being changed, verify it belongs to user
    if (fieldId !== undefined && fieldId !== existingLivestock.fieldId) {
      if (fieldId) {
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
          return res.status(403).json({ message: 'Cannot move livestock to field that does not belong to your farms' });
        }
      }
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category as any;
    if (breed !== undefined) updateData.breed = breed;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (age !== undefined) updateData.age = age ? parseInt(age) : null;
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null;
    if (status !== undefined) updateData.status = status as any;
    if (fieldId !== undefined) updateData.fieldId = fieldId || null;
    if (description !== undefined) updateData.description = description || null;
    if (deathHistory !== undefined) {
      // Ensure deathHistory is properly formatted as JSON
      // Prisma JSON fields accept objects directly, no need to stringify
      updateData.deathHistory = deathHistory ? (typeof deathHistory === 'string' ? JSON.parse(deathHistory) : deathHistory) : null;
    }
    
    const livestock = await prisma.livestock.update({
      where: { id },
      data: updateData,
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
    });
    
    // Log removido para segurança
    
    res.json(livestock);
  } catch (error: any) {
    console.error('Update livestock error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a livestock - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const livestock = await prisma.livestock.findUnique({
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
    
    if (!livestock) {
      return res.status(404).json({ message: 'Livestock not found' });
    }
    
    // Multi-tenant check: verify livestock belongs to user's farm
    if (livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Livestock does not belong to your farms' });
    }
    
    await prisma.livestock.delete({
      where: { id },
    });
    
    res.json({ message: 'Livestock deleted successfully' });
  } catch (error: any) {
    console.error('Delete livestock error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

