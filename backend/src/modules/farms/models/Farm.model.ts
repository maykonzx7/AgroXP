import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.config.js';

const Farm = sequelize.define('Farm', {
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
        msg: 'Farm name cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'Farm name must be between 1 and 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [0, 200],
        msg: 'Location must be less than 200 characters'
      }
    }
  },
  size: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Size must be a positive number'
      }
    }
  },
  sizeUnit: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'hectares',
    validate: {
      len: {
        args: [0, 20],
        msg: 'Size unit must be less than 20 characters'
      }
    }
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
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

export default Farm;