const mongoose = require("mongoose");

const campusInquirySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  campaignGoal: { type: String, enum: ['brand_awareness', 'app_installs', 'product_sampling', 'campus_hiring', 'event_promotion', 'other'], default: 'brand_awareness' },
  targetCampuses: { type: Number, default: 50 },
  budgetRange: { type: String, enum: ['under_50k', '50k_1l', '1l_5l', '5l_plus'], default: 'under_50k' },
  message: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});
campusInquirySchema.index({ status: 1, createdAt: -1 });
campusInquirySchema.index({ email: 1 });

module.exports = mongoose.models.CampusInquiry || mongoose.model("CampusInquiry", campusInquirySchema);
