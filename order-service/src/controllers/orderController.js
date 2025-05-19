const Order = require("../models/sequelize/order");
const OrderItem = require("../models/sequelize/orderItem");
const OrderItemCustomization = require("../models/mongoose/orderItemCustomization");
const menuService = require("../services/menuService");
const { sequelize } = require("../config/database");

exports.createOrder = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const order = await Order.create({
      userId,
      status: "cart",
    });

    res.status(201).json({
      status: "success",
      message: "Utworzono nowe zamówienie",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem }],
    });

    if (!order) {
      const error = new Error("Nie znaleziono zamówienia o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    const orderItemIds = order.OrderItems.map((item) => item.id);
    const customizations = await OrderItemCustomization.find({
      orderItemId: { $in: orderItemIds },
    });

    const customizationsMap = customizations.reduce((map, customization) => {
      map[customization.orderItemId] = customization;
      return map;
    }, {});

    const itemsWithCustomizations = order.OrderItems.map((item) => {
      const itemJson = item.toJSON();
      itemJson.customization = customizationsMap[item.id] || null;
      return itemJson;
    });

    const result = order.toJSON();
    result.OrderItems = itemsWithCustomizations;

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.addItemToOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;
    const { productId, quantity, customizations, specialInstructions } =
      req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      const error = new Error("Nie znaleziono zamówienia o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    const product = await menuService.getProductById(productId);
    if (!product) {
      const error = new Error("Nie znaleziono produktu o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    if (!product.isAvailable) {
      const error = new Error("Ten produkt nie jest obecnie dostępny");
      error.statusCode = 400;
      return next(error);
    }

    const unitPrice = parseFloat(product.price);
    const totalPrice = unitPrice * quantity;

    const orderItem = await OrderItem.create(
      {
        orderId,
        productId,
        quantity,
        unitPrice,
        totalPrice,
      },
      { transaction }
    );

    if ((customizations && customizations.length > 0) || specialInstructions) {
      await OrderItemCustomization.create({
        orderItemId: orderItem.id,
        customizations: customizations || [],
        specialInstructions: specialInstructions || "",
      });
    }

    const newTotalAmount = parseFloat(order.totalAmount) + totalPrice;
    await order.update({ totalAmount: newTotalAmount }, { transaction });

    await transaction.commit();

    res.status(201).json({
      status: "success",
      message: "Dodano pozycję do zamówienia",
      data: {
        orderItem,
        customizations,
        specialInstructions,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      const error = new Error("Nie znaleziono zamówienia o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    await order.update({ status });

    res.status(200).json({
      status: "success",
      message: "Zaktualizowano status zamówienia",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeItemFromOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      const error = new Error("Nie znaleziono zamówienia o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    const orderItem = await OrderItem.findOne({
      where: {
        id: itemId,
        orderId,
      },
    });

    if (!orderItem) {
      const error = new Error(
        "Nie znaleziono pozycji o podanym ID w tym zamówieniu"
      );
      error.statusCode = 404;
      return next(error);
    }

    const newTotalAmount =
      parseFloat(order.totalAmount) - parseFloat(orderItem.totalPrice);
    await order.update({ totalAmount: newTotalAmount }, { transaction });

    await OrderItemCustomization.deleteOne({ orderItemId: itemId });

    await orderItem.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      status: "success",
      message: "Usunięto pozycję z zamówienia",
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
