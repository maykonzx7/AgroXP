import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All vaccination routes are protected
router.use(authenticate);

// Get all vaccinations - Multi-tenant: only user's farms
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
    
    const vaccinations = await prisma.vaccination.findMany({
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
        vaccinationDate: 'desc',
      },
    });
    
    res.json(vaccinations);
  } catch (error: any) {
    console.error('Get vaccinations error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get vaccinations for a specific livestock - Multi-tenant: verify ownership
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
    
    const vaccinations = await prisma.vaccination.findMany({
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
        vaccinationDate: 'desc',
      },
    });
    
    res.json(vaccinations);
  } catch (error: any) {
    console.error('Get vaccinations by livestock error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new vaccination - Multi-tenant: verify livestock belongs to user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { livestockId, vaccineName, vaccinationDate, nextVaccinationDate, veterinarian, notes } = req.body;
    
    if (!livestockId || !vaccineName || !vaccinationDate) {
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
      return res.status(403).json({ message: 'Cannot create vaccination for livestock that does not belong to your farms' });
    }
    
    const vaccination = await prisma.vaccination.create({
      data: {
        livestockId,
        vaccineName,
        vaccinationDate: new Date(vaccinationDate),
        nextVaccinationDate: nextVaccinationDate ? new Date(nextVaccinationDate) : null,
        veterinarian: veterinarian || null,
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
    
    res.status(201).json(vaccination);
  } catch (error: any) {
    console.error('Create vaccination error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a vaccination - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { livestockId, vaccineName, vaccinationDate, nextVaccinationDate, veterinarian, notes } = req.body;
    
    const existingVaccination = await prisma.vaccination.findUnique({
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
    
    if (!existingVaccination) {
      return res.status(404).json({ message: 'Vaccination record not found' });
    }
    
    // Multi-tenant check: verify vaccination belongs to user's livestock
    if (existingVaccination.livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Vaccination does not belong to your farms' });
    }
    
    // If livestockId is being changed, verify it belongs to user
    if (livestockId !== undefined && livestockId !== existingVaccination.livestockId) {
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
        return res.status(403).json({ message: 'Cannot move vaccination to livestock that does not belong to your farms' });
      }
    }
    
    const updateData: any = {};
    if (livestockId !== undefined) updateData.livestockId = livestockId;
    if (vaccineName !== undefined) updateData.vaccineName = vaccineName;
    if (vaccinationDate !== undefined) updateData.vaccinationDate = new Date(vaccinationDate);
    if (nextVaccinationDate !== undefined) updateData.nextVaccinationDate = nextVaccinationDate ? new Date(nextVaccinationDate) : null;
    if (veterinarian !== undefined) updateData.veterinarian = veterinarian || null;
    if (notes !== undefined) updateData.notes = notes || null;
    
    const vaccination = await prisma.vaccination.update({
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
    
    res.json(vaccination);
  } catch (error: any) {
    console.error('Update vaccination error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a vaccination - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const vaccination = await prisma.vaccination.findUnique({
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
    
    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination record not found' });
    }
    
    // Multi-tenant check: verify vaccination belongs to user's livestock
    if (vaccination.livestock.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Vaccination does not belong to your farms' });
    }
    
    await prisma.vaccination.delete({
      where: { id },
    });
    
    res.status(204).end();
  } catch (error: any) {
    console.error('Delete vaccination error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

