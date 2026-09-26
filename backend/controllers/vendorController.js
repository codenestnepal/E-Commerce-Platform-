const Product = require("../model/product");
const Category = require("../model/categories");
const Order = require("../model/Order");
const Promotion = require("../model/Promotion");
const Notification = require("../model/Notification");
const VendorProfile = require("../model/VendorProfile");

// -------------------------------------------------------------
// DASHBOARD & ANALYTICS
// -------------------------------------------------------------
const getDashboardStats = async (req, res) => {
    try {
        const vendorId = req.vendorId;

        // 1. Total products
        const totalProducts = await Product.countDocuments({ vendorId, isActive: true });

        // 2. Pending orders
        const pendingOrders = await Order.countDocuments({
            "items.vendorId": vendorId,
            status: "pending"
        });

        // 3. Total sales (aggregate paid/shipped/delivered orders)
        const salesAggregation = await Order.aggregate([
            { $match: { "items.vendorId": vendorId, status: { $in: ["paid", "delivered", "shipped"] } } },
            { $unwind: "$items" },
            { $match: { "items.vendorId": vendorId } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            }
        ]);
        const totalSales = salesAggregation.length > 0 ? salesAggregation[0].totalSales : 0;

        // 4. Notifications count (unread or total)
        const unreadNotifs = await Notification.countDocuments({ vendorId, isRead: false });

        return res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                pendingOrders,
                totalSales: Number(totalSales.toFixed(2)),
                notifications: unreadNotifs
            }
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats", error: error.message });
    }
};

const getSalesMetrics = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Sales this week
        const weekSalesAgg = await Order.aggregate([
            {
                $match: {
                    "items.vendorId": vendorId,
                    status: { $in: ["paid", "delivered", "shipped"] },
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            { $unwind: "$items" },
            { $match: { "items.vendorId": vendorId } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } }
        ]);
        const thisWeek = weekSalesAgg.length > 0 ? weekSalesAgg[0].total : 0;

        // Sales this month
        const monthSalesAgg = await Order.aggregate([
            {
                $match: {
                    "items.vendorId": vendorId,
                    status: { $in: ["paid", "delivered", "shipped"] },
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            { $unwind: "$items" },
            { $match: { "items.vendorId": vendorId } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } }
        ]);
        const thisMonth = monthSalesAgg.length > 0 ? monthSalesAgg[0].total : 0;

        // Average order value
        const allOrdersAgg = await Order.aggregate([
            {
                $match: {
                    "items.vendorId": vendorId,
                    status: { $in: ["paid", "delivered", "shipped"] }
                }
            },
            { $unwind: "$items" },
            { $match: { "items.vendorId": vendorId } },
            {
                $group: {
                    _id: "$_id",
                    orderVendorTotal: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            {
                $group: {
                    _id: null,
                    avgOrderValue: { $avg: "$orderVendorTotal" }
                }
            }
        ]);
        const avgOrderValue = allOrdersAgg.length > 0 ? allOrdersAgg[0].avgOrderValue : 0;

        return res.status(200).json({
            success: true,
            metrics: {
                thisWeek: Number(thisWeek.toFixed(2)),
                thisMonth: Number(thisMonth.toFixed(2)),
                avgOrderValue: Number(avgOrderValue.toFixed(2))
            }
        });
    } catch (error) {
        console.error("Sales metrics error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch sales metrics", error: error.message });
    }
};

// -------------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------------
const getProducts = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const products = await Product.find({ vendorId, isActive: true }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: products.length, products });
    } catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const { name, price, stock, category, description, images } = req.body;

        if (!name || price === undefined || stock === undefined) {
            return res.status(400).json({ success: false, message: "Name, price, and stock are required." });
        }

        const newProduct = new Product({
            name,
            price: Number(price),
            stock: Number(stock),
            category: category || "General",
            description: description || "",
            images: images || [],
            vendorId,
            isActive: true
        });

        await newProduct.save();

        // Check if low stock immediately to create notification if needed
        if (newProduct.stock <= newProduct.lowStockThreshold) {
            await Notification.create({
                vendorId,
                message: `Product "${newProduct.name}" is low on stock (${newProduct.stock} remaining).`,
                type: "stock"
            });
        }

        return res.status(201).json({ success: true, message: "Product created successfully", product: newProduct });
    } catch (error) {
        console.error("Create product error:", error);
        return res.status(500).json({ success: false, message: "Failed to create product", error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const { id } = req.params;

        const product = await Product.findOneAndDelete({ _id: id, vendorId });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or not owned by vendor." });
        }

        return res.status(200).json({ success: true, message: "Product removed successfully." });
    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete product", error: error.message });
    }
};

// -------------------------------------------------------------
// INVENTORY
// -------------------------------------------------------------
const getInventory = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const products = await Product.find({ vendorId, isActive: true })
            .select("name stock lowStockThreshold updatedAt")
            .sort({ stock: 1 });

        const inventory = products.map((p) => {
            const isLow = p.stock <= (p.lowStockThreshold || 5);
            return {
                id: p._id,
                name: p.name,
                stock: p.stock,
                status: isLow ? "Low stock" : "In stock",
                isLow
            };
        });

        return res.status(200).json({ success: true, inventory });
    } catch (error) {
        console.error("Get inventory error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch inventory", error: error.message });
    }
};

