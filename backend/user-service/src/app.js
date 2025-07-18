const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "user-service" });
});

app.use((req, res, next) => {
  const error = new Error(`Nie znaleziono - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

module.exports = app;
