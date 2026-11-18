let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  mongoose = { connection: { readyState: 0 }, Types: { ObjectId: { isValid: () => false } } };
}
let Cart;
try {
  Cart = require("../model/cart");
} catch (e) {}

const isDbConnected = () => mongoose && mongoose.connection && mongoose.connection.readyState === 1;

// In-memory fallback cart store per user
const memoryCarts = new Map();

const getUserId = (req) => {
  return req.user ? String(req.user.id || req.user._id) : "guest_user";
};

// -------------------------------------------------------------
// ADD TO CART
// -------------------------------------------------------------
const addToCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId, quantity = 1, name, price, image } = req.body;

    if (!productId && !name) {
      return res.status(400).json({ success: false, message: "Product identification required." });
    }

    if (isDbConnected() && Cart && mongoose.Types.ObjectId.isValid(productId)) {
      try {
        let existing = await Cart.findOne({ user: userId, product: productId });
        if (existing) {
          existing.quantity += Number(quantity);
          await existing.save();
          return res.status(200).json({ success: true, message: "Cart quantity updated.", item: existing });
        } else {
          const item = await Cart.create({
            user: userId,
            product: productId,
            quantity: Number(quantity)
          });
          return res.status(201).json({ success: true, message: "Item added to cart.", item });
        }
      } catch (dbErr) {
        console.warn("[Cart DB Fallback]", dbErr.message);
      }
    }

    // In-memory fallback
    const userCart = memoryCarts.get(userId) || [];
    const prodKey = productId || name;
    const existing = userCart.find(it => it.productId === prodKey);

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      userCart.push({
        id: "c_" + Date.now(),
        productId: prodKey,
        name: name || "Product",
        price: Number(price) || 0,
        image: image || "",
        quantity: Number(quantity)
      });
    }

    memoryCarts.set(userId, userCart);

    return res.status(200).json({
      success: true,
      message: "Cart updated.",
      cart: userCart
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// GET CART
// -------------------------------------------------------------
const getCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (isDbConnected() && Cart) {
      try {
        const cart = await Cart.find({ user: userId }).populate("product").lean();
        if (cart && cart.length > 0) {
          return res.status(200).json({ success: true, items: cart });
        }
      } catch (e) {}
    }

    const items = memoryCarts.get(userId) || [];
    return res.status(200).json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// UPDATE CART ITEM QUANTITY
// -------------------------------------------------------------
const updateCartItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || Number(quantity) < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1." });
    }

    if (isDbConnected() && Cart && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const updated = await Cart.findOneAndUpdate(
          { _id: id, user: userId },
          { quantity: Number(quantity) },
          { new: true }
        );
        if (updated) {
          return res.status(200).json({ success: true, message: "Quantity updated.", item: updated });
        }
      } catch (e) {}
    }

    const userCart = memoryCarts.get(userId) || [];
    const item = userCart.find(it => it.id === id || it.productId === id);
    if (item) {
      item.quantity = Number(quantity);
      return res.status(200).json({ success: true, message: "Quantity updated.", cart: userCart });
    }

    return res.status(404).json({ success: false, message: "Cart item not found." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// REMOVE SINGLE CART ITEM
// -------------------------------------------------------------
const removeCartItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (isDbConnected() && Cart && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Cart.findOneAndDelete({ _id: id, user: userId });
      } catch (e) {}
    }

    let userCart = memoryCarts.get(userId) || [];
    userCart = userCart.filter(it => it.id !== id && it.productId !== id);
    memoryCarts.set(userId, userCart);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart.",
      cart: userCart
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// CLEAR ENTIRE CART
// -------------------------------------------------------------
const clearCart = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (isDbConnected() && Cart) {
      try {
        await Cart.deleteMany({ user: userId });
      } catch (e) {}
    }

    memoryCarts.delete(userId);

    return res.status(200).json({
      success: true,
      message: "Cart cleared."
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
