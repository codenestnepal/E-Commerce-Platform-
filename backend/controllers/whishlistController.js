const whishlist = require('../model/whishlist');

const addToWishlist = async (req, res) => {
    try {
        const { productId} = req.body;

        const item = await whishlist.create({
            user: req.user.id,
            product: productId
        });

        res.status(201).json(item);
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

const getWishlist = async(req, res) => {
    try{
        const items = await whishlist
        .find({user: req.user.id})
        .populate("product");

       res.json(items); 
    } catch(err){
        res.status(500).json({ message: err.message});
    }
};

module.exports = {addToWishlist,getWishlist};