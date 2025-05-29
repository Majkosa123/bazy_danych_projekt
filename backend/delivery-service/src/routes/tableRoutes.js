const express = require("express");
const tableController = require("../controllers/tableController");
const { validateRequest, createTableSchema } = require("../utils/validation");
const Joi = require("joi");

const router = express.Router();

router.get("/", tableController.getAllTables);
router.get("/available", tableController.getAvailableTables);
router.get("/statistics", tableController.getTableStatistics);
router.get("/location/:location", tableController.getTablesByLocation);
router.get("/:id", tableController.getTableById);

router.post(
  "/",
  validateRequest(createTableSchema),
  tableController.createTable
);
router.patch("/:id/availability", tableController.updateTableAvailability);

const reserveTableSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).optional(),
  duration: Joi.number().integer().min(15).max(480).optional(), // 15 min - 8h
});

const validateReservation = (req, res, next) => {
  const { error } = reserveTableSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      message: `Błąd walidacji: ${error.details[0].message}`,
    });
  }
  next();
};

const bulkUpdateSchema = Joi.object({
  updates: Joi.array()
    .items(
      Joi.object({
        tableId: Joi.string().uuid().required(),
        isAvailable: Joi.boolean().required(),
      })
    )
    .min(1)
    .required(),
});

const validateBulkUpdate = (req, res, next) => {
  const { error } = bulkUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      message: `Błąd walidacji: ${error.details[0].message}`,
    });
  }
  next();
};

// Rozszerzone endpointy
router.post("/:id/reserve", validateReservation, tableController.reserveTable);
router.post(
  "/bulk-update",
  validateBulkUpdate,
  tableController.bulkUpdateTableAvailability
);

module.exports = router;
