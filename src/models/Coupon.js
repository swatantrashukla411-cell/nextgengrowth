const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  campaignId: { type: String, default: "BWC_COLLEGE_2026" },
  discountType: { type: String, default: "percentage" },
  discountValue: { type: Number, default: 20 },
  status: { type: String, enum: ["unused", "redeemed"], default: "unused", index: true },
  storeId: { type: String, default: null },
  storeName: { type: String, default: null },
  redeemedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
