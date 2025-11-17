import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All alert routes are protected
router.use(authenticate);

// Get all alerts - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { type, severity, isRead, isActive, farmId, fieldId, cropId, livestockId } = req.query;
    
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
    
    // Get user's livestock IDs (if livestock routes exist)
    const userLivestock = await prisma.livestock.findMany({
      where: {
        fieldId: {
          in: userFieldIds,
        },
      },
      select: { id: true },
    });
    
    const userLivestockIds = userLivestock.map(l => l.id);
    
    const where: any = {
      OR: [
        { farmId: { in: userFarmIds } },
        { fieldId: { in: userFieldIds } },
        { cropId: { in: userCropIds } },
        { livestockId: { in: userLivestockIds } },
      ],
    };
    
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (isRead !== undefined) where.isRead = isRead === 'true';
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
    if (cropId && userCropIds.includes(cropId as string)) {
      where.cropId = cropId;
      delete where.OR;
    }
    if (livestockId && userLivestockIds.includes(livestockId as string)) {
      where.livestockId = livestockId;
      delete where.OR;
    }
    
    const alerts = await prisma.alert.findMany({
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
        crop: {
          select: {
            id: true,
            name: true,
          },
        },
        livestock: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(alerts);
  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get unread alerts count - Multi-tenant: only user's farms
router.get('/unread/count', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user's farm IDs for multi-tenant filtering
    const userFarms = await prisma.farm.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    
    const userFarmIds = userFarms.map(f => f.id);
    
    if (userFarmIds.length === 0) {
      return res.json({ count: 0 });
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
    
    const count = await prisma.alert.count({
      where: {
        isRead: false,
        isActive: true,
        OR: [
          { farmId: { in: userFarmIds } },
          { fieldId: { in: userFieldIds } },
          { cropId: { in: userCropIds } },
          { livestockId: { in: userLivestockIds } },
        ],
      },
    });
    
    res.json({ count });
  } catch (error: any) {
    console.error('Get unread alerts count error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific alert - Multi-tenant: verify ownership
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const alert = await prisma.alert.findUnique({
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
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Multi-tenant check: verify alert belongs to user's farm
    let hasAccess = false;
    if (alert.farmId && alert.farm && alert.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.fieldId && alert.field && alert.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.cropId && alert.crop && alert.crop.field && alert.crop.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.livestockId && alert.livestock && alert.livestock.field && alert.livestock.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Alert does not belong to your farms' });
    }
    
    res.json(alert);
  } catch (error: any) {
    console.error('Get alert error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new alert - Multi-tenant: verify ownership
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { type, severity, title, message, farmId, fieldId, cropId, livestockId, isActive } = req.body;
    
    if (!type || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Verify ownership of related entities
    let finalFarmId = farmId || null;
    let finalFieldId = fieldId || null;
    let finalCropId = cropId || null;
    let finalLivestockId = livestockId || null;
    
    if (finalFarmId) {
      const farm = await prisma.farm.findFirst({
        where: {
          id: finalFarmId,
          ownerId: userId,
        },
      });
      
      if (!farm) {
        return res.status(403).json({ message: 'Cannot create alert for farm that does not belong to you' });
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
        return res.status(403).json({ message: 'Cannot create alert for field that does not belong to your farms' });
      }
      
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
        return res.status(403).json({ message: 'Cannot create alert for crop that does not belong to your farms' });
      }
      
      if (!finalFieldId) {
        finalFieldId = crop.fieldId;
      }
      if (!finalFarmId) {
        finalFarmId = crop.field.farmId;
      }
    }
    
    if (finalLivestockId) {
      const livestock = await prisma.livestock.findUnique({
        where: { id: finalLivestockId },
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
      
      if (!livestock || livestock.field.farm.ownerId !== userId) {
        return res.status(403).json({ message: 'Cannot create alert for livestock that does not belong to your farms' });
      }
      
      if (!finalFieldId) {
        finalFieldId = livestock.fieldId;
      }
      if (!finalFarmId) {
        finalFarmId = livestock.field.farmId;
      }
    }
    
    // If no related entity, use user's first farm
    if (!finalFarmId && !finalFieldId && !finalCropId && !finalLivestockId) {
      const userFarm = await prisma.farm.findFirst({
        where: { ownerId: userId },
      });
      
      if (userFarm) {
        finalFarmId = userFarm.id;
      }
    }
    
    const alert = await prisma.alert.create({
      data: {
        type: type as any,
        severity: severity || 'MEDIUM',
        title,
        message,
        farmId: finalFarmId,
        fieldId: finalFieldId,
        cropId: finalCropId,
        livestockId: finalLivestockId,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        farm: true,
        field: true,
        crop: true,
        livestock: true,
      },
    });
    
    res.status(201).json(alert);
  } catch (error: any) {
    console.error('Create alert error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update an alert - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { type, severity, title, message, isRead, isActive, farmId, fieldId, cropId, livestockId } = req.body;
    
    const existingAlert = await prisma.alert.findUnique({
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
    
    if (!existingAlert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Multi-tenant check
    let hasAccess = false;
    if (existingAlert.farmId && existingAlert.farm && existingAlert.farm.ownerId === userId) {
      hasAccess = true;
    } else if (existingAlert.fieldId && existingAlert.field && existingAlert.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (existingAlert.cropId && existingAlert.crop && existingAlert.crop.field && existingAlert.crop.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (existingAlert.livestockId && existingAlert.livestock && existingAlert.livestock.field && existingAlert.livestock.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Alert does not belong to your farms' });
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
          return res.status(403).json({ message: 'Cannot move alert to farm that does not belong to you' });
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
          return res.status(403).json({ message: 'Cannot move alert to field that does not belong to your farms' });
        }
      }
    }
    
    if (cropId !== undefined && cropId !== existingAlert.cropId) {
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
          return res.status(403).json({ message: 'Cannot move alert to crop that does not belong to your farms' });
        }
      }
    }
    
    if (livestockId !== undefined && livestockId !== existingAlert.livestockId) {
      if (livestockId) {
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
          return res.status(403).json({ message: 'Cannot move alert to livestock that does not belong to your farms' });
        }
      }
    }
    
    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (severity !== undefined) updateData.severity = severity;
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (isRead !== undefined) {
      updateData.isRead = isRead;
      if (isRead) {
        updateData.readAt = new Date();
      } else {
        updateData.readAt = null;
      }
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    if (farmId !== undefined) updateData.farmId = farmId || null;
    if (fieldId !== undefined) updateData.fieldId = fieldId || null;
    if (cropId !== undefined) updateData.cropId = cropId || null;
    if (livestockId !== undefined) updateData.livestockId = livestockId || null;
    
    const alert = await prisma.alert.update({
      where: { id },
      data: updateData,
      include: {
        farm: true,
        field: true,
        crop: true,
        livestock: true,
      },
    });
    
    res.json(alert);
  } catch (error: any) {
    console.error('Update alert error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Mark alert as read - Multi-tenant: verify ownership
router.patch('/:id/read', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const alert = await prisma.alert.findUnique({
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
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Multi-tenant check
    let hasAccess = false;
    if (alert.farmId && alert.farm && alert.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.fieldId && alert.field && alert.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.cropId && alert.crop && alert.crop.field && alert.crop.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.livestockId && alert.livestock && alert.livestock.field && alert.livestock.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Alert does not belong to your farms' });
    }
    
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    
    res.json(updatedAlert);
  } catch (error: any) {
    console.error('Mark alert as read error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Mark all alerts as read - Multi-tenant: only user's farms
router.patch('/read-all', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user's farm IDs for multi-tenant filtering
    const userFarms = await prisma.farm.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    
    const userFarmIds = userFarms.map(f => f.id);
    
    if (userFarmIds.length === 0) {
      return res.json({ count: 0 });
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
    
    const result = await prisma.alert.updateMany({
      where: {
        isRead: false,
        isActive: true,
        OR: [
          { farmId: { in: userFarmIds } },
          { fieldId: { in: userFieldIds } },
          { cropId: { in: userCropIds } },
          { livestockId: { in: userLivestockIds } },
        ],
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    
    res.json({ count: result.count });
  } catch (error: any) {
    console.error('Mark all alerts as read error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Delete an alert - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const alert = await prisma.alert.findUnique({
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
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Multi-tenant check
    let hasAccess = false;
    if (alert.farmId && alert.farm && alert.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.fieldId && alert.field && alert.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.cropId && alert.crop && alert.crop.field && alert.crop.field.farm.ownerId === userId) {
      hasAccess = true;
    } else if (alert.livestockId && alert.livestock && alert.livestock.field && alert.livestock.field.farm.ownerId === userId) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied: Alert does not belong to your farms' });
    }
    
    await prisma.alert.delete({
      where: { id },
    });
    
    res.json({ message: 'Alert deleted successfully' });
  } catch (error: any) {
    console.error('Delete alert error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

