const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3008;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Rota de verificação
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Admin service is running', timestamp: new Date() });
});

// Rotas para administração
app.get('/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin/farms', async (req, res) => {
  try {
    const farms = await prisma.farm.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });
    res.json(farms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Admin service running on port ${port}`);
});