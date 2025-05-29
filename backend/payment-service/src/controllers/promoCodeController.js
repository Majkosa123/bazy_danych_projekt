const PromoCode = require("../models/sequelize/promoCode");
const orderService = require("../services/orderService");
const { Op } = require("sequelize");

exports.validatePromoCode = async (req, res, next) => {
  try {
    const { code, orderId, totalAmount } = req.body;

    console.log("🎟️ Validating promo code:", { code, orderId, totalAmount });

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

    let orderTotal;
    if (orderId === "temp-validation" && totalAmount) {
      orderTotal = parseFloat(totalAmount);
    } else {
      const order = await orderService.getOrderById(orderId);
      orderTotal = parseFloat(order.totalAmount);
    }

    if (orderTotal < parseFloat(promoCode.minOrderValue)) {
      const error = new Error(
        `Minimalna wartość zamówienia dla tego kodu to ${promoCode.minOrderValue} PLN`
      );
      error.statusCode = 400;
      return next(error);
    }

    let discountAmount = 0;
    if (promoCode.discountType === "percentage") {
      discountAmount = (orderTotal * parseFloat(promoCode.discountValue)) / 100;
    } else {
      discountAmount = parseFloat(promoCode.discountValue);
    }

    discountAmount = Math.min(discountAmount, orderTotal);
    const finalAmount = orderTotal - discountAmount;

    res.status(200).json({
      status: "success",
      message: "Kod promocyjny jest prawidłowy",
      data: {
        promoCode: {
          id: promoCode.id,
          code: promoCode.code,
          discountType: promoCode.discountType,
          discountValue: promoCode.discountValue,
          description: getPromoDescription(promoCode),
        },
        discountAmount,
        finalAmount,
        originalAmount: orderTotal,
        savings: discountAmount,
      },
    });
  } catch (error) {
    console.error("❌ Promo code validation error:", error);
    next(error);
  }
};

const getPromoDescription = (promoCode) => {
  const discountText =
    promoCode.discountType === "percentage"
      ? `${promoCode.discountValue}%`
      : `${promoCode.discountValue} zł`;

  const descriptions = {
    WELCOME10: `Rabat powitalny ${discountText} dla nowych klientów`,
    FIXED20: `Stały rabat ${discountText} od zamówienia`,
    SUMMER25: `Letnia promocja ${discountText} rabatu`,
  };

  return descriptions[promoCode.code] || `Rabat ${discountText}`;
};
