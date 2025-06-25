const {
  createPaymentSchema,
  validatePromoCodeSchema,
} = require("../../src/utils/validation");

describe("Payment Validation Tests", () => {
  describe("createPaymentSchema", () => {
    test("should validate correct payment data", () => {
      const validPayment = {
        paymentMethodId: "123e4567-e89b-12d3-a456-426614174000",
        customerInfo: {
          name: "Jan Kowalski",
          email: "jan@example.com",
        },
      };

      const { error } = createPaymentSchema.validate(validPayment);
      expect(error).toBeUndefined();
    });

    test("should reject invalid UUID for paymentMethodId", () => {
      const invalidPayment = {
        paymentMethodId: "invalid-uuid",
      };

      const { error } = createPaymentSchema.validate(invalidPayment);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain("valid GUID");
    });

    test("should reject invalid email", () => {
      const invalidPayment = {
        paymentMethodId: "123e4567-e89b-12d3-a456-426614174000",
        customerInfo: {
          email: "invalid-email",
        },
      };

      const { error } = createPaymentSchema.validate(invalidPayment);
      expect(error).toBeDefined();
    });

    test("should allow optional fields", () => {
      const minimalPayment = {
        paymentMethodId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const { error } = createPaymentSchema.validate(minimalPayment);
      expect(error).toBeUndefined();
    });
  });

  describe("validatePromoCodeSchema", () => {
    test("should validate correct promo code data", () => {
      const validPromo = {
        code: "SAVE10",
        orderId: "order-123",
        totalAmount: 50.0,
      };

      const { error } = validatePromoCodeSchema.validate(validPromo);
      expect(error).toBeUndefined();
    });

    test("should require code and orderId", () => {
      const invalidPromo = {
        totalAmount: 50.0,
      };

      const { error } = validatePromoCodeSchema.validate(invalidPromo);
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThan(0);
    });

    test("should allow optional totalAmount", () => {
      const validPromo = {
        code: "SAVE10",
        orderId: "order-123",
      };

      const { error } = validatePromoCodeSchema.validate(validPromo);
      expect(error).toBeUndefined();
    });
  });
});
