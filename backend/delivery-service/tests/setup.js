// backend/delivery-service/tests/setup.js

// Mock modeli Sequelize
jest.mock("../src/models/sequelize/deliveryOption", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../src/models/sequelize/table", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../src/models/sequelize/orderDelivery", () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

// Mock mongoose
jest.mock("../src/models/mongoose/deliveryAddress", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

// Mock orderService (wywołania do order-service)
jest.mock("../src/services/orderService", () => ({
  getOrderById: jest.fn(),
  updateOrderStatus: jest.fn(),
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

process.env.NODE_ENV = "test";
process.env.DB_HOST = "localhost";
process.env.DB_NAME = "test_delivery";
process.env.ORDER_SERVICE_URL = "http://localhost:3002/api/v1";

beforeEach(() => {
  jest.clearAllMocks();
});

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
