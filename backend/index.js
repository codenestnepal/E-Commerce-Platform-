const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config();
connectDB();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/api/auth", require("./routes/authRoutes"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});