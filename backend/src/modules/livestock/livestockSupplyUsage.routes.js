import express from 'express';
import LivestockSupplyUsage from './livestockSupplyUsage.model.js';
import Livestock from './Livestock.model.js';
import VeterinarySupply from './veterinarySupply.model.js';

const router = express.Router();

// Obter todos os usos de insumos
router.get('/', async (req, res) => {
  try {
    const usages = await LivestockSupplyUsage.findAll({
      include: [
        { model: Livestock, as: 'livestock' },
        { model: VeterinarySupply, as: 'supply' }
      ]
    });
    res.json(usages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter usos de insumos para um animal específico
router.get('/livestock/:livestockId', async (req, res) => {
  try {
    const usages = await LivestockSupplyUsage.findAll({
      where: { livestockId: req.params.livestockId },
      include: [
        { model: Livestock, as: 'livestock' },
        { model: VeterinarySupply, as: 'supply' }
      ]
    });
    res.json(usages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter usos de um insumo específico
router.get('/supply/:supplyId', async (req, res) => {
  try {
    const usages = await LivestockSupplyUsage.findAll({
      where: { supplyId: req.params.supplyId },
      include: [
        { model: Livestock, as: 'livestock' },
        { model: VeterinarySupply, as: 'supply' }
      ]
    });
    res.json(usages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar um novo uso de insumo
router.post('/', async (req, res) => {
  try {
    const usage = await LivestockSupplyUsage.create(req.body);
    res.status(201).json(usage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar um uso de insumo
router.put('/:id', async (req, res) => {
  try {
    const usage = await LivestockSupplyUsage.findByPk(req.params.id);
    if (usage) {
      await usage.update(req.body);
      res.json(usage);
    } else {
      res.status(404).json({ error: 'Uso de insumo não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar um uso de insumo
router.delete('/:id', async (req, res) => {
  try {
    const usage = await LivestockSupplyUsage.findByPk(req.params.id);
    if (usage) {
      await usage.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Uso de insumo não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;