let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  mongoose = { connection: { readyState: 0 }, Types: { ObjectId: { isValid: () => false } } };
}
let Wishlist;
try {
  Wishlist = require("../model/whishlist");
} catch (e) {}

const isDbConnected = () => mongoose && mongoose.connection && mongoose.connection.readyState === 1;
const memoryWishlists = new Map();

const getUserId = (req) => {
  return req.user ? String(req.user.id || req.user._id) : "guest_user";
};

// -------------------------------------------------------------
// ADD TO WISHLIST
// -------------------------------------------------------------
const addToWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId, name, price, image, category } = req.body;

    if (!productId && !name) {
      return res.status(400).json({ success: false, message: "Product identification required." });
    }

    if (isDbConnected() && Wishlist && mongoose.Types.ObjectId.isValid(productId)) {
      try {
        const existing = await Wishlist.findOne({ user: userId, product: productId });
        if (!existing) {
          const item = await Wishlist.create({ user: userId, product: productId });
          return res.status(201).json({ success: true, message: "Item added to wishlist.", item });
        }
        return res.status(200).json({ success: true, message: "Item already in wishlist." });
      } catch (dbErr) {
        console.warn("[Wishlist DB Fallback]", dbErr.message);
      }
    }

    // In-memory fallback
    const list = memoryWishlists.get(userId) || [];
    const prodKey = productId || name;
    if (!list.some(it => it.productId === prodKey)) {
      list.push({
        id: "w_" + Date.now(),
        productId: prodKey,
        name: name || "Product",
        price: Number(price) || 0,
        image: image || "",
        category: category || "General"
      });
      memoryWishlists.set(userId, list);
    }

    return res.status(200).json({ success: true, message: "Item added to wishlist.", wishlist: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// GET WISHLIST
// -------------------------------------------------------------
const getWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (isDbConnected() && Wishlist) {
      try {
        const items = await Wishlist.find({ user: userId }).populate("product").lean();
        if (items && items.length > 0) {
          return res.status(200).json({ success: true, items });
        }
      } catch (e) {}
    }

    const items = memoryWishlists.get(userId) || [];
    return res.status(200).json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// REMOVE FROM WISHLIST
// -------------------------------------------------------------
const removeFromWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (isDbConnected() && Wishlist && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Wishlist.findOneAndDelete({ _id: id, user: userId });
      } catch (e) {}
    }

    let list = memoryWishlists.get(userId) || [];
    list = list.filter(it => it.id !== id && it.productId !== id && it.name !== id);
    memoryWishlists.set(userId, list);

    return res.status(200).json({ success: true, message: "Item removed from wishlist.", wishlist: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// CLEAR WISHLIST
// -------------------------------------------------------------
const clearWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (isDbConnected() && Wishlist) {
      try {
        await Wishlist.deleteMany({ user: userId });
      } catch (e) {}
    }

    memoryWishlists.delete(userId);
    return res.status(200).json({ success: true, message: "Wishlist cleared." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist
};
