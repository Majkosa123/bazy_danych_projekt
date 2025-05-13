const Product = require("../models/sequelize/product");
const Category = require("../models/sequelize/category");
const ProductDetail = require("../models/mongoose/productDetail");

// Pobierz wszystkie produkty
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ["id", "name"], // Wybierz tylko potrzebne pola
        },
      ],
    });

    res.status(200).json({
      status: "success",
      results: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Pobierz produkty z określonej kategorii
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.findAll({
      where: {
        categoryId,
        isAvailable: true, // Tylko dostępne produkty
      },
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      results: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Pobierz szczegóły produktu (łącząc dane z PostgreSQL i MongoDB)
exports.getProductDetails = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Znajdź produkt w PostgreSQL
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!product) {
      const error = new Error("Nie znaleziono produktu o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    // Znajdź szczegóły w MongoDB
    const productDetails = await ProductDetail.findOne({
      productId: productId,
    });

    // Połącz dane i zwróć odpowiedź
    res.status(200).json({
      status: "success",
      data: {
        ...product.toJSON(),
        details: productDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};
