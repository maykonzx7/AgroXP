import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Livestock = sequelize.define('Livestock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  breed: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2)
  },
  category: {
    type: DataTypes.ENUM('bovino', 'suíno', 'ovino', 'caprino', 'avícola', 'equino', 'outros'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ativo', 'vendido', 'morto', 'transferido'),
    defaultValue: 'ativo'
  },
  parcelId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Parcels',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

export default Livestock;