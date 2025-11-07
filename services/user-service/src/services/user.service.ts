import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import Session from '../models/Session.model';
import Tenant from '../models/Tenant.model';

// Interface para os dados de registro
export interface RegisterUserData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  tenantId?: number;
}

// Interface para os dados de login
export interface LoginUserData {
  email: string;
  password: string;
}

// Interface para os dados de resposta do usuário
export interface UserResponse {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  tenantId?: number;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

// Classe de serviço de usuário
export class UserService {
  // Hash de senha
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Comparar senha
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Gerar token JWT
  private generateToken(user: UserResponse): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      },
      process.env.JWT_SECRET || 'agroxp_secret_key',
      {
        expiresIn: '7d'
      }
    );
  }

  // Registrar novo usuário
  public async register(userData: RegisterUserData): Promise<{ user: UserResponse; token: string }> {
    try {
      // Verificar se usuário já existe
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('Usuário com este email já existe');
      }

      // Hash da senha
      const passwordHash = await this.hashPassword(userData.password);

      // Criar usuário
      const user = await User.create({
        email: userData.email,
        passwordHash,
        name: userData.name,
        phone: userData.phone,
        tenantId: userData.tenantId,
        role: 'user' // Por padrão, novos usuários são usuários normais
      });

      // Converter para resposta
      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };

      // Gerar token
      const token = this.generateToken(userResponse);

      // Criar sessão
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

      await Session.create({
        userId: user.id,
        token,
        expiresAt
      });

      return { user: userResponse, token };
    } catch (error) {
      throw new Error(`Erro ao registrar usuário: ${error.message}`);
    }
  }

  // Login de usuário
  public async login(loginData: LoginUserData): Promise<{ user: UserResponse; token: string }> {
    try {
      // Buscar usuário pelo email
      const user = await User.findOne({
        where: { email: loginData.email }
      });

      if (!user) {
        throw new Error('Credenciais inválidas');
      }

      // Verificar se usuário está ativo
      if (!user.isActive) {
        throw new Error('Conta desativada. Entre em contato com o administrador.');
      }

      // Verificar senha
      const isValidPassword = await this.comparePassword(loginData.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Credenciais inválidas');
      }

      // Atualizar último login
      await user.update({ lastLogin: new Date() });

      // Converter para resposta
      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };

      // Gerar token
      const token = this.generateToken(userResponse);

      // Atualizar ou criar sessão
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

      await Session.upsert({
        userId: user.id,
        token,
        expiresAt
      });

      return { user: userResponse, token };
    } catch (error) {
      throw new Error(`Erro ao fazer login: ${error.message}`);
    }
  }

  // Logout de usuário
  public async logout(token: string): Promise<void> {
    try {
      // Remover sessão
      await Session.destroy({
        where: { token }
      });
    } catch (error) {
      throw new Error(`Erro ao fazer logout: ${error.message}`);
    }
  }

  // Validar token de sessão
  public async validateSession(token: string): Promise<UserResponse | null> {
    try {
      // Verificar se sessão existe e é válida
      const session = await Session.findOne({
        where: { token },
        include: [{
          model: User,
          as: 'user'
        }]
      });

      if (!session || !session.user) {
        return null;
      }

      // Verificar se sessão expirou
      if (session.expiresAt < new Date()) {
        // Remover sessão expirada
        await session.destroy();
        return null;
      }

      // Converter usuário para resposta
      const userResponse: UserResponse = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        phone: session.user.phone,
        role: session.user.role,
        tenantId: session.user.tenantId,
        isActive: session.user.isActive,
        lastLogin: session.user.lastLogin,
        createdAt: session.user.createdAt
      };

      return userResponse;
    } catch (error) {
      throw new Error(`Erro ao validar sessão: ${error.message}`);
    }
  }

  // Obter usuário por ID
  public async getUserById(userId: number): Promise<UserResponse | null> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        return null;
      }

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };

      return userResponse;
    } catch (error) {
      throw new Error(`Erro ao obter usuário: ${error.message}`);
    }
  }

  // Obter todos os usuários (apenas para admins)
  public async getAllUsers(role?: string): Promise<UserResponse[]> {
    try {
      const whereClause = role ? { role } : {};
      
      const users = await User.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      return users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }));
    } catch (error) {
      throw new Error(`Erro ao obter usuários: ${error.message}`);
    }
  }

  // Atualizar usuário
  public async updateUser(userId: number, updateData: Partial<RegisterUserData>): Promise<UserResponse> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Se estiver mudando a senha, fazer hash
      if (updateData.password) {
        updateData.passwordHash = await this.hashPassword(updateData.password);
        delete updateData.password; // Remover senha em texto claro
      }

      // Atualizar usuário
      await user.update(updateData);

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };

      return userResponse;
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  // Deletar usuário
  public async deleteUser(userId: number): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Remover usuário (soft delete)
      await user.update({ isActive: false });
    } catch (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }

  // Mudar senha do usuário
  public async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar senha atual
      const isValidCurrentPassword = await this.comparePassword(currentPassword, user.passwordHash);
      if (!isValidCurrentPassword) {
        throw new Error('Senha atual incorreta');
      }

      // Hash da nova senha
      const newPasswordHash = await this.hashPassword(newPassword);

      // Atualizar senha
      await user.update({ passwordHash: newPasswordHash });
    } catch (error) {
      throw new Error(`Erro ao mudar senha: ${error.message}`);
    }
  }

  // Obter tenants de um usuário
  public async getUserTenants(userId: number): Promise<any[]> {
    try {
      const tenants = await Tenant.findAll({
        where: {
          ownerUserId: userId
        }
      });

      return tenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        subscriptionPlan: tenant.subscriptionPlan,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt
      }));
    } catch (error) {
      throw new Error(`Erro ao obter tenants do usuário: ${error.message}`);
    }
  }
}

export default new UserService();