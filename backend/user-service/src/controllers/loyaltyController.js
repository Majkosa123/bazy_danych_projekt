const User = require("../models/sequelize/user");
const LoyaltyPointsHistory = require("../models/sequelize/loyaltyPointsHistory");
const SpecialOffer = require("../models/sequelize/specialOffer");
const { sequelize } = require("../config/database");

exports.getLoyaltyPoints = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: [
        "id",
        "firstName",
        "lastName",
        "loyaltyPoints",
        "totalSpent",
      ],
    });

    if (!user) {
      const error = new Error("Nie znaleziono użytkownika");
      error.statusCode = 404;
      return next(error);
    }

    const pointsHistory = await LoyaltyPointsHistory.findAll({
      where: { userId: req.userId },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    res.status(200).json({
      status: "success",
      data: {
        currentPoints: user.loyaltyPoints,
        totalSpent: user.totalSpent,
        history: pointsHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.addLoyaltyPointsServiceOnly = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { pointsChange, type, orderId, description, userId } = req.body;

    if (!userId) {
      const error = new Error("Brak identyfikatora użytkownika");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      const error = new Error("Nie znaleziono użytkownika");
      error.statusCode = 404;
      return next(error);
    }

    if (pointsChange < 0 && Math.abs(pointsChange) > user.loyaltyPoints) {
      const error = new Error(
        "Niewystarczająca liczba punktów lojalnościowych"
      );
      error.statusCode = 400;
      return next(error);
    }

    await LoyaltyPointsHistory.create(
      {
        userId,
        pointsChange,
        type,
        orderId,
        description,
      },
      { transaction }
    );

    const newPoints = parseInt(user.loyaltyPoints) + parseInt(pointsChange);
    await User.update(
      { loyaltyPoints: newPoints },
      { where: { id: userId }, transaction }
    );

    await transaction.commit();

    res.status(200).json({
      status: "success",
      message: "Punkty lojalnościowe zostały zaktualizowane",
      data: {
        previousPoints: user.loyaltyPoints,
        pointsChange,
        currentPoints: newPoints,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.getSpecialOffers = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ["loyaltyPoints"],
    });

    if (!user) {
      const error = new Error("Nie znaleziono użytkownika");
      error.statusCode = 404;
      return next(error);
    }

    const now = new Date();
    const offers = await SpecialOffer.findAll({
      where: {
        isActive: true,
        validFrom: { [require("sequelize").Op.lte]: now },
        validTo: { [require("sequelize").Op.gte]: now },
        minLoyaltyPoints: { [require("sequelize").Op.lte]: user.loyaltyPoints },
      },
      order: [["createdAt", "DESC"]],
    });

    const availableOffers = offers.filter(
      (offer) =>
        (!offer.usageLimit || offer.usageCount < offer.usageLimit) &&
        user.loyaltyPoints >= offer.pointsCost
    );

    const comingSoonOffers = offers.filter(
      (offer) =>
        user.loyaltyPoints < offer.pointsCost ||
        (offer.usageLimit && offer.usageCount >= offer.usageLimit)
    );

    res.status(200).json({
      status: "success",
      data: {
        userPoints: user.loyaltyPoints,
        availableOffers,
        comingSoonOffers,
        totalOffers: offers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.redeemSpecialOffer = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { offerId } = req.params;

    const user = await User.findByPk(req.userId, { transaction });
    if (!user) {
      const error = new Error("Nie znaleziono użytkownika");
      error.statusCode = 404;
      return next(error);
    }

    const offer = await SpecialOffer.findByPk(offerId, { transaction });
    if (!offer) {
      const error = new Error("Nie znaleziono oferty");
      error.statusCode = 404;
      return next(error);
    }

    const now = new Date();
    if (!offer.isActive || now < offer.validFrom || now > offer.validTo) {
      const error = new Error("Oferta jest nieaktywna lub wygasła");
      error.statusCode = 400;
      return next(error);
    }

    if (offer.usageLimit && offer.usageCount >= offer.usageLimit) {
      const error = new Error("Oferta osiągnęła limit użycia");
      error.statusCode = 400;
      return next(error);
    }

    if (user.loyaltyPoints < offer.pointsCost) {
      const error = new Error(
        "Niewystarczająca liczba punktów lojalnościowych"
      );
      error.statusCode = 400;
      return next(error);
    }

    if (offer.pointsCost > 0) {
      await LoyaltyPointsHistory.create(
        {
          userId: req.userId,
          pointsChange: -offer.pointsCost,
          type: "redeemed",
          description: `Wykorzystano ofertę: ${offer.title}`,
        },
        { transaction }
      );

      await User.update(
        { loyaltyPoints: user.loyaltyPoints - offer.pointsCost },
        { where: { id: req.userId }, transaction }
      );
    }

    await SpecialOffer.update(
      { usageCount: offer.usageCount + 1 },
      { where: { id: offerId }, transaction }
    );

    await transaction.commit();

    res.status(200).json({
      status: "success",
      message: "Oferta została aktywowana",
      data: {
        offer: offer.toJSON(),
        pointsUsed: offer.pointsCost,
        remainingPoints: user.loyaltyPoints - offer.pointsCost,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
