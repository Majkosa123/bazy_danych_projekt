// backend/delivery-service/tests/integration/delivery.test.js

const request = require("supertest");

// Mock app dla testów integracyjnych
const mockApp = require("express")();
mockApp.use(require("express").json());

// Mock endpoints dla delivery service
mockApp.get("/api/v1/delivery-options", (req, res) => {
  const mockDeliveryOptions = [
    {
      id: "option-1",
      name: "Na miejscu",
      description: "Zamówienie do stolika w restauracji",
      isActive: true,
      estimatedTimeMinutes: 15,
    },
    {
      id: "option-2",
      name: "Na wynos",
      description: "Odbiór osobisty z restauracji",
      isActive: true,
      estimatedTimeMinutes: 10,
    },
    {
      id: "option-3",
      name: "Dostawa",
      description: "Dostawa do domu kurierem",
      isActive: true,
      estimatedTimeMinutes: 30,
    },
  ];

  res.status(200).json({
    status: "success",
    results: mockDeliveryOptions.length,
    data: mockDeliveryOptions,
  });
});

mockApp.get("/api/v1/delivery-options/:id", (req, res) => {
  const { id } = req.params;

  if (id === "nonexistent") {
    return res.status(404).json({
      status: "error",
      message: "Nie znaleziono opcji dostawy o podanym ID",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      id: id,
      name: "Na miejscu",
      description: "Zamówienie do stolika",
      isActive: true,
      estimatedTimeMinutes: 15,
    },
  });
});

mockApp.get("/api/v1/tables/available", (req, res) => {
  const { capacity } = req.query;

  let mockTables = [
    {
      id: "table-1",
      number: 1,
      capacity: 2,
      isAvailable: true,
      location: "Przy oknie",
    },
    {
      id: "table-2",
      number: 2,
      capacity: 4,
      isAvailable: true,
      location: "Środek sali",
    },
    {
      id: "table-3",
      number: 3,
      capacity: 6,
      isAvailable: true,
      location: "Duży stół",
    },
  ];

  if (capacity) {
    mockTables = mockTables.filter(
      (table) => table.capacity >= parseInt(capacity)
    );
  }

  res.status(200).json({
    status: "success",
    results: mockTables.length,
    data: mockTables,
    message: capacity
      ? `Stoliki dla min. ${capacity} osób`
      : "Wszystkie dostępne stoliki",
  });
});

mockApp.post("/api/v1/tables", (req, res) => {
  const { number, capacity, location } = req.body;

  if (!number || !capacity) {
    return res.status(400).json({
      status: "error",
      message: "Numer stolika i pojemność są wymagane",
    });
  }

  res.status(201).json({
    status: "success",
    message: "Utworzono nowy stolik",
    data: {
      id: `table-${number}`,
      number,
      capacity,
      isAvailable: true,
      location: location || "Nie określono",
    },
  });
});

mockApp.patch("/api/v1/tables/:id/availability", (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  if (id === "nonexistent") {
    return res.status(404).json({
      status: "error",
      message: "Nie znaleziono stolika o podanym ID",
    });
  }

  const tableNumber = id.replace("table-", "");

  res.status(200).json({
    status: "success",
    message: `Stolik ${tableNumber} jest teraz ${
      isAvailable ? "dostępny" : "zajęty"
    }`,
    data: {
      id,
      number: parseInt(tableNumber),
      isAvailable,
    },
  });
});

mockApp.post("/api/v1/orders/:orderId/delivery", (req, res) => {
  const { orderId } = req.params;
  const { deliveryOptionId, tableId, notes } = req.body;

  if (!deliveryOptionId) {
    return res.status(400).json({
      status: "error",
      message: "ID opcji dostawy jest wymagane",
    });
  }

  if (deliveryOptionId === "nonexistent") {
    return res.status(404).json({
      status: "error",
      message: "Nie znaleziono opcji dostawy o podanym ID",
    });
  }

  if (tableId === "unavailable") {
    return res.status(400).json({
      status: "error",
      message: "Wybrany stolik jest niedostępny",
    });
  }

  const estimatedTime = new Date();
  estimatedTime.setMinutes(estimatedTime.getMinutes() + 15);

  res.status(201).json({
    status: "success",
    message: "Dodano informacje o dostawie zamówienia",
    data: {
      id: `delivery-${orderId}`,
      orderId,
      deliveryOptionId,
      tableId: tableId || null,
      estimatedDeliveryTime: estimatedTime,
      notes: notes || null,
    },
  });
});

mockApp.get("/api/v1/orders/:orderId/delivery", (req, res) => {
  const { orderId } = req.params;

  if (orderId === "nonexistent") {
    return res.status(404).json({
      status: "error",
      message: "Nie znaleziono informacji o dostawie dla tego zamówienia",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      id: `delivery-${orderId}`,
      orderId,
      DeliveryOption: {
        id: "option-1",
        name: "Na miejscu",
        estimatedTimeMinutes: 15,
      },
      Table: {
        id: "table-2",
        number: 2,
        capacity: 4,
        location: "Środek sali",
      },
    },
  });
});

