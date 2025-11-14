import { DataTypes } from "sequelize";
import sequelize from "../../config/database.config.js";
import Livestock from "./Livestock.model.js";
const Feeding = sequelize.define("Feeding", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  livestockId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Livestock",
      key: "id",
    },
  },
  feedType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  feedingDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
// Associação
Feeding.belongsTo(Livestock, { foreignKey: "livestockId", as: "livestock" });
export default Feeding;
