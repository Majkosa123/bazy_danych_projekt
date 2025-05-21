const PaymentMethod = require("../models/sequelize/paymentMethod");

exports.getAllPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = await PaymentMethod.findAll({
      where: { isActive: true },
    });

    res.status(200).json({
      status: "success",
      results: paymentMethods.length,
      data: paymentMethods,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentMethodById = async (req, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.findByPk(req.params.id);

    if (!paymentMethod) {
      const error = new Error("Nie znaleziono metody płatności o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: paymentMethod,
    });
  } catch (error) {
    next(error);
  }
};
