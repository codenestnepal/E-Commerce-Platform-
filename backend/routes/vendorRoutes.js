const express = require("express");
const router = express.Router();
const vendorAuth = require("../middleware/vendorAuth");
const {
    getDashboardStats,
    getSalesMetrics,
    getProducts,
    createProduct,
    deleteProduct,
    getInventory,
    updateStock,
    getCategories,
    createCategory,
    getOrders,
    updateOrderStatus,
    getPromotions,
    createPromotion,
    deletePromotion,
    getProfile,
    updateProfile,
    getNotifications,
    markNotificationAsRead
} = require("../controllers/vendorController");

// All vendor routes require authentication & vendor role
router.use(vendorAuth);

// Dashboard & Sales Analytics
router.get("/dashboard/stats", getDashboardStats);
router.get("/sales/metrics", getSalesMetrics);

// Product Management
router.get("/products", getProducts);
router.post("/products", createProduct);
router.delete("/products/:id", deleteProduct);

// Inventory Management
router.get("/inventory", getInventory);
router.patch("/inventory/:id", updateStock);

// Category Management
router.get("/categories", getCategories);
router.post("/categories", createCategory);

// Orders Management
router.get("/orders", getOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// Promotions Management
router.get("/promotions", getPromotions);
router.post("/promotions", createPromotion);
router.delete("/promotions/:id", deletePromotion);

// Store Profile Management
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Notifications
router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationAsRead);

module.exports = router;
