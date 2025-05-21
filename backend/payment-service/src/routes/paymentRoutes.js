const express = require("express");
const paymentController = require("../controllers/paymentController");
const { validateRequest, createPaymentSchema } = require("../utils/validation");

const router = express.Router();

router.post(
  "/order/:orderId",
  validateRequest(createPaymentSchema),
  paymentController.processPayment
);
router.get("/order/:orderId", paymentController.getPaymentByOrderId);
router.get("/:paymentId/receipt", paymentController.getReceiptByPaymentId);

module.exports = router;
