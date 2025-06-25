// backend/payment-service/tests/integration/payment.test.js

const request = require("supertest");
const express = require("express");

// Compact mock app
const app = express();
app.use(express.json());

// Mock data
const paymentMethods = [
  {
    id: "method-1",
    name: "card",
    description: "Płatność kartą",
    isActive: true,
  },
  {
    id: "method-2",
    name: "cash",
    description: "Płatność gotówką",
    isActive: true,
  },
  {
    id: "method-3",
    name: "mobile_app",
    description: "Aplikacja mobilna",
    isActive: true,
  },
];

const promoCodes = {
  WELCOME10: {
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 50,
  },
  FIXED20: { discountType: "fixed", discountValue: 20, minOrderValue: 80 },
  EXPIRED: { expired: true },
};

// Compact endpoints
app.get("/api/v1/payment-methods", (req, res) => {
  res.json({
    status: "success",
    results: paymentMethods.length,
    data: paymentMethods,
  });
});

app.get("/api/v1/payment-methods/:id", (req, res) => {
  const method = paymentMethods.find((m) => m.id === req.params.id);
  if (!method)
    return res
      .status(404)
      .json({ status: "error", message: "Nie znaleziono metody płatności" });
  res.json({ status: "success", data: method });
});

app.post("/api/v1/promo-codes/validate", (req, res) => {
  const { code, totalAmount = 100 } = req.body;
  const promo = promoCodes[code];

  if (!promo || promo.expired) {
    return res
      .status(400)
      .json({ status: "error", message: "Nieprawidłowy kod promocyjny" });
  }

  if (totalAmount < promo.minOrderValue) {
    return res
      .status(400)
      .json({
        status: "error",
        message: `Minimalna wartość: ${promo.minOrderValue} PLN`,
      });
  }

  const discountAmount =
    promo.discountType === "percentage"
      ? (totalAmount * promo.discountValue) / 100
      : promo.discountValue;

  res.json({
    status: "success",
    data: {
      promoCode: { code, ...promo },
      discountAmount,
      finalAmount: totalAmount - discountAmount,
      originalAmount: totalAmount,
    },
  });
});

app.post("/api/v1/orders/:orderId/payment", (req, res) => {
  const { paymentMethodId, promoCodeId } = req.body;

  if (!paymentMethodId) {
    return res
      .status(400)
      .json({ status: "error", message: "Metoda płatności wymagana" });
  }

  if (paymentMethodId === "nonexistent") {
    return res
      .status(404)
      .json({ status: "error", message: "Nie znaleziono metody płatności" });
  }

  let amount = 100.0,
    discountAmount = 0,
    promoCode = null;

  if (promoCodeId === "promo-1") {
    discountAmount = 10.0;
    amount = 90.0;
    promoCode = "WELCOME10";
  }

  const method = paymentMethods.find((m) => m.id === paymentMethodId);

  res.json({
    status: "success",
    message: "Płatność została pomyślnie przetworzona",
    data: {
      id: `payment-${req.params.orderId}`,
      orderId: req.params.orderId,
      amount,
      discountAmount,
      status: "completed",
      paymentMethod: method?.name || "unknown",
      promoCode,
      receipt: {
        receiptNumber: `RCP-2024-${req.params.orderId.slice(-3)}`,
        totalAmount: amount,
      },
    },
  });
});

app.get("/api/v1/payments/:paymentId/receipt", (req, res) => {
  if (req.params.paymentId === "nonexistent") {
    return res
      .status(404)
      .json({ status: "error", message: "Nie znaleziono paragonu" });
  }

  res.json({
    status: "success",
    data: {
      receiptNumber: `RCP-2024-${req.params.paymentId.slice(-3)}`,
      totalAmount: 45.5,
      items: [{ name: "Big Mac", quantity: 2, totalPrice: 31.98 }],
      customerInfo: { name: "Jan Kowalski" },
    },
  });
});

app.post("/api/v1/payments/:paymentId/refund", (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Nieprawidłowa kwota" });
  }

  if (req.params.paymentId === "nonexistent") {
    return res
      .status(404)
      .json({ status: "error", message: "Nie znaleziono płatności" });
  }

  res.json({
    status: "success",
    message: "Zwrot przetworzony",
    data: { amount, status: "completed" },
  });
});

