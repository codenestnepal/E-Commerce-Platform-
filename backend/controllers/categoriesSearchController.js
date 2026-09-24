const category = require('../model/categories');

const getCategories = async(req, res) => {
   try{
    const categories = await category.find().sort({name: 1});
    res.status(200).json({
        count: categories.length,
        categories
    })

   }catch(err){
         res.status(500).json({
            error: err.message,
            message: "Failed to get categories"
        
         });
   }
};

//searching 
const searchCategories = async(req,res) => {
    try{
        const {q} = req.query;
        if(!q){
            return res.status(400).json({
                message: "SEarch wuery is required"
            });
        }

        const categories = await category.find({
            name: {
                $regex: q,
                $options: "i"
            }
        }).sort({name: 1});

        res.status(200).json({
            count: categories.length,
            categories
        });

    }catch(err){

        res.status(500).json({
            message: "Categories search failed",
            error: err.message
        });

    }
};

module.exports = {
    getCategories,
    searchCategories
}