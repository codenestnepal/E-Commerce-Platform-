const category = require('../model/categories');

const getCategories = async (req, res) => {
    try{
        const categories = await category.find();
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, image, description } = req.body;
        const newCategory = new category({ name, image, description });
        await newCategory.save();
        res.status(201).json({
            success: true,
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getCategories, createCategory };