const {addToCart, getCart, removeCartItem} = require('../controllers/cartController')
const express = require('express');
const router = express.Router();

router.post("/", addToCart),
router.get("/", getCart);
router.delete("/", removeCartItem);

module.exports = router;