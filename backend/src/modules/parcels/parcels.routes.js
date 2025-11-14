import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { Parcel, Crop, Farm } from '../associations.js';

const router = express.Router();

// Get all parcels for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const parcels = await Parcel.findAll({
      include: [
        {
          model: Crop,
          as: 'crops'
        },
        {
          model: Farm,
          as: 'farm',
          where: { ownerId: userId }, // This filters to only parcels from user's farms
          attributes: [] // Don't return farm data, just use for filtering
        }
      ],
      attributes: { exclude: ['farmId'] } // Exclude the internal farmId from response
    });
    res.json(parcels);
  } catch (error) {
    console.error('Error fetching parcels:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific parcel
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const parcel = await Parcel.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Crop,
          as: 'crops'
        },
        {
          model: Farm,
          as: 'farm',
          where: { ownerId: userId },
          attributes: []
        }
      ],
      attributes: { exclude: ['farmId'] }
    });
    
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found or does not belong to user' });
    }
    res.json(parcel);
  } catch (error) {
    console.error('Error fetching specific parcel:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new parcel
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // The user should specify which of their farms the parcel belongs to
    // For now, if they don't specify, we'll need to either error or pick a default
    if (!req.body.farmId) {
      // Get user's first farm as default, or return error
      const userFarm = await Farm.findOne({ where: { ownerId: userId } });
      if (!userFarm) {
        return res.status(400).json({ message: 'User must have at least one farm to create a parcel' });
      }
      req.body.farmId = userFarm.id;
    } else {
      // Verify that the specified farm belongs to the user
      const userFarm = await Farm.findOne({ 
        where: { id: req.body.farmId, ownerId: userId } 
      });
      if (!userFarm) {
        return res.status(403).json({ message: 'Cannot create parcel for farm that does not belong to user' });
      }
    }

    const parcel = await Parcel.create(req.body);
    res.status(201).json(parcel);
  } catch (error) {
    console.error('Error creating parcel:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a parcel
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const parcel = await Parcel.findOne({
      where: { id: req.params.id },
      include: [{
        model: Farm,
        as: 'farm',
        where: { ownerId: userId },
        attributes: []
      }]
    });
    
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found or does not belong to user' });
    }
    
    // If farmId is being updated, verify it belongs to user
    if (req.body.farmId) {
      const userFarm = await Farm.findOne({ 
        where: { id: req.body.farmId, ownerId: userId } 
      });
      if (!userFarm) {
        return res.status(403).json({ message: 'Cannot move parcel to farm that does not belong to user' });
      }
    }
    
    await parcel.update(req.body);
    res.json(parcel);
  } catch (error) {
    console.error('Error updating parcel:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a parcel
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const parcel = await Parcel.findOne({
      where: { id: req.params.id },
      include: [{
        model: Farm,
        as: 'farm',
        where: { ownerId: userId },
        attributes: []
      }]
    });
    
    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found or does not belong to user' });
    }
    
    await parcel.destroy();
    res.json({ message: 'Parcel deleted successfully' });
  } catch (error) {
    console.error('Error deleting parcel:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;