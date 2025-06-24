const express = require("express");
const userRoutes = require("./userRoutes");
const loyaltyRoutes = require("./loyaltyRoutes");
const preferencesRoutes = require("./preferencesRoutes");
const feedbackRoutes = require("./feedbackRoutes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/loyalty", loyaltyRoutes);
router.use("/preferences", preferencesRoutes);
router.use("/feedback", feedbackRoutes);

module.exports = router;
