const mongoose = require("mongoose");
const { Schema } = mongoose;

const NutritionSchema = new Schema({
  calories: { type: Number },
  protein: { type: Number },
  carbohydrates: { type: Number },
  fat: { type: Number },
});

const IngredientSchema = new Schema({
  name: { type: String, required: true },
  isAllergen: { type: Boolean, default: false },
});

const ProductDetailSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    ingredients: [IngredientSchema],
    nutritionalValues: NutritionSchema,
    allergens: [String],
  },
  {
    timestamps: true,
  }
);

ProductDetailSchema.index({ productId: 1 });

const ProductDetail = mongoose.model("ProductDetail", ProductDetailSchema);

module.exports = ProductDetail;
