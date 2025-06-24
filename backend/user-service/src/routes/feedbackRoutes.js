const express = require("express");
const feedbackController = require("../controllers/feedbackController");
const {
  validateRequest,
  submitFeedbackSchema,
} = require("../utils/validation");

const router = express.Router();

router.post(
  "/",
  validateRequest(submitFeedbackSchema),
  feedbackController.submitFeedback
);

router.get("/", feedbackController.getAllFeedback);

module.exports = router;
