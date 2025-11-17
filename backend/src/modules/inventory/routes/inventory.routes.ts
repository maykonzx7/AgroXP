import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All inventory routes are protected
router.use(authenticate);

// Get all inventory items - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { farmId, category } = req.query;
    
    // Get user's farm IDs for multi-tenant filtering
    const userFarms = await prisma.farm.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    
    const userFarmIds = userFarms.map(f => f.id);
    
    const where: any = {};
    
    if (userFarmIds.length > 0) {
      if (farmId && userFarmIds.includes(farmId as string)) {
        where.farmId = farmId;
      } else {
        where.farmId = {
          in: userFarmIds,
        };
      }
    } else {
      // User has no farms, return empty array
      return res.json([]);
    }
    
    if (category) where.category = category as string;
    
    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        farm: {
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
    
    res.json(inventory);
  } catch (error: any) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific inventory item - Multi-tenant: verify ownership
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const item = await prisma.inventory.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Multi-tenant check: verify item belongs to user's farm (or is null/farmless)
    if (item.farmId && item.farm && item.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Inventory item does not belong to your farms' });
    }
    
    res.json(item);
  } catch (error: any) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new inventory item - Multi-tenant: verify farm belongs to user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { itemName, category, quantity, unit, cost, supplier, purchaseDate, expiryDate, farmId } = req.body;
    
    if (!itemName || !category || !quantity || !unit || !cost) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // If farmId is provided, verify it belongs to user
    let finalFarmId = farmId || null;
    if (finalFarmId) {
      const farm = await prisma.farm.findFirst({
        where: {
          id: finalFarmId,
          ownerId: userId,
        },
      });
      
      if (!farm) {
        return res.status(403).json({ message: 'Cannot create inventory item for farm that does not belong to you' });
      }
    } else {
      // If no farmId, use user's first farm
      const userFarm = await prisma.farm.findFirst({
        where: { ownerId: userId },
      });
      
      if (userFarm) {
        finalFarmId = userFarm.id;
      }
    }
    
    const item = await prisma.inventory.create({
      data: {
        itemName,
        category,
        quantity: parseInt(quantity),
        unit,
        cost: parseFloat(cost),
        supplier,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
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
    
    res.status(201).json(item);
  } catch (error: any) {
    console.error('Create inventory item error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update an inventory item - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { itemName, category, quantity, unit, cost, supplier, purchaseDate, expiryDate, farmId } = req.body;
    
    const existingItem = await prisma.inventory.findUnique({
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
    
    if (!existingItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Multi-tenant check: verify item belongs to user's farm (or is null/farmless)
    if (existingItem.farmId && existingItem.farm && existingItem.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Inventory item does not belong to your farms' });
    }
    
    // If farmId is being changed, verify it belongs to user
    if (farmId !== undefined && farmId !== existingItem.farmId) {
      if (farmId) {
        const newFarm = await prisma.farm.findFirst({
          where: {
            id: farmId,
            ownerId: userId,
          },
        });
        
        if (!newFarm) {
          return res.status(403).json({ message: 'Cannot move inventory item to farm that does not belong to you' });
        }
      }
    }
    
    const updateData: any = {};
    if (itemName !== undefined) updateData.itemName = itemName;
    if (category !== undefined) updateData.category = category;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (supplier !== undefined) updateData.supplier = supplier;
    if (purchaseDate !== undefined) updateData.purchaseDate = purchaseDate ? new Date(purchaseDate) : new Date();
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (farmId !== undefined) updateData.farmId = farmId || null;
    
    const item = await prisma.inventory.update({
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
    
    res.json(item);
  } catch (error: any) {
    console.error('Update inventory item error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete an inventory item - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const item = await prisma.inventory.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            ownerId: true,
          },
        },
      },
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Multi-tenant check: verify item belongs to user's farm (or is null/farmless)
    if (item.farmId && item.farm && item.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Inventory item does not belong to your farms' });
    }
    
    await prisma.inventory.delete({
      where: { id },
    });
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error: any) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

