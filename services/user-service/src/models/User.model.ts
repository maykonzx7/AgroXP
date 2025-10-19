import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.config';

// Interface para os atributos do usuário
export interface UserAttributes {
  id?: number;
  email: string;
  passwordHash: string;
  name?: string;
  phone?: string;
  role: 'user' | 'admin' | 'super_admin';
  tenantId?: number;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Classe do modelo de usuário
class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public passwordHash!: string;
  public name!: string;
  public phone!: string;
  public role!: 'user' | 'admin' | 'super_admin';
  public tenantId!: number;
  public isActive!: boolean;
  public lastLogin!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicialização do modelo
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Email inválido'
      },
      notEmpty: {
        msg: 'Email é obrigatório'
      }
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Senha é obrigatória'
      },
      len: {
        args: [6, 255],
        msg: 'Senha deve ter pelo menos 6 caracteres'
      }
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [0, 255],
        msg: 'Nome deve ter no máximo 255 caracteres'
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [0, 20],
        msg: 'Telefone deve ter no máximo 20 caracteres'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'super_admin'),
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['user', 'admin', 'super_admin']],
        msg: 'Função deve ser user, admin ou super_admin'
      }
    }
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  schema: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['tenantId']
    }
  ]
});

export default User;