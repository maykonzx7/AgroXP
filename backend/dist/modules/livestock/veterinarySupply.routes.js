import express from 'express';
import VeterinarySupply from './veterinarySupply.model.js';
const router = express.Router();
// Obter todos os insumos veterinários
router.get('/', async (req, res) => {
    try {
        const supplies = await VeterinarySupply.findAll();
        res.json(supplies);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obter um insumo veterinário específico
router.get('/:id', async (req, res) => {
    try {
        const supply = await VeterinarySupply.findByPk(req.params.id);
        if (supply) {
            res.json(supply);
        }
        else {
            res.status(404).json({ error: 'Insumo veterinário não encontrado' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Criar um novo insumo veterinário
router.post('/', async (req, res) => {
    try {
        const supply = await VeterinarySupply.create(req.body);
        res.status(201).json(supply);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Atualizar um insumo veterinário
router.put('/:id', async (req, res) => {
    try {
        const supply = await VeterinarySupply.findByPk(req.params.id);
        if (supply) {
            await supply.update(req.body);
            res.json(supply);
        }
        else {
            res.status(404).json({ error: 'Insumo veterinário não encontrado' });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Deletar um insumo veterinário
router.delete('/:id', async (req, res) => {
    try {
        const supply = await VeterinarySupply.findByPk(req.params.id);
        if (supply) {
            await supply.destroy();
            res.status(204).end();
        }
        else {
            res.status(404).json({ error: 'Insumo veterinário não encontrado' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
