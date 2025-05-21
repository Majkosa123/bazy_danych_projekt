const express = require("express");
const paymentMethodRoutes = require("./paymentMethodRoutes");
const promoCodeRoutes = require("./promoCodeRoutes");
const paymentRoutes = require("./paymentRoutes");

const router = express.Router();

router.use("/payment-methods", paymentMethodRoutes);
router.use("/promo-codes", promoCodeRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
