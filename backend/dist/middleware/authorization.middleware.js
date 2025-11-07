import prisma from '../services/database.service.js';
// Authorization middleware to check if user has access to a specific farm
export const authorizeFarmAccess = async (req, res, next) => {
    try {
        const user = req.user;
        const { farmId } = req.params;
        if (!farmId) {
            return res.status(400).json({ error: 'Farm ID is required' });
        }
        // Check if the farm belongs to the user
        const farm = await prisma.farm.findFirst({
            where: {
                id: Number(farmId),
                ownerId: user.id
            }
        });
        if (!farm) {
            return res.status(403).json({ error: 'Access denied: You do not have permission to access this farm' });
        }
        next();
    }
    catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Authorization middleware to check if user has access to a specific parcel
export const authorizeParcelAccess = async (req, res, next) => {
    try {
        const user = req.user;
        const { parcelId } = req.params;
        if (!parcelId) {
            return res.status(400).json({ error: 'Parcel ID is required' });
        }
        // Check if the parcel belongs to a farm owned by the user
        const parcel = await prisma.parcel.findFirst({
            where: {
                id: Number(parcelId),
                farm: {
                    ownerId: user.id
                }
            }
        });
        if (!parcel) {
            return res.status(403).json({ error: 'Access denied: You do not have permission to access this parcel' });
        }
        next();
    }
    catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export default { authorizeFarmAccess, authorizeParcelAccess };
