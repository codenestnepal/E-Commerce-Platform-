const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRouter");
const contactRoutes = require("./routes/contact");
const newsletterRoutes = require("./routes/newsletterRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const searchRoutes = require("./routes/searchRoutes");
const categorySearchRoutes = require("./routes/categorySearchRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

// Attempt Main MongoDB Connection
connectDB();

const PORT = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Frontend Static Assets
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// API Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Nile E-Commerce Platform is operational",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Portal and Page Quick Shortcuts
app.get("/admin", (req, res) => res.sendFile(path.join(frontendPath, "Admin Portal", "admin.html")));
app.get("/vendor", (req, res) => res.sendFile(path.join(frontendPath, "Vendor Portal", "vendor.html")));
app.get("/cart", (req, res) => res.sendFile(path.join(frontendPath, "cart.html")));
app.get("/checkout", (req, res) => res.sendFile(path.join(frontendPath, "checkout.html")));
app.get("/orders", (req, res) => res.sendFile(path.join(frontendPath, "orders.html")));
app.get("/shop", (req, res) => res.sendFile(path.join(frontendPath, "shop.html")));
app.get("/wishlist", (req, res) => res.sendFile(path.join(frontendPath, "wishlist.html")));

// Core API Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/contact", contactRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api", searchRoutes);
app.use("/api", categorySearchRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/v1/admin", adminRoutes);

// Root fallback
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) res.send("Nile Backend is running!");
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Nile Server running on port ${PORT}`);
  console.log(`  - Customer Store: http://localhost:${PORT}`);
  console.log(`  - Shop Catalog:   http://localhost:${PORT}/shop`);
  console.log(`  - Shopping Cart:  http://localhost:${PORT}/cart`);
  console.log(`  - Checkout:       http://localhost:${PORT}/checkout`);
  console.log(`  - Order History:  http://localhost:${PORT}/orders`);
  console.log(`  - Admin Portal:   http://localhost:${PORT}/admin`);
  console.log(`  - Vendor Portal:  http://localhost:${PORT}/vendor`);
  console.log(`=========================================`);
});
