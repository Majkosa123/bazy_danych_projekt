const express = require("express");
const userController = require("../controllers/userController");
const {
  validateRequest,
  registerUserSchema,
  loginUserSchema,
} = require("../utils/validation");
const { authenticateToken } = require("../middlewares/auth");

const router = express.Router();

// Publiczne endpointy (bez autoryzacji)
router.post(
  "/register",
  validateRequest(registerUserSchema),
  userController.register
);

router.post("/login", validateRequest(loginUserSchema), userController.login);

// Chronione endpointy (wymagają autoryzacji)
router.get("/profile", authenticateToken, userController.getProfile);

module.exports = router;
