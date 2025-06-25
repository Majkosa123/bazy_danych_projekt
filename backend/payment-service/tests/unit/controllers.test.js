const paymentController = require("../../src/controllers/paymentController");
const Payment = require("../../src/models/sequelize/payment");
const PaymentMethod = require("../../src/models/sequelize/paymentMethod");
const orderService = require("../../src/services/orderService");
const paymentGateway = require("../../src/services/paymentGateway");

describe("Payment Controller Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("processPayment", () => {
    test("should process payment successfully", async () => {
      req.params.orderId = "order-123";
      req.body = {
        paymentMethodId: "pm-1",
        customerInfo: { name: "Jan Kowalski" },
      };

      orderService.getOrderById.mockResolvedValue({
        id: "order-123",
        totalAmount: 25.99,
        status: "pending",
      });

      PaymentMethod.findByPk.mockResolvedValue({
        id: "pm-1",
        type: "card",
        name: "Karta kredytowa",
      });

      paymentGateway.processCardPayment.mockResolvedValue({
        success: true,
        transactionId: "txn-123",
      });

      Payment.create.mockResolvedValue({
        id: "payment-123",
        toJSON: () => ({ id: "payment-123", status: "completed" }),
      });

      await paymentController.processPayment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            payment: expect.any(Object),
          }),
        })
      );
    });

    test("should handle payment gateway failure", async () => {
      req.params.orderId = "order-123";
      req.body = { paymentMethodId: "pm-1" };

      orderService.getOrderById.mockResolvedValue({
        id: "order-123",
        totalAmount: 25.99,
      });

      PaymentMethod.findByPk.mockResolvedValue({
        id: "pm-1",
        type: "card",
      });

      paymentGateway.processCardPayment.mockResolvedValue({
        success: false,
        error: "Card declined",
      });

      await paymentController.processPayment(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
