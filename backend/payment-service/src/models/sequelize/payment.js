const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const PaymentMethod = require("./paymentMethod");

const Payment = sequelize.define(
  "Payment",
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
    paymentMethodId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: PaymentMethod,
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PLN",
    },
    status: {
      type: DataTypes.ENUM,
      values: ["pending", "completed", "failed", "refunded"],
      defaultValue: "pending",
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    promoCodeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

Payment.belongsTo(PaymentMethod, { foreignKey: "paymentMethodId" });

module.exports = Payment;
