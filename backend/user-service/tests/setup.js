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
    sync: jest.fn().mockResolvedValue(),
    authenticate: jest.fn().mockResolvedValue(),
  },
  connect: jest.fn().mockResolvedValue(),
  mongoose: {
    connect: jest.fn().mockResolvedValue(),
  },
}));

// Mock User model user
jest.mock("../src/models/sequelize/user", () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  sync: jest.fn().mockResolvedValue(),
}));

// Mock LoyaltyPointsHistory
jest.mock("../src/models/sequelize/loyaltyPointsHistory", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  sync: jest.fn().mockResolvedValue(),
}));

// Mock SpecialOffer
jest.mock("../src/models/sequelize/specialOffer", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  sync: jest.fn().mockResolvedValue(),
}));

// Mock UserPreferences (MongoDB)
jest.mock("../src/models/mongoose/userPreferences", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
}));

// Mock Feedback (MongoDB)
jest.mock("../src/models/mongoose/feedback", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashedpassword"),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock JWT z dodatkowym middleware mock
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("fake-jwt-token"),
  verify: jest
    .fn()
    .mockReturnValue({ userId: "test-user-id", email: "test@test.com" }),
}));

// Mock authentication middleware
jest.mock("../src/middlewares/auth", () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.userId = "test-user-id";
    next();
  }),
}));

// Mock service auth middleware
jest.mock("../src/middlewares/serviceAuth", () => ({
  serviceAuthOnly: jest.fn((req, res, next) => {
    req.isServiceCall = true;
    next();
  }),
}));

jest.mock("axios", () => ({
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
  get: jest.fn().mockResolvedValue({ data: { success: true } }),
}));

global.console.error = jest.fn();

process.env.JWT_SECRET = "test_jwt_secret";
process.env.JWT_EXPIRES_IN = "24h";
process.env.SYSTEM_JWT_TOKEN = "secret_service_key_12345";
process.env.NODE_ENV = "test";

beforeEach(() => {
  jest.clearAllMocks();
});
