const express = require("express");
const router = express.Router();
const {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment
} = require("../controllers/paymentController");

router.get("/config", getPaymentConfig);
router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);

module.exports = router;
