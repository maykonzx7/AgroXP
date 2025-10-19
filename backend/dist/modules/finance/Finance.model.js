import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.config.js';
const Finance = sequelize.define('Finance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
        validate: {
            isIn: {
                args: [['income', 'expense']],
                msg: 'Type must be either income or expense'
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
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0.01],
                msg: 'Amount must be greater than 0'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Description cannot be empty'
            },
            len: {
                args: [1, 500],
                msg: 'Description must be between 1 and 500 characters'
            }
        }
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: {
                msg: 'Date must be a valid date'
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
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});
export default Finance;
