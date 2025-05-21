const express = require("express");
const promoCodeController = require("../controllers/promoCodeController");
const {
  validateRequest,
  validatePromoCodeSchema,
} = require("../utils/validation");

const router = express.Router();

router.post(
  "/validate",
  validateRequest(validatePromoCodeSchema),
  promoCodeController.validatePromoCode
);

module.exports = router;
