const express = require("express");
const loyaltyController = require("../controllers/loyaltyController");
const {
  validateRequest,
  addLoyaltyPointsSchema,
} = require("../utils/validation");
const { authenticateToken } = require("../middlewares/auth");
const { serviceAuthOnly } = require("../middlewares/serviceAuth");

const router = express.Router();

router.get("/points", authenticateToken, loyaltyController.getLoyaltyPoints);
router.get("/offers", authenticateToken, loyaltyController.getSpecialOffers);
router.post(
  "/offers/:offerId/redeem",
  authenticateToken,
  loyaltyController.redeemSpecialOffer
);

router.post(
  "/points",
  serviceAuthOnly,
  validateRequest(addLoyaltyPointsSchema),
  loyaltyController.addLoyaltyPointsServiceOnly
);

module.exports = router;
