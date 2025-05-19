const Joi = require("joi");

const createOrderSchema = Joi.object({
  userId: Joi.string().allow(null).optional(),
});

const addOrderItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  customizations: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        priceModifier: Joi.number().default(0),
      })
    )
    .optional(),
  specialInstructions: Joi.string().max(500).optional(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "cart",
      "pending",
      "paid",
      "preparing",
      "ready",
      "completed",
      "cancelled"
    )
    .required(),
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
  createOrderSchema,
  addOrderItemSchema,
  updateOrderStatusSchema,
};
