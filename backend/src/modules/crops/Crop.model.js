import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Crop = sequelize.define('Crop', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  variety: {
    type: DataTypes.STRING,
    allowNull: false
  },
  plantingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  harvestDate: {
    type: DataTypes.DATE
  },
  parcelId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Parcels',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('planned', 'planting', 'growing', 'harvesting', 'completed'),
    defaultValue: 'planned'
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

export default Crop;