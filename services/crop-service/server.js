const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3005;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Rota de verificação
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Crop service is running', timestamp: new Date() });
});

// Rotas para culturas
app.get('/crops', async (req, res) => {
  try {
    const crops = await prisma.crop.findMany({
      include: {
        parcel: true
      }
    });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/crops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await prisma.crop.findUnique({
      where: { id: parseInt(id) },
      include: {
        parcel: true
      }
    });
    
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    
    res.json(crop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/crops', async (req, res) => {
  try {
    const { name, variety, plantingDate, harvestDate, status, parcelId } = req.body;
    const crop = await prisma.crop.create({
      data: {
        name,
        variety,
        plantingDate: new Date(plantingDate),
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        status,
        parcelId: parseInt(parcelId)
      }
    });
    res.status(201).json(crop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/crops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, variety, plantingDate, harvestDate, status, parcelId } = req.body;
    
    const crop = await prisma.crop.update({
      where: { id: parseInt(id) },
      data: {
        name,
        variety,
        plantingDate: new Date(plantingDate),
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        status,
        parcelId: parseInt(parcelId)
      }
    });
    
    res.json(crop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/crops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.crop.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Crop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Crop service running on port ${port}`);
});