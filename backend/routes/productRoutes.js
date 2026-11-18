const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts
} = require("../controllers/productController");

router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);
router.get("/", getProducts);

module.exports = router;