const updateStock = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined || isNaN(stock)) {
            return res.status(400).json({ success: false, message: "Valid stock number is required." });
        }

        const product = await Product.findOneAndUpdate(
            { _id: id, vendorId },
            { stock: Number(stock) },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or unauthorized." });
        }

        if (product.stock <= product.lowStockThreshold) {
            await Notification.create({
                vendorId,
                message: `Product "${product.name}" is low on stock (${product.stock} units).`,
                type: "stock"
            });
        }

        return res.status(200).json({ success: true, message: "Stock updated successfully", product });
    } catch (error) {
        console.error("Update stock error:", error);
        return res.status(500).json({ success: false, message: "Failed to update stock", error: error.message });
    }
};

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------
const getCategories = async (req, res) => {
    try {
        // Fetch all platform categories
        const categories = await Category.find().sort({ name: 1 });

        // Calculate product counts per category for this vendor
        const counts = await Product.aggregate([
            { $match: { vendorId: req.vendorId, isActive: true } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach((c) => {
            countMap[c._id] = c.count;
        });

        const list = categories.map((c) => ({
            id: c._id,
            name: c.name,
            productCount: countMap[c.name] || 0
        }));

        return res.status(200).json({ success: true, categories: list });
    } catch (error) {
        console.error("Get categories error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch categories", error: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Category name is required." });
        }

        const trimmed = name.trim();
        let existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, "i") } });
        if (existing) {
            return res.status(200).json({ success: true, message: "Category already exists", category: existing });
        }

        const newCat = new Category({ name: trimmed });
        await newCat.save();
        return res.status(201).json({ success: true, message: "Category created", category: newCat });
    } catch (error) {
        console.error("Create category error:", error);
        return res.status(500).json({ success: false, message: "Failed to create category", error: error.message });
    }
};

// -------------------------------------------------------------
// ORDERS
// -------------------------------------------------------------
const getOrders = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const orders = await Order.find({ "items.vendorId": vendorId }).sort({ createdAt: -1 });

        const mapped = orders.map((o) => {
            // Calculate vendor's slice of the order
            const vendorItems = o.items.filter((item) => String(item.vendorId) === String(vendorId));
            const vendorAmount = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return {
                id: o.orderNumber,
                dbId: o._id,
                customer: o.customerName,
                amount: Number(vendorAmount.toFixed(2)),
                status: o.status,
                createdAt: o.createdAt
            };
        });

        return res.status(200).json({ success: true, count: mapped.length, orders: mapped });
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        const order = await Order.findOneAndUpdate(
            { _id: id, "items.vendorId": vendorId },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found or unauthorized." });
        }

        return res.status(200).json({ success: true, message: "Order status updated", order });
    } catch (error) {
        console.error("Update order status error:", error);
        return res.status(500).json({ success: false, message: "Failed to update order status", error: error.message });
    }
};

// -------------------------------------------------------------
// PROMOTIONS
// -------------------------------------------------------------
const getPromotions = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const promotions = await Promotion.find({ vendorId, isActive: true }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, promotions });
    } catch (error) {
        console.error("Get promotions error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch promotions", error: error.message });
    }
};

const createPromotion = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const { name, discountPercentage, code } = req.body;

        if (!name || discountPercentage === undefined) {
            return res.status(400).json({ success: false, message: "Promotion name and discount percentage are required." });
        }

        const promo = new Promotion({
            vendorId,
            name,
            discountPercentage: Number(discountPercentage),
            code: code || "",
            isActive: true
        });

        await promo.save();
        return res.status(201).json({ success: true, message: "Promotion created successfully", promotion: promo });
    } catch (error) {
        console.error("Create promotion error:", error);
        return res.status(500).json({ success: false, message: "Failed to create promotion", error: error.message });
    }
};

const deletePromotion = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const { id } = req.params;

        const promo = await Promotion.findOneAndDelete({ _id: id, vendorId });
        if (!promo) {
            return res.status(404).json({ success: false, message: "Promotion not found or unauthorized." });
        }

        return res.status(200).json({ success: true, message: "Promotion removed." });
    } catch (error) {
        console.error("Delete promotion error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete promotion", error: error.message });
    }
};

// -------------------------------------------------------------
// STORE PROFILE
// -------------------------------------------------------------
const getProfile = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        let profile = await VendorProfile.findOne({ vendorId });

        if (!profile) {
            // Return defaults from the User model if profile record hasn't been saved yet
            profile = {
                storeName: `${req.user.FName || "My"} Store`,
                contactEmail: req.user.email || "",
                phone: "",
                address: "",
                description: "",
                logoUrl: ""
            };
        }

        return res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch store profile", error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const { storeName, contactEmail, phone, address, description, logoUrl } = req.body;

        const updated = await VendorProfile.findOneAndUpdate(
            { vendorId },
            {
                storeName: storeName || `${req.user.FName}'s Store`,
                contactEmail,
                phone,
                address,
                description,
                logoUrl
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({ success: true, message: "Store profile updated successfully", profile: updated });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ success: false, message: "Failed to update store profile", error: error.message });
    }
};

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
const getNotifications = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const notifications = await Notification.find({ vendorId }).sort({ createdAt: -1 }).limit(20);

        const formatted = notifications.map((n) => {
            const diffMs = Date.now() - new Date(n.createdAt).getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);
            let timeStr = `${diffHours}h ago`;
            if (diffHours < 1) timeStr = "just now";
            else if (diffDays >= 1) timeStr = `${diffDays}d ago`;

            return {
                id: n._id,
                text: n.message,
                time: timeStr,
                isRead: n.isRead,
                type: n.type
            };
        });

        return res.status(200).json({ success: true, count: formatted.length, notifications: formatted });
    } catch (error) {
        console.error("Get notifications error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch notifications", error: error.message });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const { id } = req.params;

        await Notification.findOneAndUpdate({ _id: id, vendorId }, { isRead: true });
        return res.status(200).json({ success: true, message: "Notification marked as read." });
    } catch (error) {
        console.error("Mark notification read error:", error);
        return res.status(500).json({ success: false, message: "Failed to update notification", error: error.message });
    }
};

module.exports = {
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
};
