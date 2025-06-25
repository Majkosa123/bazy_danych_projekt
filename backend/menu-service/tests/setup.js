// backend/menu-service/tests/setup.js

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

// Mock Product model (Sequelize)
jest.mock("../src/models/sequelize/product", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  findOne: jest.fn(),
}));

// Mock Category model (Sequelize)
jest.mock("../src/models/sequelize/category", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

// Mock ProductDetail model (MongoDB) - bez 's' na końcu!
jest.mock("../src/models/mongoose/productDetail", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
}));

// Suppress console errors in tests
global.console.error = jest.fn();

// Setup environment variables
process.env.NODE_ENV = "test";

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
