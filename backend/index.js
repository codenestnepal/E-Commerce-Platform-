const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { connectContactDB } = require("./config/contactDb");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const contactRoutes = require("./routes/contact");
const newsletterRoutes = require("./routes/newsletterRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRouter");
const searchRoutes = require("./routes/searchRoutes");
const categorySearchRoutes = require("./routes/categorySearchRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

// Attempt Database Connections
connectDB();
connectContactDB();

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
    message: "Nile E-Commerce Backend is operational",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Dedicated portal quick links
app.get("/admin", (req, res) => {
  res.sendFile(path.join(frontendPath, "Admin Portal", "admin.html"));
});

app.get("/vendor", (req, res) => {
  res.sendFile(path.join(frontendPath, "Vendor Portal", "vendor.html"));
});

// API Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/contact", contactRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api", searchRoutes);
app.use("/api", categorySearchRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/v1/admin", adminRoutes);

// Root fallback: serve frontend index.html if it exists, otherwise API greeting
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      res.send("Nile Backend is running!");
    }
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Nile Server running on port ${PORT}`);
  console.log(`  - Customer Store: http://localhost:${PORT}`);
  console.log(`  - Admin Portal:   http://localhost:${PORT}/admin`);
  console.log(`  - Vendor Portal:  http://localhost:${PORT}/vendor`);
  console.log(`  - Admin API:      http://localhost:${PORT}/api/v1/admin`);
  console.log(`=========================================`);
});
