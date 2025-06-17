const mongoose = require("mongoose");
const { Schema } = mongoose;

const DeliveryAddressSchema = new Schema(
  {
    orderDeliveryId: {
      type: String,
      required: true,
      unique: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

DeliveryAddressSchema.index({ orderDeliveryId: 1 });

const DeliveryAddress = mongoose.model(
  "DeliveryAddress",
  DeliveryAddressSchema
);

module.exports = DeliveryAddress;
