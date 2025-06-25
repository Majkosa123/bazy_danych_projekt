// Mock database connections
jest.mock("../src/config/database", () => ({
  sequelize: {
    define: jest.fn(() => ({
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    })),
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
    sync: jest.fn().mockResolvedValue(),
    authenticate: jest.fn().mockResolvedValue(),
  },
  connect: jest.fn().mockResolvedValue(),
  mongoose: {
    connect: jest.fn().mockResolvedValue(),
  },
}));

// Mock Order model
jest.mock("../src/models/sequelize/order", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

// Mock OrderItem model
jest.mock("../src/models/sequelize/orderItem", () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
  update: jest.fn(),
}));

// Mock OrderCustomizations (MongoDB)
jest.mock("../src/models/mongoose/orderCustomizations", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn(),
}));

// Mock external services
jest.mock("../src/services/menuService", () => ({
  getProductById: jest.fn(),
  checkProductAvailability: jest.fn(),
}));

// Mock axios
jest.mock("axios", () => ({
  get: jest
    .fn()
    .mockResolvedValue({ data: { data: { id: "1", name: "Product" } } }),
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
  patch: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

global.console.error = jest.fn();
process.env.NODE_ENV = "test";

beforeEach(() => {
  jest.clearAllMocks();
});

// backend/order-service/tests/integration/orders.test.js
const request = require("supertest");
const app = require("../../src/app");
const Order = require("../../src/models/sequelize/order");
const OrderItem = require("../../src/models/sequelize/orderItem");
const menuService = require("../../src/services/menuService");

describe("Orders Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    Order.create.mockResolvedValue({
      id: "order-123",
      userId: null,
      totalAmount: 0,
      status: "cart",
      toJSON: () => ({
        id: "order-123",
        userId: null,
        totalAmount: 0,
        status: "cart",
      }),
    });

    Order.findByPk.mockResolvedValue({
      id: "order-123",
      status: "cart",
      totalAmount: 15.99,
      toJSON: () => ({
        id: "order-123",
        status: "cart",
        totalAmount: 15.99,
      }),
    });

    menuService.getProductById.mockResolvedValue({
      id: "product-1",
      name: "Big Mac",
      basePrice: 15.99,
      isAvailable: true,
    });

    menuService.checkProductAvailability.mockResolvedValue(true);
  });

  describe("POST /api/v1/orders", () => {
    test("should create new order", async () => {
      const response = await request(app)
        .post("/api/v1/orders")
        .send({ userId: null });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.id).toBe("order-123");
      expect(response.body.data.status).toBe("cart");
    });
  });

  describe("GET /api/v1/orders/:id", () => {
    test("should get order by id", async () => {
      const response = await request(app).get("/api/v1/orders/order-123");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.id).toBe("order-123");
    });

    test("should return 404 for non-existent order", async () => {
      Order.findByPk.mockResolvedValue(null);

      const response = await request(app).get("/api/v1/orders/non-existent");

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/v1/orders/:orderId/items", () => {
    test("should add item to order", async () => {
      OrderItem.create.mockResolvedValue({
        id: "item-1",
        orderId: "order-123",
        productId: "product-1",
        quantity: 2,
        unitPrice: 15.99,
        toJSON: () => ({
          id: "item-1",
          orderId: "order-123",
          productId: "product-1",
          quantity: 2,
          unitPrice: 15.99,
        }),
      });

      const itemData = {
        productId: "product-1",
        quantity: 2,
        customizations: [],
      };

      const response = await request(app)
        .post("/api/v1/orders/order-123/items")
        .send(itemData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.productId).toBe("product-1");
      expect(response.body.data.quantity).toBe(2);
    });

    test("should reject unavailable product", async () => {
      menuService.checkProductAvailability.mockResolvedValue(false);

      const itemData = {
        productId: "unavailable-product",
        quantity: 1,
      };

      const response = await request(app)
        .post("/api/v1/orders/order-123/items")
        .send(itemData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("niedostępny");
    });
  });

  describe("PATCH /api/v1/orders/:id/status", () => {
    test("should update order status", async () => {
      Order.update.mockResolvedValue([1]);
      Order.findByPk.mockResolvedValue({
        id: "order-123",
        status: "pending",
        toJSON: () => ({ id: "order-123", status: "pending" }),
      });

      const response = await request(app)
        .patch("/api/v1/orders/order-123/status")
        .send({ status: "pending" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
    });

    test("should reject invalid status", async () => {
      const response = await request(app)
        .patch("/api/v1/orders/order-123/status")
        .send({ status: "invalid-status" });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe("error");
    });
  });
});
