describe("Payment Models Tests", () => {
  test("should have Payment model", () => {
    const Payment = require("../../src/models/sequelize/payment");
    expect(Payment).toBeDefined();
  });

  test("should have PaymentMethod model", () => {
    const PaymentMethod = require("../../src/models/sequelize/paymentMethod");
    expect(PaymentMethod).toBeDefined();
  });

  test("should have PromoCode model", () => {
    const PromoCode = require("../../src/models/sequelize/promoCode");
    expect(PromoCode).toBeDefined();
  });

  test("should have PaymentReceipt model", () => {
    const PaymentReceipt = require("../../src/models/mongoose/paymentReceipt");
    expect(PaymentReceipt).toBeDefined();
  });
});
