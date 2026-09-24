/** @format */

const product = require("../model/product");

const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const products = await product
      .find({
        $or: [
          {
            name: {
              $regex: q,
              $options: "i",
            },
          },
          {
            category: {
              $regex: q,
              $options: "i",
            },
          },
        ],
      })
      .limit(10);

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      message: "Search failed",
      error: err.message,
    });
  }
};

module.exports = {
  searchProducts,
};
