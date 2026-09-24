const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  storeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  city: { type: String, default: "Delhi" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Store || mongoose.model("Store", storeSchema);
