const express = require('express');
const router = express.Router();
const { getCategories, searchCategories } = require("../controllers/categoriesSearchController");

// Mount the search endpoint.
// It will be accessible at /api/categories/search if mounted correctly,
// or /api/search if mounted directly at /api without a prefix.
router.get("/categories/search", searchCategories);

// The getCategories endpoint is likely already covered by categoryRoutes.js,
// but if needed here, it would be:
router.get("/categories", getCategories);

module.exports = router;