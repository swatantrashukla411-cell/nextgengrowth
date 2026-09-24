const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  milestoneNumber: { type: Number, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: "" },
  dueDate: { type: Date },
  escrowStatus: {
    type: String,
    enum: ["unfunded", "funded", "released", "refunded"],
    default: "unfunded",
  },
  workStatus: {
    type: String,
    enum: ["pending", "in_progress", "submitted", "revision", "approved"],
    default: "pending",
  },
  razorpayOrderId: { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },
  razorpaySignature: { type: String, default: "" },
  fundedAt: { type: Date },
  submission: {
    deliverableUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    submittedAt: { type: Date },
  },
  revisions: [
    {
      notes: { type: String, required: true },
      requestedAt: { type: Date, default: Date.now },
    },
  ],
  approvedAt: { type: Date },
  autoReleaseAt: { type: Date },
});

const contractSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: "Proposal" },
    title: { type: String, required: true },
    totalBudget: { type: Number, required: true },
    platformFeePercent: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ["active", "completed", "disputed", "cancelled"],
      default: "active",
    },
    milestones: [milestoneSchema],
    terms: { type: String, default: "" },
  },
  { timestamps: true }
);

contractSchema.index({ brandId: 1, createdAt: -1 });
contractSchema.index({ studentId: 1, createdAt: -1 });
contractSchema.index({ jobId: 1 });
contractSchema.index({ status: 1 });

module.exports = mongoose.models.Contract || mongoose.model("Contract", contractSchema);
