const {addToWishlist, getWishlist} = require("../controllers/whishlistController")
const express = require("express");
const router = express.Router();


router.post("/", addToWishlist);
router.get("/",getWishlist);

module.exports = router;