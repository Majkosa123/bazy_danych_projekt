const express = require("express");
const orderController = require("../controllers/orderController");
const {
  validateRequest,
  createOrderSchema,
  addOrderItemSchema,
  updateOrderStatusSchema,
} = require("../utils/validation");

const router = express.Router();

const debugMiddleware = (req, res, next) => {
  console.log("🎯 Route hit:", req.method, req.path);
  console.log("🎯 Body:", JSON.stringify(req.body, null, 2));
  console.log("🎯 Params:", req.params);
  next();
};

router.post(
  "/",
  validateRequest(createOrderSchema),
  orderController.createOrder
);

router.get("/:id", orderController.getOrderById);

router.post(
  "/:orderId/items",
  debugMiddleware,
  validateRequest(addOrderItemSchema),
  orderController.addItemToOrder
);

router.patch(
  "/:orderId/status",
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

router.delete("/:orderId/items/:itemId", orderController.removeItemFromOrder);

module.exports = router;
