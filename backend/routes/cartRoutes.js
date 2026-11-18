const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require("../controllers/cartController");
const { optionalAuth } = require("../middleware/auth");

router.get("/", optionalAuth, getCart);
router.post("/", optionalAuth, addToCart);
router.put("/:id", optionalAuth, updateCartItem);
router.delete("/:id", optionalAuth, removeCartItem);
router.delete("/", optionalAuth, clearCart);

module.exports = router;
