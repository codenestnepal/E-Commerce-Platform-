let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  mongoose = { connection: { readyState: 0 }, Types: { ObjectId: { isValid: () => false } } };
}
let Order;
try {
  Order = require("../model/Order");
} catch (e) {}

let Product;
try {
  Product = require("../model/product");
} catch (e) {}

const isDbConnected = () => mongoose && mongoose.connection && mongoose.connection.readyState === 1;

// In-memory fallback orders store
let memoryOrders = [];

// Helper to generate a clean order number
const generateOrderNumber = () => "ORD-" + Math.floor(100000 + Math.random() * 900000);

// -------------------------------------------------------------
// CREATE ORDER (CHECKOUT)
// -------------------------------------------------------------
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = "COD",
      couponCode = "",
      discount = 0
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Your order must contain at least one item." });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: "Please provide a complete shipping address." });
    }

    // Validate and calculate totals
    const formattedItems = items.map(item => ({
      productId: item.productId && mongoose.Types.ObjectId.isValid(item.productId) ? item.productId : undefined,
      name: item.name || "Product Item",
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      vendorName: item.vendorName || "Nile Store"
    }));

    const subtotal = formattedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const discountAmount = Math.min(Number(discount) || 0, subtotal);
    const shipping = subtotal > 100 ? 0 : 15;
    const tax = Number(((subtotal - discountAmount) * 0.05).toFixed(2));
    const totalAmount = Number((subtotal - discountAmount + shipping + tax).toFixed(2));

    const orderNumber = generateOrderNumber();
    const customerId = req.user ? (req.user._id || req.user.id) : undefined;
    const customerName = shippingAddress.fullName;
    const customerEmail = shippingAddress.email || (req.user ? req.user.email : "");

    const orderData = {
      orderNumber,
      customerId,
      customerName,
      customerEmail,
      shippingAddress,
      items: formattedItems,
      totalAmount,
      subtotal,
      discount: discountAmount,
      shippingFee: shipping,
      taxFee: tax,
      couponCode,
      paymentMethod,
      status: "pending",
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
      createdAt: new Date().toISOString()
    };

    if (isDbConnected() && Order) {
      try {
        const newOrder = new Order({
          orderNumber,
          customerId,
          customerName,
          items: formattedItems,
          totalAmount,
          status: "pending",
          paymentStatus: paymentMethod === "COD" ? "pending" : "paid"
        });
        await newOrder.save();
        orderData._id = newOrder._id;
      } catch (dbErr) {
        console.warn("[Order DB Save Fallback]", dbErr.message);
      }
    }

    memoryOrders.unshift(orderData);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: orderData
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ success: false, message: "Failed to place order.", error: error.message });
  }
};

// -------------------------------------------------------------
// GET CUSTOMER'S ORDERS
// -------------------------------------------------------------
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const userEmail = req.user ? req.user.email : null;

    if (!userId && !userEmail) {
      return res.status(401).json({ success: false, message: "Authentication required to view orders." });
    }

    if (isDbConnected() && Order) {
      try {
        const query = {
          $or: [
            ...(userId ? [{ customerId: userId }] : []),
            ...(userEmail ? [{ customerName: userEmail }] : [])
          ]
        };
        const dbOrders = await Order.find(query).sort({ createdAt: -1 }).lean();
        if (dbOrders && dbOrders.length > 0) {
          return res.status(200).json({ success: true, count: dbOrders.length, orders: dbOrders });
        }
      } catch (e) {}
    }

    // In-memory lookup
    const list = memoryOrders.filter(o =>
      (userId && String(o.customerId) === String(userId)) ||
      (userEmail && o.customerEmail && o.customerEmail.toLowerCase() === userEmail.toLowerCase())
    );

    return res.status(200).json({ success: true, count: list.length, orders: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// GET SINGLE ORDER (TRACKING)
// -------------------------------------------------------------
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && Order) {
      try {
        const order = await Order.findOne({
          $or: [
            { orderNumber: id },
            ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
          ]
        }).lean();

        if (order) {
          return res.status(200).json({ success: true, order });
        }
      } catch (e) {}
    }

    const found = memoryOrders.find(o => o.orderNumber === id || o._id === id || o.id === id);
    if (!found) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    return res.status(200).json({ success: true, order: found });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------------
// CANCEL ORDER
// -------------------------------------------------------------
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const mem = memoryOrders.find(o => o.orderNumber === id || o._id === id);
    if (mem) {
      if (mem.status === "delivered" || mem.status === "shipped") {
        return res.status(400).json({ success: false, message: "Cannot cancel an order that has already shipped." });
      }
      mem.status = "cancelled";
    }

    if (isDbConnected() && Order) {
      await Order.findOneAndUpdate(
        { $or: [{ orderNumber: id }, ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])] },
        { status: "cancelled" }
      );
    }

    return res.status(200).json({ success: true, message: "Order cancelled successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
};
