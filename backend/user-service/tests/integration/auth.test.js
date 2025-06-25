const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/sequelize/user");
const LoyaltyPointsHistory = require("../../src/models/sequelize/loyaltyPointsHistory");
const UserPreferences = require("../../src/models/mongoose/userPreferences");

describe("Authentication Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks for each test
    User.findOne.mockResolvedValue(null); // No existing user by default
    User.create.mockResolvedValue({
      id: "test-user-id",
      email: "test@test.com",
      firstName: "Jan",
      lastName: "Kowalski",
      loyaltyPoints: 0,
      toJSON: () => ({
        id: "test-user-id",
        email: "test@test.com",
        firstName: "Jan",
        lastName: "Kowalski",
        loyaltyPoints: 50,
      }),
    });
    User.findByPk.mockResolvedValue({
      id: "test-user-id",
      email: "test@test.com",
      firstName: "Jan",
      lastName: "Kowalski",
      loyaltyPoints: 50,
      toJSON: () => ({
        id: "test-user-id",
        email: "test@test.com",
        firstName: "Jan",
        lastName: "Kowalski",
        loyaltyPoints: 50,
      }),
    });
    User.update.mockResolvedValue([1]);
    LoyaltyPointsHistory.create.mockResolvedValue({});
    UserPreferences.create.mockResolvedValue({});
  });

  describe("POST /api/v1/users/register", () => {
    test("should register new user successfully", async () => {
      const userData = {
        email: `test${Date.now()}@test.com`,
        password: "haslo123",
        firstName: "Jan",
        lastName: "Kowalski",
      };

      const response = await request(app)
        .post("/api/v1/users/register")
        .send(userData);

      // Debug - sprawdź odpowiedź jeśli test nie przechodzi
      if (response.status !== 201) {
        console.log("Response status:", response.status);
        console.log("Response body:", response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe("test@test.com");
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.loyaltyPoints).toBe(50);
    });

    test("should reject duplicate email", async () => {
      const userData = {
        email: "duplicate@test.com",
        password: "haslo123",
        firstName: "Jan",
        lastName: "Kowalski",
      };

      // pierwszy raz - rejestracja powinna się udać
      const firstResponse = await request(app)
        .post("/api/v1/users/register")
        .send(userData);

      expect(firstResponse.status).toBe(201);

      // użytkownik już istnieje
      User.findOne.mockResolvedValue({ email: "duplicate@test.com" });

      // drugi raz - powinno się nie udać bo duplikat email
      const secondResponse = await request(app)
        .post("/api/v1/users/register")
        .send(userData);

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.body.status).toBe("error");
      expect(secondResponse.body.message).toContain("już istnieje");
    });
  });

  describe("POST /api/v1/users/login", () => {
    test("should login with correct credentials", async () => {
      // rejstracja
      const userData = {
        email: `login${Date.now()}@test.com`,
        password: "haslo123",
        firstName: "Jan",
        lastName: "Kowalski",
      };

      const registerResponse = await request(app)
        .post("/api/v1/users/register")
        .send(userData);

      expect(registerResponse.status).toBe(201);

      // użytkownik istnieje
      User.findOne.mockResolvedValue({
        id: "test-user-id",
        email: userData.email,
        passwordHash: "hashedpassword",
        toJSON: () => ({
          id: "test-user-id",
          email: userData.email,
          firstName: "Jan",
          lastName: "Kowalski",
          loyaltyPoints: 50,
        }),
      });

      // logowanie się
      const loginResponse = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: userData.email,
          password: userData.password,
        });

      if (loginResponse.status !== 200) {
        console.log("Login failed:", loginResponse.body);
      }

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.status).toBe("success");
      expect(loginResponse.body.data.token).toBeDefined();
    });

    test("should reject wrong password", async () => {
      // użytkownik istnieje
      User.findOne.mockResolvedValue({
        id: "test-user-id",
        email: "test@test.com",
        passwordHash: "hashedpassword",
        toJSON: () => ({
          id: "test-user-id",
          email: "test@test.com",
        }),
      });

      // Zmiama mock bcrypt.compare żeby zwrócił false dla złego hasła
      const bcrypt = require("bcryptjs");
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app).post("/api/v1/users/login").send({
        email: "test@test.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("error");
    });

    test("should reject non-existent email", async () => {
      // brak użytkownika
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post("/api/v1/users/login").send({
        email: "nonexistent@test.com",
        password: "haslo123",
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("error");
    });
  });
});
