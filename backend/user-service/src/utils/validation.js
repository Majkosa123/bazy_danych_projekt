const Joi = require("joi");

const registerUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]{9,15}$/)
    .optional(),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const addLoyaltyPointsSchema = Joi.object({
  pointsChange: Joi.number().integer().required(),
  type: Joi.string()
    .valid("earned", "redeemed", "expired", "bonus", "adjustment")
    .required(),
  orderId: Joi.string().uuid().optional(),
  description: Joi.string().max(255).optional(),
  userId: Joi.string().uuid().required(), // Wymagane dla wywołań serwisowych
});

const createSpecialOfferSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  discountType: Joi.string().valid("percentage", "fixed", "points").required(),
  discountValue: Joi.number().positive().required(),
  minLoyaltyPoints: Joi.number().integer().min(0).optional(),
  minOrderValue: Joi.number().min(0).optional(),
  pointsCost: Joi.number().integer().min(0).optional(),
  validFrom: Joi.date().required(),
  validTo: Joi.date().greater(Joi.ref("validFrom")).required(),
  usageLimit: Joi.number().integer().min(1).optional(),
});

const updatePreferencesSchema = Joi.object({
  languagePreference: Joi.string().valid("pl", "en").optional(),
  dietaryRestrictions: Joi.array()
    .items(
      Joi.string().valid(
        "vegetarian",
        "vegan",
        "gluten_free",
        "lactose_free",
        "halal"
      )
    )
    .optional(),
  customizations: Joi.object({
    defaultSpicyLevel: Joi.number().integer().min(0).max(5).optional(),
    preferredSize: Joi.string().valid("small", "medium", "large").optional(),
    allergens: Joi.array().items(Joi.string().max(50)).optional(),
  }).optional(),
  notifications: Joi.object({
    email: Joi.boolean().optional(),
    sms: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    specialOffers: Joi.boolean().optional(),
  }).optional(),
});

const addFavoriteProductSchema = Joi.object({
  productId: Joi.string().required(),
});

const submitFeedbackSchema = Joi.object({
  orderId: Joi.string().required(),
  customerName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  rating: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().max(1000).optional(),
  productRatings: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        productName: Joi.string().optional(),
        rating: Joi.number().integer().min(1).max(5).required(),
      })
    )
    .optional(),
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
  registerUserSchema,
  loginUserSchema,
  addLoyaltyPointsSchema,
  createSpecialOfferSchema,
  updatePreferencesSchema,
  addFavoriteProductSchema,
  submitFeedbackSchema,
};
