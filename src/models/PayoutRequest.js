const mongoose = require("mongoose");

const payoutRequestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    payoutMethod: { type: String, enum: ["upi", "bank"], required: true },
    payoutDetails: {
      upiId: { type: String, default: "" },
      accountHolder: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifsc: { type: String, default: "" },
      bankName: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
    },
    referenceId: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

payoutRequestSchema.index({ studentId: 1, createdAt: -1 });
payoutRequestSchema.index({ status: 1 });

module.exports = mongoose.models.PayoutRequest || mongoose.model("PayoutRequest", payoutRequestSchema);
