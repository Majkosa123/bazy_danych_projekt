// backend/payment-service/tests/unit/validation.test.js

const Joi = require("joi");

// Proste testy validation tylko dla payment-service
describe("Payment Validation Tests", () => {
  describe("Payment Method Validation", () => {
    test("should validate payment method ID format", () => {
      const paymentMethodSchema = Joi.string().uuid().required();

      const validId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
      const { error } = paymentMethodSchema.validate(validId);
      expect(error).toBeUndefined();
    });

    test("should reject invalid payment method ID", () => {
      const paymentMethodSchema = Joi.string().uuid().required();

      const invalidId = "not-a-uuid";
      const { error } = paymentMethodSchema.validate(invalidId);
      expect(error).toBeDefined();
    });
  });

  describe("Amount Validation", () => {
    test("should validate positive amounts", () => {
      const amountSchema = Joi.number().positive().required();

      const validAmount = 25.5;
      const { error } = amountSchema.validate(validAmount);
      expect(error).toBeUndefined();
    });

    test("should reject negative amounts", () => {
      const amountSchema = Joi.number().positive().required();

      const invalidAmount = -10.0;
      const { error } = amountSchema.validate(invalidAmount);
      expect(error).toBeDefined();
    });

    test("should reject zero amounts", () => {
      const amountSchema = Joi.number().positive().required();

      const invalidAmount = 0;
      const { error } = amountSchema.validate(invalidAmount);
      expect(error).toBeDefined();
    });
  });

  describe("Promo Code Validation", () => {
    test("should validate promo code format", () => {
      const promoCodeSchema = Joi.string().min(3).max(20).alphanum().required();

      const validCode = "WELCOME10";
      const { error } = promoCodeSchema.validate(validCode);
      expect(error).toBeUndefined();
    });

    test("should reject empty promo code", () => {
      const promoCodeSchema = Joi.string().min(3).max(20).alphanum().required();

      const invalidCode = "";
      const { error } = promoCodeSchema.validate(invalidCode);
      expect(error).toBeDefined();
    });

    test("should reject too short promo code", () => {
      const promoCodeSchema = Joi.string().min(3).max(20).alphanum().required();

      const invalidCode = "AB";
      const { error } = promoCodeSchema.validate(invalidCode);
      expect(error).toBeDefined();
    });
  });

  describe("Customer Info Validation", () => {
    test("should validate customer email", () => {
      const emailSchema = Joi.string().email().required();

      const validEmail = "test@example.com";
      const { error } = emailSchema.validate(validEmail);
      expect(error).toBeUndefined();
    });

    test("should reject invalid email format", () => {
      const emailSchema = Joi.string().email().required();

      const invalidEmail = "not-an-email";
      const { error } = emailSchema.validate(invalidEmail);
      expect(error).toBeDefined();
    });

    test("should validate customer name", () => {
      const nameSchema = Joi.string().min(2).max(100).required();

      const validName = "Jan Kowalski";
      const { error } = nameSchema.validate(validName);
      expect(error).toBeUndefined();
    });

    test("should reject too short name", () => {
      const nameSchema = Joi.string().min(2).max(100).required();

      const invalidName = "A";
      const { error } = nameSchema.validate(invalidName);
      expect(error).toBeDefined();
    });
  });

  describe("Currency Validation", () => {
    test("should validate PLN currency", () => {
      const currencySchema = Joi.string().valid("PLN", "EUR", "USD").required();

      const validCurrency = "PLN";
      const { error } = currencySchema.validate(validCurrency);
      expect(error).toBeUndefined();
    });

    test("should reject invalid currency", () => {
      const currencySchema = Joi.string().valid("PLN", "EUR", "USD").required();

      const invalidCurrency = "INVALID";
      const { error } = currencySchema.validate(invalidCurrency);
      expect(error).toBeDefined();
    });
  });
});
