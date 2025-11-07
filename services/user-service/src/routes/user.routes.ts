import express from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Rotas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rotas protegidas
router.use(authenticate);

router.post('/logout', userController.logout);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);
router.get('/tenants', userController.getUserTenants);

// Rotas administrativas (apenas para admins)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;