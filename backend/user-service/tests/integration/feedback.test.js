const feedbackController = require("../../src/controllers/feedbackController");
const Feedback = require("../../src/models/mongoose/feedback");

describe("Feedback Controller Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("submitFeedback", () => {
    test("should submit feedback successfully", async () => {
      req.body = {
        orderId: "test-order-123",
        rating: 4,
        review: "Great food!",
        customerName: "Jan",
      };

      Feedback.create.mockResolvedValue({
        _id: "feedback-id",
        orderId: "test-order-123",
        rating: 4,
        review: "Great food!",
        customerName: "Jan",
      });

      await feedbackController.submitFeedback(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Dziękujemy za opinię!",
        })
      );
    });

    test("should use default customer name", async () => {
      req.body = {
        orderId: "test-order-123",
        rating: 5,
      };

      Feedback.create.mockResolvedValue({
        _id: "feedback-id",
        orderId: "test-order-123",
        rating: 5,
        customerName: "Anonimowy",
      });

      await feedbackController.submitFeedback(req, res, next);

      expect(Feedback.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerName: "Anonimowy",
        })
      );
    });
  });

  describe("getAllFeedback", () => {
    test("should get all feedback", async () => {
      const mockFeedback = [
        { orderId: "order-1", rating: 4 },
        { orderId: "order-2", rating: 5 },
      ];

      Feedback.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockFeedback),
        }),
      });

      await feedbackController.getAllFeedback(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          results: 2,
          data: mockFeedback,
        })
      );
    });
  });
});
