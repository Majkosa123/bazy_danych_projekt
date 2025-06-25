// backend/order-service/tests/setup.js

// Mock modeli Sequelize
jest.mock("../src/models/sequelize/order", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../src/models/sequelize/orderItem", () => ({
  create: jest.fn(),
  bulkCreate: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  destroy: jest.fn(),
}));

// Mock axios
jest.mock("axios");

// Mock mongoose
jest.mock("mongoose", () => ({
  Schema: class MockSchema {
    constructor(definition) {
      this.definition = definition;
    }
  },
  model: jest.fn(() => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  })),
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    readyState: 1,
  },
}));

// Mock modeli mongoose
jest.mock("../src/models/mongoose/orderItemCustomization", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
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
process.env.DB_HOST = "localhost";
process.env.DB_NAME = "test_orders";
process.env.DB_USER = "test";
process.env.DB_PASSWORD = "test";

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
