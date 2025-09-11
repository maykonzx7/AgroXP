import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Livestock from './Livestock.model.js';
import VeterinarySupply from './veterinarySupply.model.js';

const LivestockSupplyUsage = sequelize.define('LivestockSupplyUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  livestockId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Livestocks',
      key: 'id'
    }
  },
  supplyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'VeterinarySupplies',
      key: 'id'
    }
  },
  quantityUsed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  usageDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
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

// Associações
LivestockSupplyUsage.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'livestock' });
LivestockSupplyUsage.belongsTo(VeterinarySupply, { foreignKey: 'supplyId', as: 'supply' });

export default LivestockSupplyUsage;