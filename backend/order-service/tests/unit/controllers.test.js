// backend/order-service/tests/unit/controllers.test.js

// Import mockowanych modeli (muszą być na górze!)
const Order = require("../../src/models/sequelize/order");
const OrderItem = require("../../src/models/sequelize/orderItem");
const OrderItemCustomization = require("../../src/models/mongoose/orderItemCustomization");
const menuService = require("../../src/services/menuService");

// Mock menuService
jest.mock("../../src/services/menuService");

// Import kontrolera PO mockach
const orderController = require("../../src/controllers/orderController");

describe("Order Controller Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      userId: "test-user-123",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Reset wszystkich mocków przed każdym testem
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    test("should create order successfully", async () => {
      req.body = {
        userId: "test-user-123",
      };

      // Mock bazy danych
      Order.create.mockResolvedValue({
        id: "order-123",
        userId: "test-user-123",
        status: "cart",
        toJSON: () => ({
          id: "order-123",
          userId: "test-user-123",
          status: "cart",
        }),
      });

      await orderController.createOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Utworzono nowe zamówienie",
        })
      );
    });

    test("should handle database error", async () => {
      req.body = {
        userId: "test-user-123",
      };

      Order.create.mockRejectedValue(new Error("Database error"));

      await orderController.createOrder(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("getOrderById", () => {
    test("should get order successfully", async () => {
      req.params.id = "order-123";

      const mockOrder = {
        id: "order-123",
        totalAmount: 25.5,
        status: "cart",
        OrderItems: [
          {
            id: "item-1",
            productId: "prod-1",
            quantity: 2,
            unitPrice: 12.75,
            toJSON: () => ({
              id: "item-1",
              productId: "prod-1",
              quantity: 2,
              unitPrice: 12.75,
            }),
          },
        ],
        toJSON: () => ({
          id: "order-123",
          totalAmount: 25.5,
          status: "cart",
        }),
      };

      Order.findByPk.mockResolvedValue(mockOrder);
      OrderItemCustomization.find.mockResolvedValue([]);

      await orderController.getOrderById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: expect.any(Object),
        })
      );
    });

    test("should handle order not found", async () => {
      req.params.id = "nonexistent-order";

      Order.findByPk.mockResolvedValue(null);

      await orderController.getOrderById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nie znaleziono zamówienia o podanym ID",
          statusCode: 404,
        })
      );
    });
  });

  describe("addItemToOrder", () => {
    test("should add item to order successfully", async () => {
      req.params.orderId = "order-123";
      req.body = {
        productId: "prod-1",
        quantity: 2,
        customizations: [],
        specialInstructions: "No onions",
      };

      const mockOrder = {
        id: "order-123",
        totalAmount: 10.0,
        update: jest.fn().mockResolvedValue(true),
      };

      const mockProduct = {
        id: "prod-1",
        name: "Big Mac",
        price: 15.99,
        isAvailable: true,
      };

      const mockOrderItem = {
        id: "item-1",
        orderId: "order-123",
        productId: "prod-1",
        quantity: 2,
        unitPrice: 15.99,
        totalPrice: 31.98,
      };

      Order.findByPk.mockResolvedValue(mockOrder);
      menuService.getProductById.mockResolvedValue(mockProduct);
      OrderItem.create.mockResolvedValue(mockOrderItem);
      OrderItemCustomization.create.mockResolvedValue({});

      // Mock transakcji
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      const { sequelize } = require("../../src/config/database");
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await orderController.addItemToOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Dodano pozycję do zamówienia",
        })
      );
    });

    test("should handle unavailable product", async () => {
      req.params.orderId = "order-123";
      req.body = {
        productId: "prod-unavailable",
        quantity: 1,
      };

      const mockOrder = {
        id: "order-123",
        totalAmount: 10.0,
      };

      const mockProduct = {
        id: "prod-unavailable",
        name: "Unavailable Product",
        price: 15.99,
        isAvailable: false,
      };

      Order.findByPk.mockResolvedValue(mockOrder);
      menuService.getProductById.mockResolvedValue(mockProduct);

      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      const { sequelize } = require("../../src/config/database");
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await orderController.addItemToOrder(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Ten produkt nie jest obecnie dostępny",
          statusCode: 400,
        })
      );
    });
  });

  describe("updateOrderStatus", () => {
    test("should update order status successfully", async () => {
      req.params.orderId = "order-123";
      req.body.status = "pending";

      const mockOrder = {
        id: "order-123",
        status: "cart",
        update: jest.fn().mockResolvedValue({
          id: "order-123",
          status: "pending",
        }),
      };

      Order.findByPk.mockResolvedValue(mockOrder);

      await orderController.updateOrderStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Zaktualizowano status zamówienia",
        })
      );
    });

    test("should handle order not found for status update", async () => {
      req.params.orderId = "nonexistent-order";
      req.body.status = "pending";

      Order.findByPk.mockResolvedValue(null);

      await orderController.updateOrderStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nie znaleziono zamówienia o podanym ID",
          statusCode: 404,
        })
      );
    });
  });

  describe("removeItemFromOrder", () => {
    test("should handle order not found for item removal", async () => {
      req.params.orderId = "nonexistent-order";
      req.params.itemId = "item-1";

      Order.findByPk.mockResolvedValue(null);

      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      const { sequelize } = require("../../src/config/database");
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await orderController.removeItemFromOrder(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nie znaleziono zamówienia o podanym ID",
          statusCode: 404,
        })
      );
    });
  });
});
