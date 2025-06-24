jest.mock("../src/config/database", () => ({
  sequelize: {
    define: jest.fn(() => ({
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    })),
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
    sync: jest.fn(),
  },
  connect: jest.fn(),
}));

// Mock User model
jest.mock("../src/models/sequelize/user", () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}));

// Mock LoyaltyPointsHistory
jest.mock("../src/models/sequelize/loyaltyPointsHistory", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
}));

// Mock UserPreferences (MongoDB)
jest.mock("../src/models/mongoose/userPreferences", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

// Mock Feedback (MongoDB)
jest.mock("../src/models/mongoose/feedback", () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => "hashedpassword"),
  compare: jest.fn(() => true),
}));

// Mock JWT
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fake-jwt-token"),
  verify: jest.fn(() => ({ userId: "test-user-id", email: "test@test.com" })),
}));

// Suppress console.error in tests
global.console.error = jest.fn();
