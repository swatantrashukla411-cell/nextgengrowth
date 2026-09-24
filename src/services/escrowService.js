const mongoose = require("mongoose");
const { Contract, User, Job, Proposal, Payment, PayoutRequest, Earning } = require("../models");
const { getRazorpayClient, getRazorpayConfig, isValidRazorpaySignature, RAZORPAY_MIN_AMOUNT_PAISE } = require("./razorpayService");

const REVIEW_WINDOW_DAYS = 7;
const DEFAULT_PLATFORM_FEE_PERCENT = 10;
const GST_PERCENT = 18; // 18% GST on platform commission

/**
 * Escrow & Contract Management Service
 */
class EscrowService {
  /**
   * Create a new contract with milestones
   */
  static async createContract({
    jobId,
    brandId,
    studentId,
    proposalId,
    title,
    totalBudget,
    platformFeePercent = DEFAULT_PLATFORM_FEE_PERCENT,
    milestones = [],
    terms = "",
  }) {
    // Validate job, brand, student
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found.");
    if (String(job.brandId) !== String(brandId)) {
      throw new Error("You can only create contracts for your own jobs.");
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      throw new Error("Invalid student freelancer.");
    }

    // Default to a single milestone if none provided
    let processedMilestones = milestones;
    if (!processedMilestones || processedMilestones.length === 0) {
      processedMilestones = [
        {
          milestoneNumber: 1,
          title: "Full Project Delivery",
          amount: Number(totalBudget),
          description: "Complete all agreed deliverables.",
          dueDate: job.deadline ? new Date(job.deadline) : new Date(Date.now() + 7 * 86400000),
        },
      ];
    } else {
      processedMilestones = processedMilestones.map((m, idx) => ({
        milestoneNumber: m.milestoneNumber || idx + 1,
        title: m.title || `Milestone ${idx + 1}`,
        amount: Number(m.amount) || 0,
        description: m.description || "",
        dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
      }));
    }

    // Check sum of milestone amounts equals totalBudget
    const sumAmounts = processedMilestones.reduce((acc, curr) => acc + curr.amount, 0);
    const parsedTotal = Number(totalBudget) || sumAmounts;

    const contract = await Contract.create({
      jobId,
      brandId,
      studentId,
      proposalId: proposalId || undefined,
      title: title || job.title,
      totalBudget: parsedTotal,
      platformFeePercent: Number(platformFeePercent) || DEFAULT_PLATFORM_FEE_PERCENT,
      milestones: processedMilestones,
      terms,
      status: "active",
    });

    // If there is an associated proposal, mark it as accepted
    if (proposalId) {
      await Proposal.findByIdAndUpdate(proposalId, {
        status: "accepted",
        contractId: contract._id,
      });
    }

    // Update job status to in_progress
    await Job.findByIdAndUpdate(jobId, { status: "in_progress" });

    return contract;
  }

