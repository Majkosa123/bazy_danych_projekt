const userController = require("../../src/controllers/userController");
const User = require("../../src/models/sequelize/user");
const UserPreferences = require("../../src/models/mongoose/userPreferences");
const LoyaltyPointsHistory = require("../../src/models/sequelize/loyaltyPointsHistory");

describe("User Controller Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, userId: "test-user-id" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("register", () => {
    test("should register user successfully", async () => {
      req.body = {
        email: "test@test.com",
        password: "haslo123",
        firstName: "Jan",
        lastName: "Kowalski",
      };

      // Mock successful responses
      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockResolvedValue({
        id: "test-user-id",
        email: "test@test.com",
        firstName: "Jan",
        toJSON: () => ({
          id: "test-user-id",
          email: "test@test.com",
          firstName: "Jan",
          loyaltyPoints: 50,
        }),
      });
      User.findByPk.mockResolvedValue({
        toJSON: () => ({
          id: "test-user-id",
          email: "test@test.com",
          firstName: "Jan",
          loyaltyPoints: 50,
        }),
      });
      User.update.mockResolvedValue([1]);
      LoyaltyPointsHistory.create.mockResolvedValue({});
      UserPreferences.create.mockResolvedValue({});

      await userController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            user: expect.objectContaining({
              email: "test@test.com",
            }),
            token: "fake-jwt-token",
          }),
        })
      );
    });

    test("should reject duplicate email", async () => {
      req.body = {
        email: "existing@test.com",
        password: "haslo123",
        firstName: "Jan",
        lastName: "Kowalski",
      };

      User.findOne.mockResolvedValue({ email: "existing@test.com" });

      await userController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Użytkownik z tym adresem email już istnieje",
          statusCode: 400,
        })
      );
    });
  });

  describe("login", () => {
    test("should login successfully", async () => {
      req.body = {
        email: "test@test.com",
        password: "haslo123",
      };

      User.findOne.mockResolvedValue({
        id: "test-user-id",
        email: "test@test.com",
        passwordHash: "hashedpassword",
        toJSON: () => ({
          id: "test-user-id",
          email: "test@test.com",
        }),
      });
      User.update.mockResolvedValue([1]);

      await userController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({
            token: "fake-jwt-token",
          }),
        })
      );
    });

    test("should reject invalid email", async () => {
      req.body = {
        email: "wrong@test.com",
        password: "haslo123",
      };

      User.findOne.mockResolvedValue(null);

      await userController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Nieprawidłowy email lub hasło",
          statusCode: 401,
        })
      );
    });
  });
});
