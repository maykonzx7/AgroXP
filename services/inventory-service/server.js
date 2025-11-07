const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3006;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Rota de verificação
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Inventory service is running', timestamp: new Date() });
});

// Rotas para inventário
app.get('/inventory', async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.inventory.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/inventory', async (req, res) => {
  try {
    const { itemName, category, quantity, unit, cost, supplier, purchaseDate, expiryDate } = req.body;
    const item = await prisma.inventory.create({
      data: {
        itemName,
        category,
        quantity: parseFloat(quantity),
        unit,
        cost: parseFloat(cost),
        supplier,
        purchaseDate: new Date(purchaseDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, category, quantity, unit, cost, supplier, purchaseDate, expiryDate } = req.body;
    
    const item = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: {
        itemName,
        category,
        quantity: parseFloat(quantity),
        unit,
        cost: parseFloat(cost),
        supplier,
        purchaseDate: new Date(purchaseDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inventory.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Inventory service running on port ${port}`);
});