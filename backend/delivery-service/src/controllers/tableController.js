const Table = require("../models/sequelize/table");
const { Op } = require("sequelize");

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
