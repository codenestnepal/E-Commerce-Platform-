const jwt = require("jsonwebtoken");
const User = require("../model/User");

const vendorAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: "Access denied. No authorization token provided." });
        }

        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid or expired authorization token." });
        }

        const userId = decoded.id || decoded._id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User account not found." });
        }

        if (user.role !== "vendor" && user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access restricted. Only verified vendors or administrators can access this portal."
            });
        }

        req.user = user;
        req.vendorId = user._id;
        next();
    } catch (error) {
        console.error("Vendor Auth Error:", error);
        return res.status(500).json({ success: false, message: "Authentication validation failed.", error: error.message });
    }
};

module.exports = vendorAuth;
