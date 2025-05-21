const express = require("express");
const paymentMethodController = require("../controllers/paymentMethodController");

const router = express.Router();

router.get("/", paymentMethodController.getAllPaymentMethods);
router.get("/:id", paymentMethodController.getPaymentMethodById);

module.exports = router;
