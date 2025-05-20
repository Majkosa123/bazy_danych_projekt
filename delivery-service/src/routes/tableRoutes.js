const express = require("express");
const tableController = require("../controllers/tableController");
const { validateRequest, createTableSchema } = require("../utils/validation");

const router = express.Router();

router.get("/", tableController.getAllTables);
router.get("/available", tableController.getAvailableTables);
router.get("/:id", tableController.getTableById);
router.post(
  "/",
  validateRequest(createTableSchema),
  tableController.createTable
);
router.patch("/:id/availability", tableController.updateTableAvailability);

module.exports = router;
