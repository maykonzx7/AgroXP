import express from 'express';
import Feeding from '../models/feeding.model.js';
import Livestock from '../models/Livestock.model.js';
const router = express.Router();
// Obter todos os registros de alimentação
router.get('/', async (req, res) => {
    try {
        const feedings = await Feeding.findAll({
            include: [{ model: Livestock, as: 'livestock' }]
        });
        res.json(feedings);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obter registros de alimentação de um animal específico
router.get('/livestock/:livestockId', async (req, res) => {
    try {
        const feedings = await Feeding.findAll({
            where: { livestockId: req.params.livestockId },
            include: [{ model: Livestock, as: 'livestock' }]
        });
        res.json(feedings);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Criar um novo registro de alimentação
router.post('/', async (req, res) => {
    try {
        const feeding = await Feeding.create(req.body);
        res.status(201).json(feeding);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Atualizar um registro de alimentação
router.put('/:id', async (req, res) => {
    try {
        const feeding = await Feeding.findByPk(req.params.id);
        if (feeding) {
            await feeding.update(req.body);
            res.json(feeding);
        }
        else {
            res.status(404).json({ error: 'Registro de alimentação não encontrado' });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Deletar um registro de alimentação
router.delete('/:id', async (req, res) => {
    try {
        const feeding = await Feeding.findByPk(req.params.id);
        if (feeding) {
            await feeding.destroy();
            res.status(204).end();
        }
        else {
            res.status(404).json({ error: 'Registro de alimentação não encontrado' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