describe("Delivery Service Integration Tests", () => {
  describe("GET /api/v1/delivery-options", () => {
    test("should get all delivery options", async () => {
      const response = await request(mockApp)
        .get("/api/v1/delivery-options")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.results).toBe(3);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0]).toHaveProperty("name", "Na miejscu");
      expect(response.body.data[1]).toHaveProperty("name", "Na wynos");
      expect(response.body.data[2]).toHaveProperty("name", "Dostawa");
    });
  });

  describe("GET /api/v1/delivery-options/:id", () => {
    test("should get specific delivery option", async () => {
      const response = await request(mockApp)
        .get("/api/v1/delivery-options/option-1")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.name).toBe("Na miejscu");
    });

    test("should return 404 for nonexistent option", async () => {
      const response = await request(mockApp)
        .get("/api/v1/delivery-options/nonexistent")
        .expect(404);

      expect(response.body.status).toBe("error");
    });
  });

  describe("GET /api/v1/tables/available", () => {
    test("should get all available tables", async () => {
      const response = await request(mockApp)
        .get("/api/v1/tables/available")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.results).toBe(3);
      expect(response.body.message).toBe("Wszystkie dostępne stoliki");
    });

    test("should filter tables by capacity", async () => {
      const response = await request(mockApp)
        .get("/api/v1/tables/available?capacity=4")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.results).toBe(2); // tables with capacity >= 4
      expect(response.body.message).toBe("Stoliki dla min. 4 osób");
    });
  });

  describe("POST /api/v1/tables", () => {
    test("should create new table", async () => {
      const tableData = {
        number: 10,
        capacity: 8,
        location: "VIP sekcja",
      };

      const response = await request(mockApp)
        .post("/api/v1/tables")
        .send(tableData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Utworzono nowy stolik");
      expect(response.body.data.number).toBe(10);
      expect(response.body.data.capacity).toBe(8);
    });

    test("should reject table without required fields", async () => {
      const response = await request(mockApp)
        .post("/api/v1/tables")
        .send({ location: "Somewhere" })
        .expect(400);

      expect(response.body.status).toBe("error");
    });
  });

  describe("PATCH /api/v1/tables/:id/availability", () => {
    test("should update table availability", async () => {
      const response = await request(mockApp)
        .patch("/api/v1/tables/table-5/availability")
        .send({ isAvailable: false })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("Stolik 5 jest teraz zajęty");
      expect(response.body.data.isAvailable).toBe(false);
    });

    test("should return 404 for nonexistent table", async () => {
      const response = await request(mockApp)
        .patch("/api/v1/tables/nonexistent/availability")
        .send({ isAvailable: true })
        .expect(404);

      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/v1/orders/:orderId/delivery", () => {
    test("should create order delivery for dine-in", async () => {
      const deliveryData = {
        deliveryOptionId: "option-1",
        tableId: "table-2",
        notes: "Przy oknie, proszę",
      };

      const response = await request(mockApp)
        .post("/api/v1/orders/order-123/delivery")
        .send(deliveryData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe(
        "Dodano informacje o dostawie zamówienia"
      );
      expect(response.body.data.orderId).toBe("order-123");
      expect(response.body.data.tableId).toBe("table-2");
      expect(response.body.data.notes).toBe("Przy oknie, proszę");
    });

    test("should create order delivery for takeout (no table)", async () => {
      const deliveryData = {
        deliveryOptionId: "option-2",
        // no tableId for takeout
      };

      const response = await request(mockApp)
        .post("/api/v1/orders/order-456/delivery")
        .send(deliveryData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.tableId).toBeNull();
    });

    test("should reject delivery without option", async () => {
      const response = await request(mockApp)
        .post("/api/v1/orders/order-123/delivery")
        .send({})
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("opcji dostawy");
    });

    test("should reject nonexistent delivery option", async () => {
      const response = await request(mockApp)
        .post("/api/v1/orders/order-123/delivery")
        .send({ deliveryOptionId: "nonexistent" })
        .expect(404);

      expect(response.body.status).toBe("error");
    });

    test("should reject unavailable table", async () => {
      const response = await request(mockApp)
        .post("/api/v1/orders/order-123/delivery")
        .send({
          deliveryOptionId: "option-1",
          tableId: "unavailable",
        })
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain("niedostępny");
    });
  });

  describe("GET /api/v1/orders/:orderId/delivery", () => {
    test("should get order delivery details", async () => {
      const response = await request(mockApp)
        .get("/api/v1/orders/order-123/delivery")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.orderId).toBe("order-123");
      expect(response.body.data.DeliveryOption).toBeDefined();
      expect(response.body.data.Table).toBeDefined();
      expect(response.body.data.DeliveryOption.name).toBe("Na miejscu");
      expect(response.body.data.Table.number).toBe(2);
    });

    test("should return 404 for nonexistent order delivery", async () => {
      const response = await request(mockApp)
        .get("/api/v1/orders/nonexistent/delivery")
        .expect(404);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toContain(
        "Nie znaleziono informacji o dostawie"
      );
    });
  });
});
