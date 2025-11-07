import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.config.js';
import Livestock from './Livestock.model.js';

const Vaccination = sequelize.define('Vaccination', {
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
  vaccineName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  vaccinationDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  nextVaccinationDate: {
    type: DataTypes.DATE
  },
  veterinarian: {
    type: DataTypes.STRING
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

// Associação
Vaccination.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'livestock' });

export default Vaccination;