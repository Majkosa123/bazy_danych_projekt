const jwt = require("jsonwebtoken");
const { serviceAuthOnly } = require("../../src/middlewares/serviceAuth");

describe("Middleware Tests", () => {
  describe("serviceAuthOnly", () => {
    test("should allow access with valid service key", () => {
      const req = {
        headers: { "x-service-auth": "secret_service_key_12345" },
      };
      const res = {};
      const next = jest.fn();

      process.env.SYSTEM_JWT_TOKEN = "secret_service_key_12345";

      serviceAuthOnly(req, res, next);

      expect(req.isServiceCall).toBe(true);
      expect(next).toHaveBeenCalledWith();
    });

    test("should deny access with invalid service key", () => {
      const req = {
        headers: { "x-service-auth": "wrong_key" },
      };
      const res = {};
      const next = jest.fn();

      process.env.SYSTEM_JWT_TOKEN = "secret_service_key_12345";

      serviceAuthOnly(req, res, next);

      expect(req.isServiceCall).toBeUndefined();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Dostęp tylko dla serwisów systemowych",
          statusCode: 403,
        })
      );
    });
  });
});
