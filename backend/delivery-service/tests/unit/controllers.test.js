// backend/delivery-service/tests/unit/controllers.test.js

// Import mockowanych modeli (muszą być na górze!)
const DeliveryOption = require("../../src/models/sequelize/deliveryOption");
const Table = require("../../src/models/sequelize/table");
const OrderDelivery = require("../../src/models/sequelize/orderDelivery");
const orderService = require("../../src/services/orderService");

// Import kontrolerów PO mockach
const deliveryOptionController = require("../../src/controllers/deliveryOptionController");
const tableController = require("../../src/controllers/tableController");
const orderDeliveryController = require("../../src/controllers/orderDeliveryController");

describe("Delivery Service Controllers Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("DeliveryOptionController", () => {
    describe("getAllDeliveryOptions", () => {
      test("should get all active delivery options", async () => {
        const mockOptions = [
          {
            id: "option-1",
            name: "Na miejscu",
            description: "Zamówienie do stolika",
            isActive: true,
            estimatedTimeMinutes: 15,
          },
          {
            id: "option-2",
            name: "Na wynos",
            description: "Odbiór osobisty",
            isActive: true,
            estimatedTimeMinutes: 10,
          },
        ];

        DeliveryOption.findAll.mockResolvedValue(mockOptions);

        await deliveryOptionController.getAllDeliveryOptions(req, res, next);

        expect(DeliveryOption.findAll).toHaveBeenCalledWith({
          where: { isActive: true },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          results: 2,
          data: mockOptions,
        });
      });

      test("should handle database error", async () => {
        DeliveryOption.findAll.mockRejectedValue(new Error("Database error"));

        await deliveryOptionController.getAllDeliveryOptions(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    describe("getDeliveryOptionById", () => {
      test("should get delivery option by id", async () => {
        req.params.id = "option-1";

        const mockOption = {
          id: "option-1",
          name: "Na miejscu",
          description: "Zamówienie do stolika",
          isActive: true,
          estimatedTimeMinutes: 15,
        };

        DeliveryOption.findByPk.mockResolvedValue(mockOption);

        await deliveryOptionController.getDeliveryOptionById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          data: mockOption,
        });
      });

      test("should handle option not found", async () => {
        req.params.id = "nonexistent-option";

        DeliveryOption.findByPk.mockResolvedValue(null);

        await deliveryOptionController.getDeliveryOptionById(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Nie znaleziono opcji dostawy o podanym ID",
            statusCode: 404,
          })
        );
      });
    });
  });

  describe("TableController", () => {
    describe("getAvailableTables", () => {
      test("should get all available tables", async () => {
        const mockTables = [
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
        ];

        Table.findAll.mockResolvedValue(mockTables);

        await tableController.getAvailableTables(req, res, next);

        expect(Table.findAll).toHaveBeenCalledWith({
          where: { isAvailable: true },
          order: [["number", "ASC"]],
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          results: 2,
          data: mockTables,
          message: "Wszystkie dostępne stoliki",
        });
      });

      test("should filter tables by capacity", async () => {
        req.query.capacity = "4";

        const mockTables = [
          {
            id: "table-2",
            number: 2,
            capacity: 4,
            isAvailable: true,
            location: "Środek sali",
          },
        ];

        Table.findAll.mockResolvedValue(mockTables);

        await tableController.getAvailableTables(req, res, next);

        expect(Table.findAll).toHaveBeenCalledWith({
          where: {
            isAvailable: true,
            capacity: { [require("sequelize").Op.gte]: 4 },
          },
          order: [["number", "ASC"]],
        });
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Stoliki dla min. 4 osób",
          })
        );
      });
    });

    describe("createTable", () => {
      test("should create new table", async () => {
        req.body = {
          number: 10,
          capacity: 6,
          location: "Nowa część",
        };

        const mockTable = {
          id: "table-10",
          number: 10,
          capacity: 6,
          isAvailable: true,
          location: "Nowa część",
        };

        Table.create.mockResolvedValue(mockTable);

        await tableController.createTable(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          message: "Utworzono nowy stolik",
          data: mockTable,
        });
      });
    });

    describe("updateTableAvailability", () => {
      test("should update table availability", async () => {
        req.params.id = "table-1";
        req.body.isAvailable = false;

        const mockTable = {
          id: "table-1",
          number: 1,
          capacity: 2,
          isAvailable: true,
          update: jest.fn().mockResolvedValue({
            id: "table-1",
            number: 1,
            isAvailable: false,
          }),
        };

        Table.findByPk.mockResolvedValue(mockTable);

        await tableController.updateTableAvailability(req, res, next);

        expect(mockTable.update).toHaveBeenCalledWith({ isAvailable: false });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          message: "Stolik 1 jest teraz zajęty",
          data: mockTable,
        });
      });

      test("should handle table not found", async () => {
        req.params.id = "nonexistent-table";
        req.body.isAvailable = false;

        Table.findByPk.mockResolvedValue(null);

        await tableController.updateTableAvailability(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Nie znaleziono stolika o podanym ID",
            statusCode: 404,
          })
        );
      });
    });
  });

  describe("OrderDeliveryController", () => {
    describe("createOrderDelivery", () => {
      test("should create order delivery for dine-in", async () => {
        req.params.orderId = "order-123";
        req.body = {
          deliveryOptionId: "option-1",
          tableId: "table-2",
          notes: "Przy oknie",
        };

        const mockOrder = { id: "order-123", status: "cart" };
        const mockDeliveryOption = {
          id: "option-1",
          name: "Na miejscu",
          estimatedTimeMinutes: 15,
        };
        const mockTable = {
          id: "table-2",
          number: 2,
          isAvailable: true,
          update: jest.fn(),
        };
        const mockOrderDelivery = {
          id: "delivery-1",
          orderId: "order-123",
          deliveryOptionId: "option-1",
          tableId: "table-2",
          estimatedDeliveryTime: expect.any(Date),
          notes: "Przy oknie",
        };

        orderService.getOrderById.mockResolvedValue(mockOrder);
        DeliveryOption.findByPk.mockResolvedValue(mockDeliveryOption);
        Table.findByPk.mockResolvedValue(mockTable);
        OrderDelivery.create.mockResolvedValue(mockOrderDelivery);
        orderService.updateOrderStatus.mockResolvedValue(true);

        const mockTransaction = {
          commit: jest.fn(),
          rollback: jest.fn(),
        };
        const { sequelize } = require("../../src/config/database");
        sequelize.transaction.mockResolvedValue(mockTransaction);

        await orderDeliveryController.createOrderDelivery(req, res, next);

        expect(mockTable.update).toHaveBeenCalledWith(
          { isAvailable: false },
          { transaction: mockTransaction }
        );
        expect(orderService.updateOrderStatus).toHaveBeenCalledWith(
          "order-123",
          "pending"
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          message: "Dodano informacje o dostawie zamówienia",
          data: mockOrderDelivery,
        });
      });

      test("should create order delivery for takeout (no table)", async () => {
        req.params.orderId = "order-123";
        req.body = {
          deliveryOptionId: "option-2",
          // no tableId for takeout
        };

        const mockOrder = { id: "order-123" };
        const mockDeliveryOption = {
          id: "option-2",
          name: "Na wynos",
          estimatedTimeMinutes: 10,
        };
        const mockOrderDelivery = {
          id: "delivery-1",
          orderId: "order-123",
          deliveryOptionId: "option-2",
          tableId: null,
        };

        orderService.getOrderById.mockResolvedValue(mockOrder);
        DeliveryOption.findByPk.mockResolvedValue(mockDeliveryOption);
        OrderDelivery.create.mockResolvedValue(mockOrderDelivery);
        orderService.updateOrderStatus.mockResolvedValue(true);

        const mockTransaction = {
          commit: jest.fn(),
          rollback: jest.fn(),
        };
        const { sequelize } = require("../../src/config/database");
        sequelize.transaction.mockResolvedValue(mockTransaction);

        await orderDeliveryController.createOrderDelivery(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          message: "Dodano informacje o dostawie zamówienia",
          data: mockOrderDelivery,
        });
      });

      test("should handle unavailable table", async () => {
        req.params.orderId = "order-123";
        req.body = {
          deliveryOptionId: "option-1",
          tableId: "table-occupied",
        };

        const mockOrder = { id: "order-123" };
        const mockDeliveryOption = { id: "option-1" };
        const mockTable = {
          id: "table-occupied",
          number: 5,
          isAvailable: false, // Table is occupied
        };

        orderService.getOrderById.mockResolvedValue(mockOrder);
        DeliveryOption.findByPk.mockResolvedValue(mockDeliveryOption);
        Table.findByPk.mockResolvedValue(mockTable);

        const mockTransaction = {
          commit: jest.fn(),
          rollback: jest.fn(),
        };
        const { sequelize } = require("../../src/config/database");
        sequelize.transaction.mockResolvedValue(mockTransaction);

        await orderDeliveryController.createOrderDelivery(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Wybrany stolik jest niedostępny",
            statusCode: 400,
          })
        );
      });

      test("should handle delivery option not found", async () => {
        req.params.orderId = "order-123";
        req.body = {
          deliveryOptionId: "nonexistent-option",
        };

        orderService.getOrderById.mockResolvedValue({ id: "order-123" });
        DeliveryOption.findByPk.mockResolvedValue(null);

        const mockTransaction = {
          commit: jest.fn(),
          rollback: jest.fn(),
        };
        const { sequelize } = require("../../src/config/database");
        sequelize.transaction.mockResolvedValue(mockTransaction);

        await orderDeliveryController.createOrderDelivery(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Nie znaleziono opcji dostawy o podanym ID",
            statusCode: 404,
          })
        );
      });
    });

    describe("getOrderDeliveryByOrderId", () => {
      test("should get order delivery with details", async () => {
        req.params.orderId = "order-123";

        const mockOrderDelivery = {
          id: "delivery-1",
          orderId: "order-123",
          DeliveryOption: {
            id: "option-1",
            name: "Na miejscu",
          },
          Table: {
            id: "table-2",
            number: 2,
            capacity: 4,
          },
        };

        OrderDelivery.findOne.mockResolvedValue(mockOrderDelivery);

        await orderDeliveryController.getOrderDeliveryByOrderId(req, res, next);

        expect(OrderDelivery.findOne).toHaveBeenCalledWith({
          where: { orderId: "order-123" },
          include: [{ model: DeliveryOption }, { model: Table }],
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: "success",
          data: mockOrderDelivery,
        });
      });

      test("should handle order delivery not found", async () => {
        req.params.orderId = "nonexistent-order";

        OrderDelivery.findOne.mockResolvedValue(null);

        await orderDeliveryController.getOrderDeliveryByOrderId(req, res, next);

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Nie znaleziono informacji o dostawie dla tego zamówienia",
            statusCode: 404,
          })
        );
      });
    });
  });
});
