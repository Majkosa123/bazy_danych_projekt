const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    dialect: "postgres",
    logging: false,
  }
);

const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Połączono z PostgreSQL.");

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Połączono z MongoDB.");

    return true;
  } catch (error) {
    console.error("Błąd podczas łączenia z bazą danych:", error);
    throw error;
  }
};

module.exports = {
  connect,
  sequelize,
  mongoose,
};
