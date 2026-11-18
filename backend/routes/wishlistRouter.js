const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist
} = require("../controllers/whishlistController");
const { optionalAuth } = require("../middleware/auth");

router.get("/", optionalAuth, getWishlist);
router.post("/", optionalAuth, addToWishlist);
router.delete("/:id", optionalAuth, removeFromWishlist);
router.delete("/", optionalAuth, clearWishlist);

module.exports = router;
