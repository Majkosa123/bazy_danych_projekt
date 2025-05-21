const OrderDelivery = require("../models/sequelize/orderDelivery");
const DeliveryOption = require("../models/sequelize/deliveryOption");
const Table = require("../models/sequelize/table");
const orderService = require("../services/orderService");
const { sequelize } = require("../config/database");

exports.createOrderDelivery = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;
    const { deliveryOptionId, tableId, notes } = req.body;

    await orderService.getOrderById(orderId);

    const deliveryOption = await DeliveryOption.findByPk(deliveryOptionId);
    if (!deliveryOption) {
      const error = new Error("Nie znaleziono opcji dostawy o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    if (tableId) {
      const table = await Table.findByPk(tableId);

      if (!table) {
        const error = new Error("Nie znaleziono stolika o podanym ID");
        error.statusCode = 404;
        return next(error);
      }

      if (!table.isAvailable) {
        const error = new Error("Wybrany stolik jest niedostępny");
        error.statusCode = 400;
        return next(error);
      }

      await table.update({ isAvailable: false }, { transaction });
    }

    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(
      estimatedDeliveryTime.getMinutes() + deliveryOption.estimatedTimeMinutes
    );

    const orderDelivery = await OrderDelivery.create(
      {
        orderId,
        deliveryOptionId,
        tableId,
        estimatedDeliveryTime,
        notes,
      },
      { transaction }
    );

    await orderService.updateOrderStatus(orderId, "pending");

    await transaction.commit();

    res.status(201).json({
      status: "success",
      message: "Dodano informacje o dostawie zamówienia",
      data: orderDelivery,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.getOrderDeliveryByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const orderDelivery = await OrderDelivery.findOne({
      where: { orderId },
      include: [{ model: DeliveryOption }, { model: Table }],
    });

    if (!orderDelivery) {
      const error = new Error(
        "Nie znaleziono informacji o dostawie dla tego zamówienia"
      );
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: orderDelivery,
    });
  } catch (error) {
    next(error);
  }
};
