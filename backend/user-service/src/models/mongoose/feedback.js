const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeedbackSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: "Anonimowy",
    },
    email: {
      type: String,
      required: false,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 1000,
    },
    productRatings: [
      {
        productId: { type: String, required: true },
        productName: { type: String },
        rating: { type: Number, min: 1, max: 5, required: true },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ orderId: 1 });
FeedbackSchema.index({ submittedAt: -1 });

const Feedback = mongoose.model("Feedback", FeedbackSchema);

module.exports = Feedback;
