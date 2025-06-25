// Mock database connections
jest.mock("../src/config/database", () => ({
  sequelize: {
    define: jest.fn(() => ({
      findOne: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

// Mock Payment models
jest.mock("../src/models/sequelize/payment", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock("../src/models/sequelize/paymentMethod", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../src/models/sequelize/promoCode", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}));

// Mock PaymentReceipt (MongoDB)
jest.mock("../src/models/mongoose/paymentReceipt", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

// Mock external services
jest.mock("../src/services/orderService", () => ({
  getOrderById: jest.fn(),
  updateOrderStatus: jest.fn(),
}));

jest.mock("../src/services/paymentGateway", () => ({
  processCardPayment: jest.fn(),
  processCashPayment: jest.fn(),
}));

jest.mock("../src/services/userService", () => ({
  addLoyaltyPointsForOrder: jest.fn(),
}));

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("fake-jwt-token"),
  verify: jest.fn().mockReturnValue({ userId: "test-user-id" }),
}));

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({ data: { data: { id: "order-1" } } }),
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
  patch: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

global.console.error = jest.fn();
global.console.log = jest.fn();
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

beforeEach(() => {
  jest.clearAllMocks();
});
