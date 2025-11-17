import { Request, Response } from 'express';
import prisma from '../../../services/database.service.js';

// Create a new farm - Multi-tenant: always uses authenticated user
export const createFarm = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, description, location, size } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Farm name is required' });
    }
    
    const farm = await prisma.farm.create({
      data: {
        name: name.trim(),
        description: description || null,
        location: location || 'Localização não informada',
        size: size ? parseFloat(size) : null,
        ownerId: userId, // Always use authenticated user
      },
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
    });
    
    res.status(201).json(farm);
  } catch (error: any) {
    console.error('Create farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all farms - Multi-tenant: only user's farms
export const getFarms = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const farms = await prisma.farm.findMany({
      where: {
        ownerId: userId, // Multi-tenant: only user's farms
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        fields: {
          select: {
            id: true,
            name: true,
            size: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(farms);
  } catch (error: any) {
    console.error('Get farms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific farm by ID - Multi-tenant: verify ownership
export const getFarmById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const farm = await prisma.farm.findFirst({
      where: {
        id,
        ownerId: userId, // Multi-tenant: only if belongs to user
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        fields: {
          include: {
            crops: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            livestock: {
              select: {
                id: true,
                name: true,
                category: true,
                quantity: true,
              },
            },
          },
        },
      },
    });
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found or access denied' });
    }
    
    res.json(farm);
  } catch (error: any) {
    console.error('Get farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a farm - Multi-tenant: verify ownership
export const updateFarm = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const { name, description, location, size } = req.body;
    
    // Verify farm belongs to user
    const existingFarm = await prisma.farm.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });
    
    if (!existingFarm) {
      return res.status(404).json({ error: 'Farm not found or access denied' });
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description || null;
    if (location !== undefined) updateData.location = location || null;
    if (size !== undefined) updateData.size = size ? parseFloat(size) : null;
    
    const farm = await prisma.farm.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    res.json(farm);
  } catch (error: any) {
    console.error('Update farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a farm - Multi-tenant: verify ownership
export const deleteFarm = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    
    // Verify farm belongs to user
    const existingFarm = await prisma.farm.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });
    
    if (!existingFarm) {
      return res.status(404).json({ error: 'Farm not found or access denied' });
    }
    
    await prisma.farm.delete({
      where: { id },
    });
    
    res.json({ message: 'Farm deleted successfully' });
  } catch (error: any) {
    console.error('Delete farm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
};