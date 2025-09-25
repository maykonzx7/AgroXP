import express from 'express';
import Livestock from './Livestock.model.js';
import Parcel from '../parcels/Parcel.model.js';

const router = express.Router();

// Obter todos os animais
router.get('/', async (req, res) => {
  try {
    const livestock = await Livestock.findAll({
      include: [{ model: Parcel, as: 'parcel' }]
    });
    res.json(livestock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter um animal específico
router.get('/:id', async (req, res) => {
  try {
    const livestock = await Livestock.findByPk(req.params.id, {
      include: [{ model: Parcel, as: 'parcel' }]
    });
    if (livestock) {
      res.json(livestock);
    } else {
      res.status(404).json({ error: 'Animal não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar um novo animal
router.post('/', async (req, res) => {
  try {
    const livestock = await Livestock.create(req.body);
    res.status(201).json(livestock);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Criar múltiplos animais (cadastro em lote)
router.post('/batch', async (req, res) => {
  try {
    const { animals } = req.body;
    
    if (!Array.isArray(animals) || animals.length === 0) {
      return res.status(400).json({ error: 'É necessário fornecer um array de animais para cadastro em lote' });
    }
    
    const createdAnimals = await Livestock.bulkCreate(animals);
    res.status(201).json(createdAnimals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar um animal
router.put('/:id', async (req, res) => {
  try {
    const livestock = await Livestock.findByPk(req.params.id);
    if (livestock) {
      await livestock.update(req.body);
      res.json(livestock);
    } else {
      res.status(404).json({ error: 'Animal não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Registrar óbito de um animal
router.patch('/:id/death', async (req, res) => {
  try {
    const livestock = await Livestock.findByPk(req.params.id);
    if (livestock) {
      // Atualizar o status para 'morto' e registrar a data de óbito
      await livestock.update({
        status: 'morto',
        updatedAt: new Date()
      });
      res.json(livestock);
    } else {
      res.status(404).json({ error: 'Animal não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar um animal
router.delete('/:id', async (req, res) => {
  try {
    const livestock = await Livestock.findByPk(req.params.id);
    if (livestock) {
      await livestock.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Animal não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;