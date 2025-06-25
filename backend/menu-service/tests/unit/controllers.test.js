const productController = require("../../src/controllers/productController");
const categoryController = require("../../src/controllers/categoryController");
const Product = require("../../src/models/sequelize/product");
const Category = require("../../src/models/sequelize/category");

describe("Menu Controller Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("productController", () => {
    describe("getAllProducts", () => {
      test("should return all products successfully", async () => {
        Product.findAll.mockResolvedValue([
          {
            id: "1",
            name: "Big Mac",
            toJSON: () => ({ id: "1", name: "Big Mac" }),
          },
        ]);

        await productController.getAllProducts(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "success",
            results: 1,
            data: expect.arrayContaining([
              expect.objectContaining({ name: "Big Mac" }),
            ]),
          })
        );
      });

      test("should handle database errors", async () => {
        Product.findAll.mockRejectedValue(new Error("Database error"));

        await productController.getAllProducts(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    describe("getProductsByCategory", () => {
      test("should return products for specific category", async () => {
        req.params.categoryId = "1";

        Product.findAll.mockResolvedValue([
          {
            id: "1",
            name: "Big Mac",
            categoryId: "1",
            toJSON: () => ({ id: "1", name: "Big Mac", categoryId: "1" }),
          },
        ]);

        await productController.getProductsByCategory(req, res, next);

        expect(Product.findAll).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { categoryId: "1" },
          })
        );
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    describe("getProductDetails", () => {
      test("should return product with details", async () => {
        req.params.productId = "1";

        Product.findByPk.mockResolvedValue({
          id: "1",
          name: "Big Mac",
          toJSON: () => ({ id: "1", name: "Big Mac" }),
        });

        await productController.getProductDetails(req, res, next);

        expect(Product.findByPk).toHaveBeenCalledWith("1", expect.any(Object));
        expect(res.status).toHaveBeenCalledWith(200);
      });

      test("should return 404 for non-existent product", async () => {
        req.params.productId = "999";
        Product.findByPk.mockResolvedValue(null);

        await productController.getProductDetails(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 404,
            message: "Nie znaleziono produktu o podanym ID",
          })
        );
      });
    });
  });

  describe("categoryController", () => {
    describe("getAllCategories", () => {
      test("should return all active categories", async () => {
        Category.findAll.mockResolvedValue([
          {
            id: "1",
            name: "Burgery",
            isActive: true,
            toJSON: () => ({ id: "1", name: "Burgery", isActive: true }),
          },
        ]);

        await categoryController.getAllCategories(req, res, next);

        expect(Category.findAll).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { isActive: true },
          })
        );
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });

    describe("getCategoryById", () => {
      test("should return category by id", async () => {
        req.params.id = "1";
        Category.findByPk.mockResolvedValue({
          id: "1",
          name: "Burgery",
          toJSON: () => ({ id: "1", name: "Burgery" }),
        });

        await categoryController.getCategoryById(req, res, next);

        expect(Category.findByPk).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
      });
    });
  });
});
