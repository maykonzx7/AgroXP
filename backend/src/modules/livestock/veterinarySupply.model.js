import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const VeterinarySupply = sequelize.define('VeterinarySupply', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  supplier: {
    type: DataTypes.STRING
  },
  expirationDate: {
    type: DataTypes.DATE
  },
  batchNumber: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.ENUM('vacina', 'medicamento', 'suplemento', 'ração', 'outros'),
    allowNull: false
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

export default VeterinarySupply;