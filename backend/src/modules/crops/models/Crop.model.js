import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.config.js';

const Crop = sequelize.define('Crop', {
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
        msg: 'Name cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'Name must be between 1 and 100 characters'
      }
    }
  },
  variety: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Variety cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'Variety must be between 1 and 100 characters'
      }
    }
  },
  plantingDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Planting date must be a valid date'
      }
    }
  },
  harvestDate: {
    type: DataTypes.DATE,
    validate: {
      isDate: {
        msg: 'Harvest date must be a valid date'
      },
      isAfterPlantingDate(value) {
        if (value && this.plantingDate && value < this.plantingDate) {
          throw new Error('Harvest date must be after planting date');
        }
      }
    }
  },
  parcelId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Parcels',
      key: 'id'
    },
    validate: {
      isInt: {
        msg: 'Parcel ID must be an integer'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('planned', 'planting', 'growing', 'harvesting', 'completed'),
    defaultValue: 'planned',
    validate: {
      isIn: {
        args: [['planned', 'planting', 'growing', 'harvesting', 'completed']],
        msg: 'Status must be one of: planned, planting, growing, harvesting, completed'
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

export default Crop;