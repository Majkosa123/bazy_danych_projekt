const Table = require("../models/sequelize/table");

exports.getAllTables = async (req, res, next) => {
  try {
    const tables = await Table.findAll();

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
    const tables = await Table.findAll({
      where: { isAvailable: true },
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
      message: "Zaktualizowano dostępność stolika",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};
