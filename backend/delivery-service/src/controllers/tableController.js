const Table = require("../models/sequelize/table");
const { Op } = require("sequelize");

exports.getAllTables = async (req, res, next) => {
  try {
    const tables = await Table.findAll({
      order: [["number", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      results: tables.length,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableTables = async (req, res, next) => {
  try {
    const { capacity } = req.query;

    let whereClause = { isAvailable: true };

    if (capacity) {
      whereClause.capacity = { [Op.gte]: parseInt(capacity) };
    }

    const tables = await Table.findAll({
      where: whereClause,
      order: [["number", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      results: tables.length,
      data: tables,
      message: capacity
        ? `Stoliki dla min. ${capacity} osób`
        : "Wszystkie dostępne stoliki",
    });
  } catch (error) {
    next(error);
  }
};

exports.getTableById = async (req, res, next) => {
  try {
    const table = await Table.findByPk(req.params.id);

    if (!table) {
      const error = new Error("Nie znaleziono stolika o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTable = async (req, res, next) => {
  try {
    const table = await Table.create(req.body);

    res.status(201).json({
      status: "success",
      message: "Utworzono nowy stolik",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTableAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const table = await Table.findByPk(id);

    if (!table) {
      const error = new Error("Nie znaleziono stolika o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    await table.update({ isAvailable });

    res.status(200).json({
      status: "success",
      message: `Stolik ${table.number} jest teraz ${
        isAvailable ? "dostępny" : "zajęty"
      }`,
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTablesByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;

    const tables = await Table.findAll({
      where: {
        location: { [Op.iLike]: `%${location}%` },
      },
      order: [["number", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      results: tables.length,
      data: tables,
      location: location,
    });
  } catch (error) {
    next(error);
  }
};

exports.getTableStatistics = async (req, res, next) => {
  try {
    const totalTables = await Table.count();
    const availableTables = await Table.count({ where: { isAvailable: true } });
    const occupiedTables = totalTables - availableTables;

    const capacityStats = await Table.findAll({
      attributes: [
        "capacity",
        [sequelize.fn("COUNT", sequelize.col("capacity")), "count"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CASE WHEN "isAvailable" = true THEN 1 ELSE 0 END'
            )
          ),
          "available",
        ],
      ],
      group: ["capacity"],
      order: [["capacity", "ASC"]],
    });

    const locationStats = await Table.findAll({
      attributes: [
        "location",
        [sequelize.fn("COUNT", sequelize.col("location")), "total"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CASE WHEN "isAvailable" = true THEN 1 ELSE 0 END'
            )
          ),
          "available",
        ],
      ],
      group: ["location"],
      order: [["location", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      data: {
        overview: {
          total: totalTables,
          available: availableTables,
          occupied: occupiedTables,
          occupancyRate:
            ((occupiedTables / totalTables) * 100).toFixed(1) + "%",
        },
        byCapacity: capacityStats,
        byLocation: locationStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdateTableAvailability = async (req, res, next) => {
  try {
    const { updates } = req.body; // [{ tableId, isAvailable }, ...]

    if (!Array.isArray(updates) || updates.length === 0) {
      const error = new Error("Brak danych do aktualizacji");
      error.statusCode = 400;
      return next(error);
    }

    const results = [];

    for (const update of updates) {
      const { tableId, isAvailable } = update;

      const table = await Table.findByPk(tableId);
      if (table) {
        await table.update({ isAvailable });
        results.push({
          tableId,
          number: table.number,
          isAvailable,
          updated: true,
        });
      }
    }

    res.status(200).json({
      status: "success",
      message: `Zaktualizowano dostępność ${results.length} stolików`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

exports.reserveTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerName, duration = 120 } = req.body;

    const table = await Table.findByPk(id);

    if (!table) {
      const error = new Error("Nie znaleziono stolika o podanym ID");
      error.statusCode = 404;
      return next(error);
    }

    if (!table.isAvailable) {
      const error = new Error("Stolik jest już zajęty");
      error.statusCode = 400;
      return next(error);
    }

    await table.update({
      isAvailable: false,
    });

    setTimeout(() => {
      table.update({ isAvailable: true });
    }, duration * 60 * 1000);

    res.status(200).json({
      status: "success",
      message: `Stolik ${table.number} został zarezerwowany`,
      data: {
        table,
        reservation: {
          customerName,
          duration: `${duration} minut`,
          reservedAt: new Date(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
