const Joi = require("joi");

const validatePromoCodeSchema = Joi.object({
  code: Joi.string().required(),
  orderId: Joi.string().required(),
  totalAmount: Joi.number().optional(),
});

const createPaymentSchema = Joi.object({
  paymentMethodId: Joi.string().uuid().required(),
  promoCodeId: Joi.string().uuid().optional(),
  userToken: Joi.string().optional(),
  customerInfo: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
  }).optional(),
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    console.log(" Validating request body:", req.body);

    const { error } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      console.error("Validation error:", errorMessage);

      return res.status(400).json({
        status: "error",
        message: `Błąd walidacji: ${errorMessage}`,
      });
    }

    console.log("Validation passed");
    next();
  };
};

module.exports = {
  validateRequest,
  validatePromoCodeSchema,
  createPaymentSchema,
};
