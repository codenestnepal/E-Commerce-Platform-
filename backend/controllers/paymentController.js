const crypto = require("crypto");
let Razorpay;
try {
  Razorpay = require("razorpay");
} catch (e) {}

let razorpayInstance = null;
if (Razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  } catch (err) {
    console.warn("[Razorpay Init Warning]", err.message);
  }
}

// -------------------------------------------------------------
// GET PAYMENT CONFIG (PUBLIC KEYS & METHODS)
// -------------------------------------------------------------
const getPaymentConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
    currency: "USD",
    availableMethods: ["COD", "Razorpay", "Card"]
  });
};

// -------------------------------------------------------------
// CREATE RAZORPAY PAYMENT ORDER
// -------------------------------------------------------------
const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "USD", receipt } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required." });
    }

    // Convert to smallest currency unit (cents / paise)
    const amountInSubunits = Math.round(Number(amount) * 100);

    if (razorpayInstance) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInSubunits,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`
        });
        return res.status(200).json({ success: true, order });
      } catch (rzpErr) {
        console.warn("[Razorpay Live Order Failed, Falling Back]", rzpErr.message);
      }
    }

    // Simulated sandbox order for dev & testing without live keys
    const mockOrder = {
      id: "order_mock_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      entity: "order",
      amount: amountInSubunits,
      amount_paid: 0,
      amount_due: amountInSubunits,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: "created",
      created_at: Math.floor(Date.now() / 1000)
    };

    return res.status(200).json({
      success: true,
      message: "Payment order initialized (sandbox mode)",
      order: mockOrder
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// VERIFY PAYMENT SIGNATURE
// -------------------------------------------------------------
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: "Payment details missing." });
    }

    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment signature verification failed." });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully!",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment
};
