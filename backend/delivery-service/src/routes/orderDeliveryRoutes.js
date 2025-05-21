const express = require("express");
const orderDeliveryController = require("../controllers/orderDeliveryController");
const {
  validateRequest,
  createOrderDeliverySchema,
} = require("../utils/validation");

const router = express.Router();

router.post(
  "/:orderId",
  validateRequest(createOrderDeliverySchema),
  orderDeliveryController.createOrderDelivery
);
router.get("/:orderId", orderDeliveryController.getOrderDeliveryByOrderId);

module.exports = router;
