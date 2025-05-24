const PromoCode = require("../models/sequelize/promoCode");
const orderService = require("../services/orderService");

exports.validatePromoCode = async (req, res, next) => {
  try {
    const { code, orderId } = req.body;

    const promoCode = await PromoCode.findOne({
      where: {
        code,
        isActive: true,
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() },
      },
    });

    if (!promoCode) {
      const error = new Error("Nieprawidłowy kod promocyjny lub kod wygasł");
      error.statusCode = 400;
      return next(error);
    }

    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      const error = new Error("Kod promocyjny osiągnął limit użycia");
      error.statusCode = 400;
      return next(error);
    }

    const order = await orderService.getOrderById(orderId);

    if (parseFloat(order.totalAmount) < parseFloat(promoCode.minOrderValue)) {
      const error = new Error(
        `Minimalna wartość zamówienia dla tego kodu to ${
          promoCode.minOrderValue
        } ${order.currency || "PLN"}`
      );
      error.statusCode = 400;
      return next(error);
    }

    let discountAmount = 0;
    if (promoCode.discountType === "percentage") {
      discountAmount =
        (parseFloat(order.totalAmount) * parseFloat(promoCode.discountValue)) /
        100;
    } else {
      discountAmount = parseFloat(promoCode.discountValue);
    }

    discountAmount = Math.min(discountAmount, parseFloat(order.totalAmount));

    res.status(200).json({
      status: "success",
      message: "Kod promocyjny jest prawidłowy",
      data: {
        promoCode,
        discountAmount,
        finalAmount: parseFloat(order.totalAmount) - discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};
