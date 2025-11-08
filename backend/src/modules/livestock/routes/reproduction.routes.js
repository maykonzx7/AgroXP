import express from 'express';
import Reproduction from '../models/reproduction.model.js';
import Livestock from '../models/Livestock.model.js';
const router = express.Router();
// Obter todos os registros de reprodução
router.get('/', async (req, res) => {
    try {
        const reproductions = await Reproduction.findAll({
            include: [{ model: Livestock, as: 'livestock' }]
        });
        res.json(reproductions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obter registros de reprodução de um animal específico
router.get('/livestock/:livestockId', async (req, res) => {
    try {
        const reproductions = await Reproduction.findAll({
            where: { livestockId: req.params.livestockId },
            include: [{ model: Livestock, as: 'livestock' }]
        });
        res.json(reproductions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Criar um novo registro de reprodução
router.post('/', async (req, res) => {
    try {
        const reproduction = await Reproduction.create(req.body);
        res.status(201).json(reproduction);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Atualizar um registro de reprodução
router.put('/:id', async (req, res) => {
    try {
        const reproduction = await Reproduction.findByPk(req.params.id);
        if (reproduction) {
            await reproduction.update(req.body);
            res.json(reproduction);
        }
        else {
            res.status(404).json({ error: 'Registro de reprodução não encontrado' });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Deletar um registro de reprodução
router.delete('/:id', async (req, res) => {
    try {
        const reproduction = await Reproduction.findByPk(req.params.id);
        if (reproduction) {
            await reproduction.destroy();
            res.status(204).end();
        }
        else {
            res.status(404).json({ error: 'Registro de reprodução não encontrado' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
