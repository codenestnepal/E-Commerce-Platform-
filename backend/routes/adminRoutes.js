const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

// Authentication & Profile
router.post("/login", adminController.adminLogin);
router.get("/me", adminAuth, adminController.getAdminProfile);

// State Synchronization & Dashboard
router.get("/state", adminController.getInitialState);
router.get("/dashboard", adminController.getDashboardSummary);

// Users Management
router.get("/users", adminController.getUsers);
router.put("/users/:id/status", adminController.updateUserStatus);
router.delete("/users/:id", adminController.deleteUser);

// Vendors Management
router.get("/vendors", adminController.getVendors);
router.put("/vendors/:id/status", adminController.updateVendorStatus);
router.put("/vendors/:id/rate", adminController.updateVendorRate);

// Products Management
router.get("/products", adminController.getProducts);
router.put("/products/:id/status", adminController.updateProductStatus);
router.delete("/products/:id", adminController.deleteProduct);

// Categories Management
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.addCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// Orders & Payments Management
router.get("/orders", adminController.getOrders);
router.put("/orders/:id/status", adminController.updateOrderStatus);
router.put("/orders/:id/payment", adminController.updatePaymentStatus);

// Commission Management
router.get("/commission", adminController.getCommission);
router.put("/commission/default", adminController.updateDefaultCommission);
router.put("/commission/vendor/:id", adminController.updateVendorRate);

// Coupons Management
router.get("/coupons", adminController.getCoupons);
router.post("/coupons", adminController.addCoupon);
router.put("/coupons/:id/toggle", adminController.toggleCoupon);
router.delete("/coupons/:id", adminController.deleteCoupon);

// Reports & Analytics
router.get("/reports", adminController.getReports);

// Reviews & Complaints Management
router.get("/reviews", adminController.getReviews);
router.post("/reviews", adminController.addReview);
router.put("/reviews/:id/status", adminController.updateReviewStatus);

// Announcements
router.get("/announcements", adminController.getAnnouncements);
router.post("/announcements", adminController.addAnnouncement);
router.delete("/announcements/:id", adminController.deleteAnnouncement);

// Settings
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

// Roles & Permissions
router.get("/roles", adminController.getRoles);
router.post("/roles", adminController.addRole);
router.delete("/roles/:id", adminController.deleteRole);
router.put("/roles/:id/permissions", adminController.updateRolePermissions);

module.exports = router;
