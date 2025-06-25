const UserPreferences = require("../models/mongoose/userPreferences");
const orderService = require("../services/orderService");

exports.getPreferences = async (req, res, next) => {
  try {
    const preferences = await UserPreferences.findOne({ userId: req.userId });

    if (!preferences) {
      const newPreferences = await UserPreferences.create({
        userId: req.userId,
      });
      return res.status(200).json({
        status: "success",
        data: newPreferences,
      });
    }

    res.status(200).json({
      status: "success",
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const updateData = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId: req.userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: "success",
      message: "Preferencje zostały zaktualizowane",
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

exports.addFavoriteProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId: req.userId },
      {
        $addToSet: {
          favoriteProducts: {
            productId,
            addedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: "success",
      message: "Produkt dodany do ulubionych",
      data: preferences.favoriteProducts,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFavoriteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId: req.userId },
      {
        $pull: {
          favoriteProducts: { productId },
        },
      },
      { new: true }
    );

    if (!preferences) {
      const error = new Error("Nie znaleziono preferencji użytkownika");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      message: "Produkt usunięty z ulubionych",
      data: preferences.favoriteProducts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderHistory = async (req, res, next) => {
  try {
    const preferences = await UserPreferences.findOne(
      { userId: req.userId },
      { orderHistory: 1 }
    );

    const orderHistory = preferences?.orderHistory || [];

    res.status(200).json({
      status: "success",
      data: {
        orders: orderHistory.sort(
          (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
        ),
        totalOrders: orderHistory.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.addOrderToHistory = async (req, res, next) => {
  try {
    const { orderId, totalAmount, itemsCount, userId } = req.body;

    if (!orderId || !totalAmount) {
      const error = new Error("Brak wymaganych danych: orderId i totalAmount");
      error.statusCode = 400;
      return next(error);
    }

    let orderDetails;
    try {
      orderDetails = await orderService.getOrderById(orderId);
      console.log("Pobrano szczegóły zamówienia:", orderDetails);
    } catch (err) {
      console.error("Błąd podczas pobierania szczegółów zamówienia:", err);

      orderDetails = {
        totalAmount: totalAmount,
        OrderItems: itemsCount ? Array(itemsCount).fill({}) : [],
      };
    }

    // liczby pozycji
    const calculatedItemsCount = orderDetails.OrderItems
      ? orderDetails.OrderItems.length
      : itemsCount || 1;

    const orderHistoryEntry = {
      orderId,
      totalAmount: orderDetails.totalAmount || totalAmount,
      orderDate: new Date(),
      itemsCount: calculatedItemsCount,
    };

    console.log("Dodaję do historii:", orderHistoryEntry);

    const updatedPreferences = await UserPreferences.findOneAndUpdate(
      { userId: req.userId },
      {
        $push: {
          orderHistory: orderHistoryEntry,
        },
      },
      { upsert: true, new: true }
    );

    console.log(
      "Zaktualizowano preferencje:",
      updatedPreferences?.orderHistory?.length
    );

    res.status(200).json({
      status: "success",
      message: "Zamówienie dodane do historii",
      data: orderHistoryEntry,
    });
  } catch (error) {
    console.error("Błąd w addOrderToHistory:", error);
    next(error);
  }
};

exports.getSuggestedMenuItems = async (req, res, next) => {
  try {
    const preferences = await UserPreferences.findOne(
      { userId: req.userId },
      { suggestedMenuItems: 1, favoriteProducts: 1, orderHistory: 1 }
    );

    if (!preferences) {
      return res.status(200).json({
        status: "success",
        data: {
          suggestions: [],
          message: "Brak wystarczających danych do generowania sugestii",
        },
      });
    }

    const suggestions = preferences.suggestedMenuItems || [];

    res.status(200).json({
      status: "success",
      data: {
        suggestions,
        basedOnFavorites: preferences.favoriteProducts?.length || 0,
        basedOnHistory: preferences.orderHistory?.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
