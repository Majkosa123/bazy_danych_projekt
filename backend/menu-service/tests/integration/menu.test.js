// backend/menu-service/tests/integration/menu.test.js
const request = require("supertest");
const app = require("../../src/app");
const Product = require("../../src/models/sequelize/product");
const Category = require("../../src/models/sequelize/category");
const ProductDetail = require("../../src/models/mongoose/productDetail");

describe("Menu Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    Product.findAll.mockResolvedValue([
      {
        id: "1",
        name: "Big Mac",
        price: 15.99,
        categoryId: "1",
        isAvailable: true,
        toJSON: () => ({
          id: "1",
          name: "Big Mac",
          price: 15.99,
          categoryId: "1",
          isAvailable: true,
        }),
      },
    ]);

    Category.findAll.mockResolvedValue([
      {
        id: "1",
        name: "Burgery",
        description: "Nasze najlepsze burgery",
        isActive: true,
        toJSON: () => ({
          id: "1",
          name: "Burgery",
          description: "Nasze najlepsze burgery",
          isActive: true,
        }),
      },
    ]);
  });

  describe("GET /api/v1/categories", () => {
    test("should get all categories", async () => {
      const response = await request(app).get("/api/v1/categories");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe("Burgery");
    });
  });

  describe("GET /api/v1/products", () => {
    test("should get all products", async () => {
      const response = await request(app).get("/api/v1/products");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe("Big Mac");
    });
  });

  describe("GET /api/v1/products/category/:categoryId", () => {
    test("should get products by category", async () => {
      Product.findAll.mockResolvedValue([
        {
          id: "1",
          name: "Big Mac",
          categoryId: "1",
          toJSON: () => ({ id: "1", name: "Big Mac", categoryId: "1" }),
        },
      ]);

      const response = await request(app).get("/api/v1/products/category/1");

      expect(response.status).toBe(200);
      expect(Product.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: "1" }),
        })
      );
    });
  });

  describe("GET /api/v1/products/:productId", () => {
    test("should get product details by id", async () => {
      Product.findByPk.mockResolvedValue({
        id: "1",
        name: "Big Mac",
        price: 15.99,
        toJSON: () => ({
          id: "1",
          name: "Big Mac",
          price: 15.99,
        }),
      });

      ProductDetail.findOne.mockResolvedValue({
        productId: "1",
        ingredients: [
          { name: "wołowina", isAllergen: false },
          { name: "sałata", isAllergen: false },
        ],
        allergens: ["gluten"],
        nutritionalValues: {
          calories: 563,
          protein: 25,
          carbohydrates: 45,
          fat: 33,
        },
      });

      const response = await request(app).get("/api/v1/products/1");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.name).toBe("Big Mac");
      expect(response.body.data.details.ingredients).toHaveLength(2);
    });

    test("should return 404 for non-existent product", async () => {
      Product.findByPk.mockResolvedValue(null);

      const response = await request(app).get("/api/v1/products/999");

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
    });
  });

  describe("GET /api/v1/categories/:id", () => {
    test("should get category by id", async () => {
      Category.findByPk.mockResolvedValue({
        id: "1",
        name: "Burgery",
        description: "Nasze najlepsze burgery",
        isActive: true,
        toJSON: () => ({
          id: "1",
          name: "Burgery",
          description: "Nasze najlepsze burgery",
          isActive: true,
        }),
      });

      const response = await request(app).get("/api/v1/categories/1");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.name).toBe("Burgery");
    });

    test("should return 404 for non-existent category", async () => {
      Category.findByPk.mockResolvedValue(null);

      const response = await request(app).get("/api/v1/categories/999");

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("error");
    });
  });
});
