const Feedback = require("../models/mongoose/feedback");

exports.submitFeedback = async (req, res, next) => {
  try {
    const { orderId, customerName, email, rating, review, productRatings } =
      req.body;

    const feedback = await Feedback.create({
      orderId,
      customerName: customerName || "Anonimowy",
      email: email || null,
      rating,
      review: review || "",
      productRatings: productRatings || [],
      submittedAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      message: "Dziękujemy za opinię!",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find().sort({ submittedAt: -1 }).limit(100);

    res.status(200).json({
      status: "success",
      results: feedback.length,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};
