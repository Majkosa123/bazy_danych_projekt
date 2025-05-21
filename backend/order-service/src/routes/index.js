const express = require("express");
const orderRoutes = require("./orderRoutes");

const router = express.Router();

router.use("/orders", orderRoutes);

module.exports = router;
