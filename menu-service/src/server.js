require("dotenv").config();
const app = require("./app");
const { connect } = require("./config/database");

const PORT = process.env.PORT || 3001;

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Menu Service działa na porcie ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Nie można uruchomić serwera:", err);
    process.exit(1);
  });
