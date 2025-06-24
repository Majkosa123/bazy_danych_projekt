const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserPreferencesSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    favoriteProducts: [
      {
        productId: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    orderHistory: [
      {
        orderId: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        orderDate: { type: Date, required: true },
        itemsCount: { type: Number, required: true },
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String },
      },
    ],
    languagePreference: {
      type: String,
      enum: ["pl", "en"],
      default: "pl",
    },
    dietaryRestrictions: {
      type: [String],
      enum: ["vegetarian", "vegan", "gluten_free", "lactose_free", "halal"],
      default: [],
    },
    customizations: {
      defaultSpicyLevel: { type: Number, min: 0, max: 5, default: 0 },
      preferredSize: { type: String, enum: ["small", "medium", "large"] },
      allergens: [String],
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      specialOffers: { type: Boolean, default: true },
    },
    suggestedMenuItems: [
      {
        productId: { type: String, required: true },
        reason: { type: String },
        confidence: { type: Number, min: 0, max: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserPreferencesSchema.index({ userId: 1 });
UserPreferencesSchema.index({ "favoriteProducts.productId": 1 });

const UserPreferences = mongoose.model(
  "UserPreferences",
  UserPreferencesSchema
);

module.exports = UserPreferences;
