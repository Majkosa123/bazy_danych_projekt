const mongoose = require("mongoose");
const { Schema } = mongoose;

const CustomizationOptionSchema = new Schema({
  name: { type: String, required: true },
  priceModifier: { type: Number, default: 0 },
});

const OrderItemCustomizationSchema = new Schema(
  {
    orderItemId: {
      type: String,
      required: true,
      unique: true,
    },
    customizations: [CustomizationOptionSchema],
    specialInstructions: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

OrderItemCustomizationSchema.index({ orderItemId: 1 });

const OrderItemCustomization = mongoose.model(
  "OrderItemCustomization",
  OrderItemCustomizationSchema
);

module.exports = OrderItemCustomization;
