const Payment = require("../models/sequelize/payment");
const PaymentMethod = require("../models/sequelize/paymentMethod");
const PromoCode = require("../models/sequelize/promoCode");
const PaymentReceipt = require("../models/mongoose/paymentReceipt");
const orderService = require("../services/orderService");
const paymentGateway = require("../services/paymentGateway");
const { sequelize } = require("../config/database");

exports.processPayment = async (req, res, next) => {
  console.log("Payment request received:");
  console.log("  orderId:", req.params.orderId);
  console.log("  paymentMethodId:", req.body.paymentMethodId);
  console.log("  full body:", JSON.stringify(req.body, null, 2));

  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;
    const { paymentMethodId, promoCodeId, customerInfo } = req.body;

    console.log("Looking for order:", orderId);
    const order = await orderService.getOrderById(orderId);
    console.log("Order found:", order.id, "Total:", order.totalAmount);

    const paymentMethod = await PaymentMethod.findByPk(paymentMethodId);
    if (!paymentMethod) {
      const error = new Error("Nie znaleziono metody płatności o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    let discountAmount = 0;
    let promoCode = null;

    if (promoCodeId) {
      promoCode = await PromoCode.findByPk(promoCodeId);

      if (!promoCode) {
        const error = new Error(
          "Nie znaleziono kodu promocyjnego o podanym ID"
        );
        error.statusCode = 404;
        return next(error);
      }

      const now = new Date();
      if (
        !promoCode.isActive ||
        now < promoCode.startDate ||
        now > promoCode.endDate
      ) {
        const error = new Error("Kod promocyjny jest nieaktywny lub wygasł");
        error.statusCode = 400;
        return next(error);
      }

      if (
        promoCode.usageLimit &&
        promoCode.usageCount >= promoCode.usageLimit
      ) {
        const error = new Error("Kod promocyjny osiągnął limit użycia");
        error.statusCode = 400;
        return next(error);
      }

      if (promoCode.discountType === "percentage") {
        discountAmount =
          (parseFloat(order.totalAmount) *
            parseFloat(promoCode.discountValue)) /
          100;
      } else {
        discountAmount = parseFloat(promoCode.discountValue);
      }

      discountAmount = Math.min(discountAmount, parseFloat(order.totalAmount));

      await promoCode.increment("usageCount", { transaction });
    }

    const finalAmount = parseFloat(order.totalAmount) - discountAmount;

    const payment = await Payment.create(
      {
        orderId,
        paymentMethodId,
        amount: finalAmount,
        currency: "PLN",
        status: "pending",
        promoCodeId: promoCode ? promoCode.id : null,
        discountAmount,
      },
      { transaction }
    );

    try {
      const paymentResult = await paymentGateway.processPayment(
        paymentMethod.name.toLowerCase(),
        finalAmount,
        "PLN"
      );

      await payment.update(
        {
          transactionId: paymentResult.transactionId,
          status: "completed",
        },
        { transaction }
      );

      await orderService.updateOrderStatus(orderId, "paid");

      const receiptItems = await Promise.all(
        order.OrderItems.map(async (item) => {
          return {
            productId: item.productId,
            name: item.productName || `Produkt ${item.productId}`,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
            customizations: item.customization
              ? item.customization.customizations
              : [],
          };
        })
      );

      const taxRate = 0.23;
      const subtotal = parseFloat(order.totalAmount);
      const taxAmount = (finalAmount * taxRate) / (1 + taxRate);

      const receipt = await PaymentReceipt.create({
        paymentId: payment.id,
        orderId,
        items: receiptItems,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount: finalAmount,
        paymentMethod: paymentMethod.name,
        promoCode: promoCode ? promoCode.code : null,
        customerInfo: customerInfo || {},
        restaurantInfo: {
          name: "Fast Food Restaurant",
          address: "ul. Przykładowa 1, 00-001 Warszawa",
          taxId: "PL1234567890",
        },
        receiptNumber: `INV-${Date.now().toString().substring(5)}`,
      });

      await transaction.commit();

      res.status(200).json({
        status: "success",
        message: "Płatność została zrealizowana pomyślnie",
        data: {
          payment: {
            id: payment.id,
            orderId,
            amount: finalAmount,
            currency: "PLN",
            status: "completed",
            transactionId: paymentResult.transactionId,
          },
          receipt: {
            receiptNumber: receipt.receiptNumber,
            issueDate: receipt.issueDate,
            totalAmount: receipt.totalAmount,
          },
        },
      });
    } catch (paymentError) {
      await payment.update({ status: "failed" }, { transaction });

      await transaction.commit();

      const error = new Error(
        `Błąd przetwarzania płatności: ${paymentError.message}`
      );
      error.statusCode = 400;
      return next(error);
    }
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({
      where: { orderId },
      include: [{ model: PaymentMethod }],
    });

    if (!payment) {
      const error = new Error("Nie znaleziono płatności dla tego zamówienia");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

exports.getReceiptByPaymentId = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const receipt = await PaymentReceipt.findOne({ paymentId });

    if (!receipt) {
      const error = new Error("Nie znaleziono paragonu dla tej płatności");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};
