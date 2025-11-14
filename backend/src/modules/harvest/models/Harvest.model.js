import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.config.js';

const Harvest = sequelize.define('Harvest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  crop: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Crop cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'Crop must be between 1 and 100 characters'
      }
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Date must be a valid date'
      }
    }
  },
  yield: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: {
        args: 0,
        msg: 'Yield must be a positive number'
      }
    }
  },
  expectedYield: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: {
        args: 0,
        msg: 'Expected yield must be a positive number'
      }
    }
  },
  harvestArea: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: {
        args: 0,
        msg: 'Harvest area must be a positive number'
      }
    }
  },
  quality: {
    type: DataTypes.ENUM('Excelente', 'Boa', 'Média', 'Baixa'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Excelente', 'Boa', 'Média', 'Baixa']],
        msg: 'Quality must be one of: Excelente, Boa, Média, Baixa'
      }
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

export default Harvest;