const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        discountPercentage: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },
        code: {
            type: String,
            trim: true,
            uppercase: true
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date
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

module.exports = mongoose.model("Promotion", promotionSchema);