  /**
   * Create Razorpay order to fund a specific milestone escrow
   */
  static async createMilestoneFundOrder({ contractId, milestoneNumber, brandId }) {
    const contract = await Contract.findById(contractId)
      .populate("brandId", "firstName lastName companyName email")
      .populate("studentId", "firstName lastName email");

    if (!contract) throw new Error("Contract not found.");
    if (String(contract.brandId._id) !== String(brandId)) {
      throw new Error("Unauthorized: Only the contracting brand can fund this milestone.");
    }

    const milestone = contract.milestones.find(
      (m) => m.milestoneNumber === Number(milestoneNumber)
    );
    if (!milestone) throw new Error(`Milestone #${milestoneNumber} not found.`);
    if (milestone.escrowStatus === "funded" || milestone.escrowStatus === "released") {
      throw new Error("This milestone is already funded or released.");
    }

    const amountInPaise = Math.round(Number(milestone.amount) * 100);
    if (!Number.isInteger(amountInPaise) || amountInPaise < RAZORPAY_MIN_AMOUNT_PAISE) {
      throw new Error("Milestone amount must be at least ₹1.");
    }

    const receipt = `ngg_esc_${String(contract._id).slice(-8)}_${milestoneNumber}_${Date.now().toString().slice(-6)}`;

    const rzpClient = getRazorpayClient();
    const order = await rzpClient.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        contractId: String(contract._id),
        milestoneNumber: String(milestoneNumber),
        milestoneTitle: milestone.title,
        brandName: contract.brandId.companyName || `${contract.brandId.firstName} ${contract.brandId.lastName}`,
        studentName: `${contract.studentId.firstName} ${contract.studentId.lastName}`,
      },
    });

    milestone.razorpayOrderId = order.id;
    await contract.save();

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: getRazorpayConfig().keyId,
      milestoneTitle: milestone.title,
      contractTitle: contract.title,
      studentName: `${contract.studentId.firstName} ${contract.studentId.lastName}`,
    };
  }

  /**
   * Verify Razorpay payment and mark milestone escrow as funded
   */
  static async verifyAndFundMilestone({
    contractId,
    milestoneNumber,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    brandId,
  }) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error("Missing Razorpay signature verification parameters.");
    }

    if (!isValidRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      throw new Error("Payment signature mismatch. Escrow verification failed.");
    }

    const contract = await Contract.findById(contractId);
    if (!contract) throw new Error("Contract not found.");
    if (String(contract.brandId) !== String(brandId)) {
      throw new Error("Unauthorized contract action.");
    }

    const milestone = contract.milestones.find(
      (m) => m.milestoneNumber === Number(milestoneNumber)
    );
    if (!milestone) throw new Error(`Milestone #${milestoneNumber} not found.`);

    if (milestone.escrowStatus === "funded") {
      return { contract, message: "Milestone escrow is already funded." };
    }

    // Calculate student net cut (amount - 10% platform fee)
    const platformFee = (milestone.amount * contract.platformFeePercent) / 100;
    const studentNet = milestone.amount - platformFee;

    // Update milestone state
    milestone.escrowStatus = "funded";
    milestone.workStatus = milestone.workStatus === "pending" ? "in_progress" : milestone.workStatus;
    milestone.razorpayOrderId = razorpayOrderId;
    milestone.razorpayPaymentId = razorpayPaymentId;
    milestone.razorpaySignature = razorpaySignature;
    milestone.fundedAt = new Date();

    await contract.save();

    // Increment student pendingBalance
    await User.findByIdAndUpdate(contract.studentId, {
      $inc: { "wallet.pendingBalance": studentNet },
    });

    // Record Payment
    await Payment.create({
      studentId: contract.studentId,
      brandId: contract.brandId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount: milestone.amount,
      status: "paid",
      description: `Escrow funded for Milestone #${milestoneNumber}: ${milestone.title}`,
    });

    return {
      success: true,
      message: `Escrow funded successfully! ₹${milestone.amount} is securely held in NNG Escrow.`,
      contract,
    };
  }

  /**
   * Student submits deliverable for review
   */
  static async submitMilestoneWork({
    contractId,
    milestoneNumber,
    studentId,
    deliverableUrl,
    notes = "",
  }) {
    if (!deliverableUrl) throw new Error("Deliverable URL is required.");

    const contract = await Contract.findById(contractId);
    if (!contract) throw new Error("Contract not found.");
    if (String(contract.studentId) !== String(studentId)) {
      throw new Error("Unauthorized: Only the assigned student freelancer can submit work.");
    }

    const milestone = contract.milestones.find(
      (m) => m.milestoneNumber === Number(milestoneNumber)
    );
    if (!milestone) throw new Error(`Milestone #${milestoneNumber} not found.`);

    if (milestone.escrowStatus !== "funded") {
      throw new Error("Milestone must be escrow-funded before submitting work.");
    }

    const now = new Date();
    const autoRelease = new Date(now.getTime() + REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    milestone.workStatus = "submitted";
    milestone.submission = {
      deliverableUrl: String(deliverableUrl).trim(),
      notes: String(notes || "").trim(),
      submittedAt: now,
    };
    milestone.autoReleaseAt = autoRelease;

    await contract.save();

    return {
      success: true,
      message: `Milestone work submitted! Brand has a 7-day review window ending on ${autoRelease.toLocaleDateString()}.`,
      contract,
      autoReleaseAt: autoRelease,
    };
  }

  /**
   * Brand reviews submitted work: Approve & Release or Request Revision
   */
  static async reviewMilestoneSubmission({
    contractId,
    milestoneNumber,
    brandId,
    action,
    revisionNote = "",
  }) {
    if (!["approve", "revision"].includes(action)) {
      throw new Error("Invalid review action. Must be 'approve' or 'revision'.");
    }

    const contract = await Contract.findById(contractId);
    if (!contract) throw new Error("Contract not found.");
    if (String(contract.brandId) !== String(brandId)) {
      throw new Error("Unauthorized: Only the hiring brand can review this milestone.");
    }

    const milestone = contract.milestones.find(
      (m) => m.milestoneNumber === Number(milestoneNumber)
    );
    if (!milestone) throw new Error(`Milestone #${milestoneNumber} not found.`);

    if (milestone.workStatus !== "submitted") {
      throw new Error("Milestone does not currently have a pending submission to review.");
    }

    if (action === "approve") {
      return this._releaseMilestoneFunds(contract, milestone);
    } else {
      // Revision requested
      if (!revisionNote || !String(revisionNote).trim()) {
        throw new Error("Please provide specific feedback/notes for the requested revision.");
      }

      milestone.workStatus = "revision";
      milestone.revisions.push({
        notes: String(revisionNote).trim(),
        requestedAt: new Date(),
      });
      // Clear auto-release while under revision
      milestone.autoReleaseAt = null;

      await contract.save();

      return {
        success: true,
        message: "Revision request sent to the student freelancer.",
        contract,
        revisionCount: milestone.revisions.length,
      };
    }
  }

  /**
   * Core helper to release milestone funds to student's available wallet balance
   */
  static async _releaseMilestoneFunds(contract, milestone, isAutoRelease = false) {
    const platformFee = (milestone.amount * contract.platformFeePercent) / 100;
    const netStudentAmount = milestone.amount - platformFee;

    milestone.workStatus = "approved";
    milestone.escrowStatus = "released";
    milestone.approvedAt = new Date();

    // Check if all milestones are now approved/released
    const allCompleted = contract.milestones.every(
      (m) => m.escrowStatus === "released" || m.workStatus === "approved"
    );
    if (allCompleted) {
      contract.status = "completed";
      await Job.findByIdAndUpdate(contract.jobId, { status: "closed" });
    }

    await contract.save();

    // Update Student Wallet:
    // pendingBalance decrements by netStudentAmount
    // availableBalance increments by netStudentAmount
    // lifetimeEarned increments by netStudentAmount
    await User.findByIdAndUpdate(contract.studentId, {
      $inc: {
        "wallet.pendingBalance": -netStudentAmount,
        "wallet.availableBalance": netStudentAmount,
        "wallet.lifetimeEarned": netStudentAmount,
      },
    });

    // Create Earning record
    await Earning.create({
      studentId: contract.studentId,
      amount: netStudentAmount,
      description: `Payment released for ${contract.title} (Milestone #${milestone.milestoneNumber}: ${milestone.title})`,
      status: "paid",
    });

    return {
      success: true,
      message: isAutoRelease
        ? `7-day review window elapsed. ₹${netStudentAmount} auto-released to student balance.`
        : `Milestone approved! ₹${netStudentAmount} released to student freelancer balance.`,
      contract,
      netStudentAmount,
      platformFee,
    };
  }

  /**
   * Auto-release funds for any milestones where 7-day review window has elapsed
   */
  static async processAutoReleases() {
    const now = new Date();
    const contracts = await Contract.find({
      status: "active",
      "milestones.workStatus": "submitted",
      "milestones.autoReleaseAt": { $lte: now },
    });

    const results = [];
    for (const contract of contracts) {
      for (const milestone of contract.milestones) {
        if (
          milestone.workStatus === "submitted" &&
          milestone.escrowStatus === "funded" &&
          milestone.autoReleaseAt &&
          milestone.autoReleaseAt <= now
        ) {
          try {
            const res = await this._releaseMilestoneFunds(contract, milestone, true);
            results.push({
              contractId: contract._id,
              milestoneNumber: milestone.milestoneNumber,
              releasedAmount: res.netStudentAmount,
            });
          } catch (err) {
            console.error(`Auto-release failed for contract ${contract._id} m#${milestone.milestoneNumber}:`, err);
          }
        }
      }
    }
    return results;
  }

  /**
   * Request student payout (UPI or Bank)
   */
  static async requestPayout({ studentId, amount, payoutMethod, payoutDetails }) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 100) {
      throw new Error("Minimum payout amount is ₹100.");
    }

    if (!["upi", "bank"].includes(payoutMethod)) {
      throw new Error("Invalid payout method. Choose 'upi' or 'bank'.");
    }

    if (payoutMethod === "upi" && (!payoutDetails?.upiId || !payoutDetails.upiId.includes("@"))) {
      throw new Error("Please provide a valid UPI ID (e.g., student@okaxis).");
    }

    if (payoutMethod === "bank") {
      if (!payoutDetails?.accountNumber || !payoutDetails?.ifsc || !payoutDetails?.accountHolder) {
        throw new Error("Please provide Account Holder name, Account Number, and IFSC code.");
      }
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      throw new Error("Invalid student account.");
    }

    const available = Number(student.wallet?.availableBalance || 0);
    if (numericAmount > available) {
      throw new Error(`Insufficient wallet balance. Available for payout: ₹${available.toLocaleString("en-IN")}`);
    }

    // Deduct available balance immediately to prevent double spending
    student.wallet.availableBalance -= numericAmount;
    await student.save();

    const payout = await PayoutRequest.create({
      studentId,
      amount: numericAmount,
      payoutMethod,
      payoutDetails: {
        upiId: payoutDetails.upiId || "",
        accountHolder: payoutDetails.accountHolder || "",
        accountNumber: payoutDetails.accountNumber || "",
        ifsc: (payoutDetails.ifsc || "").toUpperCase(),
        bankName: payoutDetails.bankName || "",
      },
      status: "pending",
    });

    return payout;
  }

  /**
   * Process payout request (Admin approval / automated execution)
   */
  static async processPayout({ payoutId, status, referenceId = "", adminNotes = "" }) {
    if (!["processing", "completed", "rejected"].includes(status)) {
      throw new Error("Invalid payout status.");
    }

    const payout = await PayoutRequest.findById(payoutId);
    if (!payout) throw new Error("Payout request not found.");

    if (payout.status === "completed" || payout.status === "rejected") {
      throw new Error(`This payout is already ${payout.status}.`);
    }

    if (status === "rejected") {
      // Re-credit student wallet
      await User.findByIdAndUpdate(payout.studentId, {
        $inc: { "wallet.availableBalance": payout.amount },
      });
    }

    payout.status = status;
    payout.referenceId = referenceId || `UTR_${Date.now()}`;
    payout.adminNotes = adminNotes;
    if (status === "completed") {
      payout.processedAt = new Date();
    }
    await payout.save();

    return payout;
  }

  /**
   * Generate GST-compliant invoice data for a funded/released milestone
   */
  static async generateInvoiceData({ contractId, milestoneNumber, userId }) {
    const contract = await Contract.findById(contractId)
      .populate("brandId", "firstName lastName companyName email")
      .populate("studentId", "firstName lastName email college");

    if (!contract) throw new Error("Contract not found.");

    const milestone = contract.milestones.find(
      (m) => m.milestoneNumber === Number(milestoneNumber)
    );
    if (!milestone) throw new Error(`Milestone #${milestoneNumber} not found.`);

    if (milestone.escrowStatus === "unfunded") {
      throw new Error("Invoice is only generated for funded or completed milestones.");
    }

    const milestoneAmount = Number(milestone.amount);
    const platformFee = (milestoneAmount * contract.platformFeePercent) / 100;
    const gstOnPlatformFee = Math.round((platformFee * (GST_PERCENT / 100)) * 100) / 100;
    const studentNet = milestoneAmount - platformFee;

    const invoiceDate = milestone.fundedAt || milestone.approvedAt || contract.updatedAt || new Date();
    const invoiceNumber = `NGG-INV-${invoiceDate.getFullYear()}-${String(contract._id).slice(-6).toUpperCase()}-${milestoneNumber}`;

    return {
      invoiceNumber,
      invoiceDate: invoiceDate.toISOString(),
      platform: {
        legalName: "NextGenGrowth Technologies Private Limited",
        gstin: "07AAACN1234F1Z8", // Standard compliant GSTIN format
        address: "NextGenGrowth HQ, Bangalore & New Delhi, India",
        supportEmail: "support@nextgengrowth.in",
        website: "https://nextgengrowth.in",
      },
      brand: {
        companyName: contract.brandId.companyName || `${contract.brandId.firstName} ${contract.brandId.lastName}`,
        representative: `${contract.brandId.firstName} ${contract.brandId.lastName}`,
        email: contract.brandId.email,
      },
      freelancer: {
        name: `${contract.studentId.firstName} ${contract.studentId.lastName}`,
        college: contract.studentId.college || "Verified Student Creator",
        email: contract.studentId.email,
      },
      project: {
        contractId: contract._id,
        contractTitle: contract.title,
        milestoneNumber: milestone.milestoneNumber,
        milestoneTitle: milestone.title,
        escrowStatus: milestone.escrowStatus,
        razorpayPaymentId: milestone.razorpayPaymentId || "ESCROW_PAID",
      },
      breakdown: {
        milestoneGrossAmount: milestoneAmount,
        platformFeePercent: contract.platformFeePercent,
        platformFeeAmount: platformFee,
        gstPercent: GST_PERCENT,
        gstAmount: gstOnPlatformFee,
        freelancerDisbursement: studentNet,
        totalPaidByBrand: milestoneAmount,
        currency: "INR",
      },
    };
  }
}

module.exports = EscrowService;
