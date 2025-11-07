import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.config';
import User from './User.model';

// Interface para os atributos da sessão
export interface SessionAttributes {
  id?: number;
  userId: number;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Classe do modelo de sessão
class Session extends Model<SessionAttributes> implements SessionAttributes {
  public id!: number;
  public userId!: number;
  public token!: string;
  public expiresAt!: Date;
  public ipAddress!: string;
  public userAgent!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicialização do modelo
Session.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'Token é obrigatório'
      }
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Data de expiração inválida'
      },
      isAfter: {
        args: [new Date().toISOString()],
        msg: 'Data de expiração deve ser no futuro'
      }
    }
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Session',
  tableName: 'sessions',
  schema: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['token']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

// Associações
Session.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export default Session;