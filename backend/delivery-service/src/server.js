require("dotenv").config();
const app = require("./app");
const { connect, sequelize } = require("./config/database");

const PORT = process.env.PORT || 3003;

connect()
  .then(async () => {
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Delivery Service działa na porcie ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Nie można uruchomić serwera:", err);
    process.exit(1);
  });
