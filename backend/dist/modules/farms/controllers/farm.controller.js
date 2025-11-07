import prisma from '../../../services/database.service.js';
// Create a new farm
export const createFarm = async (req, res) => {
    try {
        const { name, description, location, size, sizeUnit, ownerId } = req.body;
        const farm = await prisma.farm.create({
            data: {
                name,
                description,
                location,
                size,
                sizeUnit,
                ownerId,
            },
        });
        res.status(201).json(farm);
    }
    catch (error) {
        console.error('Create farm error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get all farms
export const getFarms = async (req, res) => {
    try {
        const farms = await prisma.farm.findMany({
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                parcels: true,
            },
        });
        res.json(farms);
    }
    catch (error) {
        console.error('Get farms error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get a specific farm by ID
export const getFarmById = async (req, res) => {
    try {
        const { id } = req.params;
        const farm = await prisma.farm.findUnique({
            where: { id: Number(id) },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                parcels: {
                    include: {
                        crops: true,
                        livestock: true,
                    },
                },
            },
        });
        if (!farm) {
            return res.status(404).json({ error: 'Farm not found' });
        }
        res.json(farm);
    }
    catch (error) {
        console.error('Get farm error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Update a farm
export const updateFarm = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, location, size, sizeUnit } = req.body;
        const farm = await prisma.farm.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
                location,
                size,
                sizeUnit,
            },
        });
        res.json(farm);
    }
    catch (error) {
        console.error('Update farm error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Delete a farm
export const deleteFarm = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.farm.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Farm deleted successfully' });
    }
    catch (error) {
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
