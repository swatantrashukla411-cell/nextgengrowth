/**
 * NextGenGrowth — Seed Real Indian D2C & Consumer Startups
 * 
 * Run: node add_indian_startups.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

// Schemas
const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false }));
const Job = mongoose.models.Job || mongoose.model("Job", new mongoose.Schema({}, { strict: false }));
const LongTermRole = mongoose.models.LongTermRole || mongoose.model("LongTermRole", new mongoose.Schema({}, { strict: false }));

const indianBrands = [
  {
    firstName: "Siddharth",
    lastName: "Dungarwal",
    email: "partnerships@snitch.co.in",
    companyName: "Snitch Fashion",
    serviceNeeded: "Social Media Marketing, UGC Reels, Fashion Content",
    bio: "India's fastest-growing Gen-Z fast-fashion brand. We design apparel that fits the style, vibe, and attitude of youth. Looking for college creators and campus ambassadors.",
    linkedin: "https://linkedin.com/company/snitchin",
    brandLink: "https://snitch.co.in",
  },
  {
    firstName: "Sangeet",
    lastName: "Agrawal",
    email: "collabs@mokobara.com",
    companyName: "Mokobara",
    serviceNeeded: "Video Editing, Graphic Design, Campus Ambassadorship",
    bio: "Modern travel brand making premium luggage, backpacks, and accessories. We are on a mission to elevate the joy of travel. Need creators who make clean, minimalist, high-vibe visual content.",
    linkedin: "https://linkedin.com/company/mokobara",
    brandLink: "https://mokobara.com",
  },
  {
    firstName: "Peyush",
    lastName: "Bansal",
    email: "campus@lenskart.in",
    companyName: "Lenskart",
    serviceNeeded: "Campus Ambassadors, Local Marketing, App Installs",
    bio: "India's leading omni-channel eyewear brand. We want to recruit energetic campus squads to run vision screening camps and drive student app signups.",
    linkedin: "https://linkedin.com/company/lenskart",
    brandLink: "https://lenskart.com",
  },
  {
    firstName: "Aadit",
    lastName: "Palicha",
    email: "growth@zepto.co.in",
    companyName: "Zepto Delivery",
    serviceNeeded: "College Signups, Brand Awareness, Campus Activations",
    bio: "India's fastest 10-minute grocery delivery app. Expanding rapidly across top tier colleges and campuses. Need campus squads to drive student downloads and referral codes.",
    linkedin: "https://linkedin.com/company/zeptostore",
    brandLink: "https://www.zepto.co.in",
  }
];

function getMockJobs(brandMap) {
  const now = new Date();
  const day = (d) => { const dt = new Date(now); dt.setDate(dt.getDate() + d); return dt.toISOString().split('T')[0]; };
  
  return [
    {
      brandId: brandMap["partnerships@snitch.co.in"],
      brandName: "Snitch Fashion",
      title: "Shoot 4 UGC Style Try-On Reels for Summer Collection",
      description: "We'll ship 4 Snitch summer shirts/trousers to your hostel/home. Record 4 short, high-energy transition reels trying them on, matching with cool shoes, and highlighting Gen-Z styling. Background music must be trending on Instagram. Authentic and organic style.",
      budget: "₹5,000",
      category: "Social Media",
      tags: ["Social Media", "UGC Reels", "Fashion Styling", "Gen-Z Brand"],
      applicationQuestions: ["Share your Instagram handle", "What size clothing do you wear?", "Share a link to your styling video/portfolio"],
      deadline: day(12),
      status: "open",
      createdAt: now
    },
    {
      brandId: brandMap["collabs@mokobara.com"],
      brandName: "Mokobara",
      title: "Design 6 Premium Social Media Carousel Templates (Figma)",
      description: "We need 6 reusable, sleek, minimalist Instagram carousel templates in Figma. Focus on clean product photography layouts, pastel colors, and bold sans-serif typography that match the Mokobara aesthetic. Deliver fully organized Figma files.",
      budget: "₹6,000",
      category: "Graphic Design",
      tags: ["Graphic Design", "Figma", "Branding", "Social Media"],
      applicationQuestions: ["Share your Figma portfolio link", "Do you understand Mokobara's color scheme and branding?"],
      deadline: day(10),
      status: "open",
      createdAt: now
    },
    {
      brandId: brandMap["campus@lenskart.in"],
      brandName: "Lenskart",
      title: "Run Campus Vision Screening & App Download Campaign",
      description: "We're looking for campus leads to organize a 1-day free vision checkup camp on your college campus. You'll get visual material, frame samples to showcase, and a specific coupon code. Goal is to drive 80+ student signups on the Lenskart app.",
      budget: "₹4,500 + Incentives",
      category: "Social Media",
      tags: ["Campus Ambassadors", "Event Management", "App Installs", "Offline Marketing"],
      applicationQuestions: ["Which college are you in?", "Have you organized any college fest or society events?", "Can you recruit 2 friends to help?"],
      deadline: day(15),
      status: "open",
      createdAt: now
    },
    {
      brandId: brandMap["growth@zepto.co.in"],
      brandName: "Zepto Delivery",
      title: "Drive 100 First-Time App Orders in Hostel Blocks",
      description: "Get hostel students to try Zepto for their late-night cravings. We will provide special ₹100 discount coupon codes. You need to spread them in hostel WhatsApp groups and place offline door-hangers. Goal is 100 first-time orders in 2 weeks.",
      budget: "₹5,000",
      category: "Social Media",
      tags: ["App Installs", "Local Marketing", "Campus Ambassadors", "User Acquisition"],
      applicationQuestions: ["Do you live in a college hostel?", "What is your college hostel student capacity?"],
      deadline: day(14),
      status: "open",
      createdAt: now
    }
  ];
}

function getMockRoles(brandMap) {
  const now = new Date();
  return [
    {
      brandId: brandMap["partnerships@snitch.co.in"],
      brandName: "Snitch Fashion",
      managerName: "Siddharth Dungarwal",
      email: "partnerships@snitch.co.in",
      roleTitle: "Snitch Campus Squad Lead (Monthly Ambassador)",
      skillsNeeded: ["Social Media", "Content Writing"],
      monthlyBudget: "₹7,000/month + Free Apparel",
      duration: "3 months (extendable)",
      workType: "hybrid",
      hoursPerWeek: "10 hours",
      expectedWeeklyOutput: "Promoting Snitch offline campaigns, recruiting college ambassadors, distributing monthly discount vouchers, and compiling weekly feedback report.",
      trialTask: "Write a short creative proposal detailing how you would promote Snitch's new winter merch in your college.",
      trialPay: "₹1,000",
      startTimeline: "Immediate",
      status: "open",
      createdAt: now
    },
    {
      brandId: brandMap["collabs@mokobara.com"],
      brandName: "Mokobara",
      managerName: "Sangeet Agrawal",
      email: "collabs@mokobara.com",
      roleTitle: "Social Media Video Editor (Travel Content Retainer)",
      skillsNeeded: ["Video Editing", "Social Media"],
      monthlyBudget: "₹12,000 - ₹15,000/month",
      duration: "6 months",
      workType: "remote",
      hoursPerWeek: "15 hours",
      expectedWeeklyOutput: "Editing 4 high-quality cinematic reels per week. Raw travel clips and voiceovers will be provided. Aesthetic color grading is crucial.",
      trialTask: "Edit 1 sample 30-sec reel using raw clips we send.",
      trialPay: "₹1,500",
      startTimeline: "Within 5 days",
      status: "open",
      createdAt: now
    }
  ];
}

async function run() {
  try {
    const maskedUri = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`🔌 Connecting to MongoDB at: ${maskedUri}...`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected successfully!');

    const brandMap = {};
    const hashedPw = await bcrypt.hash('IndianBrand@123', 10);

    console.log('🏢 Seeding Indian D2C startup brands...');
    for (const b of indianBrands) {
      let existing = await User.findOne({ email: b.email });
      if (existing) {
        console.log(`   ↳ Brand "${b.companyName}" already exists (${b.email})`);
        brandMap[b.email] = existing._id;
      } else {
        const newBrand = await User.create({
          ...b,
          password: hashedPw,
          role: 'brand',
          isVerified: true,
          isApproved: true,
        });
        console.log(`   ✅ Created brand: ${b.companyName}`);
        brandMap[b.email] = newBrand._id;
      }
    }

    const brandIds = Object.values(brandMap);

    console.log('🧹 Cleaning old mock projects for these brands...');
    await Job.deleteMany({ brandId: { $in: brandIds } });
    await LongTermRole.deleteMany({ brandId: { $in: brandIds } });

    console.log('📋 Inserting fresh recognizable Indian D2C jobs...');
    const jobs = getMockJobs(brandMap);
    const insertedJobs = await Job.insertMany(jobs);
    console.log(`   ✅ Seeded ${insertedJobs.length} new jobs!`);

    console.log('💼 Inserting fresh recognizable Indian D2C roles...');
    const roles = getMockRoles(brandMap);
    const insertedRoles = await LongTermRole.insertMany(roles);
    console.log(`   ✅ Seeded ${insertedRoles.length} new long-term roles!`);

    console.log('🎉 Seeding successfully finished!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

run();
