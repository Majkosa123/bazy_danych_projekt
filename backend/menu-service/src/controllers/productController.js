const Product = require("../models/sequelize/product");
const Category = require("../models/sequelize/category");
const ProductDetail = require("../models/mongoose/productDetail");

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
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

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    // Pokazuje WSZYSTKIE produkty w kategorii (dostępne i niedostępne)
    const products = await Product.findAll({
      where: {
        categoryId: categoryId,
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

exports.getProductDetails = async (req, res, next) => {
  try {
    const { productId } = req.params;

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

    const productDetails = await ProductDetail.findOne({
      productId: productId,
    });

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
