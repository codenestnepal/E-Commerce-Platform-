const Cart = require("../model/cart");

const addToCart = async(req,res) => {
    try {
        const {productId, quantity} = req.body;

        const item = await Cart.create({
            user: req.user.id,
            product: productId,
            quantity
        });

        res.status(201).json(item);
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

const getCart = async(req,res) => {
    try{
        const cart = await Cart
        .find({user: req.user.id})
        .populate("product");

        res.json(cart)
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

const removeCartItem = async(req,res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Item removed"
        });
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

module.exports = {addToCart, getCart, removeCartItem};