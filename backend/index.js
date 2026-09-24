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

dotenv.config();
connectDB();
connectContactDB();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));;

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/contact", contactRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api",searchRoutes);
app.use("/api",categorySearchRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});