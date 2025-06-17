const Joi = require("joi");

const createTableSchema = Joi.object({
  number: Joi.number().integer().required(),
  capacity: Joi.number().integer().min(1).required(),
  isAvailable: Joi.boolean().default(true),
  location: Joi.string().optional(),
});

const createOrderDeliverySchema = Joi.object({
  deliveryOptionId: Joi.string().uuid().required(),

  tableId: Joi.string().uuid().allow(null).optional(),
  notes: Joi.string().allow("").optional(),
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.status(400).json({
        status: "error",
        message: `Błąd walidacji: ${errorMessage}`,
      });
    }

    next();
  };
};

module.exports = {
  validateRequest,
  createDeliveryOptionSchema,
  createTableSchema,
  createOrderDeliverySchema,
};
