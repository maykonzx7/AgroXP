import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.config.js';
const Parcel = sequelize.define('Parcel', {
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
    size: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0.01],
                msg: 'Size must be greater than 0'
            }
        }
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Location cannot be empty'
            },
            len: {
                args: [1, 200],
                msg: 'Location must be between 1 and 200 characters'
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
export default Parcel;
