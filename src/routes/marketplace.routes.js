const express = require("express");
const mongoose = require("mongoose");
const { Contract, Proposal, PayoutRequest, Job, User, Earning } = require("../models");
const EscrowService = require("../services/escrowService");
const { createGeminiService } = require("../services/geminiService");

function registerMarketplaceRoutes(app, { verifyToken, adminOnly, aiLimiter }) {
  const router = express.Router();
  const geminiService = createGeminiService();

  // Helper to check brand ownership of a job
  async function checkBrandOwnsJob(jobId, brandId) {
    const job = await Job.findById(jobId);
    if (!job) return false;
    return String(job.brandId) === String(brandId);
  }

  // ═══════════════════════════════════════════════════════════════
  // MODULE A: PAYMENT & ESCROW ENGINE
  // ═══════════════════════════════════════════════════════════════

  // 1. Create a Contract with Milestones
  router.post("/contracts/create", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "brand") {
        return res.status(403).json({ success: false, message: "Only brands can create contracts." });
      }

      const { jobId, studentId, proposalId, title, totalBudget, platformFeePercent, milestones, terms } = req.body;
      if (!jobId || !studentId || !totalBudget) {
        return res.status(400).json({ success: false, message: "Job ID, student ID, and total budget are required." });
      }

      const contract = await EscrowService.createContract({
        jobId,
        brandId: req.user.id,
        studentId,
        proposalId,
        title,
        totalBudget,
        platformFeePercent,
        milestones,
        terms,
      });

      res.status(201).json({
        success: true,
        message: "Contract created successfully with milestones!",
        contract,
      });
    } catch (err) {
      console.error("Contract create error:", err);
      res.status(400).json({ success: false, message: err.message || "Failed to create contract." });
    }
  });

  // 2. Get Brand's Contracts
  router.get("/contracts/brand", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "brand") {
        return res.status(403).json({ success: false, message: "Brand only." });
      }

      const contracts = await Contract.find({ brandId: req.user.id })
        .populate("studentId", "firstName lastName email college studentBadge avatar portfolioLink")
        .populate("jobId", "title category budget jobType")
        .sort({ updatedAt: -1 });

      res.json({ success: true, contracts });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 3. Get Student's Contracts
  router.get("/contracts/student", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Student only." });
      }

      const contracts = await Contract.find({ studentId: req.user.id })
        .populate("brandId", "firstName lastName companyName email brandLink")
        .populate("jobId", "title category budget jobType")
        .sort({ updatedAt: -1 });

      res.json({ success: true, contracts });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4. Get Single Contract Details
  router.get("/contracts/:id", verifyToken, async (req, res) => {
    try {
      const contract = await Contract.findById(req.params.id)
        .populate("brandId", "firstName lastName companyName email brandLink")
        .populate("studentId", "firstName lastName email college studentBadge avatar portfolioLink workSamples github behance linkedin")
        .populate("jobId")
        .populate("proposalId");

      if (!contract) return res.status(404).json({ success: false, message: "Contract not found." });

      const isAuthorized =
        String(contract.brandId._id) === String(req.user.id) ||
        String(contract.studentId._id) === String(req.user.id) ||
        req.user.role === "admin";

      if (!isAuthorized) {
        return res.status(403).json({ success: false, message: "Unauthorized access to this contract." });
      }

      res.json({ success: true, contract });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 5. Escrow Funding Order: Create Razorpay Order for Milestone
  router.post("/contracts/:id/milestones/:milestoneNumber/fund-order", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "brand") {
        return res.status(403).json({ success: false, message: "Only brands can fund milestone escrows." });
      }

      const orderData = await EscrowService.createMilestoneFundOrder({
        contractId: req.params.id,
        milestoneNumber: req.params.milestoneNumber,
        brandId: req.user.id,
      });

      res.json({ success: true, ...orderData });
    } catch (err) {
      console.error("Fund order error:", err);
      res.status(400).json({ success: false, message: err.message || "Failed to create escrow funding order." });
    }
  });

  // 6. Escrow Funding Verify: Brand submits payment signature to lock funds in escrow
  router.post("/contracts/:id/milestones/:milestoneNumber/fund-verify", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "brand") {
        return res.status(403).json({ success: false, message: "Only brands can verify milestone escrows." });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const result = await EscrowService.verifyAndFundMilestone({
        contractId: req.params.id,
        milestoneNumber: req.params.milestoneNumber,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature,
        brandId: req.user.id,
      });

      res.json(result);
    } catch (err) {
      console.error("Fund verify error:", err);
      res.status(400).json({ success: false, message: err.message || "Escrow funding verification failed." });
    }
  });

  // 7. Work Submission: Student submits deliverable links and notes
  router.post("/contracts/:id/milestones/:milestoneNumber/submit", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Only assigned student freelancers can submit work." });
      }

      const { deliverableUrl, notes } = req.body;
      const result = await EscrowService.submitMilestoneWork({
        contractId: req.params.id,
        milestoneNumber: req.params.milestoneNumber,
        studentId: req.user.id,
        deliverableUrl,
        notes,
      });

      res.json(result);
    } catch (err) {
      console.error("Milestone submit error:", err);
      res.status(400).json({ success: false, message: err.message || "Work submission failed." });
    }
  });

  // 8. Review & Approval: Brand approves (releases funds) or requests revision
  router.post("/contracts/:id/milestones/:milestoneNumber/review", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "brand") {
        return res.status(403).json({ success: false, message: "Only the hiring brand can review submissions." });
      }

      const { action, revisionNote } = req.body;
      const result = await EscrowService.reviewMilestoneSubmission({
        contractId: req.params.id,
        milestoneNumber: req.params.milestoneNumber,
        brandId: req.user.id,
        action,
        revisionNote,
      });

      res.json(result);
    } catch (err) {
      console.error("Milestone review error:", err);
      res.status(400).json({ success: false, message: err.message || "Review submission failed." });
    }
  });

  // 9. GST-Compliant Invoice / Receipt for Milestone
  router.get("/contracts/:id/milestones/:milestoneNumber/invoice", verifyToken, async (req, res) => {
    try {
      const invoiceData = await EscrowService.generateInvoiceData({
        contractId: req.params.id,
        milestoneNumber: req.params.milestoneNumber,
        userId: req.user.id,
      });

      res.json({ success: true, invoice: invoiceData });
    } catch (err) {
      console.error("Invoice generation error:", err);
      res.status(400).json({ success: false, message: err.message || "Invoice generation failed." });
    }
  });

  // 10. Auto-Release Cron trigger (public / scheduled or admin)
  router.post("/contracts/trigger-auto-release", async (req, res) => {
    try {
      const released = await EscrowService.processAutoReleases();
      res.json({
        success: true,
        message: `Processed auto-releases. ${released.length} milestone(s) completed.`,
        released,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // MODULE B: JOB POSTING & PROPOSAL ENGINE
  // ═══════════════════════════════════════════════════════════════

  // 1. Post a Project / Job
  router.post("/jobs/create", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "brand") {
        return res.status(403).json({ success: false, message: "Only registered brands can post jobs." });
      }

      const user = await User.findById(req.user.id);
      const {
        title,
        description,
        budget,
        category,
        categoryPath,
        jobType = "fixed_project",
        tags = [],
        scopeDuration = "",
        screeningQuestions = [],
        deadline = "",
      } = req.body;

      if (!title || !category || !budget) {
        return res.status(400).json({ success: false, message: "Title, category, and budget are required." });
      }

      // Max 3 screening questions
      const sanitizedQuestions = Array.isArray(screeningQuestions)
        ? screeningQuestions.slice(0, 3).map((q) => String(q).trim()).filter(Boolean)
        : [];

      // Extract numeric budget
      const matches = String(budget).replace(/,/g, "").match(/\d+(?:\.\d+)?/g);
      const budgetAmount = matches && matches.length ? Number(matches[0]) : 0;

      const job = await Job.create({
        brandId: req.user.id,
        brandName: user?.companyName || `${user?.firstName} ${user?.lastName}`,
        title: String(title).trim(),
        description: String(description || "").trim(),
        budget: String(budget).trim(),
        budgetAmount,
        category: String(category).trim(),
        categoryPath: String(categoryPath || "").trim(),
        jobType: ["fixed_project", "milestone_based", "monthly_retainer"].includes(jobType)
          ? jobType
          : "fixed_project",
        tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
        scopeDuration: String(scopeDuration).trim(),
        screeningQuestions: sanitizedQuestions,
        applicationQuestions: sanitizedQuestions, // backward compat
        deadline: String(deadline).trim(),
        status: "open",
      });

      res.status(201).json({
        success: true,
        message: "Job posted successfully! Top student creators can now submit proposals.",
        job,
      });
    } catch (err) {
      console.error("Job post error:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to post project." });
    }
  });

  // 2. AI Brief Enhancer (integrated with Google Gemini API)
  router.post("/jobs/ai-enhance", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "brand") {
        return res.status(403).json({ success: false, message: "Brand only." });
      }

      const { roughIdea, category, targetBudget } = req.body;
      if (!roughIdea || roughIdea.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Please describe what you are looking for in at least 1-2 sentences.",
        });
      }

      const prompt = `You are the Lead Creative Director & Upwork/Fiverr Project Architect for NextGenGrowth, India's premier student-brand marketplace.
A brand needs help turning their rough idea into a structured, high-converting project brief.

Brand's rough idea: "${roughIdea}"
Category: "${category || 'General'}"
Target budget: "${targetBudget || 'Open'}"

Return ONLY a JSON object (no markdown, no backticks, no preamble) with this exact schema:
{
  "title": "Clear, professional job title (e.g. Modern SaaS Explainer Video & 30s Reels Edit)",
  "category": "One of: Video Editing, Graphic Design, Web Development, Content Writing, AI Tools, Social Media",
  "description": "Comprehensive 2-paragraph project brief explaining goals, requirements, expectations, and student-friendly context.",
  "deliverables": [
    "Deliverable 1 item with specifications",
    "Deliverable 2 item with specifications"
  ],
  "suggestedBudgetINR": 5000,
  "suggestedDays": 5,
  "requiredSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "screeningQuestions": [
    "Specific question 1 to test candidate portfolio/technique",
    "Specific question 2 about availability/turnaround time",
    "Specific question 3 about similar past work"
  ]
}`;

      let enhancedData;
      try {
        const aiResponse = await geminiService.generateContent(prompt);
        const text = await aiResponse.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          enhancedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid AI format");
        }
      } catch (aiErr) {
        console.warn("Gemini AI Brief Enhancer fallback:", aiErr.message);
        // Clean fallback brief
        enhancedData = {
          title: `Professional ${category || "Creative"} Project: ${roughIdea.slice(0, 45)}...`,
          category: category || "Video Editing",
          description: `We are seeking a talented, proactive student creator to assist with ${roughIdea}. The ideal candidate is detail-oriented, communicates clearly, and delivers production-ready files following our brand guidelines.`,
          deliverables: ["Final approved master files", "Editable source project", "1 round of revisions"],
          suggestedBudgetINR: 4000,
          suggestedDays: 4,
          requiredSkills: [category || "Creative", "Fast Turnaround", "Communication"],
          screeningQuestions: [
            "Please share links to 1-2 of your best relevant work samples.",
            "Can you complete this within the estimated timeline?",
            "What tools or software do you use for this workflow?",
          ],
        };
      }

      res.json({ success: true, enhanced: enhancedData });
    } catch (err) {
      console.error("AI enhance error:", err);
      res.status(500).json({ success: false, message: "AI Brief Enhancer temporarily unavailable." });
    }
  });

  // 3. Student Opportunity Feed
  router.get("/jobs/feed", async (req, res) => {
    try {
      const { category, minBudget, maxBudget, jobType, search, limit = 50 } = req.query;
      const query = { status: "open" };

      if (category && category !== "all") {
        query.category = new RegExp(category, "i");
      }

      if (jobType && jobType !== "all") {
        query.jobType = jobType;
      }

      if (search) {
        query.$or = [
          { title: new RegExp(search, "i") },
          { description: new RegExp(search, "i") },
          { tags: new RegExp(search, "i") },
        ];
      }

      const jobs = await Job.find(query)
        .populate("brandId", "companyName firstName lastName avatar")
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      // Filter budget if requested
      let filtered = jobs;
      if (minBudget || maxBudget) {
        const min = Number(minBudget) || 0;
        const max = Number(maxBudget) || Infinity;
        filtered = jobs.filter((j) => {
          const amt = j.budgetAmount || 0;
          return amt >= min && amt <= max;
        });
      }

      res.json({ success: true, count: filtered.length, jobs: filtered });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4. Student Submits Proposal
  router.post("/proposals/submit", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Only students can submit proposals." });
      }

      const student = await User.findById(req.user.id);
      if (!student) return res.status(404).json({ success: false, message: "Student not found." });

      const { jobId, bidAmount, estimatedDays, coverLetter, workSamples = [], answers = [] } = req.body;
      if (!jobId || !bidAmount || !estimatedDays || !coverLetter) {
        return res.status(400).json({
          success: false,
          message: "Job ID, bid amount, delivery days, and cover letter are required.",
        });
      }

      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ success: false, message: "Job not found." });
      if (job.status !== "open") {
        return res.status(400).json({ success: false, message: "This job is no longer accepting proposals." });
      }

      // Check if student already submitted proposal for this job
      const existing = await Proposal.findOne({ jobId, studentId: req.user.id });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "You have already submitted a proposal for this project. Check 'My Proposals'.",
        });
      }

      // Validate student badge
      const badge = student.studentBadge || "beginner";

      const proposal = await Proposal.create({
        jobId,
        studentId: req.user.id,
        bidAmount: Number(bidAmount),
        estimatedDays: Number(estimatedDays),
        coverLetter: String(coverLetter).trim(),
        workSamples: Array.isArray(workSamples) ? workSamples.slice(0, 6) : [],
        answers: Array.isArray(answers) ? answers.slice(0, 5) : [],
        studentBadgeAtApply: badge,
        status: "submitted",
      });

      res.status(201).json({
        success: true,
        message: "Proposal submitted successfully! The brand will review your pitch.",
        proposal,
      });
    } catch (err) {
      console.error("Proposal submit error:", err);
      res.status(400).json({ success: false, message: err.message || "Failed to submit proposal." });
    }
  });

  // 5. Brand Views Proposals for a Job (Applicants Comparison Pipeline)
  router.get("/jobs/:jobId/proposals", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "brand") {
        return res.status(403).json({ success: false, message: "Brand only." });
      }

      const job = await Job.findById(req.params.jobId);
      if (!job) return res.status(404).json({ success: false, message: "Job not found." });
      if (String(job.brandId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: "You can only view applicants for your own jobs." });
      }

      const proposals = await Proposal.find({ jobId: req.params.jobId })
        .populate("studentId", "firstName lastName email college studentBadge avatar portfolioLink workSamples github behance linkedin bio skills ratingAverage ratingCount")
        .sort({ createdAt: -1 });

      res.json({ success: true, job, proposals });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 6. Brand Updates Proposal Pipeline Status
  router.patch("/proposals/:id/status", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "brand") {
        return res.status(403).json({ success: false, message: "Brand only." });
      }

      const { status } = req.body;
      if (!["submitted", "shortlisted", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid proposal status." });
      }

      const proposal = await Proposal.findById(req.params.id).populate("jobId");
      if (!proposal) return res.status(404).json({ success: false, message: "Proposal not found." });

      if (String(proposal.jobId.brandId) !== String(req.user.id)) {
        return res.status(403).json({ success: false, message: "Unauthorized pipeline management." });
      }

      proposal.status = status;
      await proposal.save();

      res.json({
        success: true,
        message: `Applicant moved to '${status}'.`,
        proposal,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 7. Student Tracks Submitted Proposals
  router.get("/student/proposals", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Student only." });
      }

      const proposals = await Proposal.find({ studentId: req.user.id })
        .populate({
          path: "jobId",
          select: "title category budget budgetAmount brandName deadline jobType",
          populate: { path: "brandId", select: "companyName avatar firstName lastName" },
        })
        .populate("contractId")
        .sort({ createdAt: -1 });

      res.json({ success: true, proposals });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // MODULE D: STUDENT DASHBOARD EARNINGS & PAYOUT CENTER
  // ═══════════════════════════════════════════════════════════════

  // 1. Get Student Wallet Metrics & Payout History
  router.get("/student/wallet", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Student only." });
      }

      const student = await User.findById(req.user.id).select("wallet studentBadge payoutKyc");
      const payouts = await PayoutRequest.find({ studentId: req.user.id }).sort({ createdAt: -1 });
      const earnings = await Earning.find({ studentId: req.user.id }).sort({ createdAt: -1 }).limit(20);

      // Active contracts in escrow
      const activeContracts = await Contract.find({
        studentId: req.user.id,
        status: "active",
      }).select("title milestones totalBudget platformFeePercent");

      let escrowLocked = 0;
      activeContracts.forEach((c) => {
        c.milestones.forEach((m) => {
          if (m.escrowStatus === "funded" && m.workStatus !== "approved") {
            const net = m.amount * (1 - c.platformFeePercent / 100);
            escrowLocked += net;
          }
        });
      });

      res.json({
        success: true,
        wallet: {
          availableBalance: Number(student?.wallet?.availableBalance || 0),
          pendingBalance: Number(student?.wallet?.pendingBalance || escrowLocked),
          lifetimeEarned: Number(student?.wallet?.lifetimeEarned || 0),
        },
        escrowLocked,
        payouts,
        earnings,
        payoutKyc: student?.payoutKyc || {},
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 2. Student Submits Payout Request (UPI or Bank)
  router.post("/student/payout-request", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Student only." });
      }

      const { amount, payoutMethod, payoutDetails } = req.body;
      const payout = await EscrowService.requestPayout({
        studentId: req.user.id,
        amount,
        payoutMethod,
        payoutDetails,
      });

      res.status(201).json({
        success: true,
        message: `Payout request for ₹${payout.amount} submitted! Processing via ${payout.payoutMethod.toUpperCase()}.`,
        payout,
      });
    } catch (err) {
      console.error("Payout request error:", err);
      res.status(400).json({ success: false, message: err.message || "Failed to submit payout request." });
    }
  });

  // 3. Admin Views Payout Queue
  router.get("/admin/payouts", adminOnly, async (req, res) => {
    try {
      const payouts = await PayoutRequest.find()
        .populate("studentId", "firstName lastName email college phone")
        .sort({ createdAt: -1 });

      res.json({ success: true, payouts });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4. Admin Processes Payout (Completed or Rejected)
  router.post("/admin/payouts/:id/process", adminOnly, async (req, res) => {
    try {
      const { status, referenceId, adminNotes } = req.body;
      const payout = await EscrowService.processPayout({
        payoutId: req.params.id,
        status,
        referenceId,
        adminNotes,
      });

      res.json({
        success: true,
        message: `Payout marked as ${status}.`,
        payout,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // 5. Student Profile & Verification Hub
  router.get("/student/profile-hub", verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select(
        "firstName lastName email college year skills headline bio linkedin github behance portfolioLink workSamples studentBadge verificationStatus ratingAverage ratingCount"
      );

      res.json({ success: true, profile: user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  router.put("/student/profile-hub", verifyToken, async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ success: false, message: "Student only." });
      }

      const { headline, bio, linkedin, github, behance, portfolioLink, workSamples, skills } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found." });

      if (headline !== undefined) user.headline = String(headline).trim().slice(0, 160);
      if (bio !== undefined) user.bio = String(bio).trim().slice(0, 1000);
      if (linkedin !== undefined) user.linkedin = String(linkedin).trim();
      if (github !== undefined) user.github = String(github).trim();
      if (behance !== undefined) user.behance = String(behance).trim();
      if (portfolioLink !== undefined) user.portfolioLink = String(portfolioLink).trim();
      if (Array.isArray(skills)) user.skills = skills.slice(0, 15);
      if (Array.isArray(workSamples)) {
        user.workSamples = workSamples.slice(0, 4).map((s) => ({
          title: String(s.title || "").trim().slice(0, 90),
          category: String(s.category || "").trim().slice(0, 60),
          link: String(s.link || "").trim().slice(0, 500),
          description: String(s.description || "").trim().slice(0, 250),
        }));
      }

      await user.save();
      res.json({ success: true, message: "Profile & Verification Hub updated!", profile: user });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });

  // Mount router under /api
  app.use("/api", router);
}

module.exports = { registerMarketplaceRoutes };
