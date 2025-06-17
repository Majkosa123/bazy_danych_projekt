const express = require("express");
const deliveryOptionController = require("../controllers/deliveryOptionController");
const {
  validateRequest,
  createDeliveryOptionSchema,
} = require("../utils/validation");

const router = express.Router();

router.get("/", deliveryOptionController.getAllDeliveryOptions);
router.get("/:id", deliveryOptionController.getDeliveryOptionById);

module.exports = router;
