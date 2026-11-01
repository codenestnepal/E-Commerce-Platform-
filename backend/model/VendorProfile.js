const mongoose = require("mongoose");

const vendorProfileSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        storeName: {
            type: String,
            required: true,
            trim: true
        },
        contactEmail: {
            type: String,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        logoUrl: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "suspended"],
            default: "approved"
        },
        commissionRate: {
            type: Number,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("VendorProfile", vendorProfileSchema);
