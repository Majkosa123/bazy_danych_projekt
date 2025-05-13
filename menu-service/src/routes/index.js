const express = require("express");
const categoryRoutes = require("./categoryRoutes");
const productRoutes = require("./productRoutes");

const router = express.Router();

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);

module.exports = router;
