require("dotenv").config();
const app = require("./app");
const { connect, sequelize } = require("./config/database");
const { seedAll } = require("./utils/seedData");

const PORT = process.env.PORT || 3004;

connect()
  .then(async () => {
    await sequelize.sync({ alter: true });

    await seedAll();

    app.listen(PORT, () => {
      console.log(`Payment Service działa na porcie ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Nie można uruchomić serwera:", err);
    process.exit(1);
  });
