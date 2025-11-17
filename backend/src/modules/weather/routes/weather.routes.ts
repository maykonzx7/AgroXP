import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All weather routes are protected
router.use(authenticate);

// Get all weather alerts - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { type, severity, isActive, farmId, fieldId } = req.query;
    
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
    
    const where: any = {
      OR: [
        { farmId: { in: userFarmIds } },
        { fieldId: { in: userFieldIds } },
      ],
    };
    
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    // If specific IDs are provided, verify they belong to user
    if (farmId && userFarmIds.includes(farmId as string)) {
      where.farmId = farmId;
      delete where.OR;
    }
    if (fieldId && userFieldIds.includes(fieldId as string)) {
      where.fieldId = fieldId;
      delete where.OR;
    }
    
    const alerts = await prisma.weatherAlert.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
        field: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    res.json(alerts);
  } catch (error: any) {
    console.error('Get weather alerts error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific weather alert - Multi-tenant: verify ownership
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const alert = await prisma.weatherAlert.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
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
    
    if (!alert) {
      return res.status(404).json({ message: 'Weather alert not found' });
    }
    
    // Multi-tenant check: verify alert belongs to user's farm
    let hasAccess = false;
    if (alert.farmId && alert.farm && alert.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.fieldId && alert.field && alert.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Weather alert does not belong to your farms' });
    }
    
    res.json(alert);
  } catch (error: any) {
    console.error('Get weather alert error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new weather alert - Multi-tenant: verify ownership
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { type, severity, title, description, startDate, endDate, region, farmId, fieldId, isActive } = req.body;
    
    if (!type || !title || !description || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Verify ownership of related entities
    let finalFarmId = farmId || null;
    let finalFieldId = fieldId || null;
    
    if (finalFarmId) {
      const farm = await prisma.farm.findFirst({
        where: {
          id: finalFarmId,
          ownerId: userId,
        },
      });
      
      if (!farm) {
        return res.status(403).json({ message: 'Cannot create weather alert for farm that does not belong to you' });
      }
    }
    
    if (finalFieldId) {
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
      
      if (!field || field.farm.ownerId !== userId) {
        return res.status(403).json({ message: 'Cannot create weather alert for field that does not belong to your farms' });
      }
      
      if (!finalFarmId) {
        finalFarmId = field.farmId;
      }
    }
    
    // If no related entity, use user's first farm
    if (!finalFarmId && !finalFieldId) {
      const userFarm = await prisma.farm.findFirst({
        where: { ownerId: userId },
      });
      
      if (userFarm) {
        finalFarmId = userFarm.id;
      }
    }
    
    const alert = await prisma.weatherAlert.create({
      data: {
        type: type as any,
        severity: severity || 'MEDIUM',
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        region,
        farmId: finalFarmId,
        fieldId: finalFieldId,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        farm: true,
        field: true,
      },
    });
    
    res.status(201).json(alert);
  } catch (error: any) {
    console.error('Create weather alert error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a weather alert - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { type, severity, title, description, startDate, endDate, region, farmId, fieldId, isActive } = req.body;
    
    const existingAlert = await prisma.weatherAlert.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            ownerId: true,
          },
        },
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
    
    if (!existingAlert) {
      return res.status(404).json({ message: 'Weather alert not found' });
    }
    
    // Multi-tenant check: verify alert belongs to user's farm
    let hasAccess = false;
    if (existingAlert.farmId && existingAlert.farm && existingAlert.farm.ownerId === userId) {
      hasAccess = true;
    } else if (existingAlert.fieldId && existingAlert.field && existingAlert.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Weather alert does not belong to your farms' });
    }
    
    // Verify new related entities if being changed
    if (farmId !== undefined && farmId !== existingAlert.farmId) {
      if (farmId) {
        const newFarm = await prisma.farm.findFirst({
          where: {
            id: farmId,
            ownerId: userId,
          },
        });
        
        if (!newFarm) {
          return res.status(403).json({ message: 'Cannot move weather alert to farm that does not belong to you' });
        }
      }
    }
    
    if (fieldId !== undefined && fieldId !== existingAlert.fieldId) {
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
          return res.status(403).json({ message: 'Cannot move weather alert to field that does not belong to your farms' });
        }
      }
    }
    
    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (severity !== undefined) updateData.severity = severity;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (region !== undefined) updateData.region = region;
    if (farmId !== undefined) updateData.farmId = farmId || null;
    if (fieldId !== undefined) updateData.fieldId = fieldId || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const alert = await prisma.weatherAlert.update({
      where: { id },
      data: updateData,
      include: {
        farm: true,
        field: true,
      },
    });
    
    res.json(alert);
  } catch (error: any) {
    console.error('Update weather alert error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a weather alert - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const alert = await prisma.weatherAlert.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            ownerId: true,
          },
        },
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
    
    if (!alert) {
      return res.status(404).json({ message: 'Weather alert not found' });
    }
    
    // Multi-tenant check: verify alert belongs to user's farm
    let hasAccess = false;
    if (alert.farmId && alert.farm && alert.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.fieldId && alert.field && alert.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Weather alert does not belong to your farms' });
    }
    
    await prisma.weatherAlert.delete({
      where: { id },
    });
    
    res.json({ message: 'Weather alert deleted successfully' });
  } catch (error: any) {
    console.error('Delete weather alert error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

