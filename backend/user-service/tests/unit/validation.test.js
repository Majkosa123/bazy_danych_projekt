const {
  registerUserSchema,
  loginUserSchema,
  submitFeedbackSchema,
} = require("../../src/utils/validation");

describe("Validation Tests", () => {
  describe("registerUserSchema", () => {
    test("should validate correct user data", () => {
      const validUser = {
        email: "test@test.com",
        password: "haslo123",
        firstName: "Jan",
        lastName: "Kowalski",
      };

      const { error } = registerUserSchema.validate(validUser);
      expect(error).toBeUndefined();
    });

    test("should reject invalid email", () => {
      const invalidUser = {
        email: "not-an-email",
        password: "haslo123",
        firstName: "Jan",
        lastName: "Kowalski",
      };

      const { error } = registerUserSchema.validate(invalidUser);
      expect(error).toBeDefined();
    });

    test("should reject short password", () => {
      const invalidUser = {
        email: "test@test.com",
        password: "123",
        firstName: "Jan",
        lastName: "Kowalski",
      };

      const { error } = registerUserSchema.validate(invalidUser);
      expect(error).toBeDefined();
    });
  });

  describe("submitFeedbackSchema", () => {
    test("should validate correct feedback", () => {
      const validFeedback = {
        orderId: "test-order-123",
        rating: 4,
        review: "Great food!",
        customerName: "Jan",
      };

      const { error } = submitFeedbackSchema.validate(validFeedback);
      expect(error).toBeUndefined();
    });

    test("should reject rating outside 1-5 range", () => {
      const invalidFeedback = {
        orderId: "test-order-123",
        rating: 6,
        review: "Great food!",
      };

      const { error } = submitFeedbackSchema.validate(invalidFeedback);
      expect(error).toBeDefined();
    });
  });
});
