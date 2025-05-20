const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const DeliveryOption = require("./deliveryOption");
const Table = require("./table");

const OrderDelivery = sequelize.define(
  "OrderDelivery",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    deliveryOptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: DeliveryOption,
        key: "id",
      },
    },
    tableId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Table,
        key: "id",
      },
    },
    estimatedDeliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "order_deliveries",
    timestamps: true,
  }
);

OrderDelivery.belongsTo(DeliveryOption, { foreignKey: "deliveryOptionId" });
OrderDelivery.belongsTo(Table, { foreignKey: "tableId" });

module.exports = OrderDelivery;