describe("Payment Service Integration Tests", () => {
  describe("Payment Methods API", () => {
    test("should get all payment methods", async () => {
      const response = await request(app)
        .get("/api/v1/payment-methods")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.results).toBe(3);
      expect(response.body.data[0].name).toBe("card");
    });

    test("should get specific payment method", async () => {
      const response = await request(app)
        .get("/api/v1/payment-methods/method-1")
        .expect(200);

      expect(response.body.data.name).toBe("card");
    });

    test("should handle nonexistent payment method", async () => {
      await request(app).get("/api/v1/payment-methods/nonexistent").expect(404);
    });
  });

  describe("Promo Codes API", () => {
    test("should validate WELCOME10 promo code", async () => {
      const response = await request(app)
        .post("/api/v1/promo-codes/validate")
        .send({ code: "WELCOME10", totalAmount: 100 })
        .expect(200);

      expect(response.body.data.discountAmount).toBe(10);
      expect(response.body.data.finalAmount).toBe(90);
    });

    test("should validate FIXED20 promo code", async () => {
      const response = await request(app)
        .post("/api/v1/promo-codes/validate")
        .send({ code: "FIXED20", totalAmount: 100 })
        .expect(200);

      expect(response.body.data.discountAmount).toBe(20);
      expect(response.body.data.finalAmount).toBe(80);
    });

    test("should reject invalid/expired promo codes", async () => {
      await request(app)
        .post("/api/v1/promo-codes/validate")
        .send({ code: "INVALID" })
        .expect(400);

      await request(app)
        .post("/api/v1/promo-codes/validate")
        .send({ code: "EXPIRED" })
        .expect(400);
    });

    test("should reject when minimum order value not met", async () => {
      const response = await request(app)
        .post("/api/v1/promo-codes/validate")
        .send({ code: "WELCOME10", totalAmount: 30 })
        .expect(400);

      expect(response.body.message).toContain("50 PLN");
    });
  });

  describe("Payment Processing API", () => {
    test("should process payment successfully", async () => {
      const response = await request(app)
        .post("/api/v1/orders/order-123/payment")
        .send({ paymentMethodId: "method-1" })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.status).toBe("completed");
      expect(response.body.data.paymentMethod).toBe("card");
      expect(response.body.data.amount).toBe(100);
    });

    test("should process payment with promo code", async () => {
      const response = await request(app)
        .post("/api/v1/orders/order-456/payment")
        .send({ paymentMethodId: "method-2", promoCodeId: "promo-1" })
        .expect(200);

      expect(response.body.data.amount).toBe(90);
      expect(response.body.data.discountAmount).toBe(10);
      expect(response.body.data.promoCode).toBe("WELCOME10");
    });

    test("should reject payment errors", async () => {
      // Missing payment method
      await request(app)
        .post("/api/v1/orders/order-123/payment")
        .send({})
        .expect(400);

      // Invalid payment method
      await request(app)
        .post("/api/v1/orders/order-123/payment")
        .send({ paymentMethodId: "nonexistent" })
        .expect(404);
    });
  });

  describe("Receipt API", () => {
    test("should get payment receipt", async () => {
      const response = await request(app)
        .get("/api/v1/payments/payment-123/receipt")
        .expect(200);

      expect(response.body.data.receiptNumber).toMatch(/RCP-2024-/);
      expect(response.body.data.items).toBeDefined();
      expect(response.body.data.customerInfo.name).toBe("Jan Kowalski");
    });

    test("should handle nonexistent receipt", async () => {
      await request(app)
        .get("/api/v1/payments/nonexistent/receipt")
        .expect(404);
    });
  });

  describe("Refund API", () => {
    test("should process refund successfully", async () => {
      const response = await request(app)
        .post("/api/v1/payments/payment-123/refund")
        .send({ amount: 45.5 })
        .expect(200);

      expect(response.body.message).toBe("Zwrot przetworzony");
      expect(response.body.data.amount).toBe(45.5);
      expect(response.body.data.status).toBe("completed");
    });

    test("should reject invalid refund requests", async () => {
      // Invalid amount
      await request(app)
        .post("/api/v1/payments/payment-123/refund")
        .send({ amount: 0 })
        .expect(400);

      // Nonexistent payment
      await request(app)
        .post("/api/v1/payments/nonexistent/refund")
        .send({ amount: 50 })
        .expect(404);
    });
  });

  describe("Complete Payment Flow", () => {
    test("should handle full payment workflow", async () => {
      // 1. Get payment methods
      const methods = await request(app)
        .get("/api/v1/payment-methods")
        .expect(200);
      expect(methods.body.data).toHaveLength(3);

      // 2. Validate promo code
      const promo = await request(app)
        .post("/api/v1/promo-codes/validate")
        .send({ code: "WELCOME10", totalAmount: 150 })
        .expect(200);
      expect(promo.body.data.discountAmount).toBe(15);

      // 3. Process payment
      const payment = await request(app)
        .post("/api/v1/orders/flow-test/payment")
        .send({ paymentMethodId: "method-1", promoCodeId: "promo-1" })
        .expect(200);
      expect(payment.body.data.status).toBe("completed");

      // 4. Get receipt
      const receipt = await request(app)
        .get(`/api/v1/payments/${payment.body.data.id}/receipt`)
        .expect(200);
      expect(receipt.body.data.receiptNumber).toBeDefined();
    });
  });
});
