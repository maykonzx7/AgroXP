import { Request, Response } from 'express';
import userService from '../services/user.service';

// Interface para requisições protegidas
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Controlador de usuário
export class UserController {
  // Registrar novo usuário
  public async register(req: Request, res: Response) {
    try {
      const { email, password, name, phone, tenantId } = req.body;
      
      const result = await userService.register({
        email,
        password,
        name,
        phone,
        tenantId
      });
      
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Login de usuário
  public async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const result = await userService.login({
        email,
        password
      });
      
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  // Logout de usuário
  public async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      
      await userService.logout(token);
      
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obter perfil do usuário
  public async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar perfil do usuário
  public async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { name, phone, email } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      const user = await userService.updateUser(userId, {
        name,
        phone,
        email
      });
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Mudar senha
  public async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      await userService.changePassword(userId, currentPassword, newPassword);
      
      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Obter todos os usuários (apenas para admins)
  public async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user;
      
      // Verificar se usuário tem permissão de admin
      if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const users = await userService.getAllUsers();
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obter usuário por ID (apenas para admins)
  public async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user;
      const userId = parseInt(req.params.id);
      
      // Verificar se usuário tem permissão
      if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin' && currentUser.userId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar usuário (apenas para admins)
  public async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user;
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Verificar se usuário tem permissão
      if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin' && currentUser.userId !== userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      const user = await userService.updateUser(userId, updateData);
      
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Deletar usuário (apenas para admins)
  public async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const currentUser = req.user;
      const userId = parseInt(req.params.id);
      
      // Verificar se usuário tem permissão
      if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      await userService.deleteUser(userId);
      
      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obter tenants do usuário
  public async getUserTenants(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      const tenants = await userService.getUserTenants(userId);
      
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController();