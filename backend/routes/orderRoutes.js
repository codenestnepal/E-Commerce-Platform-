const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} = require("../controllers/orderController");
const { ensureAuthenticated, optionalAuth } = require("../middleware/auth");

router.post("/", optionalAuth, createOrder);
router.get("/my-orders", ensureAuthenticated, getMyOrders);
router.get("/:id", optionalAuth, getOrderById);
router.put("/:id/cancel", optionalAuth, cancelOrder);

module.exports = router;
