const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bidAmount: { type: Number, required: true },
    estimatedDays: { type: Number, required: true },
    coverLetter: { type: String, required: true },
    workSamples: [
      {
        title: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],
    answers: [
      {
        question: { type: String, default: "" },
        answer: { type: String, default: "" },
      },
    ],
    studentBadgeAtApply: {
      type: String,
      enum: ["beginner", "verified", "top-rated"],
      default: "beginner",
    },
    status: {
      type: String,
      enum: ["submitted", "shortlisted", "accepted", "rejected"],
      default: "submitted",
    },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
  },
  { timestamps: true }
);

proposalSchema.index({ jobId: 1, createdAt: -1 });
proposalSchema.index({ studentId: 1, createdAt: -1 });
proposalSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.models.Proposal || mongoose.model("Proposal", proposalSchema);
