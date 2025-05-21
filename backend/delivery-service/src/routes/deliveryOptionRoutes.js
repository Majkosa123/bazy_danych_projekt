const express = require("express");
const deliveryOptionController = require("../controllers/deliveryOptionController");
const {
  validateRequest,
  createDeliveryOptionSchema,
} = require("../utils/validation");

const router = express.Router();

router.get("/", deliveryOptionController.getAllDeliveryOptions);
router.get("/:id", deliveryOptionController.getDeliveryOptionById);
router.post(
  "/",
  validateRequest(createDeliveryOptionSchema),
  deliveryOptionController.createDeliveryOption
);

module.exports = router;
