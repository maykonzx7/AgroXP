import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.config.js';
import Livestock from './Livestock.model.js';
const Reproduction = sequelize.define('Reproduction', {
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
    matingDate: {
        type: DataTypes.DATE
    },
    expectedDeliveryDate: {
        type: DataTypes.DATE
    },
    actualDeliveryDate: {
        type: DataTypes.DATE
    },
    offspringCount: {
        type: DataTypes.INTEGER
    },
    notes: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('planejado', 'gestando', 'pariu', 'abortou'),
        defaultValue: 'planejado'
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
Reproduction.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'livestock' });
export default Reproduction;
