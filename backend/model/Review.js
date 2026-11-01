const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Review", "Complaint"],
            default: "Review"
        },
        from: {
            type: String,
            required: true,
            trim: true
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
        vendorName: {
            type: String,
            default: ""
        },
        about: {
            type: String,
            default: ""
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["open", "resolved", "removed"],
            default: "open"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
