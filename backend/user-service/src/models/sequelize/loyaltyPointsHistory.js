const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/database");
const User = require("./user");

const LoyaltyPointsHistory = sequelize.define(
  "LoyaltyPointsHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    pointsChange: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("earned", "redeemed", "expired", "bonus"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "loyalty_points_history",
    timestamps: true,
  }
);

LoyaltyPointsHistory.belongsTo(User, { foreignKey: "userId" });
User.hasMany(LoyaltyPointsHistory, { foreignKey: "userId" });

module.exports = LoyaltyPointsHistory;
