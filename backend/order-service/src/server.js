require("dotenv").config();
const app = require("./app");
const { connect, sequelize } = require("./config/database");

const PORT = process.env.PORT || 3002;

connect()
  .then(async () => {
    await sequelize.sync({ alter: true });

    console.log("Tabele zostały utworzone/zaktualizowane");

    app.listen(PORT, () => {
      console.log(`Order Service działa na porcie ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Nie można uruchomić serwera:", err);
    process.exit(1);
  });
