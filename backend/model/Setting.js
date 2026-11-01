const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: "global_settings",
            unique: true
        },
        name: {
            type: String,
            default: "Nile Marketplace"
        },
        email: {
            type: String,
            default: "support@store.com"
        },
        vreg: {
            type: String,
            enum: ["open", "closed"],
            default: "open"
        },
        maint: {
            type: String,
            enum: ["off", "on"],
            default: "off"
        },
        defaultCommissionRate: {
            type: Number,
            default: 10,
            min: 0,
            max: 100
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
