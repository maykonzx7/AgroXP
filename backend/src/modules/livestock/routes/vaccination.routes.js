import express from 'express';
import Vaccination from '../models/vaccination.model.js';
import Livestock from '../models/Livestock.model.js';
const router = express.Router();
// Obter todas as vacinações
router.get('/', async (req, res) => {
    try {
        const vaccinations = await Vaccination.findAll({
            include: [{ model: Livestock, as: 'livestock' }]
        });
        res.json(vaccinations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Obter vacinações de um animal específico
router.get('/livestock/:livestockId', async (req, res) => {
    try {
        const vaccinations = await Vaccination.findAll({
            where: { livestockId: req.params.livestockId },
            include: [{ model: Livestock, as: 'livestock' }]
        });
        res.json(vaccinations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Criar um novo registro de vacinação
router.post('/', async (req, res) => {
    try {
        const vaccination = await Vaccination.create(req.body);
        res.status(201).json(vaccination);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Atualizar um registro de vacinação
router.put('/:id', async (req, res) => {
    try {
        const vaccination = await Vaccination.findByPk(req.params.id);
        if (vaccination) {
            await vaccination.update(req.body);
            res.json(vaccination);
        }
        else {
            res.status(404).json({ error: 'Registro de vacinação não encontrado' });
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Deletar um registro de vacinação
router.delete('/:id', async (req, res) => {
    try {
        const vaccination = await Vaccination.findByPk(req.params.id);
        if (vaccination) {
            await vaccination.destroy();
            res.status(204).end();
        }
        else {
            res.status(404).json({ error: 'Registro de vacinação não encontrado' });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
