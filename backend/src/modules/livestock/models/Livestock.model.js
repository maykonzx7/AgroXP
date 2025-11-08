import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.config.js';
const Livestock = sequelize.define('Livestock', {
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
    breed: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Breed cannot be empty'
            },
            len: {
                args: [1, 100],
                msg: 'Breed must be between 1 and 100 characters'
            }
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: {
                msg: 'Quantity must be an integer'
            },
            min: {
                args: [1],
                msg: 'Quantity must be at least 1'
            }
        }
    },
    age: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: 'Age must be an integer'
            },
            min: {
                args: [0],
                msg: 'Age cannot be negative'
            }
        }
    },
    weight: {
        type: DataTypes.DECIMAL(10, 2),
        validate: {
            min: {
                args: [0.01],
                msg: 'Weight must be greater than 0'
            }
        }
    },
    category: {
        type: DataTypes.ENUM('bovino', 'suíno', 'ovino', 'caprino', 'avícola', 'equino', 'outros'),
        allowNull: false,
        field: 'category', // Explicitly define the field name
        validate: {
            isIn: {
                args: [['bovino', 'suíno', 'ovino', 'caprino', 'avícola', 'equino', 'outros']],
                msg: 'Category must be one of: bovino, suíno, ovino, caprino, avícola, equino, outros'
            }
        }
    },
    status: {
        type: DataTypes.ENUM('ativo', 'vendido', 'morto', 'transferido'),
        defaultValue: 'ativo',
        validate: {
            isIn: {
                args: [['ativo', 'vendido', 'morto', 'transferido']],
                msg: 'Status must be one of: ativo, vendido, morto, transferido'
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
}, {
    tableName: 'Livestock', // Explicitly define the table name
    timestamps: true
});
export default Livestock;
