import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All task routes are protected
router.use(authenticate);

// Get all tasks - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { status, priority, farmId, fieldId, cropId } = req.query;
    
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
    
    // Get user's crop IDs
    const userCrops = await prisma.crop.findMany({
      where: {
        fieldId: {
          in: userFieldIds,
        },
      },
      select: { id: true },
    });
    
    const userCropIds = userCrops.map(c => c.id);
    
    const where: any = {
      OR: [
        { farmId: { in: userFarmIds } },
        { fieldId: { in: userFieldIds } },
        { cropId: { in: userCropIds } },
      ],
    };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (farmId && userFarmIds.includes(farmId as string)) {
      where.farmId = farmId;
      delete where.OR;
    }
    if (fieldId && userFieldIds.includes(fieldId as string)) {
      where.fieldId = fieldId;
      delete where.OR;
    }
    if (cropId && userCropIds.includes(cropId as string)) {
      where.cropId = cropId;
      delete where.OR;
    }
    
    const tasks = await prisma.task.findMany({
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
        crop: {
          select: {
            id: true,
            name: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    
    res.json(tasks);
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific task - Multi-tenant: verify ownership
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const task = await prisma.task.findUnique({
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
        crop: {
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
        farm: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Multi-tenant check: verify task belongs to user's farm
    let hasAccess = false;
    if (task.farmId && task.farm && task.farm.ownerId === userId) {
      hasAccess = true;
    } else if (task.fieldId && task.field && task.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (task.cropId && task.crop && task.crop.field && task.crop.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Task does not belong to your farms' });
    }
    
    res.json(task);
  } catch (error: any) {
    console.error('Get task error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new task - Multi-tenant: verify ownership
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, description, dueDate, priority, status, assignedTo, fieldId, cropId, farmId } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Verify ownership of related entities
    let finalFarmId = farmId || null;
    let finalFieldId = fieldId || null;
    let finalCropId = cropId || null;
    
    if (finalFarmId) {
      const farm = await prisma.farm.findFirst({
        where: {
          id: finalFarmId,
          ownerId: userId,
        },
      });
      
      if (!farm) {
        return res.status(403).json({ message: 'Cannot create task for farm that does not belong to you' });
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
        return res.status(403).json({ message: 'Cannot create task for field that does not belong to your farms' });
      }
      
      // Auto-set farmId if not provided
      if (!finalFarmId) {
        finalFarmId = field.farmId;
      }
    }
    
    if (finalCropId) {
      const crop = await prisma.crop.findUnique({
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
      
      if (!crop || crop.field.farm.ownerId !== userId) {
        return res.status(403).json({ message: 'Cannot create task for crop that does not belong to your farms' });
      }
      
      // Auto-set fieldId and farmId if not provided
      if (!finalFieldId) {
        finalFieldId = crop.fieldId;
      }
      if (!finalFarmId) {
        finalFarmId = crop.field.farmId;
      }
    }
    
    // If no related entity, use user's first farm
    if (!finalFarmId && !finalFieldId && !finalCropId) {
      const userFarm = await prisma.farm.findFirst({
        where: { ownerId: userId },
      });
      
      if (userFarm) {
        finalFarmId = userFarm.id;
      }
    }
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        assignedTo,
        fieldId: finalFieldId,
        cropId: finalCropId,
        farmId: finalFarmId,
      },
      include: {
        field: true,
        crop: true,
        farm: true,
      },
    });
    
    res.status(201).json(task);
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a task - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { title, description, dueDate, priority, status, assignedTo, fieldId, cropId, farmId, completedAt } = req.body;
    
    const existingTask = await prisma.task.findUnique({
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
        crop: {
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
        farm: {
          select: {
            ownerId: true,
          },
        },
      },
    });
    
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Multi-tenant check: verify task belongs to user's farm
    let hasAccess = false;
    if (existingTask.farmId && existingTask.farm && existingTask.farm.ownerId === userId) {
      hasAccess = true;
    } else if (existingTask.fieldId && existingTask.field && existingTask.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (existingTask.cropId && existingTask.crop && existingTask.crop.field && existingTask.crop.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Task does not belong to your farms' });
    }
    
    // Verify new related entities if being changed
    if (farmId !== undefined && farmId !== existingTask.farmId) {
      if (farmId) {
        const newFarm = await prisma.farm.findFirst({
          where: {
            id: farmId,
            ownerId: userId,
          },
        });
        
        if (!newFarm) {
          return res.status(403).json({ message: 'Cannot move task to farm that does not belong to you' });
        }
      }
    }
    
    if (fieldId !== undefined && fieldId !== existingTask.fieldId) {
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
          return res.status(403).json({ message: 'Cannot move task to field that does not belong to your farms' });
        }
      }
    }
    
    if (cropId !== undefined && cropId !== existingTask.cropId) {
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
          return res.status(403).json({ message: 'Cannot move task to crop that does not belong to your farms' });
        }
      }
    }
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (fieldId !== undefined) updateData.fieldId = fieldId || null;
    if (cropId !== undefined) updateData.cropId = cropId || null;
    if (farmId !== undefined) updateData.farmId = farmId || null;
    if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;
    
    // Auto-set completedAt if status is DONE
    if (status === 'DONE' && !completedAt) {
      updateData.completedAt = new Date();
    }
    
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        field: true,
        crop: true,
        farm: true,
      },
    });
    
    res.json(task);
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a task - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const task = await prisma.task.findUnique({
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
        crop: {
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
        farm: {
          select: {
            ownerId: true,
          },
        },
      },
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Multi-tenant check: verify task belongs to user's farm
    let hasAccess = false;
    if (task.farmId && task.farm && task.farm.ownerId === userId) {
      hasAccess = true;
    } else if (task.fieldId && task.field && task.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (task.cropId && task.crop && task.crop.field && task.crop.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Task does not belong to your farms' });
    }
    
    await prisma.task.delete({
      where: { id },
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

