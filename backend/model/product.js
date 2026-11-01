const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        stock: {
            type: Number,
            default: 0,
            min: 0
        },

        lowStockThreshold: {
            type: Number,
            default: 5,
            min: 0
        },

        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false // Optional for general platform items, required for vendor items
        },

        vendorName: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        images: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: ["pending", "published", "rejected"],
            default: "published"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);
