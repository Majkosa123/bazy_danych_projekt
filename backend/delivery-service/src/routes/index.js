const express = require("express");
const deliveryOptionRoutes = require("./deliveryOptionRoutes");
const tableRoutes = require("./tableRoutes");
const orderDeliveryRoutes = require("./orderDeliveryRoutes");

const router = express.Router();

router.use("/delivery-options", deliveryOptionRoutes);
router.use("/tables", tableRoutes);
router.use("/order-deliveries", orderDeliveryRoutes);

module.exports = router;
