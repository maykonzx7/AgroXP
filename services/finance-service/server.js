const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3007;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Rota de verificação
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Finance service is running', timestamp: new Date() });
});

// Rotas para finanças
app.get('/finance', async (req, res) => {
  try {
    const finance = await prisma.finance.findMany({
      include: {
        parcel: true
      }
    });
    res.json(finance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/finance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await prisma.finance.findUnique({
      where: { id: parseInt(id) },
      include: {
        parcel: true
      }
    });
    
    if (!record) {
      return res.status(404).json({ error: 'Financial record not found' });
    }
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/finance', async (req, res) => {
  try {
    const { type, category, amount, description, date, parcelId } = req.body;
    const record = await prisma.finance.create({
      data: {
        type,
        category,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        parcelId: parcelId ? parseInt(parcelId) : null
      }
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/finance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, amount, description, date, parcelId } = req.body;
    
    const record = await prisma.finance.update({
      where: { id: parseInt(id) },
      data: {
        type,
        category,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        parcelId: parcelId ? parseInt(parcelId) : null
      }
    });
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/finance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.finance.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Financial record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Finance service running on port ${port}`);
});