const Category = require("../models/sequelize/category");

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
    });

    res.status(200).json({
      status: "success",
      results: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      const error = new Error("Nie znaleziono kategorii o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
