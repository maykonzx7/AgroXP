import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All veterinary supply routes are protected
router.use(authenticate);

// Get all veterinary supplies - Multi-tenant: all users can see all supplies (shared catalog)
// Note: Veterinary supplies are shared across all users as a catalog
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { category } = req.query;
    
    const where: any = {};
    if (category) where.category = category as string;
    
    const supplies = await prisma.veterinarySupply.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(supplies);
  } catch (error: any) {
    console.error('Get veterinary supplies error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific veterinary supply - Multi-tenant: all users can see all supplies (shared catalog)
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const supply = await prisma.veterinarySupply.findUnique({
      where: { id },
    });
    
    if (!supply) {
      return res.status(404).json({ message: 'Veterinary supply not found' });
    }
    
    res.json(supply);
  } catch (error: any) {
    console.error('Get veterinary supply error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new veterinary supply - Multi-tenant: all authenticated users can create (shared catalog)
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name, description, quantity, unit, supplier, expirationDate, batchNumber, category } = req.body;
    
    if (!name || !quantity || !unit || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const supply = await prisma.veterinarySupply.create({
      data: {
        name,
        description: description || null,
        quantity: parseFloat(quantity),
        unit,
        supplier: supplier || null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        batchNumber: batchNumber || null,
        category,
      },
    });
    
    res.status(201).json(supply);
  } catch (error: any) {
    console.error('Create veterinary supply error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a veterinary supply - Multi-tenant: all authenticated users can update (shared catalog)
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name, description, quantity, unit, supplier, expirationDate, batchNumber, category } = req.body;
    
    const existingSupply = await prisma.veterinarySupply.findUnique({
      where: { id },
    });
    
    if (!existingSupply) {
      return res.status(404).json({ message: 'Veterinary supply not found' });
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (supplier !== undefined) updateData.supplier = supplier || null;
    if (expirationDate !== undefined) updateData.expirationDate = expirationDate ? new Date(expirationDate) : null;
    if (batchNumber !== undefined) updateData.batchNumber = batchNumber || null;
    if (category !== undefined) updateData.category = category;
    
    const supply = await prisma.veterinarySupply.update({
      where: { id },
      data: updateData,
    });
    
    res.json(supply);
  } catch (error: any) {
    console.error('Update veterinary supply error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a veterinary supply - Multi-tenant: all authenticated users can delete (shared catalog)
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const supply = await prisma.veterinarySupply.findUnique({
      where: { id },
    });
    
    if (!supply) {
      return res.status(404).json({ message: 'Veterinary supply not found' });
    }
    
    await prisma.veterinarySupply.delete({
      where: { id },
    });
    
    res.status(204).end();
  } catch (error: any) {
    console.error('Delete veterinary supply error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

