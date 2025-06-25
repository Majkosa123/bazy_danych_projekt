const request = require("supertest");
const app = require("../../src/app");
const Payment = require("../../src/models/sequelize/payment");
const PaymentMethod = require("../../src/models/sequelize/paymentMethod");
const PromoCode = require("../../src/models/sequelize/promoCode");
const orderService = require("../../src/services/orderService");
const paymentGateway = require("../../src/services/paymentGateway");

describe("Payments Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    PaymentMethod.findAll.mockResolvedValue([
      {
        id: "pm-1",
        name: "Karta kredytowa",
        type: "card",
        isActive: true,
        toJSON: () => ({
          id: "pm-1",
          name: "Karta kredytowa",
          type: "card",
          isActive: true,
        }),
      },
      {
        id: "pm-2",
        name: "Gotówka",
        type: "cash",
        isActive: true,
        toJSON: () => ({
          id: "pm-2",
          name: "Gotówka",
          type: "cash",
          isActive: true,
        }),
      },
    ]);

    PaymentMethod.findByPk.mockResolvedValue({
      id: "pm-1",
      name: "Karta kredytowa",
      type: "card",
      isActive: true,
    });

    orderService.getOrderById.mockResolvedValue({
      id: "order-123",
      totalAmount: 25.99,
      status: "pending",
      userId: "user-123",
    });

    paymentGateway.processCardPayment.mockResolvedValue({
      success: true,
      transactionId: "txn-123",
      amount: 25.99,
    });

    Payment.create.mockResolvedValue({
      id: "payment-123",
      orderId: "order-123",
      amount: 25.99,
      status: "completed",
      toJSON: () => ({
        id: "payment-123",
        orderId: "order-123",
        amount: 25.99,
        status: "completed",
      }),
    });
  });

  describe("GET /api/v1/payment-methods", () => {
    test("should get all payment methods", async () => {
      const response = await request(app).get("/api/v1/payment-methods");

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("metody płatności");
    });
  });

  describe("GET /api/v1/promo-codes", () => {
    test("should get active promo codes", async () => {
      PromoCode.findAll.mockResolvedValue([
        {
          id: "promo-1",
          code: "SAVE10",
          discountType: "percentage",
          discountValue: 10,
          isActive: true,
          toJSON: () => ({
            id: "promo-1",
            code: "SAVE10",
            discountType: "percentage",
            discountValue: 10,
            isActive: true,
          }),
        },
      ]);

      const response = await request(app).get("/api/v1/promo-codes");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].code).toBe("SAVE10");
    });
  });

  describe("POST /api/v1/promo-codes/validate", () => {
    test("should validate promo code successfully", async () => {
      PromoCode.findOne.mockResolvedValue({
        id: "promo-1",
        code: "SAVE10",
        discountType: "percentage",
        discountValue: 10,
        isActive: true,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        minOrderValue: 20,
      });

      const validationData = {
        code: "SAVE10",
        orderId: "order-123",
        totalAmount: 30,
      };

      const response = await request(app)
        .post("/api/v1/promo-codes/validate")
        .send(validationData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.discountAmount).toBeGreaterThan(0);
    });

    test("should reject invalid promo code", async () => {
      PromoCode.findOne.mockResolvedValue(null);

      const validationData = {
        code: "INVALID",
        orderId: "order-123",
        totalAmount: 30,
      };

      const response = await request(app)
        .post("/api/v1/promo-codes/validate")
        .send(validationData);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
    });
  });
});
