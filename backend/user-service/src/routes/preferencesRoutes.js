const express = require("express");
const preferencesController = require("../controllers/preferencesController");
const {
  validateRequest,
  updatePreferencesSchema,
  addFavoriteProductSchema,
} = require("../utils/validation");
const { authenticateToken } = require("../middlewares/auth");

const router = express.Router();

router.use(authenticateToken);

// Preferencje użytkownika
router.get("/", preferencesController.getPreferences);
router.patch(
  "/",
  validateRequest(updatePreferencesSchema),
  preferencesController.updatePreferences
);

// Ulubione produkty
router.post(
  "/favorites",
  validateRequest(addFavoriteProductSchema),
  preferencesController.addFavoriteProduct
);
router.delete(
  "/favorites/:productId",
  preferencesController.removeFavoriteProduct
);

// Historia zamówień
router.get("/orders", preferencesController.getOrderHistory);
router.post("/orders", preferencesController.addOrderToHistory);

// Sugestie menu
router.get("/suggestions", preferencesController.getSuggestedMenuItems);

module.exports = router;
