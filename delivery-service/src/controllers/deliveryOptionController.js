const DeliveryOption = require("../models/sequelize/deliveryOption");

exports.getAllDeliveryOptions = async (req, res, next) => {
  try {
    const deliveryOptions = await DeliveryOption.findAll({
      where: { isActive: true },
    });

    res.status(200).json({
      status: "success",
      results: deliveryOptions.length,
      data: deliveryOptions,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDeliveryOptionById = async (req, res, next) => {
  try {
    const deliveryOption = await DeliveryOption.findByPk(req.params.id);

    if (!deliveryOption) {
      const error = new Error("Nie znaleziono opcji dostawy o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: deliveryOption,
    });
  } catch (error) {
    next(error);
  }
};

exports.createDeliveryOption = async (req, res, next) => {
  try {
    const deliveryOption = await DeliveryOption.create(req.body);

    res.status(201).json({
      status: "success",
      message: "Utworzono nową opcję dostawy",
      data: deliveryOption,
    });
  } catch (error) {
    next(error);
  }
};
