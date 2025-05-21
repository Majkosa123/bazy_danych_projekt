const express = require("express");
const orderController = require("../controllers/orderController");
const {
  validateRequest,
  createOrderSchema,
  addOrderItemSchema,
  updateOrderStatusSchema,
} = require("../utils/validation");

const router = express.Router();

router.post(
  "/",
  validateRequest(createOrderSchema),
  orderController.createOrder
);
router.get("/:id", orderController.getOrderById);
router.post(
  "/:orderId/items",
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
