const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReceiptItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  customizations: [
    {
      name: { type: String, required: true },
      priceModifier: { type: Number, default: 0 },
    },
  ],
});

const PaymentReceiptSchema = new Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    items: [ReceiptItemSchema],
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    promoCode: { type: String },
    customerInfo: {
      name: { type: String },
      email: { type: String },
    },
    restaurantInfo: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      taxId: { type: String, required: true },
    },
    receiptNumber: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

PaymentReceiptSchema.index({ paymentId: 1 });
PaymentReceiptSchema.index({ orderId: 1 });
PaymentReceiptSchema.index({ receiptNumber: 1 });

const PaymentReceipt = mongoose.model("PaymentReceipt", PaymentReceiptSchema);

module.exports = PaymentReceipt;
