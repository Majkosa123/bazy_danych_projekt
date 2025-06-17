const express = require("express");
const tableController = require("../controllers/tableController");
const { validateRequest, createTableSchema } = require("../utils/validation");
const Joi = require("joi");

const router = express.Router();

router.get("/available", tableController.getAvailableTables);

router.post(
  "/",
  validateRequest(createTableSchema),
  tableController.createTable
);
router.patch("/:id/availability", tableController.updateTableAvailability);

module.exports = router;
