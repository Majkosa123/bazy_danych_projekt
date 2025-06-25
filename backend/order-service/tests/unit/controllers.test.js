const orderController = require("../../src/controllers/orderController");
const Order = require("../../src/models/sequelize/order");

describe("Order Controller Tests", () => {
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

  describe("createOrder", () => {
    test("should create order successfully", async () => {
      Order.create.mockResolvedValue({
        id: "order-123",
        toJSON: () => ({ id: "order-123", status: "cart" }),
      });

      await orderController.createOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({ id: "order-123" }),
        })
      );
    });
  });

  describe("getOrderById", () => {
    test("should get order by id", async () => {
      req.params.id = "order-123";
      Order.findByPk.mockResolvedValue({
        id: "order-123",
        toJSON: () => ({ id: "order-123" }),
      });

      await orderController.getOrderById(req, res, next);

      expect(Order.findByPk).toHaveBeenCalledWith(
        "order-123",
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should handle non-existent order", async () => {
      req.params.id = "non-existent";
      Order.findByPk.mockResolvedValue(null);

      await orderController.getOrderById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: "Nie znaleziono zamówienia",
        })
      );
    });
  });
});
