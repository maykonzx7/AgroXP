import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.config.js';

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Item name cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'Item name must be between 1 and 100 characters'
      }
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Category cannot be empty'
      },
      len: {
        args: [1, 50],
        msg: 'Category must be between 1 and 50 characters'
      }
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: {
        msg: 'Quantity must be an integer'
      },
      min: {
        args: [0],
        msg: 'Quantity cannot be negative'
      }
    }
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Unit cannot be empty'
      },
      len: {
        args: [1, 20],
        msg: 'Unit must be between 1 and 20 characters'
      }
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Cost cannot be negative'
      }
    }
  },
  supplier: {
    type: DataTypes.STRING,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Supplier name must be less than 100 characters'
      }
    }
  },
  purchaseDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: {
        msg: 'Purchase date must be a valid date'
      }
    }
  },
  expiryDate: {
    type: DataTypes.DATE,
    validate: {
      isDate: {
        msg: 'Expiry date must be a valid date'
      },
      isAfterPurchaseDate(value) {
        if (value && this.purchaseDate && value < this.purchaseDate) {
          throw new Error('Expiry date must be after purchase date');
        }
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

export default Inventory;