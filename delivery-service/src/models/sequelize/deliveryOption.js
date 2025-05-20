const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");

const DeliveryOption = sequelize.define(
  "DeliveryOption",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    estimatedTimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
  },
  {
    tableName: "delivery_options",
    timestamps: true,
  }
);

module.exports = DeliveryOption;
