const request = require("supertest");
const app = require("../../src/app");

describe("Authentication Integration Tests", () => {
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
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe(userData.email);
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

      // Pierwszy raz - powinno się udać
      await request(app)
        .post("/api/v1/users/register")
        .send(userData)
        .expect(201);

      // Drugi raz - powinno się nie udać
      const response = await request(app)
        .post("/api/v1/users/register")
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("już istnieje");
    });
  });

  describe("POST /api/v1/users/login", () => {
    test("should login with correct credentials", async () => {
      // Najpierw zarejestruj
      const userData = {
        email: `login${Date.now()}@test.com`,
        password: "haslo123",
        firstName: "Jan",
        lastName: "Kowalski",
      };

      await request(app).post("/api/v1/users/register").send(userData);

      // Potem zaloguj
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.token).toBeDefined();
    });

    test("should reject wrong password", async () => {
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "test@test.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });
});
