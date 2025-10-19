import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.config';
import User from './User.model';

// Interface para os atributos do tenant
export interface TenantAttributes {
  id?: number;
  name: string;
  ownerEmail: string;
  ownerUserId?: number;
  address?: string;
  phone?: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: Date;
  trialEndsAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Classe do modelo de tenant
class Tenant extends Model<TenantAttributes> implements TenantAttributes {
  public id!: number;
  public name!: string;
  public ownerEmail!: string;
  public ownerUserId!: number;
  public address!: string;
  public phone!: string;
  public subscriptionPlan!: 'free' | 'basic' | 'premium' | 'enterprise';
  public billingCycle!: 'monthly' | 'yearly';
  public nextBillingDate!: Date;
  public trialEndsAt!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicialização do modelo
Tenant.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome da fazenda/organização é obrigatório'
      },
      len: {
        args: [1, 255],
        msg: 'Nome deve ter entre 1 e 255 caracteres'
      }
    }
  },
  ownerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Email do proprietário inválido'
      },
      notEmpty: {
        msg: 'Email do proprietário é obrigatório'
      }
    }
  },
  ownerUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
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
  subscriptionPlan: {
    type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
    defaultValue: 'free',
    validate: {
      isIn: {
        args: [['free', 'basic', 'premium', 'enterprise']],
        msg: 'Plano de assinatura inválido'
      }
    }
  },
  billingCycle: {
    type: DataTypes.ENUM('monthly', 'yearly'),
    defaultValue: 'monthly',
    validate: {
      isIn: {
        args: [['monthly', 'yearly']],
        msg: 'Ciclo de cobrança inválido'
      }
    }
  },
  nextBillingDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  trialEndsAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Tenant',
  tableName: 'tenants',
  schema: 'users',
  timestamps: true,
  indexes: [
    {
      fields: ['ownerUserId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['subscriptionPlan']
    }
  ]
});

// Associações
Tenant.belongsTo(User, {
  foreignKey: 'ownerUserId',
  as: 'owner'
});

export default Tenant;