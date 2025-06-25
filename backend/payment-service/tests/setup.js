// backend/payment-service/tests/setup.js

// Mock modeli Sequelize
jest.mock("../src/models/sequelize/payment", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../src/models/sequelize/paymentMethod", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../src/models/sequelize/promoCode", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  increment: jest.fn(),
}));

// Mock modeli mongoose
jest.mock("../src/models/mongoose/paymentReceipt", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
}));

// Mock zewnętrznych serwisów
jest.mock("../src/services/orderService", () => ({
  getOrderById: jest.fn(),
  updateOrderStatus: jest.fn(),
}));

jest.mock("../src/services/paymentGateway", () => ({
  processPayment: jest.fn(),
}));

jest.mock("../src/services/userService", () => ({
  addLoyaltyPoints: jest.fn(),
}));

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

// Mock bazy danych
jest.mock("../src/config/database", () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    transaction: jest.fn().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    }),
  },
  connect: jest.fn().mockResolvedValue(true),
}));

// Zmienne środowiskowe dla testów
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.ORDER_SERVICE_URL = "http://localhost:3002/api/v1";

// Globalne przed każdym testem
beforeEach(() => {
  jest.clearAllMocks();
});

// Wyłącz logi podczas testów
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
