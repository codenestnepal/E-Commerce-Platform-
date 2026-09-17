
const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
    
};

module.exports = ensureAuthenticated;