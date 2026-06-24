/**
 * ═══════════════════════════════════════════════════════════════
 * NextGenGrowth — Seed Realistic Projects & Long-Term Roles
 * ═══════════════════════════════════════════════════════════════
 * 
 * This script creates:
 *   1. Realistic brand accounts (if they don't already exist)
 *   2. Short-term projects (Jobs) under those brands
 *   3. Long-term monthly roles under those brands
 *
 * Run:  node seed_projects.js
 * ═══════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

// ─── Schemas (mirrored from server.js) ───────────────────────
const userSchema = new mongoose.Schema({
  firstName:{type:String,default:""},
  lastName:{type:String,default:""},
  email:{type:String,required:true,unique:true,lowercase:true},
  password:{type:String,default:""},
  role:{type:String,enum:["student","brand"],required:true},
  college:{type:String,default:""},
  year:{type:String,default:""},
  skills:{type:[String],default:[]},
  headline:{type:String,default:""},
  collegeId:{type:String,default:""},
  companyName:{type:String,default:""},
  serviceNeeded:{type:String,default:""},
  bio:{type:String,default:""},
  linkedin:{type:String,default:""},
  portfolioLink:{type:String,default:""},
  workSamples:{type:[{title:{type:String,default:""},category:{type:String,default:""},link:{type:String,default:""},description:{type:String,default:""}}],default:[]},
  studentBadge:{type:String,enum:["beginner","verified","top-rated"],default:"beginner"},
  verificationStatus:{type:String,enum:["not_applied","pending","verified","rejected"],default:"not_applied"},
  verificationCategory:{type:String,default:""},
  verificationSampleLink:{type:String,default:""},
  verificationAnswer:{type:String,default:""},
  verificationReviewNote:{type:String,default:""},
  verificationSubmittedAt:{type:Date},
  verifiedAt:{type:Date},
  complaintsCount:{type:Number,default:0},
  ratingAverage:{type:Number,default:0},
  ratingCount:{type:Number,default:0},
  googleId:{type:String,default:""},
  isVerified:{type:Boolean,default:false},
  avatar:{type:String,default:""},
  brandLink:{type:String,default:""},
  isApproved:{type:Boolean,default:true},
  payoutKyc:{
    legalName:{type:String,default:""},
    preferredPayout:{type:String,enum:["bank","upi"],default:"bank"},
    upiId:{type:String,default:""},
    bankAccountHolder:{type:String,default:""},
    bankName:{type:String,default:""},
    bankAccountNumberEncrypted:{type:String,default:""},
    bankAccountLast4:{type:String,default:""},
    ifsc:{type:String,default:""},
    status:{type:String,enum:["not_submitted","submitted","verified","rejected"],default:"not_submitted"},
    rejectionReason:{type:String,default:""},
    submittedAt:{type:Date},
    verifiedAt:{type:Date},
  }
},{timestamps:true});

const jobSchema = new mongoose.Schema({
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  brandName:{type:String,required:true},
  title:{type:String,required:true},
  description:{type:String,default:""},
  budget:{type:String,required:true},
  category:{type:String,required:true},
  tags:{type:[String],default:[]},
  applicationQuestions:{type:[String],default:[]},
  deadline:{type:String,default:""},
  status:{type:String,enum:["open","closed"],default:"open"},
},{timestamps:true});

const longTermRoleSchema = new mongoose.Schema({
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  brandName:{type:String,default:""},
  managerName:{type:String,default:""},
  email:{type:String,default:""},
  whatsapp:{type:String,default:""},
  roleTitle:{type:String,required:true},
  skillsNeeded:{type:[String],default:[]},
  monthlyBudget:{type:String,required:true},
  duration:{type:String,default:"1 month"},
  workType:{type:String,enum:["remote","on-site","hybrid"],default:"remote"},
  hoursPerWeek:{type:String,default:""},
  expectedWeeklyOutput:{type:String,default:""},
  trialTask:{type:String,default:""},
  trialPay:{type:String,default:""},
  startTimeline:{type:String,default:""},
  status:{type:String,enum:["open","shortlisting","trial","active","closed"],default:"open"},
  adminNotes:{type:String,default:""},
},{timestamps:true});

const User = mongoose.model("User", userSchema);
const Job = mongoose.model("Job", jobSchema);
const LongTermRole = mongoose.model("LongTermRole", longTermRoleSchema);

// ─── Brand Profiles ──────────────────────────────────────────
const seedBrands = [
  {
    firstName: "Rohit",
    lastName: "Kapoor",
    email: "rohit@flavourbox.in",
    companyName: "FlavourBox India",
    serviceNeeded: "Social Media Marketing, Video Editing",
    bio: "India's fastest growing D2C snack brand. We ship across 18,000+ pin codes. Looking for creative students who understand Gen-Z audiences.",
    linkedin: "https://linkedin.com/company/flavourboxindia",
    brandLink: "https://flavourbox.in",
  },
  {
    firstName: "Priya",
    lastName: "Menon",
    email: "priya@urbancraft.co",
    companyName: "UrbanCraft Studio",
    serviceNeeded: "Graphic Design, Web Development",
    bio: "Premium interior design studio based in Bangalore. We work with architects and luxury real estate brands. Need students for website, social media creatives, and 3D renders.",
    linkedin: "https://linkedin.com/company/urbancraft-studio",
    brandLink: "https://urbancraft.co",
  },
  {
    firstName: "Aditya",
    lastName: "Joshi",
    email: "aditya@learnhub.io",
    companyName: "LearnHub EdTech",
    serviceNeeded: "Content Writing, Video Editing, Graphic Design",
    bio: "Ed-tech startup building India's most affordable upskilling platform. 50K+ students on our platform. We create daily short-form content and need a creative team.",
    linkedin: "https://linkedin.com/company/learnhub-edtech",
    brandLink: "https://learnhub.io",
  },
  {
    firstName: "Sneha",
    lastName: "Reddy",
    email: "sneha@glowveda.com",
    companyName: "GlowVeda Skincare",
    serviceNeeded: "Social Media, Photography, Content Writing",
    bio: "Ayurvedic skincare brand with 2L+ Instagram followers. We focus on organic, cruelty-free products. Need students for UGC content, reels, and product photography.",
    linkedin: "https://linkedin.com/company/glowveda",
    brandLink: "https://glowveda.com",
  },
  {
    firstName: "Vikram",
    lastName: "Sinha",
    email: "vikram@codelaunch.dev",
    companyName: "CodeLaunch Technologies",
    serviceNeeded: "Web Development, AI Tools, Data & Excel",
    bio: "SaaS startup building no-code tools for small businesses. Funded by YCombinator W26 batch. Looking for sharp engineering students for internship-style projects.",
    linkedin: "https://linkedin.com/company/codelaunch",
    brandLink: "https://codelaunch.dev",
  },
  {
    firstName: "Meghna",
    lastName: "Arora",
    email: "meghna@thecontentco.in",
    companyName: "The Content Co.",
    serviceNeeded: "Content Writing, SEO, Social Media",
    bio: "Content marketing agency working with 40+ D2C brands. We handle blogs, newsletters, LinkedIn ghostwriting, and SEO. Always hiring fresh writing talent.",
    linkedin: "https://linkedin.com/company/thecontentco",
    brandLink: "https://thecontentco.in",
  },
  {
    firstName: "Arjun",
    lastName: "Malhotra",
    email: "arjun@pixelplay.studio",
    companyName: "PixelPlay Creative Studio",
    serviceNeeded: "Video Editing, Graphic Design, Photography",
    bio: "Full-service creative agency specializing in brand films, product shoots, and digital ads. Clients include Boat, Mamaearth, and Sugar Cosmetics.",
    linkedin: "https://linkedin.com/company/pixelplay-studio",
    brandLink: "https://pixelplay.studio",
  },
  {
    firstName: "Kavya",
    lastName: "Sharma",
    email: "kavya@fitfuel.in",
    companyName: "FitFuel Nutrition",
    serviceNeeded: "Social Media, Video Editing, Graphic Design",
    bio: "Sports nutrition brand endorsed by Olympic athletes. 5L+ community on Instagram. We need students for daily social media management and short-form video content.",
    linkedin: "https://linkedin.com/company/fitfuel-nutrition",
    brandLink: "https://fitfuel.in",
  },
];

// ─── Short-Term Projects (Jobs) ──────────────────────────────
function getShortTermProjects(brandMap) {
  const now = new Date();
  const day = (d) => { const dt = new Date(now); dt.setDate(dt.getDate() + d); return dt.toISOString().split('T')[0]; };
  
  return [
    // FlavourBox
    {
      brandId: brandMap["rohit@flavourbox.in"],
      brandName: "FlavourBox India",
      title: "Edit 5 Instagram Reels for Snack Brand Launch",
      description: "We're launching 3 new snack flavours and need 5 high-energy Instagram Reels (15-30 sec each). You'll get raw footage of product shots and behind-the-scenes clips. Add trendy transitions, text overlays, and background music. Must feel premium + fun. Reference: Lay's India, Too Yumm reels.",
      budget: "₹3,500",
      category: "Video Editing",
      tags: ["Video Editing", "Instagram Reels", "Product Video", "D2C"],
      applicationQuestions: ["Share your best reel edit (link)", "Which video editing tool do you use?", "Can you deliver 5 reels within 7 days?"],
      deadline: day(10),
      status: "open",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      brandId: brandMap["rohit@flavourbox.in"],
      brandName: "FlavourBox India",
      title: "Design Social Media Creatives for Diwali Campaign",
      description: "We need 10 social media creatives (Instagram + Facebook) for our Diwali festive campaign. Includes carousel posts, story templates, and a WhatsApp banner. Brand guidelines will be provided. Aesthetic: warm, festive, premium snack vibes.",
      budget: "₹4,000",
      category: "Graphic Design",
      tags: ["Graphic Design", "Social Media", "Festive Campaign", "Branding"],
      applicationQuestions: ["Share 2-3 social media designs you've done", "Do you have experience with Canva Pro or Figma?"],
      deadline: day(8),
      status: "open",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },

    // UrbanCraft Studio
    {
      brandId: brandMap["priya@urbancraft.co"],
      brandName: "UrbanCraft Studio",
      title: "Build a Responsive Portfolio Website for Interior Design Studio",
      description: "We need a clean, modern, responsive portfolio website with 5-6 pages: Home, About, Projects Gallery (filterable), Services, Testimonials, Contact. Must use Next.js or plain HTML/CSS/JS. Should load fast and look premium on mobile. We'll provide all content and images.",
      budget: "₹8,000",
      category: "Web Development",
      tags: ["Web Development", "Portfolio", "Responsive", "Next.js", "HTML/CSS"],
      applicationQuestions: ["Share your portfolio or GitHub link", "Have you built portfolio/agency websites before?", "What's your estimated delivery time?"],
      deadline: day(14),
      status: "open",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      brandId: brandMap["priya@urbancraft.co"],
      brandName: "UrbanCraft Studio",
      title: "Create 8 Premium Social Media Carousels for Instagram",
      description: "Design 8 Instagram carousels (10 slides each) showcasing our latest interior design projects. Style: minimalist, luxury, editorial. Use brand colors (#1a1a2e, #e2c275). Include before/after shots, floor plans, and client testimonials. Canva or Figma files needed.",
      budget: "₹3,000",
      category: "Graphic Design",
      tags: ["Graphic Design", "Carousel Design", "Instagram", "Luxury Brand"],
      applicationQuestions: ["Share your best carousel design", "Can you work with a minimalist luxury aesthetic?"],
      deadline: day(7),
      status: "open",
      createdAt: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000),
    },

    // LearnHub EdTech
    {
      brandId: brandMap["aditya@learnhub.io"],
      brandName: "LearnHub EdTech",
      title: "Write 10 SEO Blog Articles on Career & Upskilling Topics",
      description: "Write 10 SEO-optimized blog articles (800-1200 words each) on topics like: 'Top 5 Skills to Learn in 2026', 'How to Build a Portfolio as a Student', 'Freelancing vs Full-Time After College', etc. Keyword research will be provided. Tone: friendly, helpful, data-backed.",
      budget: "₹5,000",
      category: "Content Writing",
      tags: ["Content Writing", "SEO", "Blog Writing", "EdTech"],
      applicationQuestions: ["Share 2 blog samples you've written", "Are you familiar with SEO writing (meta titles, headings, keywords)?", "Can you deliver 10 articles in 12 days?"],
      deadline: day(12),
      status: "open",
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      brandId: brandMap["aditya@learnhub.io"],
      brandName: "LearnHub EdTech",
      title: "Edit 8 YouTube Tutorial Videos with Subtitles & Thumbnails",
      description: "We have 8 raw tutorial recordings (15-25 min each) that need editing: cut dead space, add intro/outro, lower thirds, background music, and auto-subtitles. Also design 8 matching YouTube thumbnails. Style: clean, educational, bright colors.",
      budget: "₹6,000",
      category: "Video Editing",
      tags: ["Video Editing", "YouTube", "Thumbnails", "Education"],
      applicationQuestions: ["Share a YouTube video you've edited", "Which software do you use (Premiere Pro / DaVinci / CapCut)?", "Can you also design thumbnails?"],
      deadline: day(15),
      status: "open",
      createdAt: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000),
    },

    // GlowVeda Skincare
    {
      brandId: brandMap["sneha@glowveda.com"],
      brandName: "GlowVeda Skincare",
      title: "Create UGC-Style Product Review Reels (6 Videos)",
      description: "We'll ship 3 products to you. Record 6 UGC-style reels (15-30 sec) showing unboxing, texture shots, application, and honest mini-review. Must feel authentic — no heavy editing, just good lighting and clean audio. We'll provide a brief and hashtags.",
      budget: "₹2,500",
      category: "Social Media",
      tags: ["Social Media", "UGC", "Instagram Reels", "Skincare", "Product Review"],
      applicationQuestions: ["Share your Instagram handle", "Have you done UGC content before?", "Share your city/pin code for product shipping"],
      deadline: day(10),
      status: "open",
      createdAt: new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000),
    },
    {
      brandId: brandMap["sneha@glowveda.com"],
      brandName: "GlowVeda Skincare",
      title: "Write Product Descriptions & Instagram Captions (20 Products)",
      description: "Write compelling product descriptions (80-120 words each) for our e-commerce website + matching Instagram captions for 20 skincare products. Tone: warm, trustworthy, ingredient-focused. Must highlight key benefits and Ayurvedic ingredients. Reference: Forest Essentials, Juicy Chemistry.",
      budget: "₹2,000",
      category: "Content Writing",
      tags: ["Content Writing", "Product Description", "Copywriting", "E-commerce"],
      applicationQuestions: ["Share a product description sample", "Are you familiar with beauty/skincare terminology?"],
      deadline: day(7),
      status: "open",
      createdAt: new Date(now.getTime() - 0.8 * 24 * 60 * 60 * 1000),
    },

    // CodeLaunch Technologies
    {
      brandId: brandMap["vikram@codelaunch.dev"],
      brandName: "CodeLaunch Technologies",
      title: "Build a Dashboard UI with React + Charts for SaaS Product",
      description: "Build a responsive admin dashboard with React.js featuring: sidebar navigation, analytics cards (revenue, users, growth), interactive charts (line + bar using Recharts or Chart.js), data table with search/filter, and a dark/light theme toggle. We'll provide Figma designs.",
      budget: "₹10,000",
      category: "Web Development",
      tags: ["Web Development", "React", "Dashboard", "SaaS", "Charts"],
      applicationQuestions: ["Share your GitHub or portfolio", "Have you worked with React + charting libraries?", "What's your estimated delivery time?"],
      deadline: day(18),
      status: "open",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      brandId: brandMap["vikram@codelaunch.dev"],
      brandName: "CodeLaunch Technologies",
      title: "Create AI-Powered Chatbot Prototype Using OpenAI API",
      description: "Build a customer support chatbot prototype that uses OpenAI API to answer FAQs about our product. Tech: Node.js backend + simple React frontend. Should support conversation history, typing indicators, and a clean chat UI. Bonus: deploy on Vercel.",
      budget: "₹7,000",
      category: "AI Tools",
      tags: ["AI Tools", "Web Development", "Chatbot", "OpenAI", "Node.js"],
      applicationQuestions: ["Have you worked with OpenAI or similar APIs?", "Share a relevant project link", "Can you deploy it on Vercel?"],
      deadline: day(12),
      status: "open",
      createdAt: new Date(now.getTime() - 1.2 * 24 * 60 * 60 * 1000),
    },

    // The Content Co.
    {
      brandId: brandMap["meghna@thecontentco.in"],
      brandName: "The Content Co.",
      title: "Ghostwrite 4 LinkedIn Posts for Startup Founder",
      description: "Write 4 LinkedIn posts (200-350 words each) for a D2C startup founder. Topics: bootstrapping journey, hiring culture, lessons from scaling, customer obsession. Tone: authentic, story-driven, no corporate jargon. Must include a hook, body, and CTA. Reference: Kunal Shah, Nithin Kamath style.",
      budget: "₹1,500",
      category: "Content Writing",
      tags: ["Content Writing", "LinkedIn", "Ghostwriting", "Startup"],
      applicationQuestions: ["Share a LinkedIn post you've written or admire", "Can you match a conversational yet professional tone?"],
      deadline: day(5),
      status: "open",
      createdAt: new Date(now.getTime() - 0.3 * 24 * 60 * 60 * 1000),
    },
    {
      brandId: brandMap["meghna@thecontentco.in"],
      brandName: "The Content Co.",
      title: "Design a Monthly Newsletter Template for E-commerce Client",
      description: "Create a reusable email newsletter template (HTML or Mailchimp-compatible) for a fashion e-commerce brand. Must include: header with logo, hero banner section, product grid (4 items), discount code section, social links footer. Clean, mobile-responsive design.",
      budget: "₹2,500",
      category: "Graphic Design",
      tags: ["Graphic Design", "Email Design", "Newsletter", "E-commerce"],
      applicationQuestions: ["Share an email/newsletter design you've created", "Are you familiar with Mailchimp or HTML email coding?"],
      deadline: day(8),
      status: "open",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },

    // PixelPlay Creative Studio
    {
      brandId: brandMap["arjun@pixelplay.studio"],
      brandName: "PixelPlay Creative Studio",
      title: "Edit a 2-Minute Brand Film for Fashion Startup",
      description: "We have 45 minutes of raw footage from a fashion brand shoot (models, behind-the-scenes, product close-ups). Edit it into a 2-minute cinematic brand film with color grading, transitions, and a background score. Must evoke premium luxury feeling. Delivery: MP4 (1080p + 4K).",
      budget: "₹5,500",
      category: "Video Editing",
      tags: ["Video Editing", "Brand Film", "Color Grading", "Fashion"],
      applicationQuestions: ["Share your best video editing work", "Do you do color grading (DaVinci Resolve / Premiere)?", "Can you deliver within 10 days?"],
      deadline: day(10),
      status: "open",
      createdAt: new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000),
    },
    {
      brandId: brandMap["arjun@pixelplay.studio"],
      brandName: "PixelPlay Creative Studio",
      title: "Design Product Packaging Mockups for Beverage Brand",
      description: "Create 4 packaging design mockups for a new cold-pressed juice brand. Need: bottle label design (front + back), box packaging, and a multipack carton design. Must include nutritional info layout, barcode area, and brand logo placement. Style: fresh, organic, modern.",
      budget: "₹4,500",
      category: "Graphic Design",
      tags: ["Graphic Design", "Packaging Design", "Product Design", "Branding"],
      applicationQuestions: ["Share a packaging design you've done", "Are you comfortable with print-ready file formats (CMYK, bleed)?"],
      deadline: day(12),
      status: "open",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },

    // FitFuel Nutrition
    {
      brandId: brandMap["kavya@fitfuel.in"],
      brandName: "FitFuel Nutrition",
      title: "Manage Instagram Page for 2 Weeks (Daily Posts + Stories)",
      description: "Take over our Instagram account (5L+ followers) for 14 days. You'll post 1 feed post + 3-5 stories daily. Content plan will be provided, but you'll create the creatives, write captions, use relevant hashtags, and engage with comments. Must understand fitness/nutrition space.",
      budget: "₹4,000",
      category: "Social Media",
      tags: ["Social Media", "Instagram Management", "Community", "Fitness"],
      applicationQuestions: ["Share an Instagram page you've managed or your own", "Do you understand the fitness/health niche?", "Are you available for 14 consecutive days?"],
      deadline: day(5),
      status: "open",
      createdAt: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000),
    },
    {
      brandId: brandMap["kavya@fitfuel.in"],
      brandName: "FitFuel Nutrition",
      title: "Build a Sales & Inventory Tracker in Google Sheets",
      description: "Create an advanced Google Sheets dashboard for tracking: daily sales (product-wise), inventory levels with reorder alerts, monthly revenue comparison charts, and a supplier payment tracker. Must include data validation, conditional formatting, and auto-generated charts.",
      budget: "₹2,000",
      category: "Data & Excel",
      tags: ["Data & Excel", "Google Sheets", "Dashboard", "Inventory"],
      applicationQuestions: ["Share a spreadsheet/dashboard you've built", "Are you comfortable with Google Sheets formulas (VLOOKUP, QUERY, etc)?"],
      deadline: day(7),
      status: "open",
      createdAt: new Date(now.getTime() - 2.8 * 24 * 60 * 60 * 1000),
    },
  ];
}

// ─── Long-Term Roles ─────────────────────────────────────────
function getLongTermRoles(brandMap) {
  const now = new Date();
  return [
    // FlavourBox
    {
      brandId: brandMap["rohit@flavourbox.in"],
      brandName: "FlavourBox India",
      managerName: "Rohit Kapoor",
      email: "rohit@flavourbox.in",
      roleTitle: "Social Media Video Editor (Monthly Retainer)",
      skillsNeeded: ["Video Editing", "Social Media"],
      monthlyBudget: "₹8,000 - ₹12,000/month",
      duration: "3 months (extendable)",
      workType: "remote",
      hoursPerWeek: "12-15 hours",
      expectedWeeklyOutput: "6 Instagram Reels + 2 YouTube Shorts per week",
      trialTask: "Edit 2 sample reels from our raw footage (we'll provide clips)",
      trialPay: "₹1,000",
      startTimeline: "Immediate",
      status: "open",
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },

    // UrbanCraft Studio
    {
      brandId: brandMap["priya@urbancraft.co"],
      brandName: "UrbanCraft Studio",
      managerName: "Priya Menon",
      email: "priya@urbancraft.co",
      roleTitle: "Junior Web Developer — Ongoing Website Maintenance",
      skillsNeeded: ["Web Development"],
      monthlyBudget: "₹10,000 - ₹15,000/month",
      duration: "6 months",
      workType: "remote",
      hoursPerWeek: "15-20 hours",
      expectedWeeklyOutput: "Bug fixes, new page builds, SEO improvements, performance optimization",
      trialTask: "Fix 3 bugs on our staging site and add one new section",
      trialPay: "₹2,000",
      startTimeline: "Within 1 week",
      status: "open",
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    },

    // LearnHub EdTech
    {
      brandId: brandMap["aditya@learnhub.io"],
      brandName: "LearnHub EdTech",
      managerName: "Aditya Joshi",
      email: "aditya@learnhub.io",
      roleTitle: "Content Writer & SEO Specialist (Part-Time)",
      skillsNeeded: ["Content Writing", "SEO"],
      monthlyBudget: "₹6,000 - ₹9,000/month",
      duration: "3 months",
      workType: "remote",
      hoursPerWeek: "10-12 hours",
      expectedWeeklyOutput: "3 SEO blog articles + 5 social media captions per week",
      trialTask: "Write 2 SEO articles (1000 words each) on given topics",
      trialPay: "₹800",
      startTimeline: "Immediate",
      status: "open",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },

    // GlowVeda Skincare
    {
      brandId: brandMap["sneha@glowveda.com"],
      brandName: "GlowVeda Skincare",
      managerName: "Sneha Reddy",
      email: "sneha@glowveda.com",
      roleTitle: "Instagram Content Creator & Community Manager",
      skillsNeeded: ["Social Media", "Graphic Design", "Content Writing"],
      monthlyBudget: "₹7,000 - ₹10,000/month",
      duration: "3 months (extendable)",
      workType: "remote",
      hoursPerWeek: "12-15 hours",
      expectedWeeklyOutput: "5 feed posts + daily stories + community engagement (reply to DMs & comments)",
      trialTask: "Create 3 Instagram post designs + captions for our Vitamin C serum launch",
      trialPay: "₹1,000",
      startTimeline: "Within 3 days",
      status: "open",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },

    // CodeLaunch Technologies
    {
      brandId: brandMap["vikram@codelaunch.dev"],
      brandName: "CodeLaunch Technologies",
      managerName: "Vikram Sinha",
      email: "vikram@codelaunch.dev",
      roleTitle: "Full Stack Developer Intern (React + Node.js)",
      skillsNeeded: ["Web Development", "AI Tools"],
      monthlyBudget: "₹12,000 - ₹18,000/month",
      duration: "6 months",
      workType: "remote",
      hoursPerWeek: "20-25 hours",
      expectedWeeklyOutput: "Feature development, code reviews, API integrations, and testing",
      trialTask: "Build a small CRUD app with React frontend + Node.js backend + MongoDB",
      trialPay: "₹2,500",
      startTimeline: "Within 1 week",
      status: "open",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },

    // The Content Co.
    {
      brandId: brandMap["meghna@thecontentco.in"],
      brandName: "The Content Co.",
      managerName: "Meghna Arora",
      email: "meghna@thecontentco.in",
      roleTitle: "LinkedIn Ghostwriter for Startup Founders",
      skillsNeeded: ["Content Writing", "Social Media"],
      monthlyBudget: "₹5,000 - ₹8,000/month",
      duration: "3 months",
      workType: "remote",
      hoursPerWeek: "8-10 hours",
      expectedWeeklyOutput: "4 LinkedIn posts per week for 2 founders + content calendar",
      trialTask: "Write 3 LinkedIn posts on topics we provide (different writing styles)",
      trialPay: "₹700",
      startTimeline: "Immediate",
      status: "open",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },

    // PixelPlay Creative Studio
    {
      brandId: brandMap["arjun@pixelplay.studio"],
      brandName: "PixelPlay Creative Studio",
      managerName: "Arjun Malhotra",
      email: "arjun@pixelplay.studio",
      roleTitle: "Motion Graphics & Video Editor (Agency Projects)",
      skillsNeeded: ["Video Editing", "Graphic Design"],
      monthlyBudget: "₹10,000 - ₹14,000/month",
      duration: "Ongoing",
      workType: "remote",
      hoursPerWeek: "15-18 hours",
      expectedWeeklyOutput: "3-4 edited videos (brand films, ads, social content) per week across multiple clients",
      trialTask: "Edit a 60-sec brand ad from raw footage + create 2 motion graphic title cards",
      trialPay: "₹1,500",
      startTimeline: "Within 5 days",
      status: "open",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },

    // FitFuel Nutrition
    {
      brandId: brandMap["kavya@fitfuel.in"],
      brandName: "FitFuel Nutrition",
      managerName: "Kavya Sharma",
      email: "kavya@fitfuel.in",
      roleTitle: "Graphic Designer — Daily Creatives & Packaging",
      skillsNeeded: ["Graphic Design"],
      monthlyBudget: "₹7,000 - ₹10,000/month",
      duration: "3 months (extendable)",
      workType: "remote",
      hoursPerWeek: "12-15 hours",
      expectedWeeklyOutput: "5 social media creatives + 1 packaging mockup update per week",
      trialTask: "Design 3 Instagram post creatives for our new protein bar launch",
      trialPay: "₹1,000",
      startTimeline: "Immediate",
      status: "open",
      createdAt: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000),
    },
  ];
}

// ─── Main Seed Function ──────────────────────────────────────
async function seedProjects() {
  try {
    const maskedUri = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`\n🔄 Connecting to MongoDB at: ${maskedUri}...`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected successfully!\n');

    // ── Step 1: Create brand accounts ─────────────────────
    console.log('🏢 Creating brand accounts...');
    const brandMap = {}; // email → ObjectId
    const hashedPw = await bcrypt.hash('Brand@123', 10);

    for (const brand of seedBrands) {
      let existing = await User.findOne({ email: brand.email });
      if (existing) {
        console.log(`   ↳ Brand "${brand.companyName}" already exists (${brand.email})`);
        brandMap[brand.email] = existing._id;
      } else {
        const newBrand = await User.create({
          ...brand,
          password: hashedPw,
          role: 'brand',
          isVerified: true,
          isApproved: true,
        });
        console.log(`   ✅ Created brand: ${brand.companyName}`);
        brandMap[brand.email] = newBrand._id;
      }
    }
    console.log(`   🏢 Total brands ready: ${Object.keys(brandMap).length}\n`);

    // ── Step 2: Clean old seed projects ───────────────────
    const brandIds = Object.values(brandMap);
    
    const delJobs = await Job.deleteMany({ brandId: { $in: brandIds } });
    console.log(`🧹 Cleaned ${delJobs.deletedCount} old seed jobs.`);
    
    const delRoles = await LongTermRole.deleteMany({ brandId: { $in: brandIds } });
    console.log(`🧹 Cleaned ${delRoles.deletedCount} old seed long-term roles.\n`);

    // ── Step 3: Insert short-term projects ────────────────
    console.log('📋 Inserting short-term projects (Jobs)...');
    const jobs = getShortTermProjects(brandMap);
    const insertedJobs = await Job.insertMany(jobs);
    console.log(`   ✅ Inserted ${insertedJobs.length} short-term projects!\n`);

    // ── Step 4: Insert long-term roles ────────────────────
    console.log('💼 Inserting long-term roles...');
    const roles = getLongTermRoles(brandMap);
    const insertedRoles = await LongTermRole.insertMany(roles);
    console.log(`   ✅ Inserted ${insertedRoles.length} long-term roles!\n`);

    // ── Summary ───────────────────────────────────────────
    console.log('═══════════════════════════════════════════');
    console.log('  ✅ SEEDING COMPLETE!');
    console.log(`  🏢 Brands:             ${Object.keys(brandMap).length}`);
    console.log(`  📋 Short-Term Projects: ${insertedJobs.length}`);
    console.log(`  💼 Long-Term Roles:     ${insertedRoles.length}`);
    console.log('═══════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

seedProjects();
