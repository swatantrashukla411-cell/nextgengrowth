const mongoose = require("mongoose");

const campusApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  collegeName: { type: String, required: true },
  year: { type: String, enum: ['1st', '2nd', '3rd', '4th', 'PG'], required: true },
  city: { type: String, required: true },
  instagramHandle: { type: String, default: '' },
  whyJoin: { type: String, default: '' },
  status: { type: String, enum: ['applied', 'shortlisted', 'selected', 'rejected'], default: 'applied' },
  createdAt: { type: Date, default: Date.now }
});
campusApplicationSchema.index({ status: 1, createdAt: -1 });
campusApplicationSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.CampusApplication || mongoose.model("CampusApplication", campusApplicationSchema);
