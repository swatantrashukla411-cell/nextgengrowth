require('dotenv').config();
const express    = require("express");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const cors       = require("cors");
const bodyParser = require("body-parser");
const rateLimit  = require("express-rate-limit");
const path       = require("path");
const mongoose   = require("mongoose");
const passport   = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session    = require("express-session");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Razorpay   = require("razorpay");
const crypto     = require("crypto");

const app        = express();
const PORT       = process.env.PORT             || 3000;
const JWT_SECRET = process.env.JWT_SECRET       || "nextgengrowth_secret_2026";
const MONGO_URI  = process.env.MONGODB_URI;
const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL  = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback";
const BASE_URL   = process.env.BASE_URL || "https://nextgengrowth-production.up.railway.app";

const RAZORPAY_MIN_AMOUNT_PAISE = 100;

function cleanEnv(name){
  return String(process.env[name]||"").trim();
}

function getRazorpayConfig(){
  const keyId=cleanEnv("RAZORPAY_KEY_ID");
  const keySecret=cleanEnv("RAZORPAY_KEY_SECRET");
  const missing=[];
  if(!keyId)missing.push("RAZORPAY_KEY_ID");
  if(!keySecret)missing.push("RAZORPAY_KEY_SECRET");
  return{
    keyId,
    keySecret,
    configured:missing.length===0,
    missing,
    mode:keyId.startsWith("rzp_live_")?"live":keyId.startsWith("rzp_test_")?"test":"unknown",
  };
}

function getRazorpayClient(){
  const config=getRazorpayConfig();
  if(!config.configured){
    const err=new Error(`Razorpay credentials are not configured. Missing: ${config.missing.join(", ")}`);
    err.statusCode=401;
    throw err;
  }
  return new Razorpay({
    key_id:config.keyId,
    key_secret:config.keySecret,
  });
}

// ═══════════════════════════════════════════
// MONGODB
// ═══════════════════════════════════════════
if(MONGO_URI){
  mongoose.connect(MONGO_URI)
    .then(()=>console.log("✅ MongoDB Connected!"))
    .catch(err=>console.error("❌ MongoDB Error:",err));
}else{
  console.error("❌ MongoDB Error: MONGODB_URI is not configured.");
}

// ═══════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════
const userSchema = new mongoose.Schema({
  firstName:{type:String,default:""}, // ✅ FIXED: required removed for Google Login
  lastName:{type:String,default:""},  // ✅ FIXED: required removed for Google Login
  email:{type:String,required:true,unique:true,lowercase:true},
  password:{type:String,default:""},
  role:{type:String,enum:["student","brand"],required:true},
  college:{type:String,default:""},
  year:{type:String,default:""},        // ✅ College year
  skills:{type:[String],default:[]},
  companyName:{type:String,default:""},
  serviceNeeded:{type:String,default:""},
  bio:{type:String,default:""},
  linkedin:{type:String,default:""},
  portfolioLink:{type:String,default:""}, // ✅ Added Portfolio
  googleId:{type:String,default:""},   // ✅ Google OAuth
  isVerified:{type:Boolean,default:false}, // ✅ Email verified
  avatar:{type:String,default:""},
  brandLink: { type: String, default: "" }, // LinkedIn/Website link store karne ke liye
  isApproved: { type: Boolean, default: false },
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

const otpSchema = new mongoose.Schema({
  email:{type:String,required:true},
  otp:{type:String,required:true},
  expiresAt:{type:Date,required:true},
  verified:{type:Boolean,default:false},
},{timestamps:true});

const applicationSchema = new mongoose.Schema({
  studentId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  jobId:{type:String,required:true},
  jobTitle:{type:String,required:true},
  brandName:{type:String,required:true},
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  pay:{type:String,required:true},
  status:{type:String,enum:["review","accepted","rejected"],default:"review"},
  paymentStatus:{type:String,enum:["unpaid","paid"],default:"unpaid"},
  paidAmount:{type:Number,default:0},
},{timestamps:true});

const earningSchema = new mongoose.Schema({
  studentId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  applicationId:{type:mongoose.Schema.Types.ObjectId,ref:"Application"},
  amount:{type:Number,required:true},
  description:{type:String,default:"Project payment"},
  status:{type:String,enum:["paid","pending"],default:"paid"},
},{timestamps:true});

// ✅ REAL JOBS from DB (brand posts karta hai)
const jobSchema = new mongoose.Schema({
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  brandName:{type:String,required:true},
  title:{type:String,required:true},
  description:{type:String,default:""},
  budget:{type:String,required:true},
  category:{type:String,required:true},
  tags:{type:[String],default:[]},
  deadline:{type:String,default:""},
  status:{type:String,enum:["open","closed"],default:"open"},
},{timestamps:true});

const paymentSchema = new mongoose.Schema({
  applicationId:{type:mongoose.Schema.Types.ObjectId,ref:"Application",required:true},
  studentId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  razorpayOrderId:{type:String,required:true},
  razorpayPaymentId:{type:String,default:""},
  razorpaySignature:{type:String,default:""},
  amount:{type:Number,required:true},
  status:{type:String,enum:["created","paid","failed"],default:"created"},
  description:{type:String,default:"Project payment"},
},{timestamps:true});

const projectWorkspaceSchema = new mongoose.Schema({
  applicationId:{type:mongoose.Schema.Types.ObjectId,ref:"Application",required:true,unique:true},
  jobId:{type:String,required:true},
  jobTitle:{type:String,default:""},
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  studentId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  brief:{type:String,default:""},
  resources:{type:[{title:{type:String,default:""},url:{type:String,default:""}}],default:[]},
  status:{type:String,enum:["resources_pending","in_progress","submitted","revision_requested","approved","completed"],default:"resources_pending"},
  submissionLink:{type:String,default:""},
  submissionNote:{type:String,default:""},
  revisionNote:{type:String,default:""},
  deadline:{type:String,default:""},
  submittedAt:{type:Date},
  approvedAt:{type:Date},
},{timestamps:true});

const blogPostSchema = new mongoose.Schema({
  title:{type:String,required:true,trim:true},
  slug:{type:String,required:true,unique:true,lowercase:true,trim:true},
  category:{type:String,required:true,default:"marketing",trim:true},
  tags:{type:[String],default:[]},
  featuredImage:{type:String,default:""},
  excerpt:{type:String,default:""},
  content:{type:String,default:""},
  seoTitle:{type:String,default:""},
  seoDescription:{type:String,default:""},
  status:{type:String,enum:["draft","published"],default:"draft"},
  authorName:{type:String,default:"NextGenGrowth Team"},
  authorSlug:{type:String,default:"nextgengrowth-team"},
  featured:{type:Boolean,default:false},
  publishAt:{type:Date},
  views:{type:Number,default:0},
  ctaClicks:{type:Number,default:0},
  shareClicks:{type:Number,default:0},
  newsletterSignups:{type:Number,default:0},
},{timestamps:true});
blogPostSchema.index({status:1,publishAt:-1,createdAt:-1});
blogPostSchema.index({category:1,status:1,publishAt:-1});
blogPostSchema.index({title:"text",excerpt:"text",content:"text",tags:"text"});

const newsletterSubscriberSchema = new mongoose.Schema({
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  name:{type:String,default:""},
  source:{type:String,default:"blog"},
  tags:{type:[String],default:[]},
  subscribedAt:{type:Date,default:Date.now},
},{timestamps:true});

const blogEventSchema = new mongoose.Schema({
  postId:{type:mongoose.Schema.Types.ObjectId,ref:"BlogPost"},
  slug:{type:String,default:""},
  event:{type:String,enum:["view","share","cta_click","newsletter_signup","feedback","search"],required:true},
  channel:{type:String,default:""},
  metadata:{type:Object,default:{}},
  ip:{type:String,default:""},
  userAgent:{type:String,default:""},
},{timestamps:true});

const platformSettingSchema = new mongoose.Schema({
  key:{type:String,default:"main",unique:true},
  commissionRate:{type:Number,default:10,min:0,max:50},
  minProjectBudget:{type:Number,default:500,min:0},
  maxProjectBudget:{type:Number,default:50000,min:0},
  features:{
    studentRegistrations:{type:Boolean,default:true},
    brandRegistrations:{type:Boolean,default:true},
    projectPosting:{type:Boolean,default:true},
    maintenanceMode:{type:Boolean,default:false},
  },
  emails:{
    welcomeEmail:{type:Boolean,default:true},
    applicationAlert:{type:Boolean,default:true},
    paymentConfirmation:{type:Boolean,default:true},
    adminAlerts:{type:Boolean,default:false},
  },
},{timestamps:true});

const User        = mongoose.model("User",userSchema);
const OTP         = mongoose.model("OTP",otpSchema);
const Application = mongoose.model("Application",applicationSchema);
const Earning     = mongoose.model("Earning",earningSchema);
const Job         = mongoose.model("Job",jobSchema);
const Payment     = mongoose.model("Payment",paymentSchema);
const ProjectWorkspace = mongoose.model("ProjectWorkspace",projectWorkspaceSchema);
const BlogPost = mongoose.model("BlogPost",blogPostSchema);
const NewsletterSubscriber = mongoose.model("NewsletterSubscriber",newsletterSubscriberSchema);
const BlogEvent = mongoose.model("BlogEvent",blogEventSchema);
const PlatformSetting = mongoose.model("PlatformSetting",platformSettingSchema);

console.log("✅ All models loaded!");

function getMinimumAmount(value){
  const matches=String(value||"").replace(/,/g,"").match(/\d+(?:\.\d+)?/g);
  const amount=matches?.length?Number(matches[0]):0;
  return Number.isFinite(amount)&&amount>0?amount:1;
}

function formatINR(amount){
  return `₹${Number(amount||0).toLocaleString("en-IN")}`;
}

function getRazorpayErrorStatus(err){
  const status=err?.statusCode||err?.status||err?.error?.statusCode;
  return Number(status)===401?401:500;
}

async function createRazorpayOrder({amount,currency="INR",receipt,notes={}}){
  const amountInPaise=Number(amount);
  if(!Number.isInteger(amountInPaise)||amountInPaise<RAZORPAY_MIN_AMOUNT_PAISE){
    const err=new Error("Minimum order amount is 100 paise.");
    err.statusCode=400;
    throw err;
  }
  return getRazorpayClient().orders.create({
    amount:amountInPaise,
    currency:currency||"INR",
    receipt:receipt||`ngg_${Date.now()}`,
    notes,
  });
}

function isValidRazorpaySignature(orderId,paymentId,signature){
  const {keySecret}=getRazorpayConfig();
  if(!keySecret)return false;
  const expectedSig=crypto
    .createHmac("sha256",keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const expected=Buffer.from(expectedSig,"hex");
  const received=Buffer.from(String(signature||""),"hex");
  return expected.length===received.length&&crypto.timingSafeEqual(expected,received);
}

function isValidUrl(value){
  try{
    const url=new URL(String(value||"").trim());
    return ["http:","https:"].includes(url.protocol);
  }catch{
    return false;
  }
}

function cleanResources(resources){
  if(!Array.isArray(resources))return [];
  return resources
    .map(r=>({title:String(r?.title||"").trim(),url:String(r?.url||"").trim()}))
    .filter(r=>r.title&&r.url&&isValidUrl(r.url))
    .slice(0,5);
}

function safeMessage(value,max=3000){
  return String(value||"").trim().slice(0,max);
}

function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,ch=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}

function escapeAttr(value){
  return escapeHtml(value).replace(/`/g,"&#96;");
}

function stripMarkdown(value){
  return String(value||"")
    .replace(/```[\s\S]*?```/g," ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g," ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g,"$1")
    .replace(/[#>*_`~\-]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function slugify(value){
  return String(value||"")
    .toLowerCase()
    .trim()
    .replace(/&/g," and ")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,90)||`post-${Date.now()}`;
}

function normalizeTags(tags){
  const raw=Array.isArray(tags)?tags:String(tags||"").split(",");
  return [...new Set(raw.map(t=>String(t||"").trim()).filter(Boolean).slice(0,12))];
}

function estimateReadingTime(content){
  const words=stripMarkdown(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1,Math.ceil(words/210));
}

function dbReady(){
  return Boolean(MONGO_URI)&&mongoose.connection.readyState===1;
}

const DEFAULT_PLATFORM_SETTINGS={
  commissionRate:10,
  minProjectBudget:500,
  maxProjectBudget:50000,
  features:{
    studentRegistrations:true,
    brandRegistrations:true,
    projectPosting:true,
    maintenanceMode:false,
  },
  emails:{
    welcomeEmail:true,
    applicationAlert:true,
    paymentConfirmation:true,
    adminAlerts:false,
  },
};

function boolSetting(value,fallback){
  return typeof value==="boolean"?value:fallback;
}

function amountSetting(value,fallback){
  const parsed=getMinimumAmount(value);
  return Number.isFinite(parsed)&&parsed>=0?parsed:fallback;
}

function normalizePlatformSettings(raw={}){
  const settings=raw.toObject?raw.toObject():raw;
  const commission=Number(settings.commissionRate);
  const minBudget=amountSetting(settings.minProjectBudget,DEFAULT_PLATFORM_SETTINGS.minProjectBudget);
  const maxBudget=amountSetting(settings.maxProjectBudget,DEFAULT_PLATFORM_SETTINGS.maxProjectBudget);
  return{
    commissionRate:Number.isFinite(commission)?Math.min(50,Math.max(0,commission)):DEFAULT_PLATFORM_SETTINGS.commissionRate,
    minProjectBudget:minBudget,
    maxProjectBudget:Math.max(minBudget,maxBudget),
    features:{
      studentRegistrations:boolSetting(settings.features?.studentRegistrations,DEFAULT_PLATFORM_SETTINGS.features.studentRegistrations),
      brandRegistrations:boolSetting(settings.features?.brandRegistrations,DEFAULT_PLATFORM_SETTINGS.features.brandRegistrations),
      projectPosting:boolSetting(settings.features?.projectPosting,DEFAULT_PLATFORM_SETTINGS.features.projectPosting),
      maintenanceMode:boolSetting(settings.features?.maintenanceMode,DEFAULT_PLATFORM_SETTINGS.features.maintenanceMode),
    },
    emails:{
      welcomeEmail:boolSetting(settings.emails?.welcomeEmail,DEFAULT_PLATFORM_SETTINGS.emails.welcomeEmail),
      applicationAlert:boolSetting(settings.emails?.applicationAlert,DEFAULT_PLATFORM_SETTINGS.emails.applicationAlert),
      paymentConfirmation:boolSetting(settings.emails?.paymentConfirmation,DEFAULT_PLATFORM_SETTINGS.emails.paymentConfirmation),
      adminAlerts:boolSetting(settings.emails?.adminAlerts,DEFAULT_PLATFORM_SETTINGS.emails.adminAlerts),
    },
  };
}

async function getPlatformSettings(){
  const defaults=normalizePlatformSettings(DEFAULT_PLATFORM_SETTINGS);
  if(!dbReady())return defaults;
  const doc=await PlatformSetting.findOneAndUpdate(
    {key:"main"},
    {$setOnInsert:{key:"main",...defaults}},
    {new:true,upsert:true,setDefaultsOnInsert:true}
  );
  return normalizePlatformSettings(doc);
}

async function savePlatformSettings(payload){
  if(!dbReady())throw apiError("Database not connected.",503);
  const settings=normalizePlatformSettings(payload);
  const doc=await PlatformSetting.findOneAndUpdate(
    {key:"main"},
    {$set:{...settings,key:"main"}},
    {new:true,upsert:true,setDefaultsOnInsert:true,runValidators:true}
  );
  return normalizePlatformSettings(doc);
}

const EMAIL_SETTING_KEYS={
  welcome:"welcomeEmail",
  application:"applicationAlert",
  payment:"paymentConfirmation",
  admin:"adminAlerts",
};

async function sendConfiguredEmail(type,to,subject,html){
  const settings=await getPlatformSettings();
  const key=EMAIL_SETTING_KEYS[type]||type;
  if(settings.emails?.[key]===false){
    console.log(`📧 Email skipped by admin setting [${key}] for ${to}`);
    return;
  }
  return sendEmail(to,subject,html);
}

const BLOG_CATEGORIES=[
  {slug:"marketing",name:"Marketing",description:"Digital marketing playbooks for brands that want measurable growth."},
  {slug:"business-growth",name:"Business Growth",description:"Strategy, positioning, conversion, retention, and revenue ideas for founders."},
  {slug:"ai-tools",name:"AI Tools",description:"Practical AI workflows, automation stacks, and tools for modern teams."},
  {slug:"startup-growth",name:"Startup Growth",description:"Lean acquisition, launch systems, and operating habits for early teams."},
  {slug:"automation",name:"Automation",description:"No-fluff systems that save time and make growth repeatable."},
  {slug:"lead-generation",name:"Lead Generation",description:"Better pipelines, offers, funnels, and outreach for consistent demand."},
  {slug:"branding",name:"Branding",description:"Trust-building brand strategy, content systems, and market positioning."},
];

const DEFAULT_BLOG_POSTS=[
  {
    title:"How student-powered teams help brands grow faster in 2026",
    slug:"student-powered-teams-brand-growth-2026",
    category:"business-growth",
    tags:["student talent","business growth","outsourcing","creator economy"],
    featured:true,
    featuredImage:"https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
    excerpt:"A practical guide to using skilled student talent for content, design, websites, and growth work without slowing your core team.",
    seoTitle:"Student-Powered Growth Teams for Brands in 2026 | NextGenGrowth",
    seoDescription:"Learn how brands can use skilled student talent to ship marketing, content, design, and web projects faster with NextGenGrowth.",
    authorName:"NextGenGrowth Team",
    authorSlug:"nextgengrowth-team",
    status:"published",
    publishAt:new Date("2026-05-14T05:30:00.000Z"),
    createdAt:new Date("2026-05-14T05:30:00.000Z"),
    updatedAt:new Date("2026-05-14T05:30:00.000Z"),
    views:220,
    content:`## Why brands need a new growth model

Most growing brands do not fail because they lack ideas. They fail because good ideas sit in a backlog for weeks. A reel campaign, a landing page refresh, a product shoot, a lead magnet, or a simple automation can create real momentum, but only if it ships.

Student-powered teams solve that gap. They give brands access to energetic, digitally native talent while giving students real work, real feedback, and real income.

## Where student talent works best

- Short-form content and social media execution
- Website updates, landing pages, and portfolio pages
- Graphic design, pitch decks, and campaign creatives
- Research, data cleanup, and lead list building
- AI-assisted workflows and automation setup

## How to make the model work

Start with a clear project brief. Define the outcome, examples, timeline, budget, brand assets, and acceptance criteria. Then select one student for ownership instead of approving many people for the same task.

NextGenGrowth helps brands post projects, review student profiles, create workspaces, collect submissions, and pay students after approval.

## Internal growth lesson

Do not treat student talent as cheap labor. Treat it as a flexible growth layer. When expectations are clear, students can help your brand test more ideas, create more assets, and learn what works faster.

## Next step

[Start a project on NextGenGrowth](/register) and turn one stalled growth idea into a shipped deliverable this week.`
  },
  {
    title:"Digital marketing checklist for brands before they hire creators",
    slug:"digital-marketing-checklist-before-hiring-creators",
    category:"marketing",
    tags:["digital marketing","creator marketing","content strategy","brand growth"],
    featuredImage:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    excerpt:"Before hiring creators or student talent, use this checklist to make your offer, audience, content angles, and success metrics clear.",
    seoTitle:"Digital Marketing Checklist Before Hiring Creators | NextGenGrowth",
    seoDescription:"Use this digital marketing checklist to prepare your brand before hiring creators, interns, freelancers, or student talent.",
    authorName:"NextGenGrowth Team",
    authorSlug:"nextgengrowth-team",
    status:"published",
    publishAt:new Date("2026-05-13T09:30:00.000Z"),
    createdAt:new Date("2026-05-13T09:30:00.000Z"),
    updatedAt:new Date("2026-05-13T09:30:00.000Z"),
    views:165,
    content:`## Why preparation matters

Hiring creators without a clear brief usually creates average content. A little strategy before the work starts makes every reel, post, ad, and landing page stronger.

## Your pre-hire checklist

- Define the customer you want to attract.
- Write the exact offer in one sentence.
- Collect brand assets, product photos, and examples.
- List three competitors or references.
- Decide the platform: Instagram, LinkedIn, website, email, or ads.
- Pick one success metric such as leads, clicks, saves, signups, or sales.

## What to include in a project brief

Add the goal, deliverables, deadline, budget, brand tone, examples you like, and examples you do not want. This helps students and creators make better decisions without asking for clarification every hour.

## Next step

Use [NextGenGrowth](/register) to post a clear marketing project and get applications from skilled students who can help you execute.`
  },
  {
    title:"10 AI tools Indian startups can use to save 20 hours a week",
    slug:"ai-tools-indian-startups-save-time",
    category:"ai-tools",
    tags:["AI tools","automation","startup growth","productivity"],
    featuredImage:"https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80",
    excerpt:"A founder-friendly breakdown of AI tools and workflows that reduce manual work across content, research, sales, and operations.",
    seoTitle:"10 AI Tools for Indian Startups to Save Time | NextGenGrowth",
    seoDescription:"Explore practical AI tools and workflows Indian startups can use for content, research, marketing, sales, and automation.",
    authorName:"NextGenGrowth Team",
    authorSlug:"nextgengrowth-team",
    status:"published",
    publishAt:new Date("2026-05-13T05:30:00.000Z"),
    createdAt:new Date("2026-05-13T05:30:00.000Z"),
    updatedAt:new Date("2026-05-13T05:30:00.000Z"),
    views:180,
    content:`## The real value of AI tools

AI does not replace growth strategy. It removes repeated work so founders and teams can spend more time on customers, offers, and execution.

## High-impact AI workflows

1. Turn customer calls into content ideas.
2. Convert blog posts into LinkedIn posts, reels scripts, and newsletters.
3. Summarize competitor pages and pricing.
4. Generate first-draft outreach messages.
5. Clean CRM notes and lead lists.
6. Create landing page copy variations.
7. Build FAQs from support conversations.
8. Draft project briefs for freelancers and student talent.
9. Make SOPs from screen recordings.
10. Analyze ad comments and customer objections.

## What to automate first

Start with tasks that repeat every week and already have a clear input and output. AI works best when the process is defined.

## Next step

If your brand needs execution support, [post a project](/register) and hire students who understand AI-assisted creative and growth work.`
  },
  {
    title:"A simple lead generation system for service businesses",
    slug:"simple-lead-generation-system-service-businesses",
    category:"lead-generation",
    tags:["lead generation","sales","service business","marketing"],
    featuredImage:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
    excerpt:"A clean lead generation system built around positioning, useful content, landing pages, and follow-up.",
    seoTitle:"Simple Lead Generation System for Service Businesses | NextGenGrowth",
    seoDescription:"Build a practical lead generation system with positioning, content, landing pages, and follow-up workflows.",
    authorName:"NextGenGrowth Team",
    authorSlug:"nextgengrowth-team",
    status:"published",
    publishAt:new Date("2026-05-12T05:30:00.000Z"),
    createdAt:new Date("2026-05-12T05:30:00.000Z"),
    updatedAt:new Date("2026-05-12T05:30:00.000Z"),
    views:145,
    content:`## Lead generation is a system, not a hack

Most service businesses chase random tactics. A stronger approach is to build one simple system that makes your offer easy to understand and easy to act on.

## The four-part system

- A clear niche and painful problem
- A landing page that explains the outcome
- Helpful content that earns trust
- Follow-up that moves interested people toward a call

## Content that attracts buyers

Write about the questions prospects already ask before buying. Turn those answers into blog posts, LinkedIn posts, short videos, and email sequences.

## Where NextGenGrowth fits

Brands can use NextGenGrowth to hire students for landing page design, content repurposing, lead research, and social media execution.

## Next step

[Book support through NextGenGrowth](/contact) or [start a project](/register) to build your first growth asset.`
  },
  {
    title:"Startup growth loops: how small teams compound attention",
    slug:"startup-growth-loops-small-teams-compound-attention",
    category:"startup-growth",
    tags:["startup growth","growth loops","content system","founders"],
    featuredImage:"https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
    excerpt:"A simple way for early-stage teams to turn every customer question, project, and launch into repeatable growth content.",
    seoTitle:"Startup Growth Loops for Small Teams | NextGenGrowth",
    seoDescription:"Learn how startups can build simple growth loops from customer questions, content, launches, and student-powered execution.",
    authorName:"NextGenGrowth Team",
    authorSlug:"nextgengrowth-team",
    status:"published",
    publishAt:new Date("2026-05-11T09:30:00.000Z"),
    createdAt:new Date("2026-05-11T09:30:00.000Z"),
    updatedAt:new Date("2026-05-11T09:30:00.000Z"),
    views:118,
    content:`## Growth loops beat random posting

A growth loop is a repeatable system where one action creates the next opportunity. For startups, this often starts with customer learning.

## A simple startup loop

1. Talk to customers.
2. Capture their questions and objections.
3. Turn those into articles, posts, reels, emails, and landing page sections.
4. Use that content to attract more prospects.
5. Learn from the new conversations and repeat.

## Why small teams should use student talent

Founders should not spend every week formatting posts, collecting research, or editing simple pages. With a clear brief, student talent can help convert raw founder knowledge into growth assets.

## Next step

[Post a growth project](/register) and turn one customer insight into a campaign this week.`
  },
  {
    title:"Automation ideas that save founders time without breaking trust",
    slug:"automation-ideas-save-founders-time-without-breaking-trust",
    category:"automation",
    tags:["automation","operations","AI workflows","productivity"],
    featuredImage:"https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
    excerpt:"Use automation where it improves speed, consistency, and follow-up, while keeping human judgment in the moments that matter.",
    seoTitle:"Automation Ideas That Save Founders Time | NextGenGrowth",
    seoDescription:"Practical automation ideas for founders across leads, follow-up, content, onboarding, reporting, and project delivery.",
    authorName:"NextGenGrowth Team",
    authorSlug:"nextgengrowth-team",
    status:"published",
    publishAt:new Date("2026-05-10T09:30:00.000Z"),
    createdAt:new Date("2026-05-10T09:30:00.000Z"),
    updatedAt:new Date("2026-05-10T09:30:00.000Z"),
    views:102,
    content:`## Automation should feel helpful, not cold

The best automation removes repeated work while keeping people in control. It should make your brand faster, clearer, and more reliable.

## Good places to automate

- Lead form notifications and follow-up reminders
- Meeting notes and action items
- Blog-to-social content repurposing
- Weekly performance reports
- Project brief templates
- Customer onboarding checklists

## What not to automate too early

Do not automate your positioning, customer empathy, or final quality review. Those still need human judgment.

## Next step

If you need help building simple workflows, [book a free growth call](/contact) or post an automation project on NextGenGrowth.`
  },
  {
    title:"Branding basics: how small businesses can look more trustworthy online",
    slug:"branding-basics-small-business-trust-online",
    category:"branding",
    tags:["branding","trust","website","small business"],
    featuredImage:"https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&q=80",
    excerpt:"Trust-building branding fundamentals for small teams that need better first impressions online.",
    seoTitle:"Branding Basics for Small Business Trust Online | NextGenGrowth",
    seoDescription:"Learn how small businesses can improve online trust with stronger visuals, messaging, social proof, and consistency.",
    authorName:"NextGenGrowth Team",
    authorSlug:"nextgengrowth-team",
    status:"published",
    publishAt:new Date("2026-05-11T05:30:00.000Z"),
    createdAt:new Date("2026-05-11T05:30:00.000Z"),
    updatedAt:new Date("2026-05-11T05:30:00.000Z"),
    views:130,
    content:`## Trust is built before the sales call

Your website, social profile, logo, content, and customer proof all shape whether someone believes your business can deliver.

## Fix these first

- A clear homepage headline
- Real examples of work
- Consistent colors and typography
- Testimonials or proof points
- A simple contact or booking path

## Do not overcomplicate the brand

Small businesses do not need a giant brand manual at the beginning. They need clarity, consistency, and visible proof.

## Next step

Use NextGenGrowth to hire students for brand refreshes, social media kits, landing pages, and content assets. [Create your brand account](/register).`
  }
];

function getBlogCategory(slug){
  return BLOG_CATEGORIES.find(c=>c.slug===slug)||null;
}

function normalizeBlogPost(post){
  const p=post?.toObject?post.toObject():post;
  const publishAt=p.publishAt||p.createdAt||new Date();
  const category=getBlogCategory(p.category)||{slug:p.category||"marketing",name:p.category||"Marketing",description:"Growth insights"};
  return{
    id:String(p._id||p.id||p.slug),
    title:p.title||"Untitled post",
    slug:p.slug||slugify(p.title),
    category:category.slug,
    categoryName:category.name,
    categoryDescription:category.description,
    tags:normalizeTags(p.tags),
    featuredImage:p.featuredImage||"",
    excerpt:p.excerpt||stripMarkdown(p.content).slice(0,160),
    content:p.content||"",
    seoTitle:p.seoTitle||`${p.title||"NextGenGrowth Blog"} | NextGenGrowth`,
    seoDescription:p.seoDescription||p.excerpt||stripMarkdown(p.content).slice(0,155),
    status:p.status||"published",
    authorName:p.authorName||"NextGenGrowth Team",
    authorSlug:p.authorSlug||slugify(p.authorName||"NextGenGrowth Team"),
    featured:!!p.featured,
    publishAt:new Date(publishAt),
    updatedAt:new Date(p.updatedAt||publishAt),
    views:Number(p.views||0),
    ctaClicks:Number(p.ctaClicks||0),
    shareClicks:Number(p.shareClicks||0),
    newsletterSignups:Number(p.newsletterSignups||0),
    readingTime:estimateReadingTime(p.content||p.excerpt||""),
  };
}

function filterDefaultPosts({category,tag,search,limit}={}){
  let posts=DEFAULT_BLOG_POSTS.map(normalizeBlogPost);
  if(category)posts=posts.filter(p=>p.category===category);
  if(tag)posts=posts.filter(p=>p.tags.map(t=>t.toLowerCase()).includes(String(tag).toLowerCase()));
  if(search){
    const q=String(search).toLowerCase();
    posts=posts.filter(p=>[p.title,p.excerpt,p.content,p.categoryName,p.tags.join(" ")].join(" ").toLowerCase().includes(q));
  }
  posts.sort((a,b)=>(b.featured-a.featured)||b.publishAt-a.publishAt);
  return limit?posts.slice(0,limit):posts;
}

async function getPublishedBlogPosts({category,tag,search,limit=50}={}){
  if(!dbReady())return filterDefaultPosts({category,tag,search,limit});
  try{
    const now=new Date();
    const query={status:"published",$or:[{publishAt:{$exists:false}},{publishAt:null},{publishAt:{$lte:now}}]};
    if(category)query.category=category;
    if(tag)query.tags={$in:[tag]};
    if(search)query.$text={$search:search};
    const posts=await BlogPost.find(query).sort({featured:-1,publishAt:-1,createdAt:-1}).limit(Number(limit)||50).lean();
    if(posts.length)return posts.map(normalizeBlogPost);
    return filterDefaultPosts({category,tag,search,limit});
  }catch(err){
    console.error("Blog list error:",err.message);
    return filterDefaultPosts({category,tag,search,limit});
  }
}

async function getBlogPostBySlug(slug){
  const normalized=slugify(slug);
  if(dbReady()){
    try{
      const now=new Date();
      const post=await BlogPost.findOne({slug:normalized,status:"published",$or:[{publishAt:{$exists:false}},{publishAt:null},{publishAt:{$lte:now}}]}).lean();
      if(post)return normalizeBlogPost(post);
    }catch(err){
      console.error("Blog post error:",err.message);
    }
  }
  return filterDefaultPosts().find(p=>p.slug===normalized)||null;
}

function inlineMarkdown(text){
  let out=escapeHtml(text);
  out=out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g,(m,label,url)=>`<a href="${escapeAttr(url)}">${label}</a>`);
  out=out.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  out=out.replace(/\*([^*]+)\*/g,"<em>$1</em>");
  out=out.replace(/`([^`]+)`/g,"<code>$1</code>");
  return out;
}

function renderMarkdown(markdown){
  const lines=String(markdown||"").replace(/\r\n/g,"\n").split("\n");
  const html=[];
  const toc=[];
  let i=0;
  let usedIds={};
  const uniqueId=(base)=>{
    const root=slugify(base);
    usedIds[root]=(usedIds[root]||0)+1;
    return usedIds[root]===1?root:`${root}-${usedIds[root]}`;
  };
  while(i<lines.length){
    const line=lines[i].trim();
    if(!line){i++;continue;}
    const heading=line.match(/^(#{2,3})\s+(.+)$/);
    if(heading){
      const level=heading[1].length;
      const text=heading[2].trim();
      const id=uniqueId(text);
      toc.push({level,text,id});
      html.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`);
      i++;
      continue;
    }
    if(/^[-*]\s+/.test(line)){
      const items=[];
      while(i<lines.length&&/^[-*]\s+/.test(lines[i].trim())){
        items.push(`<li>${inlineMarkdown(lines[i].trim().replace(/^[-*]\s+/,""))}</li>`);
        i++;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    if(/^\d+\.\s+/.test(line)){
      const items=[];
      while(i<lines.length&&/^\d+\.\s+/.test(lines[i].trim())){
        items.push(`<li>${inlineMarkdown(lines[i].trim().replace(/^\d+\.\s+/,""))}</li>`);
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    if(/^>\s+/.test(line)){
      const quote=[];
      while(i<lines.length&&/^>\s+/.test(lines[i].trim())){
        quote.push(inlineMarkdown(lines[i].trim().replace(/^>\s+/,"")));
        i++;
      }
      html.push(`<blockquote>${quote.join("<br>")}</blockquote>`);
      continue;
    }
    const para=[line];
    i++;
    while(i<lines.length&&lines[i].trim()&&!/^(#{2,3})\s+/.test(lines[i].trim())&&!/^[-*]\s+/.test(lines[i].trim())&&!/^\d+\.\s+/.test(lines[i].trim())){
      para.push(lines[i].trim());
      i++;
    }
    html.push(`<p>${inlineMarkdown(para.join(" "))}</p>`);
  }
  return{html:html.join("\n"),toc};
}

function blogImageMarkup(post,classes=""){
  if(post.featuredImage){
    return `<img class="${classes}" src="${escapeAttr(post.featuredImage)}" alt="${escapeAttr(post.title)}" loading="lazy" decoding="async">`;
  }
  return `<div class="blog-art ${classes}"><span>${escapeHtml(post.categoryName)}</span></div>`;
}

function getBaseUrl(){
  return String(BASE_URL||"https://nextgengrowth.in").replace(/\/$/,"");
}

function blogMetaTags({title,description,url,image,type="website",publishedAt,updatedAt}){
  const safeTitle=escapeAttr(title);
  const safeDescription=escapeAttr(description);
  const safeUrl=escapeAttr(url);
  const safeImage=escapeAttr(image||`${getBaseUrl()}/favicon.ico`);
  return`
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    <link rel="canonical" href="${safeUrl}">
    <meta property="og:type" content="${type}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${safeUrl}">
    <meta property="og:image" content="${safeImage}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${safeImage}">
    ${publishedAt?`<meta property="article:published_time" content="${new Date(publishedAt).toISOString()}">`:""}
    ${updatedAt?`<meta property="article:modified_time" content="${new Date(updatedAt).toISOString()}">`:""}`;
}

function blogLayout({meta,body,schema=""}){
  return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${meta}
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/blog.css">
${schema?`<script type="application/ld+json">${schema}</script>`:""}
</head>
<body>
${body}
</body>
</html>`;
}

function renderPostCard(post,{large=false}={}){
  return`<article class="post-card ${large?"post-card-large":""}">
    <a class="post-image" href="/blog/${escapeAttr(post.slug)}">${blogImageMarkup(post)}</a>
    <div class="post-card-body">
      <div class="post-meta"><a href="/blog/${escapeAttr(post.category)}">${escapeHtml(post.categoryName)}</a><span>${post.readingTime} min read</span></div>
      <h3><a href="/blog/${escapeAttr(post.slug)}">${escapeHtml(post.title)}</a></h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <div class="post-foot"><span>${new Date(post.publishAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span><a href="/blog/${escapeAttr(post.slug)}">Read article</a></div>
    </div>
  </article>`;
}

function renderBlogHome({posts,allPosts,category,search}){
  const categoryData=category?getBlogCategory(category):null;
  const featured=posts.find(p=>p.featured)||posts[0]||filterDefaultPosts({limit:1})[0];
  const latest=posts.filter(p=>p.slug!==featured.slug).slice(0,9);
  const popular=[...(allPosts?.length?allPosts:posts)].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,5);
  const tags=[...new Set((allPosts||posts).flatMap(p=>p.tags))].slice(0,16);
  const pageTitle=search?`Search results for "${search}"`:categoryData?`${categoryData.name} insights`:"NextGenGrowth Blog";
  const pageDescription=search?`Articles matching ${search} from NextGenGrowth.`:categoryData?categoryData.description:"Growth strategy, digital marketing, AI tools, automation, lead generation, branding, and startup growth insights.";
  const canonical=categoryData?`${getBaseUrl()}/blog/${categoryData.slug}`:search?`${getBaseUrl()}/blog/search?q=${encodeURIComponent(search)}`:`${getBaseUrl()}/blog`;
  const meta=blogMetaTags({
    title:`${pageTitle} | NextGenGrowth`,
    description:pageDescription,
    url:canonical,
    image:featured.featuredImage,
  });
  const schema=JSON.stringify({
    "@context":"https://schema.org",
    "@type":"Blog",
    name:"NextGenGrowth Blog",
    url:`${getBaseUrl()}/blog`,
    description:pageDescription,
    publisher:{"@type":"Organization",name:"NextGenGrowth",url:getBaseUrl()},
  });
  const body=`<div class="site-shell">
    <header class="blog-nav">
      <a href="/" class="blog-brand"><span>N</span>NextGenGrowth</a>
      <nav>
        <a href="/blog">Blog</a>
        <a href="/#services">Services</a>
        <a href="/contact">Contact</a>
        <a class="nav-cta" href="/register">Start Growing</a>
      </nav>
    </header>

    <main>
      <section class="blog-hero">
        <div class="eyebrow">Growth Library</div>
        <h1>${escapeHtml(pageTitle)}</h1>
        <p>${escapeHtml(pageDescription)}</p>
        <form class="blog-search" action="/blog/search" method="get" onsubmit="trackBlogEvent('search','blog-home',{query:this.q.value})">
          <input name="q" value="${escapeAttr(search||"")}" placeholder="Search marketing, AI tools, branding, lead generation..." aria-label="Search blog">
          <button type="submit">Search</button>
        </form>
        <div class="category-row">
          ${BLOG_CATEGORIES.map(c=>`<a class="${category===c.slug?"active":""}" href="/blog/${escapeAttr(c.slug)}">${escapeHtml(c.name)}</a>`).join("")}
        </div>
      </section>

      <section class="featured-section">
        <div class="section-label">Featured article</div>
        ${renderPostCard(featured,{large:true})}
      </section>

      <section class="content-grid">
        <div>
          <div class="section-headline"><h2>${search?"Matching articles":categoryData?`Latest in ${categoryData.name}`:"Latest posts"}</h2><span>${posts.length} articles</span></div>
          <div class="posts-grid">
            ${(latest.length?latest:posts.filter(p=>p.slug!==featured.slug)).map(p=>renderPostCard(p)).join("")||`<div class="empty-blog">No articles found. Try another search or explore all categories.</div>`}
          </div>
        </div>
        <aside class="blog-sidebar">
          <div class="side-card">
            <h3>Popular reads</h3>
            ${popular.map((p,i)=>`<a class="popular-link" href="/blog/${escapeAttr(p.slug)}"><span>${String(i+1).padStart(2,"0")}</span>${escapeHtml(p.title)}</a>`).join("")}
          </div>
          <div class="side-card">
            <h3>Topics</h3>
            <div class="tag-cloud">${tags.map(t=>`<a href="/blog/search?q=${encodeURIComponent(t)}">${escapeHtml(t)}</a>`).join("")}</div>
          </div>
          <div class="side-card side-cta">
            <h3>Need growth execution?</h3>
            <p>Post a project and hire skilled student talent for content, websites, AI workflows, and lead generation.</p>
            <a href="/register">Start Growing with NextGenGrowth</a>
          </div>
        </aside>
      </section>

      <section class="newsletter-band">
        <div>
          <span class="eyebrow">Newsletter</span>
          <h2>Get practical growth playbooks in your inbox.</h2>
          <p>No noise. Just marketing, AI, automation, and platform growth ideas you can actually use.</p>
        </div>
        <form class="newsletter-form" onsubmit="subscribeNewsletter(event,'blog-home')">
          <input name="email" type="email" placeholder="you@company.com" required>
          <button type="submit">Subscribe</button>
          <small>By subscribing, you agree to receive NextGenGrowth updates.</small>
        </form>
      </section>

      <section class="bottom-cta">
        <h2>Turn reading into execution.</h2>
        <p>Use NextGenGrowth to find students who can help you build growth assets faster.</p>
        <div>
          <a href="/register">Start Growing with NextGenGrowth</a>
          <a href="/contact">Book a Free Growth Call</a>
        </div>
      </section>
    </main>
    ${renderBlogFooter()}
  </div>
  ${blogClientScript()}`;
  return blogLayout({meta,body,schema});
}

function renderBlogPost(post,related=[]){
  const rendered=renderMarkdown(post.content);
  const canonical=`${getBaseUrl()}/blog/${post.slug}`;
  const meta=blogMetaTags({
    title:post.seoTitle,
    description:post.seoDescription,
    url:canonical,
    image:post.featuredImage,
    type:"article",
    publishedAt:post.publishAt,
    updatedAt:post.updatedAt,
  });
  const schema=JSON.stringify({
    "@context":"https://schema.org",
    "@type":"BlogPosting",
    headline:post.title,
    description:post.seoDescription,
    image:post.featuredImage?[post.featuredImage]:undefined,
    datePublished:new Date(post.publishAt).toISOString(),
    dateModified:new Date(post.updatedAt).toISOString(),
    author:{"@type":"Person",name:post.authorName,url:`${getBaseUrl()}/blog/author/${post.authorSlug}`},
    publisher:{"@type":"Organization",name:"NextGenGrowth",url:getBaseUrl()},
    mainEntityOfPage:canonical,
  });
  const toc=rendered.toc.length?`<nav class="toc-card"><strong>Table of contents</strong>${rendered.toc.map(h=>`<a class="toc-l${h.level}" href="#${escapeAttr(h.id)}">${escapeHtml(h.text)}</a>`).join("")}</nav>`:"";
  const body=`<div class="site-shell post-shell">
    <header class="blog-nav">
      <a href="/" class="blog-brand"><span>N</span>NextGenGrowth</a>
      <nav>
        <a href="/blog">Blog</a>
        <a href="/#services">Services</a>
        <a href="/contact">Contact</a>
        <a class="nav-cta" href="/register">Start Growing</a>
      </nav>
    </header>

    <main>
      <article class="article-wrap" data-slug="${escapeAttr(post.slug)}">
        <header class="article-hero">
          <div class="post-meta"><a href="/blog/${escapeAttr(post.category)}">${escapeHtml(post.categoryName)}</a><span>${post.readingTime} min read</span></div>
          <h1>${escapeHtml(post.title)}</h1>
          <p>${escapeHtml(post.excerpt)}</p>
          <div class="article-byline">
            <span>By <a href="/blog/author/${escapeAttr(post.authorSlug)}">${escapeHtml(post.authorName)}</a></span>
            <span>${new Date(post.publishAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</span>
          </div>
          <div class="share-row">
            <button onclick="sharePost('linkedin','${escapeAttr(post.slug)}')">LinkedIn</button>
            <button onclick="sharePost('twitter','${escapeAttr(post.slug)}')">X/Twitter</button>
            <button onclick="sharePost('facebook','${escapeAttr(post.slug)}')">Facebook</button>
            <button onclick="sharePost('whatsapp','${escapeAttr(post.slug)}')">WhatsApp</button>
          </div>
          <div class="article-image">${blogImageMarkup(post)}</div>
        </header>

        <div class="article-grid">
          <aside>${toc}<div class="toc-card growth-card"><strong>Grow faster</strong><p>Hire student talent for marketing, websites, content, and AI workflows.</p><a href="/register" onclick="trackBlogEvent('cta_click','${escapeAttr(post.slug)}',{placement:'toc'})">Start Growing</a></div></aside>
          <div class="article-content">
            <div class="inline-cta">
              <strong>Need help executing this?</strong>
              <p>Post a project on NextGenGrowth and get student talent for marketing, branding, websites, and automation.</p>
              <a href="/register" onclick="trackBlogEvent('cta_click','${escapeAttr(post.slug)}',{placement:'inline-top'})">Start Growing with NextGenGrowth</a>
            </div>
            ${rendered.html}
            <div class="feedback-box">
              <h3>Was this useful?</h3>
              <p>Your feedback helps us write better growth playbooks.</p>
              <button onclick="sendFeedback('${escapeAttr(post.slug)}','yes')">Yes</button>
              <button onclick="sendFeedback('${escapeAttr(post.slug)}','no')">Not yet</button>
            </div>
          </div>
        </div>
      </article>

      <section class="related-section">
        <div class="section-headline"><h2>Related articles</h2><a href="/blog/${escapeAttr(post.category)}">More in ${escapeHtml(post.categoryName)}</a></div>
        <div class="posts-grid related-grid">${related.map(p=>renderPostCard(p)).join("")}</div>
      </section>

      <section class="newsletter-band">
        <div>
          <span class="eyebrow">Keep learning</span>
          <h2>Get the next growth playbook.</h2>
          <p>Marketing, AI tools, automation, branding, and lead generation ideas for serious builders.</p>
        </div>
        <form class="newsletter-form" onsubmit="subscribeNewsletter(event,'blog-post:${escapeAttr(post.slug)}')">
          <input name="email" type="email" placeholder="you@company.com" required>
          <button type="submit">Subscribe</button>
          <small>No spam. Only practical growth notes.</small>
        </form>
      </section>

      <section class="bottom-cta">
        <h2>Ready to turn strategy into shipped work?</h2>
        <p>Build your next landing page, content system, AI workflow, or lead generation campaign with NextGenGrowth.</p>
        <div>
          <a href="/register" onclick="trackBlogEvent('cta_click','${escapeAttr(post.slug)}',{placement:'end'})">Start Growing with NextGenGrowth</a>
          <a href="/contact">Book a Free Growth Call</a>
        </div>
      </section>
    </main>
    ${renderBlogFooter()}
    <div class="lead-capture" id="leadCapture">
      <button onclick="dismissLeadCapture()" aria-label="Close">x</button>
      <strong>Want this turned into action?</strong>
      <p>Get student talent for growth projects.</p>
      <a href="/register" onclick="trackBlogEvent('cta_click','${escapeAttr(post.slug)}',{placement:'scroll-popup'})">Start Growing</a>
    </div>
  </div>
  ${blogClientScript(post.slug)}`;
  return blogLayout({meta,body,schema});
}

function renderAuthorPage(authorSlug,posts){
  const authorName=posts[0]?.authorName||"NextGenGrowth Team";
  return renderBlogHome({
    posts,
    allPosts:posts,
    search:`Author: ${authorName}`,
  });
}

function renderBlogFooter(){
  return`<footer class="blog-footer">
    <div><strong>NextGenGrowth</strong><p>Student-powered growth execution for modern brands.</p></div>
    <nav>
      <a href="/blog">Blog</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/refund-policy">Refunds</a>
      <a href="/contact">Contact</a>
    </nav>
  </footer>`;
}

function blogClientScript(slug=""){
  return`<script>
async function trackBlogEvent(event,slug,metadata){
  try{await fetch('/api/blog/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,slug,metadata})});}catch(e){}
}
async function subscribeNewsletter(event,source){
  event.preventDefault();
  const form=event.currentTarget;
  const email=form.email.value.trim();
  if(!email)return;
  const btn=form.querySelector('button');
  const old=btn.textContent;
  btn.textContent='Subscribing...';
  btn.disabled=true;
  try{
    const res=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,source})});
    const data=await res.json();
    form.querySelector('small').textContent=data.message||'Subscribed successfully.';
    form.reset();
  }catch(e){form.querySelector('small').textContent='Could not subscribe. Please try again.';}
  btn.textContent=old;
  btn.disabled=false;
}
function sharePost(channel,slug){
  const url=encodeURIComponent(location.href);
  const title=encodeURIComponent(document.title);
  const links={
    linkedin:'https://www.linkedin.com/sharing/share-offsite/?url='+url,
    twitter:'https://twitter.com/intent/tweet?url='+url+'&text='+title,
    facebook:'https://www.facebook.com/sharer/sharer.php?u='+url,
    whatsapp:'https://api.whatsapp.com/send?text='+title+'%20'+url
  };
  trackBlogEvent('share',slug,{channel});
  window.open(links[channel],'_blank','noopener,noreferrer,width=760,height=560');
}
function sendFeedback(slug,value){
  trackBlogEvent('feedback',slug,{value});
  alert('Thanks for the feedback.');
}
function dismissLeadCapture(){const el=document.getElementById('leadCapture');if(el)el.classList.remove('show');sessionStorage.setItem('ngg_blog_lead_dismissed','1');}
${slug?`trackBlogEvent('view','${escapeAttr(slug)}',{path:location.pathname});
let shown=false;
window.addEventListener('scroll',()=>{
  if(shown||sessionStorage.getItem('ngg_blog_lead_dismissed'))return;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  if(max>0&&window.scrollY/max>.36){
    shown=true;
    const el=document.getElementById('leadCapture');
    if(el)el.classList.add('show');
  }
});`:""}
</script>`;
}

// ═══════════════════════════════════════════
// EMAIL
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// EMAIL (RESEND API)
// ═══════════════════════════════════════════
const { Resend } = require("resend");
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendEmail(to, subject, html) {
  try {
    if(!resend){
      console.warn(`⚠️ Email skipped for ${to}: RESEND_API_KEY is not configured.`);
      return;
    }
    const { data, error } = await resend.emails.send({
      // DHYAN DE: Jab tak Resend me domain verify nahi hota, 
      // yahan 'onboarding@resend.dev' hi rahega aur OTP sirf tere account wale email par hi jayega.
     from: 'NextGenGrowth <team@nextgengrowth.in>', // 'team' ki jagah 'support' ya 'hello' bhi likh sakte ho 
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("❌ Resend API error:", error);
      throw new Error(error.message);
    }
    
    console.log(`📧 Email sent via Resend to: ${to}`);
  } catch (err) {
    console.error("❌ Email error:", err.message);
    throw err;
  }
}

// ═══════════════════════════════════════════
// BRAND VERIFICATION EMAILS (NEW)
// ═══════════════════════════════════════════
const brandPendingEmail = (name) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2>Action Required: Your Brand Verification is Under Review</h2>
    <p>Dear ${name},</p>
    <p>Thank you for registering with <b>NextGenGrowth</b>. We manually verify every brand profile to maintain the quality of our marketplace.</p>
    <p>Our team is currently reviewing your application and links. This usually takes <b>24-48 hours</b>.</p>
    <p>You will receive a confirmation email once your account is activated. Until then, project posting will be restricted.</p>
    <p>Best Regards,<br>The NextGenGrowth Team</p>
  </div>
`;

const brandApprovedEmail = (name) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #0a7c44;">Welcome Aboard! Your Brand Account is Approved 🎉</h2>
    <p>Dear ${name},</p>
    <p>Great news! Your account on <b>NextGenGrowth</b> has been successfully verified.</p>
    <p>You now have full access to your Dashboard. You can start posting projects and hiring the best creative talent immediately.</p>
    <p>Cheers,<br>NextGenGrowth Administration</p>
  </div>
`;

// OTP Email template
function otpEmailTemplate(name,otp){
  return`<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f7fdf9;padding:20px">
  <div style="background:linear-gradient(135deg,#0a7c44,#064e2b);border-radius:16px;padding:28px;text-align:center;margin-bottom:20px">
    <h2 style="color:white;margin:0">NextGenGrowth</h2>
    <p style="color:rgba(255,255,255,.8);margin:6px 0 0">Email Verification</p>
  </div>
  <div style="background:white;border-radius:16px;padding:28px;border:1px solid #d1ead9">
    <h3 style="color:#0a1f12;margin-top:0">Hi ${name}! 👋</h3>
    <p style="color:#2d5a3d">Your verification code is:</p>
    <div style="background:#e8fdf2;border:2px solid #00c96b;border-radius:14px;padding:22px;text-align:center;margin:20px 0">
      <span style="font-size:2.5rem;font-weight:900;letter-spacing:12px;color:#064e2b;font-family:monospace">${otp}</span>
    </div>
    <p style="color:#6b8f77;font-size:.85rem">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <p style="color:#6b8f77;font-size:.85rem">If you didn't request this, ignore this email.</p>
  </div>
  <p style="text-align:center;color:#6b8f77;font-size:13px;margin-top:16px">NextGenGrowth — Student Opportunity Platform</p>
</div>`;
}

function welcomeEmail(name,role){
  return`<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f7fdf9;padding:20px">
  <div style="background:linear-gradient(135deg,#0a7c44,#064e2b);border-radius:16px;padding:28px;text-align:center;margin-bottom:20px">
    <h1 style="color:white;margin:0;font-size:24px">🎉 Welcome!</h1>
    <p style="color:rgba(255,255,255,.8);margin:6px 0 0">NextGenGrowth</p>
  </div>
  <div style="background:white;border-radius:16px;padding:28px;border:1px solid #d1ead9">
    <h2 style="color:#0a1f12;margin-top:0">Hi ${name}! 👋</h2>
    <p style="color:#2d5a3d;font-size:16px">Welcome to <strong>NextGenGrowth</strong> — India's Student Opportunity Platform!</p>
    ${role==="student"?`
    <div style="background:#e8fdf2;border:1px solid #d1ead9;border-radius:12px;padding:16px;margin:20px 0">
      <p style="margin:0;color:#064e2b;font-weight:bold">🚀 Your Next Steps:</p>
      <p style="margin:8px 0;color:#2d5a3d">1. Add your skills in Profile</p>
      <p style="margin:8px 0;color:#2d5a3d">2. Browse matched projects</p>
      <p style="margin:8px 0 0;color:#2d5a3d">3. Apply and start earning! 💰</p>
    </div>
    <a href="${BASE_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0a7c44,#064e2b);color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold">Go to Dashboard →</a>
    `:`
    <div style="background:#e8fdf2;border:1px solid #d1ead9;border-radius:12px;padding:16px;margin:20px 0">
      <p style="margin:0;color:#064e2b;font-weight:bold">🚀 Your Next Steps:</p>
      <p style="margin:8px 0;color:#2d5a3d">1. Post your first project</p>
      <p style="margin:8px 0;color:#2d5a3d">2. Review student applications</p>
      <p style="margin:8px 0 0;color:#2d5a3d">3. Get quality work done! ✅</p>
    </div>
    <a href="${BASE_URL}/brand-dashboard" style="display:inline-block;background:linear-gradient(135deg,#0a7c44,#064e2b);color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold">Go to Dashboard →</a>
    `}
  </div>
</div>`;
}

function acceptedEmail(studentName,jobTitle,brandName){
  return`<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f7fdf9;padding:20px">
  <div style="background:linear-gradient(135deg,#0a7c44,#064e2b);border-radius:16px;padding:28px;text-align:center;margin-bottom:20px">
    <h1 style="color:white;margin:0">🎉 Congratulations!</h1>
  </div>
  <div style="background:white;border-radius:16px;padding:28px;border:1px solid #d1ead9">
    <h2 style="color:#0a1f12;margin-top:0">Hi ${studentName}!</h2>
    <p style="color:#2d5a3d;font-size:16px">Your application has been <strong style="color:#00c96b">ACCEPTED</strong>!</p>
    <div style="background:#e8fdf2;border:1px solid #d1ead9;border-radius:12px;padding:16px;margin:20px 0">
      <p style="margin:0;color:#064e2b"><strong>📋 Project:</strong> ${jobTitle}</p>
      <p style="margin:8px 0 0;color:#064e2b"><strong>🏢 Brand:</strong> ${brandName}</p>
    </div>
    <a href="${BASE_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0a7c44,#064e2b);color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold">View Dashboard →</a>
  </div>
</div>`;
}

function rejectedEmail(studentName,jobTitle){
  return`<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px">
  <div style="background:linear-gradient(135deg,#0a7c44,#064e2b);border-radius:16px;padding:28px;text-align:center;margin-bottom:20px">
    <h2 style="color:white;margin:0">NextGenGrowth</h2>
  </div>
  <div style="background:white;border-radius:16px;padding:28px;border:1px solid #d1ead9">
    <h2 style="color:#0a1f12;margin-top:0">Hi ${studentName},</h2>
    <p style="color:#2d5a3d">Unfortunately your application for <strong>${jobTitle}</strong> was not selected. Keep applying — more opportunities await!</p>
    <a href="${BASE_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0a7c44,#064e2b);color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold">Browse More Projects →</a>
  </div>
</div>`;
}

// ═══════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════
app.use(cors());
app.use(bodyParser.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"public")));
app.set("trust proxy",1);
app.use(session({secret:JWT_SECRET,resave:false,saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(async(req,res,next)=>{
  if(!req.path.startsWith("/api/")||req.path.startsWith("/api/admin")||req.path==="/api/health")return next();
  try{
    const settings=await getPlatformSettings();
    if(settings.features.maintenanceMode){
      return res.status(503).json({success:false,message:"Platform is in maintenance mode. Please try again later."});
    }
  }catch(err){
    console.error("Maintenance guard error:",err.message);
  }
  next();
});

const authLimiter=rateLimit({windowMs:15*60*1000,max:20,message:{success:false,message:"Too many attempts."}});

function generateToken(user){
  return jwt.sign({id:user._id,email:user.email,role:user.role,name:`${user.firstName} ${user.lastName}`},JWT_SECRET,{expiresIn:"7d"});
}
function normalizeRole(role){
  return role==="brand"?"brand":"student";
}
function verifyToken(req,res,next){
  const token=(req.headers["authorization"]||"").split(" ")[1];
  if(!token)return res.status(401).json({success:false,message:"No token."});
  try{req.user=jwt.verify(token,JWT_SECRET);next();}
  catch{res.status(403).json({success:false,message:"Invalid token."});}
}
function safeUser(user){
  const u=user.toObject?user.toObject():user;
  delete u.password;
  if(u.payoutKyc){
    u.payoutKyc=safePayoutKyc(u.payoutKyc);
  }
  u.name=`${u.firstName} ${u.lastName}`;return u;
}
function generateOTP(){
  return Math.floor(100000+Math.random()*900000).toString();
}

function encryptSensitive(value){
  const text=String(value||"").trim();
  if(!text)return "";
  const key=crypto.createHash("sha256").update(cleanEnv("KYC_ENCRYPTION_KEY")||JWT_SECRET).digest();
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv("aes-256-gcm",key,iv);
  const encrypted=Buffer.concat([cipher.update(text,"utf8"),cipher.final()]);
  const tag=cipher.getAuthTag();
  return [iv.toString("base64"),tag.toString("base64"),encrypted.toString("base64")].join(".");
}

function decryptSensitive(value){
  try{
    const [ivRaw,tagRaw,dataRaw]=String(value||"").split(".");
    if(!ivRaw||!tagRaw||!dataRaw)return "";
    const key=crypto.createHash("sha256").update(cleanEnv("KYC_ENCRYPTION_KEY")||JWT_SECRET).digest();
    const decipher=crypto.createDecipheriv("aes-256-gcm",key,Buffer.from(ivRaw,"base64"));
    decipher.setAuthTag(Buffer.from(tagRaw,"base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataRaw,"base64")),decipher.final()]).toString("utf8");
  }catch{
    return "";
  }
}

function maskAccountNumber(last4){
  return last4?`••••${last4}`:"";
}

function safePayoutKyc(kyc={}){
  const plain=kyc.toObject?kyc.toObject():kyc;
  return{
    legalName:plain.legalName||"",
    preferredPayout:plain.preferredPayout||"bank",
    upiId:plain.upiId||"",
    bankAccountHolder:plain.bankAccountHolder||"",
    bankName:plain.bankName||"",
    bankAccountMasked:maskAccountNumber(plain.bankAccountLast4),
    ifsc:plain.ifsc||"",
    status:plain.status||"not_submitted",
    rejectionReason:plain.rejectionReason||"",
    submittedAt:plain.submittedAt||null,
    verifiedAt:plain.verifiedAt||null,
  };
}

function sanitizeText(value,max=120){
  return String(value||"").trim().slice(0,max);
}

// ═══════════════════════════════════════════
// GOOGLE OAUTH
// ═══════════════════════════════════════════
if(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET){
  passport.use(new GoogleStrategy({
    clientID:GOOGLE_CLIENT_ID,
    clientSecret:GOOGLE_CLIENT_SECRET,
    callbackURL:GOOGLE_CALLBACK_URL,
  },async(accessToken,refreshToken,profile,done)=>{
    try{
      let user=await User.findOne({$or:[{googleId:profile.id},{email:profile.emails[0].value.toLowerCase()}]});
      if(!user){
        // New user via Google — need to choose role
        // Store in session temporarily
        return done(null,{googleProfile:profile,isNew:true});
      }
      // Update googleId if missing
      if(!user.googleId){user.googleId=profile.id;await user.save();}
      user.isVerified=true;await user.save();
      return done(null,user);
    }catch(err){return done(err,null);}
  }));

  passport.serializeUser((user,done)=>done(null,user._id||user.googleProfile?.id));
  passport.deserializeUser(async(id,done)=>{
    try{const user=await User.findById(id);done(null,user);}
    catch{done(null,null);}
  });

  // Google auth routes
  app.get("/auth/google",(req,res,next)=>{
    const role=normalizeRole(req.query.role);
    req.session.googleRole=role;
    req.session.save((err)=>{
      if(err)return next(err);
      passport.authenticate("google",{scope:["profile","email"],state:role})(req,res,next);
    });
  });

  app.get("/auth/google/callback",
    passport.authenticate("google",{failureRedirect:"/login?error=google_failed"}),
    async(req,res)=>{
      try{
        const u=req.user;
        const requestedRoleRaw=req.query.state||req.session.googleRole;
        const requestedRole=["student","brand"].includes(requestedRoleRaw)?requestedRoleRaw:"";
        if(u.isNew||u.googleProfile){
          // New user — redirect to complete profile
          const role=normalizeRole(requestedRoleRaw);
          const settings=await getPlatformSettings();
          const allowedKey=role==="brand"?"brandRegistrations":"studentRegistrations";
          if(settings.features.maintenanceMode||settings.features[allowedKey]===false){
            return res.redirect(`/login?error=registration_closed&selected=${encodeURIComponent(role)}`);
          }
          const profile=u.googleProfile;
          
          // ✅ FIXED: Better name extraction so it doesn't fail if Google gives empty names
          const fName = profile.name?.givenName || profile.displayName?.split(" ")[0] || "User";
          const lName = profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "";

          const newUser=await User.create({
            firstName: fName,
            lastName: lName,
            email:profile.emails[0].value.toLowerCase(),
            password:"",role,
            googleId:profile.id,
            avatar:profile.photos?.[0]?.value||"",
            isVerified:true,
          });
          const token=generateToken(newUser);
          
          // ✅ BRAND PENDING MAIL CHECK HERE
          if (role === 'brand') {
            sendConfiguredEmail("welcome",newUser.email, "Action Required: Your Brand Verification is Under Review — NextGenGrowth", brandPendingEmail(newUser.firstName))
              .catch(err=>console.error("Brand pending email error:",err.message));
          } else {
            sendConfiguredEmail("welcome",newUser.email, `Welcome to NextGenGrowth! 🎉`, welcomeEmail(newUser.firstName, role))
              .catch(err=>console.error("Welcome email error:",err.message));
          }
          notifyAdminSignup(newUser);

          return res.redirect(`/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(safeUser(newUser)))}`);
        }
        if(requestedRole&&u.role!==requestedRole){
          return res.redirect(`/login?error=role_mismatch&selected=${encodeURIComponent(requestedRole)}&actual=${encodeURIComponent(u.role)}`);
        }
        const token=generateToken(u);
        res.redirect(`/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(safeUser(u)))}`);
      }catch(err){
        console.error("Google callback error:",err);
        res.redirect("/login?error=google_failed");
      }
    }
  );
  console.log("✅ Google OAuth configured!");
}else{
  console.log("⚠️ Google OAuth not configured — add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
}

// Auth success page
app.get("/auth/success",(req,res)=>{
  res.send(`<!DOCTYPE html><html><head><title>Logging in...</title></head><body>
  <script>
    const p=new URLSearchParams(location.search);
    const token=p.get('token');
    const user=JSON.parse(decodeURIComponent(p.get('user')));
    if(token&&user){
      localStorage.setItem('ngg_token',token);
      localStorage.setItem('ngg_user',JSON.stringify(user));
      window.location.href=user.role==='brand'?'/brand-dashboard':'/dashboard';
    }else{window.location.href='/login';}
  </script>
  <p style="font-family:sans-serif;text-align:center;margin-top:40px">Logging you in...</p>
  </body></html>`);
});

// ═══════════════════════════════════════════
// OTP ROUTES
// ═══════════════════════════════════════════

// Send OTP
app.post("/api/send-otp",authLimiter,async(req,res)=>{
  try{
    const{email,name,role}=req.body;
    const normalizedRole=normalizeRole(role);
    const settings=await getPlatformSettings();
    const allowedKey=normalizedRole==="brand"?"brandRegistrations":"studentRegistrations";
    if(settings.features.maintenanceMode||settings.features[allowedKey]===false){
      return res.status(403).json({success:false,message:`${normalizedRole==="brand"?"Brand":"Student"} registrations are currently closed.`});
    }
    if(!email)return res.status(400).json({success:false,message:"Email required."});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({success:false,message:"Invalid email format."});
    // Check if email already registered
    const existing=await User.findOne({email:email.toLowerCase()});
    if(existing)return res.status(409).json({success:false,message:"Email already registered. Please login."});
    // Delete old OTPs for this email
    await OTP.deleteMany({email:email.toLowerCase()});
    // Generate new OTP
    const otp=generateOTP();
    const expiresAt=new Date(Date.now()+10*60*1000); // 10 min
    await OTP.create({email:email.toLowerCase(),otp,expiresAt});
    // Send email
    await sendEmail(email,`${otp} — Your NextGenGrowth Verification Code`,otpEmailTemplate(name||"User",otp));
    console.log(`📧 OTP sent to: ${email}`);
    res.json({success:true,message:"OTP sent to your email!"});
  }catch(err){
    console.error("Send OTP error:",err);
    res.status(500).json({success:false,message:"Could not send OTP. Check email config."});
  }
});

// Verify OTP
app.post("/api/verify-otp",async(req,res)=>{
  try{
    const{email,otp}=req.body;
    if(!email||!otp)return res.status(400).json({success:false,message:"Email and OTP required."});
    const record=await OTP.findOne({email:email.toLowerCase(),otp}).sort({createdAt:-1});
    if(!record)return res.status(400).json({success:false,message:"Invalid OTP."});
    if(record.expiresAt<new Date())return res.status(400).json({success:false,message:"OTP expired. Request a new one."});
    record.verified=true;await record.save();
    res.json({success:true,message:"Email verified! ✅"});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

// ═══════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════
app.post("/api/register",authLimiter,async(req,res)=>{
  try{
    const{firstName,lastName,email,password,role,college,year,skills,companyName,serviceNeeded,brandLink}=req.body;
    if(!firstName||!lastName||!email||!password||!role)
      return res.status(400).json({success:false,message:"All fields required."});
    const settings=await getPlatformSettings();
    const normalizedRole=normalizeRole(role);
    const allowedKey=normalizedRole==="brand"?"brandRegistrations":"studentRegistrations";
    if(settings.features.maintenanceMode||settings.features[allowedKey]===false){
      return res.status(403).json({success:false,message:`${normalizedRole==="brand"?"Brand":"Student"} registrations are currently closed.`});
    }
    if(password.length<8)
      return res.status(400).json({success:false,message:"Password must be 8+ characters."});
    // Check OTP verified
    const otpRecord=await OTP.findOne({email:email.toLowerCase(),verified:true}).sort({createdAt:-1});
    if(!otpRecord)
      return res.status(400).json({success:false,message:"Email not verified. Please verify OTP first."});
    const existing=await User.findOne({email:email.toLowerCase()});
    if(existing)return res.status(409).json({success:false,message:"Email already registered."});
    const hashedPwd=await bcrypt.hash(password,12);
    const newUser=await User.create({
      firstName,lastName,email:email.toLowerCase(),password:hashedPwd,
      role:normalizedRole,college:college||"",year:year||"",
      skills:skills||[],companyName:companyName||"",brandLink:brandLink||"",serviceNeeded:serviceNeeded||"",
      isVerified:true,
    });
    // Clean up OTP
    await OTP.deleteMany({email:email.toLowerCase()});
    const token=generateToken(newUser);

    // ✅ BRAND PENDING MAIL CHECK HERE FOR MANUAL REGISTER
    if (normalizedRole === 'brand') {
      sendConfiguredEmail("welcome",email, "Action Required: Your Brand Verification is Under Review — NextGenGrowth", brandPendingEmail(firstName))
        .catch(err=>console.error("Brand pending email error:",err.message));
    } else {
      sendConfiguredEmail("welcome",email, `Welcome to NextGenGrowth, ${firstName}! 🎉`, welcomeEmail(firstName, normalizedRole))
        .catch(err=>console.error("Welcome email error:",err.message));
    }
    notifyAdminSignup(newUser);

    console.log(`✅ Registered [${normalizedRole}]: ${email}`);
    res.status(201).json({success:true,message:`Welcome, ${firstName}! 🎉`,token,user:safeUser(newUser)});
  }catch(err){
    console.error("Register error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.post("/api/login",authLimiter,async(req,res)=>{
  try{
    const{email,password,role}=req.body;
    if(!email||!password)return res.status(400).json({success:false,message:"Email and password required."});
    const user=await User.findOne({email:email.toLowerCase()});
    if(!user)return res.status(401).json({success:false,message:"Invalid email or password."});
    if(role&&user.role!==role)return res.status(401).json({success:false,message:`This is a ${user.role} account.`});
    if(user.googleId&&!user.password)return res.status(400).json({success:false,message:"This account uses Google Sign-In. Please use 'Continue with Google'."});
    const ok=await bcrypt.compare(password,user.password);
    if(!ok)return res.status(401).json({success:false,message:"Invalid email or password."});
    const token=generateToken(user);
    console.log(`🔑 Login: ${email} [${user.role}]`);
    res.json({success:true,message:`Welcome back, ${user.firstName}! 👋`,token,user:safeUser(user)});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

// ═══════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════
app.get("/api/profile",verifyToken,async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    if(!user)return res.status(404).json({success:false,message:"User not found."});
    res.json({success:true,user:safeUser(user)});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.put("/api/profile",verifyToken,async(req,res)=>{
  try{
    const{firstName,lastName,college,year,skills,bio,linkedin,portfolioLink}=req.body;
    const updates={};
    if(firstName!==undefined)updates.firstName=firstName;
    if(lastName!==undefined)updates.lastName=lastName;
    if(college!==undefined)updates.college=college;
    if(year!==undefined)updates.year=year;       
    if(skills!==undefined)updates.skills=skills;
    if(bio!==undefined)updates.bio=bio;
    if(linkedin!==undefined)updates.linkedin=linkedin;
    if(portfolioLink!==undefined)updates.portfolioLink=portfolioLink; // ✅ Added Portfolio
    const updated=await User.findByIdAndUpdate(req.user.id,{$set:updates},{new:true,runValidators:false});
    res.json({success:true,message:"Profile updated!",user:safeUser(updated)});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.get("/api/student/kyc",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});
    const user=await User.findById(req.user.id).select("payoutKyc");
    if(!user)return res.status(404).json({success:false,message:"User not found."});
    res.json({success:true,kyc:safePayoutKyc(user.payoutKyc)});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.put("/api/student/kyc",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});

    const legalName=sanitizeText(req.body.legalName,120);
    const preferredPayout=req.body.preferredPayout==="upi"?"upi":"bank";
    const upiId=sanitizeText(req.body.upiId,120).toLowerCase();
    const bankAccountHolder=sanitizeText(req.body.bankAccountHolder,120);
    const bankName=sanitizeText(req.body.bankName,120);
    const accountNumber=String(req.body.bankAccountNumber||"").replace(/\s+/g,"");
    const confirmAccountNumber=String(req.body.confirmAccountNumber||"").replace(/\s+/g,"");
    const ifsc=sanitizeText(req.body.ifsc,20).toUpperCase().replace(/\s+/g,"");
    const consent=!!req.body.consent;

    if(!legalName||legalName.length<3)return res.status(400).json({success:false,message:"Enter your full legal name."});
    if(!bankAccountHolder||bankAccountHolder.length<3)return res.status(400).json({success:false,message:"Enter bank account holder name."});
    if(!bankName||bankName.length<2)return res.status(400).json({success:false,message:"Enter bank name."});
    if(!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc))return res.status(400).json({success:false,message:"Enter a valid IFSC code."});
    if(upiId&&!/^[a-z0-9.\-_]{2,}@[a-z0-9.\-_]{2,}$/i.test(upiId))return res.status(400).json({success:false,message:"Enter a valid UPI ID."});
    if(preferredPayout==="upi"&&!upiId)return res.status(400).json({success:false,message:"Enter UPI ID or choose bank transfer."});
    if(!consent)return res.status(400).json({success:false,message:"Please confirm that these payout details are correct."});

    const user=await User.findById(req.user.id);
    if(!user)return res.status(404).json({success:false,message:"User not found."});

    const update={
      "payoutKyc.legalName":legalName,
      "payoutKyc.preferredPayout":preferredPayout,
      "payoutKyc.upiId":upiId,
      "payoutKyc.bankAccountHolder":bankAccountHolder,
      "payoutKyc.bankName":bankName,
      "payoutKyc.ifsc":ifsc,
      "payoutKyc.status":"submitted",
      "payoutKyc.rejectionReason":"",
      "payoutKyc.submittedAt":new Date(),
    };

    if(accountNumber){
      if(!/^\d{6,20}$/.test(accountNumber))return res.status(400).json({success:false,message:"Enter a valid bank account number."});
      if(accountNumber!==confirmAccountNumber)return res.status(400).json({success:false,message:"Bank account numbers do not match."});
      update["payoutKyc.bankAccountNumberEncrypted"]=encryptSensitive(accountNumber);
      update["payoutKyc.bankAccountLast4"]=accountNumber.slice(-4);
    }else if(!user.payoutKyc?.bankAccountNumberEncrypted){
      return res.status(400).json({success:false,message:"Enter bank account number."});
    }

    const updated=await User.findByIdAndUpdate(req.user.id,{$set:update},{new:true});
    res.json({success:true,message:"Payout KYC submitted for review.",kyc:safePayoutKyc(updated.payoutKyc),user:safeUser(updated)});
  }catch(err){
    console.error("Student KYC error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

// ═══════════════════════════════════════════
// STUDENT ROUTES
// ═══════════════════════════════════════════
app.get("/api/student/stats",verifyToken,async(req,res)=>{
  try{
    const sid=req.user.id;
    const[earned,projectsDone,activeApps,pending,transactions,applications]=await Promise.all([
      Earning.aggregate([{$match:{studentId:new mongoose.Types.ObjectId(sid),status:"paid"}},{$group:{_id:null,total:{$sum:"$amount"}}}]),
      Application.countDocuments({studentId:sid,status:"accepted"}),
      Application.countDocuments({studentId:sid,status:"review"}),
      Earning.aggregate([{$match:{studentId:new mongoose.Types.ObjectId(sid),status:"pending"}},{$group:{_id:null,total:{$sum:"$amount"}}}]),
      Earning.find({studentId:sid}).sort({createdAt:-1}).limit(10),
      Application.find({studentId:sid}).sort({createdAt:-1}).limit(10),
    ]);
    res.json({success:true,stats:{totalEarned:earned[0]?.total||0,projectsDone:projectsDone||0,activeApps:activeApps||0,pending:pending[0]?.total||0,rating:projectsDone>0?4.9:null},transactions,applications});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

// ✅ LIVE JOBS — fetches from DB (brand posted jobs)
app.get("/api/jobs",verifyToken,async(req,res)=>{
  try{
    const jobs=await Job.find({status:"open"}).populate("brandId","firstName lastName companyName").sort({createdAt:-1});
    const result=jobs.map(j=>({
      id:j._id,
      brandId:j.brandId?._id||j.brandId,
      ico:"🏢",
      brand:j.brandName||`${j.brandId?.firstName||""} ${j.brandId?.lastName||""}`.trim(),
      title:j.title,
      cat:j.category,
      tags:j.tags||[],
      pay:j.budget,
      days:j.deadline||"Flexible",
      badge:"new",
      description:j.description,
      postedAt:j.createdAt,
      isLive:true,
    }));
    res.json({success:true,jobs:result});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

// APPLY
app.post("/api/apply",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Only students can apply."});
    const{jobId,jobTitle,brandName,pay,brandId}=req.body;
    const existing=await Application.findOne({studentId:req.user.id,jobId});
    if(existing)return res.status(409).json({success:false,message:"Already applied for this project."});
    await Application.create({studentId:req.user.id,jobId,jobTitle,brandName,brandId:brandId||null,pay});
    const activeCount=await Application.countDocuments({studentId:req.user.id,status:"review"});
    // Email brand
    const student=await User.findById(req.user.id);
    const brand=brandId?await User.findById(brandId):await User.findOne({$or:[{companyName:brandName},{firstName:brandName.split(" ")[0]}],role:"brand"});
    if(brand?.email){
      sendConfiguredEmail("application",brand.email,`📥 New Application for "${jobTitle}"!`,
        `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#0a7c44,#064e2b);border-radius:16px;padding:24px;text-align:center;color:white;margin-bottom:20px">
          <h2 style="margin:0">📥 New Application!</h2>
        </div>
        <div style="background:white;border-radius:16px;padding:24px;border:1px solid #d1ead9">
          <p><strong>Student:</strong> ${student.firstName} ${student.lastName}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Skills:</strong> ${student.skills.join(", ")||"Not listed"}</p>
          <p><strong>Project:</strong> ${jobTitle}</p>
          <a href="${BASE_URL}/brand-dashboard" style="display:inline-block;background:#0a7c44;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Review Application →</a>
        </div></div>`).catch(err=>console.error("Application alert email error:",err.message));
    }
    res.json({success:true,message:`Applied for "${jobTitle}"! 🎉`,activeApplications:activeCount});
  }catch(err){console.error("Apply error:",err);res.status(500).json({success:false,message:"Server error."});}
});

// ═══════════════════════════════════════════
// BRAND ROUTES
// ═══════════════════════════════════════════
app.get("/api/brand/stats",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const[totalProjects,openProjects,projects]=await Promise.all([
      Job.countDocuments({brandId:req.user.id}),
      Job.countDocuments({brandId:req.user.id,status:"open"}),
      Job.find({brandId:req.user.id}).sort({createdAt:-1}),
    ]);
    res.json({success:true,stats:{totalProjects,openProjects,totalApps:0},projects});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

// ✅ Brand posts project — goes to REAL Jobs DB
app.post("/api/brand/project",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const settings=await getPlatformSettings();
    if(settings.features.maintenanceMode)return res.status(503).json({success:false,message:"Platform is in maintenance mode. Please try again later."});
    if(settings.features.projectPosting===false)return res.status(403).json({success:false,message:"Project posting is currently disabled by admin."});
    
    // ✅ ADMIN VERIFICATION CHECK ADDED HERE
    const brand=await User.findById(req.user.id);
    if(!brand.isApproved) {
      return res.status(403).json({success:false,message:"Aapka account verification pending hai. Admin approval ke baad hi aap project post kar payenge."});
    }

    const{title,description,budget,category,deadline,tags}=req.body;
    if(!title||!budget||!category)return res.status(400).json({success:false,message:"Title, budget and category required."});
    const budgetAmount=getMinimumAmount(budget);
    if(budgetAmount<settings.minProjectBudget){
      return res.status(400).json({success:false,message:`Minimum project budget is ${formatINR(settings.minProjectBudget)}.`});
    }
    if(budgetAmount>settings.maxProjectBudget){
      return res.status(400).json({success:false,message:`Maximum project budget is ${formatINR(settings.maxProjectBudget)}.`});
    }
    
    const brandName=brand.companyName||`${brand.firstName} ${brand.lastName}`;
    const job=await Job.create({
      brandId:req.user.id,brandName,
      title,description:description||"",budget,category,
      deadline:deadline||"",tags:tags||[],
    });
    res.json({success:true,message:"Project posted! Students will see it now 🚀",projectId:job._id});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

// Brand applications
app.get("/api/brand/applications",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const brand=await User.findById(req.user.id);
    const brandName=brand.companyName||`${brand.firstName} ${brand.lastName}`;
    // Get brand's job IDs
    const brandJobs=await Job.find({brandId:req.user.id}).select("_id title");
    const jobIds=brandJobs.map(j=>j._id.toString());
    const jobTitles=brandJobs.map(j=>j.title);
    const apps=await Application.find({$or:[{brandId:req.user.id},{jobId:{$in:jobIds}},{brandName:brandName}]})
      .populate("studentId","firstName lastName email college year skills bio linkedin portfolioLink avatar") // ✅ Added fields
      .sort({createdAt:-1});
    const result=apps.map(a=>({
      ...a.toObject(),
      student:{
        id:a.studentId?._id,
        name:`${a.studentId?.firstName||""} ${a.studentId?.lastName||""}`.trim(),
        email:a.studentId?.email||"",
        college:a.studentId?.college||"",
        year:a.studentId?.year||"",
        skills:a.studentId?.skills||[],
        bio:a.studentId?.bio||"",
        linkedin:a.studentId?.linkedin||"",
        portfolioLink:a.studentId?.portfolioLink||"", // ✅ Added field
        avatar:a.studentId?.avatar||"",               // ✅ Added field
      }
    }));
    res.json({success:true,applications:result});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.get("/api/brand/students",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const students=await User.find({role:"student"})
      .select("firstName lastName college year skills bio linkedin portfolioLink avatar createdAt updatedAt")
      .sort({updatedAt:-1,createdAt:-1})
      .limit(80);
    const ids=students.map(s=>s._id);
    const[acceptedData,completedData,earningData]=await Promise.all([
      Application.aggregate([{$match:{studentId:{$in:ids},status:"accepted"}},{$group:{_id:"$studentId",count:{$sum:1}}}]),
      ProjectWorkspace.aggregate([{$match:{studentId:{$in:ids},status:{$in:["approved","completed"]}}},{$group:{_id:"$studentId",count:{$sum:1}}}]),
      Earning.aggregate([{$match:{studentId:{$in:ids},status:"paid"}},{$group:{_id:"$studentId",total:{$sum:"$amount"}}}]),
    ]);
    const acceptedMap=new Map(acceptedData.map(x=>[String(x._id),x.count]));
    const completedMap=new Map(completedData.map(x=>[String(x._id),x.count]));
    const earningMap=new Map(earningData.map(x=>[String(x._id),x.total]));
    const result=students.map(s=>{
      const id=String(s._id);
      const completed=completedMap.get(id)||0;
      const acceptedApps=acceptedMap.get(id)||0;
      const rating=completed?Math.min(5,4.6+Math.min(.4,completed*.06)):null;
      return{
        id,
        name:`${s.firstName||""} ${s.lastName||""}`.trim()||"Student",
        firstName:s.firstName||"",
        lastName:s.lastName||"",
        college:s.college||"",
        year:s.year||"",
        skills:s.skills||[],
        bio:s.bio||"",
        linkedin:s.linkedin||"",
        portfolioLink:s.portfolioLink||"",
        avatar:s.avatar||"",
        createdAt:s.createdAt,
        stats:{rating,completed,acceptedApps,totalEarned:earningMap.get(id)||0},
      };
    });
    res.json({success:true,students:result});
  }catch(err){
    console.error("Brand students error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.get("/api/brand/student/:id/profile",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const student=await User.findOne({_id:req.params.id,role:"student"}).select("-password");
    if(!student)return res.status(404).json({success:false,message:"Student not found."});

    const brand=await User.findById(req.user.id);
    const brandName=brand.companyName||`${brand.firstName} ${brand.lastName}`;
    const brandJobs=await Job.find({brandId:req.user.id}).select("_id");
    const jobIds=brandJobs.map(j=>j._id.toString());
    const hasAccess=await Application.findOne({studentId:student._id,$or:[{brandId:req.user.id},{jobId:{$in:jobIds}},{brandName}]});
    if(!hasAccess)return res.status(403).json({success:false,message:"You can view profiles only for students who applied to your projects."});

    const[applications,approvedWork,earnings,totalApps,acceptedApps]=await Promise.all([
      Application.find({studentId:student._id}).sort({createdAt:-1}).limit(8),
      ProjectWorkspace.find({studentId:student._id,status:{$in:["approved","completed"]}}).sort({approvedAt:-1,updatedAt:-1}).limit(6),
      Earning.aggregate([{$match:{studentId:student._id,status:"paid"}},{$group:{_id:null,total:{$sum:"$amount"}}}]),
      Application.countDocuments({studentId:student._id}),
      Application.countDocuments({studentId:student._id,status:"accepted"}),
    ]);

    const completed=approvedWork.length;
    const rating=completed?Math.min(5,4.6+Math.min(.4,completed*.06)):null;
    res.json({
      success:true,
      student:safeUser(student),
      stats:{rating,totalApps,acceptedApps,completed,totalEarned:earnings[0]?.total||0},
      recentApplications:applications.map(a=>({jobTitle:a.jobTitle,brandName:a.brandName,pay:a.pay,status:a.status,createdAt:a.createdAt})),
      recentWorks:approvedWork.map(w=>({
        jobTitle:w.jobTitle,
        status:w.status,
        approvedAt:w.approvedAt||w.updatedAt,
        submissionLink:String(w.brandId)===String(req.user.id)?w.submissionLink:"",
      })),
    });
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

// Brand accept/reject with email
app.put("/api/brand/application/:id",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const{status}=req.body;
    if(!["accepted","rejected"].includes(status))return res.status(400).json({success:false,message:"Invalid status."});
    const app=await Application.findById(req.params.id).populate("studentId","firstName lastName email");
    if(!app)return res.status(404).json({success:false,message:"Not found."});
    if(!(await brandOwnsApplication(app,req.user.id)))return res.status(403).json({success:false,message:"You can only update applications for your own projects."});
    if(status==="accepted"){
      const alreadyAccepted=await Application.findOne({
        _id:{$ne:app._id},
        jobId:app.jobId,
        status:"accepted",
      }).populate("studentId","firstName lastName");
      if(alreadyAccepted){
        const selectedName=`${alreadyAccepted.studentId?.firstName||""} ${alreadyAccepted.studentId?.lastName||""}`.trim()||"another student";
        return res.status(409).json({success:false,message:`You already approved ${selectedName} for this project. Only one student can be approved per project.`});
      }
    }
    app.status=status;await app.save();
    const student=app.studentId;
    if(student?.email){
      if(status==="accepted"){
        sendConfiguredEmail("application",student.email,`🎉 Your application was ACCEPTED! — ${app.jobTitle}`,acceptedEmail(student.firstName,app.jobTitle,app.brandName))
          .catch(err=>console.error("Application status email error:",err.message));
      }else{
        sendConfiguredEmail("application",student.email,`Application Update — ${app.jobTitle}`,rejectedEmail(student.firstName,app.jobTitle))
          .catch(err=>console.error("Application status email error:",err.message));
      }
    }
    res.json({success:true,message:`Application ${status}! Email sent. ✅`});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

async function brandOwnsApplication(application,brandId){
  if(application.brandId&&String(application.brandId)===String(brandId))return true;
  if(mongoose.Types.ObjectId.isValid(application.jobId)){
    const job=await Job.findOne({_id:application.jobId,brandId}).select("_id");
    if(job)return true;
  }
  const brand=await User.findById(brandId).select("companyName firstName lastName");
  const brandName=(brand?.companyName||`${brand?.firstName||""} ${brand?.lastName||""}`.trim()).trim();
  return !!brandName&&String(application.brandName||"").trim().toLowerCase()===brandName.toLowerCase();
}

async function ensureWorkspaceForApplication(applicationId,brandId){
  const application=await Application.findById(applicationId);
  if(!application)return null;
  return ProjectWorkspace.findOneAndUpdate(
    {applicationId:application._id},
    {$setOnInsert:{
      applicationId:application._id,
      jobId:application.jobId,
      jobTitle:application.jobTitle,
      brandId,
      studentId:application.studentId,
      status:"resources_pending",
    }},
    {new:true,upsert:true,setDefaultsOnInsert:true}
  );
}

async function notifyStudentPaymentSecured(payment){
  const student=await User.findById(payment.studentId);
  if(!student?.email)return;
  sendConfiguredEmail(
    "payment",
    student.email,
    "💰 Payment Received — NextGenGrowth",
    `<div style="font-family:Arial,sans-serif;padding:20px;max-width:500px;margin:0 auto">
    <div style="background:linear-gradient(135deg,#0a7c44,#064e2b);border-radius:16px;padding:24px;text-align:center;color:white;margin-bottom:20px">
      <h2 style="margin:0 0 8px">💰 Payment Secured!</h2>
      <p style="font-size:2rem;font-weight:bold;margin:0">₹${payment.amount.toLocaleString('en-IN')}</p>
      <p style="margin:6px 0 0;opacity:.85">${payment.description}</p>
    </div>
    <p style="color:#2d5a3d;font-size:15px">Hi ${student.firstName}! The brand payment is secured. It will be released after your submitted work is approved.</p>
    <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#0a7c44;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:8px;font-weight:bold">View Earnings →</a>
    </div>`
  );
}

async function finalizeVerifiedPayment(payment){
  await Application.findByIdAndUpdate(payment.applicationId,{
    paymentStatus:"paid",
    paidAmount:payment.amount,
  });

  await ensureWorkspaceForApplication(payment.applicationId,payment.brandId);

  await Earning.findOneAndUpdate(
    {applicationId:payment.applicationId,studentId:payment.studentId},
    {$setOnInsert:{
      studentId:payment.studentId,
      applicationId:payment.applicationId,
      amount:payment.amount,
      description:payment.description,
      status:"pending",
    }},
    {new:true,upsert:true,setDefaultsOnInsert:true}
  );
}

// ═══════════════════════════════════════════
// PROJECT WORKSPACE ROUTES
// ═══════════════════════════════════════════
app.get("/api/brand/workspaces",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const workspaces=await ProjectWorkspace.find({brandId:req.user.id})
      .populate("studentId","firstName lastName email")
      .sort({updatedAt:-1});
    res.json({success:true,workspaces});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.put("/api/brand/workspace/:applicationId/resources",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    let workspace=await ProjectWorkspace.findOne({applicationId:req.params.applicationId,brandId:req.user.id});
    if(!workspace){
      const application=await Application.findById(req.params.applicationId);
      if(!application)return res.status(404).json({success:false,message:"Application not found."});
      if(!(await brandOwnsApplication(application,req.user.id)))return res.status(403).json({success:false,message:"You can only manage your own workspaces."});
      if(application.paymentStatus!=="paid")return res.status(400).json({success:false,message:"Complete payment before adding resources."});
      workspace=await ensureWorkspaceForApplication(application._id,req.user.id);
    }

    const resources=cleanResources(req.body.resources);
    const brief=safeMessage(req.body.brief);
    const deadline=safeMessage(req.body.deadline,120);
    if(!brief&&!deadline&&!resources.length){
      return res.status(400).json({success:false,message:"Add a brief, deadline, or at least one resource link."});
    }

    workspace.brief=brief;
    workspace.deadline=deadline;
    workspace.resources=resources;
    if(workspace.status==="resources_pending")workspace.status="in_progress";
    await workspace.save();

    const student=await User.findById(workspace.studentId);
    if(student?.email){
      sendEmail(student.email,`Project resources added — ${workspace.jobTitle}`,
        `<div style="font-family:Arial,sans-serif;padding:20px;max-width:520px;margin:0 auto">
          <h2 style="color:#0a7c44">Project resources are ready</h2>
          <p>Hi ${student.firstName||"there"}, your brand has added the brief/resources for <b>${workspace.jobTitle}</b>.</p>
          <p>You can now start work and submit your final link from your dashboard.</p>
          <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#0a7c44;color:white;padding:12px 20px;border-radius:9px;text-decoration:none;font-weight:bold">Open Dashboard</a>
        </div>`);
    }

    res.json({success:true,message:"Workspace resources saved.",workspace});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.put("/api/brand/workspace/:applicationId/review",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const{action,revisionNote}=req.body;
    if(!["approve","revision"].includes(action))return res.status(400).json({success:false,message:"Invalid review action."});
    const workspace=await ProjectWorkspace.findOne({applicationId:req.params.applicationId,brandId:req.user.id});
    if(!workspace)return res.status(404).json({success:false,message:"Workspace not found."});
    if(workspace.status!=="submitted")return res.status(400).json({success:false,message:"Student has not submitted work yet."});

    if(action==="approve"){
      workspace.status="approved";
      workspace.revisionNote="";
      workspace.approvedAt=new Date();
      await workspace.save();
      await Earning.findOneAndUpdate(
        {applicationId:workspace.applicationId,studentId:workspace.studentId,status:"pending"},
        {$set:{status:"paid"}},
        {new:true}
      );
      const student=await User.findById(workspace.studentId);
      if(student?.email){
        sendEmail(student.email,`Work approved — ${workspace.jobTitle}`,
          `<div style="font-family:Arial,sans-serif;padding:20px;max-width:520px;margin:0 auto">
            <h2 style="color:#0a7c44">Work approved</h2>
            <p>Hi ${student.firstName||"there"}, your submission for <b>${workspace.jobTitle}</b> has been approved.</p>
            <p>Your pending earning has been marked as paid in NextGenGrowth.</p>
          </div>`);
      }
      return res.json({success:true,message:"Work approved and student earning released.",workspace});
    }

    workspace.status="revision_requested";
    workspace.revisionNote=safeMessage(revisionNote,1500);
    await workspace.save();
    res.json({success:true,message:"Revision requested.",workspace});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.get("/api/student/workspaces",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});
    const workspaces=await ProjectWorkspace.find({studentId:req.user.id})
      .populate("brandId","firstName lastName companyName email")
      .sort({updatedAt:-1});
    res.json({success:true,workspaces});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.post("/api/student/workspace/:applicationId/submit",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});
    const workspace=await ProjectWorkspace.findOne({applicationId:req.params.applicationId,studentId:req.user.id});
    if(!workspace)return res.status(404).json({success:false,message:"Workspace not found."});
    if(!["in_progress","revision_requested","submitted"].includes(workspace.status)){
      return res.status(400).json({success:false,message:"You can submit after the brand adds project resources."});
    }
    const submissionLink=String(req.body.submissionLink||"").trim();
    if(!isValidUrl(submissionLink))return res.status(400).json({success:false,message:"Add a valid final work link."});

    workspace.submissionLink=submissionLink;
    workspace.submissionNote=safeMessage(req.body.submissionNote,1500);
    workspace.status="submitted";
    workspace.submittedAt=new Date();
    await workspace.save();

    const brand=await User.findById(workspace.brandId);
    if(brand?.email){
      sendEmail(brand.email,`Work submitted — ${workspace.jobTitle}`,
        `<div style="font-family:Arial,sans-serif;padding:20px;max-width:520px;margin:0 auto">
          <h2 style="color:#0a7c44">Student submitted work</h2>
          <p>The student has submitted final work for <b>${workspace.jobTitle}</b>.</p>
          <p><a href="${submissionLink}">Open submission</a></p>
          <a href="${BASE_URL}/brand-dashboard" style="display:inline-block;background:#0a7c44;color:white;padding:12px 20px;border-radius:9px;text-decoration:none;font-weight:bold">Review Submission</a>
        </div>`);
    }

    res.json({success:true,message:"Work submitted for brand review.",workspace});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

// ═══════════════════════════════════════════
// RAZORPAY PAYMENT ROUTES
// ═══════════════════════════════════════════
app.post("/api/create-order",authLimiter,async(req,res)=>{
  try{
    const{amount,currency="INR",receipt}=req.body;
    const order=await createRazorpayOrder({
      amount:Number(amount),
      currency,
      receipt,
    });
    res.json({
      success:true,
      order_id:order.id,
      orderId:order.id,
      amount:order.amount,
      currency:order.currency,
      key:getRazorpayConfig().keyId,
    });
  }catch(err){
    if(err.statusCode===400){
      return res.status(400).json({success:false,message:err.message});
    }
    console.error("Razorpay order error:",err);
    res.status(getRazorpayErrorStatus(err)).json({
      success:false,
      message:getRazorpayErrorStatus(err)===401?"Razorpay authentication failed. Check credentials.":"Could not create Razorpay order.",
    });
  }
});

app.post("/api/verify-payment",authLimiter,async(req,res)=>{
  try{
    const{razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
    if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature){
      return res.status(400).json({success:false,message:"Missing payment verification fields."});
    }
    if(!isValidRazorpaySignature(razorpay_order_id,razorpay_payment_id,razorpay_signature)){
      return res.status(400).json({success:false,message:"Payment signature mismatch. Verification failed."});
    }
    res.json({success:true,message:"Payment signature verified."});
  }catch(err){
    console.error("Razorpay verify error:",err);
    res.status(500).json({success:false,message:"Payment verification failed."});
  }
});

app.post("/api/payment/create-order",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});

    const{applicationId,amount,description}=req.body;
    if(!applicationId||amount===undefined)return res.status(400).json({success:false,message:"Application ID and amount required."});

    const application=await Application.findById(applicationId).populate("studentId","firstName lastName email");
    if(!application)return res.status(404).json({success:false,message:"Application not found."});
    if(!(await brandOwnsApplication(application,req.user.id)))return res.status(403).json({success:false,message:"You can only pay for your own applications."});
    if(application.status!=="accepted")return res.status(400).json({success:false,message:"Application must be accepted before payment."});
    if(application.paymentStatus==="paid")return res.status(400).json({success:false,message:"This application is already paid."});

    const numericAmount=Number(amount);
    const amountInPaise=Math.round(numericAmount*100);
    const minimumAmount=getMinimumAmount(application.pay);
    if(!Number.isFinite(numericAmount)||amountInPaise<minimumAmount*100){
      return res.status(400).json({success:false,message:`Minimum payment for this project is ${formatINR(minimumAmount)}.`});
    }

    const order=await createRazorpayOrder({
      amount:amountInPaise,
      currency:"INR",
      receipt:`ngg_${String(applicationId).slice(-10)}_${String(Date.now()).slice(-8)}`,
      notes:{
        applicationId:String(applicationId),
        jobTitle:application.jobTitle,
        studentName:`${application.studentId.firstName} ${application.studentId.lastName}`.trim(),
        description:description||application.jobTitle,
      },
    });

    await Payment.create({
      applicationId,
      studentId:application.studentId._id,
      brandId:req.user.id,
      razorpayOrderId:order.id,
      amount:numericAmount,
      description:description||application.jobTitle,
    });

    res.json({
      success:true,
      orderId:order.id,
      order_id:order.id,
      amount:amountInPaise,
      currency:"INR",
      key:getRazorpayConfig().keyId,
      studentName:`${application.studentId.firstName} ${application.studentId.lastName}`.trim(),
      jobTitle:application.jobTitle,
    });
  }catch(err){
    console.error("Payment create-order error:",err);
    if(err.statusCode===400){
      return res.status(400).json({success:false,message:err.message});
    }
    res.status(getRazorpayErrorStatus(err)).json({
      success:false,
      message:getRazorpayErrorStatus(err)===401?"Razorpay authentication failed. Check credentials.":"Could not create payment order. Check Razorpay credentials.",
    });
  }
});

app.post("/api/payment/verify",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const{razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
    if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature){
      return res.status(400).json({success:false,message:"Missing payment verification fields."});
    }

    if(!isValidRazorpaySignature(razorpay_order_id,razorpay_payment_id,razorpay_signature)){
      return res.status(400).json({success:false,message:"Payment signature mismatch. Verification failed."});
    }

    const payment=await Payment.findOne({razorpayOrderId:razorpay_order_id});
    if(!payment)return res.status(404).json({success:false,message:"Payment record not found."});
    if(String(payment.brandId)!==String(req.user.id))return res.status(403).json({success:false,message:"You can only verify your own payments."});
    if(payment.status==="paid"){
      await finalizeVerifiedPayment(payment);
      return res.json({success:true,message:"Payment already verified."});
    }

    payment.razorpayPaymentId=razorpay_payment_id;
    payment.razorpaySignature=razorpay_signature;
    payment.status="paid";
    await payment.save();

    await finalizeVerifiedPayment(payment);
    notifyStudentPaymentSecured(payment).catch(err=>console.error("Payment email error:",err.message));

    res.json({success:true,message:"Payment verified! Student has been notified. ✅"});
  }catch(err){
    console.error("Payment verify error:",err);
    res.status(500).json({success:false,message:"Payment verification failed."});
  }
});

app.post("/api/payment/reconcile",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const{applicationId,razorpay_payment_id}=req.body;
    if(!applicationId||!razorpay_payment_id){
      return res.status(400).json({success:false,message:"Application ID and Razorpay payment ID required."});
    }

    const payment=await Payment.findOne({applicationId,brandId:req.user.id}).sort({createdAt:-1});
    if(!payment)return res.status(404).json({success:false,message:"Payment record not found for this application."});
    if(payment.status==="paid"){
      await finalizeVerifiedPayment(payment);
      return res.json({success:true,message:"Payment already verified."});
    }

    const razorpayPayment=await getRazorpayClient().payments.fetch(razorpay_payment_id);
    if(!razorpayPayment||String(razorpayPayment.order_id)!==String(payment.razorpayOrderId)){
      return res.status(400).json({success:false,message:"Razorpay payment does not match this order."});
    }
    if(Number(razorpayPayment.amount)!==Math.round(Number(payment.amount)*100)){
      return res.status(400).json({success:false,message:"Razorpay payment amount does not match this application."});
    }
    if(!["captured","authorized"].includes(razorpayPayment.status)){
      return res.status(400).json({success:false,message:`Razorpay payment is ${razorpayPayment.status}.`});
    }

    payment.razorpayPaymentId=razorpay_payment_id;
    payment.status="paid";
    await payment.save();
    await finalizeVerifiedPayment(payment);
    notifyStudentPaymentSecured(payment).catch(err=>console.error("Payment email error:",err.message));

    res.json({success:true,message:"Payment reconciled successfully."});
  }catch(err){
    console.error("Payment reconcile error:",err);
    res.status(getRazorpayErrorStatus(err)).json({
      success:false,
      message:getRazorpayErrorStatus(err)===401?"Razorpay authentication failed. Check credentials.":"Could not reconcile payment.",
    });
  }
});

app.get("/api/payment/status/:applicationId",verifyToken,async(req,res)=>{
  try{
    const application=await Application.findById(req.params.applicationId);
    if(!application)return res.status(404).json({success:false,message:"Application not found."});
    const canView=req.user.role==="student"
      ? String(application.studentId)===String(req.user.id)
      : req.user.role==="brand"&&await brandOwnsApplication(application,req.user.id);
    if(!canView)return res.status(403).json({success:false,message:"You cannot view this payment status."});
    const payment=await Payment.findOne({applicationId:req.params.applicationId,status:"paid"});
    res.json({success:true,paid:!!payment,amount:payment?.amount||0});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

// ═══════════════════════════════════════════
// BLOG PUBLIC ROUTES
// ═══════════════════════════════════════════
app.get("/api/blog/posts",async(req,res)=>{
  try{
    const posts=await getPublishedBlogPosts({
      category:req.query.category?slugify(req.query.category):"",
      tag:req.query.tag?String(req.query.tag).trim():"",
      search:req.query.q?String(req.query.q).trim():"",
      limit:Number(req.query.limit)||30,
    });
    res.json({success:true,posts});
  }catch(err){
    res.status(500).json({success:false,message:"Could not load blog posts."});
  }
});

app.get("/api/blog/posts/:slug",async(req,res)=>{
  const post=await getBlogPostBySlug(req.params.slug);
  if(!post)return res.status(404).json({success:false,message:"Post not found."});
  res.json({success:true,post});
});

app.post("/api/newsletter",async(req,res)=>{
  try{
    const email=String(req.body.email||"").trim().toLowerCase();
    const name=sanitizeText(req.body.name,90);
    const source=sanitizeText(req.body.source||"blog",120);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      return res.status(400).json({success:false,message:"Enter a valid email address."});
    }
    if(dbReady()){
      await NewsletterSubscriber.findOneAndUpdate(
        {email},
        {$set:{name,source},$addToSet:{tags:"blog"},$setOnInsert:{subscribedAt:new Date()}},
        {new:true,upsert:true,setDefaultsOnInsert:true}
      );
      await BlogEvent.create({event:"newsletter_signup",channel:source,metadata:{email},ip:req.ip,userAgent:req.get("user-agent")||""});
      const slug=String(source).startsWith("blog-post:")?String(source).split(":")[1]:"";
      if(slug)await BlogPost.updateOne({slug},{$inc:{newsletterSignups:1}});
    }
    res.json({success:true,message:"You're subscribed. Welcome to the growth list."});
  }catch(err){
    console.error("Newsletter error:",err.message);
    res.status(500).json({success:false,message:"Could not subscribe right now."});
  }
});

app.post("/api/blog/track",async(req,res)=>{
  try{
    const event=String(req.body.event||"").trim();
    const slug=slugify(req.body.slug||"");
    const allowed=["view","share","cta_click","newsletter_signup","feedback","search"];
    if(!allowed.includes(event))return res.status(400).json({success:false,message:"Invalid event."});
    if(dbReady()){
      const post=slug?await BlogPost.findOne({slug}).select("_id slug"):null;
      await BlogEvent.create({
        postId:post?._id,
        slug,
        event,
        channel:sanitizeText(req.body.channel||req.body.metadata?.channel||"",60),
        metadata:req.body.metadata||{},
        ip:req.ip,
        userAgent:req.get("user-agent")||"",
      });
      const inc={};
      if(event==="view")inc.views=1;
      if(event==="share")inc.shareClicks=1;
      if(event==="cta_click")inc.ctaClicks=1;
      if(event==="newsletter_signup")inc.newsletterSignups=1;
      if(slug&&Object.keys(inc).length)await BlogPost.updateOne({slug},{$inc:inc});
    }
    res.json({success:true});
  }catch(err){
    res.json({success:true});
  }
});

// ═══════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════
const ADMIN_EMAIL=process.env.ADMIN_EMAIL||"admin@nextgengrowth.in";
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||"NGG@Admin2026";

app.post("/api/admin/login",(req,res)=>{
  const{email,password}=req.body;
  if(email===ADMIN_EMAIL&&password===ADMIN_PASSWORD){
    const token=jwt.sign({role:"admin",email},JWT_SECRET,{expiresIn:"1d"});
    res.json({success:true,token,message:"Welcome back, Admin! 👑"});
  }else{
    res.status(401).json({success:false,message:"Invalid admin credentials."});
  }
});

function adminOnly(req,res,next){
  const token=(req.headers["authorization"]||"").split(" ")[1];
  if(!token)return res.status(401).json({success:false,message:"No token."});
  try{const d=jwt.verify(token,JWT_SECRET);if(d.role!=="admin")return res.status(403).json({success:false,message:"Admin only."});req.admin=d;next();}
  catch{res.status(403).json({success:false,message:"Invalid token."});}
}

function buildBlogPayload(body){
  const title=sanitizeText(body.title,180);
  const content=safeMessage(body.content,60000);
  const slug=slugify(body.slug||title);
  const category=slugify(body.category||"marketing");
  const status=body.status==="published"?"published":"draft";
  const publishAt=body.publishAt?new Date(body.publishAt):status==="published"?new Date():null;
  return{
    title,
    slug,
    category:getBlogCategory(category)?category:"marketing",
    tags:normalizeTags(body.tags),
    featuredImage:isValidUrl(body.featuredImage)?String(body.featuredImage).trim():"",
    excerpt:safeMessage(body.excerpt||stripMarkdown(content).slice(0,170),260),
    content,
    seoTitle:safeMessage(body.seoTitle||`${title} | NextGenGrowth`,190),
    seoDescription:safeMessage(body.seoDescription||body.excerpt||stripMarkdown(content).slice(0,155),220),
    status,
    authorName:sanitizeText(body.authorName||"NextGenGrowth Team",90),
    authorSlug:slugify(body.authorSlug||body.authorName||"nextgengrowth-team"),
    featured:!!body.featured,
    publishAt:Number.isNaN(publishAt?.getTime?.())?null:publishAt,
  };
}

function apiError(message,statusCode=500){
  const err=new Error(message);
  err.statusCode=statusCode;
  return err;
}

function requireObjectId(id,label="ID"){
  if(!mongoose.Types.ObjectId.isValid(String(id||"")))throw apiError(`Invalid ${label}.`,400);
}

async function deleteProjectCascade(projectId){
  requireObjectId(projectId,"project ID");
  const project=await Job.findById(projectId).lean();
  if(!project)throw apiError("Project not found.",404);
  const jobId=String(project._id);
  const apps=await Application.find({jobId}).select("_id").lean();
  const appIds=apps.map(a=>a._id);
  const[workspaces,payments,earnings,applications,job]=await Promise.all([
    ProjectWorkspace.deleteMany({$or:[{jobId},{applicationId:{$in:appIds}}]}),
    Payment.deleteMany({applicationId:{$in:appIds}}),
    Earning.deleteMany({applicationId:{$in:appIds}}),
    Application.deleteMany({_id:{$in:appIds}}),
    Job.deleteOne({_id:project._id}),
  ]);
  return{
    projects:job.deletedCount||0,
    applications:applications.deletedCount||0,
    workspaces:workspaces.deletedCount||0,
    payments:payments.deletedCount||0,
    earnings:earnings.deletedCount||0,
  };
}

async function deleteUserCascade(userId){
  requireObjectId(userId,"user ID");
  const user=await User.findById(userId).lean();
  if(!user)throw apiError("User not found.",404);
  const brandJobs=user.role==="brand"
    ? await Job.find({brandId:user._id}).select("_id").lean()
    : [];
  const jobObjectIds=brandJobs.map(j=>j._id);
  const jobIds=jobObjectIds.map(String);
  const appQuery={$or:[{studentId:user._id},{brandId:user._id}]};
  if(jobIds.length)appQuery.$or.push({jobId:{$in:jobIds}});
  const apps=await Application.find(appQuery).select("_id").lean();
  const appIds=apps.map(a=>a._id);

  const[workspaces,payments,earnings,applications,jobs,otps,deletedUser]=await Promise.all([
    ProjectWorkspace.deleteMany({$or:[
      {studentId:user._id},
      {brandId:user._id},
      {applicationId:{$in:appIds}},
      {jobId:{$in:jobIds}},
    ]}),
    Payment.deleteMany({$or:[{studentId:user._id},{brandId:user._id},{applicationId:{$in:appIds}}]}),
    Earning.deleteMany({$or:[{studentId:user._id},{applicationId:{$in:appIds}}]}),
    Application.deleteMany({_id:{$in:appIds}}),
    Job.deleteMany({_id:{$in:jobObjectIds}}),
    OTP.deleteMany({email:user.email}),
    User.deleteOne({_id:user._id}),
  ]);

  return{
    users:deletedUser.deletedCount||0,
    projects:jobs.deletedCount||0,
    applications:applications.deletedCount||0,
    workspaces:workspaces.deletedCount||0,
    payments:payments.deletedCount||0,
    earnings:earnings.deletedCount||0,
    otps:otps.deletedCount||0,
  };
}

async function updateApplicationStatusAsAdmin(applicationId,status){
  requireObjectId(applicationId,"application ID");
  if(!["review","accepted","rejected"].includes(status))throw apiError("Invalid status.",400);
  const app=await Application.findById(applicationId).populate("studentId","firstName lastName email");
  if(!app)throw apiError("Application not found.",404);
  if(app.paymentStatus==="paid"&&status!=="accepted"){
    throw apiError("Paid applications cannot be moved out of accepted status from the admin panel.",400);
  }
  if(status==="accepted"){
    const alreadyAccepted=await Application.findOne({
      _id:{$ne:app._id},
      jobId:app.jobId,
      status:"accepted",
    }).populate("studentId","firstName lastName");
    if(alreadyAccepted){
      const selectedName=`${alreadyAccepted.studentId?.firstName||""} ${alreadyAccepted.studentId?.lastName||""}`.trim()||"another student";
      throw apiError(`Already approved ${selectedName} for this project. Only one student can be approved per project.`,409);
    }
  }
  app.status=status;
  await app.save();
  const student=app.studentId;
  if(student?.email&&["accepted","rejected"].includes(status)){
    const subject=status==="accepted"
      ? `🎉 Your application was ACCEPTED! — ${app.jobTitle}`
      : `Application Update — ${app.jobTitle}`;
    const html=status==="accepted"
      ? acceptedEmail(student.firstName,app.jobTitle,app.brandName)
      : rejectedEmail(student.firstName,app.jobTitle);
    sendConfiguredEmail("application",student.email,subject,html).catch(err=>console.error("Application email error:",err.message));
  }
  return app;
}

function testDataQueries(){
  const textRegex=/(^|[\s._+\-@])(test|demo|sample|dummy|example|seed)([\s._+\-@]|$)/i;
  const emailRegex=/(^test|[._+\-](test|demo|sample|dummy|seed)|@(example|test)\.|mailinator|yopmail|tempmail)/i;
  return{textRegex,emailRegex};
}

async function clearTestData(){
  const{textRegex,emailRegex}=testDataQueries();
  const users=await User.find({$or:[
    {email:emailRegex},
    {firstName:textRegex},
    {lastName:textRegex},
    {companyName:textRegex},
  ]}).select("_id email").lean();
  const userIds=users.map(u=>u._id);

  const jobs=await Job.find({$or:[
    {brandId:{$in:userIds}},
    {title:textRegex},
    {brandName:textRegex},
    {description:textRegex},
  ]}).select("_id").lean();
  const jobObjectIds=jobs.map(j=>j._id);
  const jobIds=jobObjectIds.map(String);

  const applications=await Application.find({$or:[
    {studentId:{$in:userIds}},
    {brandId:{$in:userIds}},
    {jobId:{$in:jobIds}},
    {jobTitle:textRegex},
    {brandName:textRegex},
  ]}).select("_id").lean();
  const appIds=applications.map(a=>a._id);

  const blogPosts=await BlogPost.find({$or:[{title:textRegex},{slug:textRegex}]}).select("_id").lean();
  const blogIds=blogPosts.map(p=>p._id);

  const[
    workspacesDeleted,
    paymentsDeleted,
    earningsDeleted,
    applicationsDeleted,
    jobsDeleted,
    usersDeleted,
    otpsDeleted,
    postsDeleted,
    eventsDeleted,
    subscribersDeleted,
  ]=await Promise.all([
    ProjectWorkspace.deleteMany({$or:[
      {studentId:{$in:userIds}},
      {brandId:{$in:userIds}},
      {applicationId:{$in:appIds}},
      {jobId:{$in:jobIds}},
    ]}),
    Payment.deleteMany({$or:[
      {studentId:{$in:userIds}},
      {brandId:{$in:userIds}},
      {applicationId:{$in:appIds}},
    ]}),
    Earning.deleteMany({$or:[{studentId:{$in:userIds}},{applicationId:{$in:appIds}}]}),
    Application.deleteMany({_id:{$in:appIds}}),
    Job.deleteMany({_id:{$in:jobObjectIds}}),
    User.deleteMany({_id:{$in:userIds}}),
    OTP.deleteMany({email:emailRegex}),
    BlogPost.deleteMany({_id:{$in:blogIds}}),
    BlogEvent.deleteMany({postId:{$in:blogIds}}),
    NewsletterSubscriber.deleteMany({email:emailRegex}),
  ]);

  return{
    users:usersDeleted.deletedCount||0,
    projects:jobsDeleted.deletedCount||0,
    applications:applicationsDeleted.deletedCount||0,
    workspaces:workspacesDeleted.deletedCount||0,
    payments:paymentsDeleted.deletedCount||0,
    earnings:earningsDeleted.deletedCount||0,
    otps:otpsDeleted.deletedCount||0,
    blogPosts:postsDeleted.deletedCount||0,
    blogEvents:eventsDeleted.deletedCount||0,
    subscribers:subscribersDeleted.deletedCount||0,
  };
}

function notifyAdminSignup(user){
  if(!user?.email||!ADMIN_EMAIL)return;
  const name=`${user.firstName||""} ${user.lastName||""}`.trim()||"New user";
  sendConfiguredEmail("admin",ADMIN_EMAIL,`New ${user.role} signup — NextGenGrowth`,
    `<div style="font-family:Arial,sans-serif;padding:20px;max-width:520px;margin:0 auto">
      <h2>New ${user.role} signup</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
      <p><strong>Role:</strong> ${escapeHtml(user.role)}</p>
      <p><strong>Company/College:</strong> ${escapeHtml(user.companyName||user.college||"")}</p>
    </div>`).catch(err=>console.error("Admin alert email error:",err.message));
}

// ✅ NEW ADMIN API FOR APPROVING BRANDS
app.put("/api/admin/approve-brand/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user || user.role !== 'brand') return res.status(404).json({success: false, message: "Brand not found"});
    
    user.isApproved = true;
    await user.save();
    
    // Approval Email bhej rahe hain yahan se
    sendConfiguredEmail("welcome",user.email, "Welcome Aboard! Your Brand Account is Approved 🎉", brandApprovedEmail(user.firstName))
      .catch(err=>console.error("Brand approval email error:",err.message));
    
    res.json({success: true, message: "Brand approved and email sent!"});
  } catch (err) {
    res.status(500).json({success: false, message: "Server error."});
  }
});

app.get("/api/admin/stats",adminOnly,async(req,res)=>{
  try{
    const today=new Date();today.setHours(0,0,0,0);
    const[totalUsers,totalStudents,totalBrands,totalProjects,openProjects,totalApps,acceptedApps,todaySignups,earningsData,pendingData]=await Promise.all([
      User.countDocuments(),User.countDocuments({role:"student"}),User.countDocuments({role:"brand"}),
      Job.countDocuments(),Job.countDocuments({status:"open"}),
      Application.countDocuments(),Application.countDocuments({status:"accepted"}),
      User.countDocuments({createdAt:{$gte:today}}),
      Earning.aggregate([{$match:{status:"paid"}},{$group:{_id:null,total:{$sum:"$amount"}}}]),
      Earning.aggregate([{$match:{status:"pending"}},{$group:{_id:null,total:{$sum:"$amount"}}}]),
    ]);
    res.json({success:true,stats:{totalUsers,totalStudents,totalBrands,totalProjects,openProjects,totalApps,acceptedApps,totalEarnings:earningsData[0]?.total||0,pendingEarnings:pendingData[0]?.total||0,todaySignups}});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.get("/api/admin/settings",adminOnly,async(req,res)=>{
  try{
    const settings=await getPlatformSettings();
    res.json({success:true,settings});
  }catch(err){
    res.status(500).json({success:false,message:"Could not load settings."});
  }
});

app.put("/api/admin/settings",adminOnly,async(req,res)=>{
  try{
    const settings=await savePlatformSettings(req.body||{});
    res.json({success:true,message:"Settings saved.",settings});
  }catch(err){
    res.status(err.statusCode||500).json({success:false,message:err.message||"Could not save settings."});
  }
});

app.get("/api/admin/export",adminOnly,async(req,res)=>{
  try{
    const[users,projects,applications,earnings,payments,workspaces,blogPosts,newsletterSubscribers,settings]=await Promise.all([
      User.find().select("-password").lean(),
      Job.find().lean(),
      Application.find().lean(),
      Earning.find().lean(),
      Payment.find().lean(),
      ProjectWorkspace.find().lean(),
      BlogPost.find().lean(),
      NewsletterSubscriber.find().lean(),
      getPlatformSettings(),
    ]);
    res.json({
      success:true,
      exportedAt:new Date().toISOString(),
      counts:{
        users:users.length,
        projects:projects.length,
        applications:applications.length,
        earnings:earnings.length,
        payments:payments.length,
        workspaces:workspaces.length,
        blogPosts:blogPosts.length,
        newsletterSubscribers:newsletterSubscribers.length,
      },
      data:{users,projects,applications,earnings,payments,workspaces,blogPosts,newsletterSubscribers,settings},
    });
  }catch(err){
    res.status(500).json({success:false,message:"Could not export data."});
  }
});

app.delete("/api/admin/test-data",adminOnly,async(req,res)=>{
  try{
    const deleted=await clearTestData();
    res.json({success:true,message:"Test data cleared.",deleted});
  }catch(err){
    res.status(err.statusCode||500).json({success:false,message:err.message||"Could not clear test data."});
  }
});

app.get("/api/admin/blog/posts",adminOnly,async(req,res)=>{
  try{
    const posts=await BlogPost.find().sort({updatedAt:-1}).lean();
    res.json({success:true,posts:posts.map(normalizeBlogPost),categories:BLOG_CATEGORIES});
  }catch(err){
    res.status(500).json({success:false,message:"Could not load blog posts."});
  }
});

app.post("/api/admin/blog/posts",adminOnly,async(req,res)=>{
  try{
    const payload=buildBlogPayload(req.body);
    if(!payload.title)return res.status(400).json({success:false,message:"Title required."});
    if(!payload.content)return res.status(400).json({success:false,message:"Content required."});
    const exists=await BlogPost.findOne({slug:payload.slug}).select("_id");
    if(exists)return res.status(409).json({success:false,message:"Slug already exists."});
    const post=await BlogPost.create(payload);
    res.status(201).json({success:true,message:"Blog post saved.",post:normalizeBlogPost(post)});
  }catch(err){
    console.error("Admin blog create error:",err);
    res.status(500).json({success:false,message:"Could not save blog post."});
  }
});

app.put("/api/admin/blog/posts/:id",adminOnly,async(req,res)=>{
  try{
    const payload=buildBlogPayload(req.body);
    if(!payload.title)return res.status(400).json({success:false,message:"Title required."});
    if(!payload.content)return res.status(400).json({success:false,message:"Content required."});
    const exists=await BlogPost.findOne({slug:payload.slug,_id:{$ne:req.params.id}}).select("_id");
    if(exists)return res.status(409).json({success:false,message:"Slug already exists."});
    const post=await BlogPost.findByIdAndUpdate(req.params.id,{$set:payload},{new:true,runValidators:true});
    if(!post)return res.status(404).json({success:false,message:"Blog post not found."});
    res.json({success:true,message:"Blog post updated.",post:normalizeBlogPost(post)});
  }catch(err){
    console.error("Admin blog update error:",err);
    res.status(500).json({success:false,message:"Could not update blog post."});
  }
});

app.delete("/api/admin/blog/posts/:id",adminOnly,async(req,res)=>{
  try{
    const post=await BlogPost.findByIdAndDelete(req.params.id);
    if(!post)return res.status(404).json({success:false,message:"Blog post not found."});
    await BlogEvent.deleteMany({postId:post._id});
    res.json({success:true,message:"Blog post deleted."});
  }catch(err){
    res.status(500).json({success:false,message:"Could not delete blog post."});
  }
});

app.get("/api/admin/blog/analytics",adminOnly,async(req,res)=>{
  try{
    const[posts,events,subscribers]=await Promise.all([
      BlogPost.countDocuments(),
      BlogEvent.aggregate([{$group:{_id:"$event",total:{$sum:1}}}]),
      NewsletterSubscriber.countDocuments(),
    ]);
    res.json({success:true,analytics:{posts,subscribers,events}});
  }catch(err){
    res.status(500).json({success:false,message:"Could not load blog analytics."});
  }
});

app.get("/api/admin/kyc",adminOnly,async(req,res)=>{
  try{
    const users=await User.find({role:"student","payoutKyc.status":{$ne:"not_submitted"}})
      .select("firstName lastName email college payoutKyc createdAt updatedAt")
      .sort({"payoutKyc.submittedAt":-1});
    const students=users.map(u=>{
      const k=u.payoutKyc||{};
      return{
        id:u._id,
        name:`${u.firstName||""} ${u.lastName||""}`.trim()||"Student",
        email:u.email,
        college:u.college||"",
        kyc:{
          ...safePayoutKyc(k),
          bankAccountNumber:decryptSensitive(k.bankAccountNumberEncrypted),
        },
        updatedAt:u.updatedAt,
      };
    });
    res.json({success:true,students});
  }catch(err){
    console.error("Admin KYC list error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.put("/api/admin/kyc/:id",adminOnly,async(req,res)=>{
  try{
    const{status,rejectionReason}=req.body;
    if(!["verified","rejected","submitted"].includes(status)){
      return res.status(400).json({success:false,message:"Invalid KYC status."});
    }
    const update={
      "payoutKyc.status":status,
      "payoutKyc.rejectionReason":status==="rejected"?sanitizeText(rejectionReason,300):"",
    };
    if(status==="verified")update["payoutKyc.verifiedAt"]=new Date();
    const user=await User.findOneAndUpdate({_id:req.params.id,role:"student"},{$set:update},{new:true});
    if(!user)return res.status(404).json({success:false,message:"Student not found."});
    res.json({success:true,message:`KYC ${status}.`,kyc:safePayoutKyc(user.payoutKyc)});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.get("/api/admin/users",adminOnly,async(req,res)=>{
  try{
    const users=await User.find().select("-password").sort({createdAt:-1});
    res.json({success:true,users:users.map(u=>({...u.toObject(),name:`${u.firstName} ${u.lastName}`}))});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.delete("/api/admin/user/:id",adminOnly,async(req,res)=>{
  try{
    const deleted=await deleteUserCascade(req.params.id);
    res.json({success:true,message:`User deleted.`,deleted});
  }catch(err){res.status(err.statusCode||500).json({success:false,message:err.message||"Server error."});}
});

app.get("/api/admin/projects",adminOnly,async(req,res)=>{
  try{
    const projects=await Job.find().populate("brandId","firstName lastName email").sort({createdAt:-1});
    const result=projects.map(p=>({...p.toObject(),firstName:p.brandId?.firstName||"",lastName:p.brandId?.lastName||"",brandEmail:p.brandId?.email||""}));
    res.json({success:true,projects:result});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.delete("/api/admin/project/:id",adminOnly,async(req,res)=>{
  try{
    const deleted=await deleteProjectCascade(req.params.id);
    res.json({success:true,message:"Project deleted.",deleted});
  }
  catch(err){res.status(err.statusCode||500).json({success:false,message:err.message||"Server error."});}
});

app.get("/api/admin/applications",adminOnly,async(req,res)=>{
  try{
    const apps=await Application.find().populate("studentId","firstName lastName email").sort({createdAt:-1});
    const result=apps.map(a=>({...a.toObject(),firstName:a.studentId?.firstName||"",lastName:a.studentId?.lastName||"",studentEmail:a.studentId?.email||""}));
    res.json({success:true,applications:result});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.put("/api/admin/application/:id",adminOnly,async(req,res)=>{
  try{
    const app=await updateApplicationStatusAsAdmin(req.params.id,req.body.status);
    res.json({success:true,message:`Application marked ${app.status}.`,application:app});
  }catch(err){
    res.status(err.statusCode||500).json({success:false,message:err.message||"Server error."});
  }
});

app.get("/api/admin/transactions",adminOnly,async(req,res)=>{
  try{
    const txs=await Earning.find().populate("studentId","firstName lastName email").sort({createdAt:-1});
    const result=txs.map(t=>({...t.toObject(),firstName:t.studentId?.firstName||"",lastName:t.studentId?.lastName||"",email:t.studentId?.email||""}));
    res.json({success:true,transactions:result});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.post("/api/admin/earning",adminOnly,async(req,res)=>{
  try{
    const{studentId,amount,description,status}=req.body;
    requireObjectId(studentId,"student ID");
    if(!Number(amount)||Number(amount)<=0)return res.status(400).json({success:false,message:"Enter a valid amount."});
    if(!["paid","pending",undefined,null,""].includes(status))return res.status(400).json({success:false,message:"Invalid payment status."});
    const student=await User.findOne({_id:studentId,role:"student"});
    if(!student)return res.status(404).json({success:false,message:"Student not found."});
    await Earning.create({studentId,amount,description,status:status||"paid"});
    if(student?.email){
      sendConfiguredEmail("payment",student.email,"💰 Payment Received — NextGenGrowth",
        `<div style="font-family:Arial,sans-serif;padding:20px;max-width:500px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#0a7c44,#064e2b);border-radius:16px;padding:24px;text-align:center;color:white">
          <h2>💰 Payment Received!</h2><p style="font-size:2rem;font-weight:bold">₹${amount}</p><p>${description||"Project payment"}</p>
        </div>
        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#0a7c44;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:16px;font-weight:bold">View Earnings →</a></div>`)
        .catch(err=>console.error("Payment email error:",err.message));
    }
    res.json({success:true,message:"Earning added!"});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

// ═══════════════════════════════════════════
// PAGE ROUTES
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// PAGE ROUTES
// ═══════════════════════════════════════════
app.get("/blog",async(req,res)=>{
  const posts=await getPublishedBlogPosts({limit:40});
  const allPosts=await getPublishedBlogPosts({limit:80});
  res.send(renderBlogHome({posts,allPosts}));
});

app.get("/blog/search",async(req,res)=>{
  const search=String(req.query.q||"").trim().slice(0,80);
  const posts=await getPublishedBlogPosts({search,limit:40});
  const allPosts=await getPublishedBlogPosts({limit:80});
  if(search&&dbReady()){
    BlogEvent.create({event:"search",channel:"blog-search",metadata:{query:search},ip:req.ip,userAgent:req.get("user-agent")||""}).catch(()=>{});
  }
  res.send(renderBlogHome({posts,allPosts,search}));
});

app.get("/blog/author/:authorSlug",async(req,res)=>{
  const authorSlug=slugify(req.params.authorSlug);
  const allPosts=await getPublishedBlogPosts({limit:80});
  const posts=allPosts.filter(p=>p.authorSlug===authorSlug);
  if(!posts.length)return res.status(404).send(renderBlogHome({posts:allPosts.slice(0,6),allPosts,search:"Author not found"}));
  res.send(renderAuthorPage(authorSlug,posts));
});

app.get("/blog/:slug",async(req,res)=>{
  const slug=slugify(req.params.slug);
  const category=getBlogCategory(slug);
  const allPosts=await getPublishedBlogPosts({limit:80});
  if(category){
    const posts=await getPublishedBlogPosts({category:category.slug,limit:40});
    return res.send(renderBlogHome({posts,allPosts,category:category.slug}));
  }
  const post=await getBlogPostBySlug(slug);
  if(!post)return res.status(404).send(renderBlogHome({posts:allPosts.slice(0,6),allPosts,search:"Post not found"}));
  const related=allPosts
    .filter(p=>p.slug!==post.slug&&(p.category===post.category||p.tags.some(t=>post.tags.includes(t))))
    .slice(0,3);
  res.send(renderBlogPost(post,related.length?related:allPosts.filter(p=>p.slug!==post.slug).slice(0,3)));
});

app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"public","landing.html"))); // ✅ Changed this to landing.html
app.get("/login",(req,res)=>res.sendFile(path.join(__dirname,"public","login.html")));
app.get("/register",(req,res)=>res.sendFile(path.join(__dirname,"public","register.html")));
app.get("/privacy",(req,res)=>res.sendFile(path.join(__dirname,"public","privacy.html")));
app.get("/terms",(req,res)=>res.sendFile(path.join(__dirname,"public","terms.html")));
app.get("/refund-policy",(req,res)=>res.sendFile(path.join(__dirname,"public","refund-policy.html")));
app.get("/refund",(req,res)=>res.redirect(301,"/refund-policy"));
app.get("/contact",(req,res)=>res.sendFile(path.join(__dirname,"public","contact.html")));
app.get("/dashboard",(req,res)=>res.sendFile(path.join(__dirname,"public","dashboard.html")));
app.get("/brand-dashboard",(req,res)=>res.sendFile(path.join(__dirname,"public","brand-dashboard.html")));
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));

app.get("/robots.txt",(req,res)=>{
  res.type("text/plain").send(`User-agent: *
Allow: /
Sitemap: ${getBaseUrl()}/sitemap.xml
`);
});

app.get("/sitemap.xml",async(req,res)=>{
  const posts=await getPublishedBlogPosts({limit:500});
  const urls=[
    "/","/login","/register","/blog","/privacy","/terms","/refund-policy","/contact",
    ...BLOG_CATEGORIES.map(c=>`/blog/${c.slug}`),
    ...posts.map(p=>`/blog/${p.slug}`),
  ];
  const unique=[...new Set(urls)];
  const xml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique.map(url=>`  <url><loc>${escapeHtml(`${getBaseUrl()}${url}`)}</loc><changefreq>${url.startsWith("/blog/")?"weekly":"monthly"}</changefreq><priority>${url==="/"? "1.0":url==="/blog"?"0.9":"0.7"}</priority></url>`).join("\n")}
</urlset>`;
  res.type("application/xml").send(xml);
});

app.get("/api/health",async(req,res)=>{
  try{
    const[userCount,jobCount]=dbReady()
      ? await Promise.all([User.countDocuments(),Job.countDocuments()])
      : [0,0];
    const razorpayConfig=getRazorpayConfig();
    res.json({
      success:true,
      message:"NextGenGrowth API 🚀 v4",
      users:userCount,
      jobs:jobCount,
      database:dbReady()?"connected":"not connected",
      email:process.env.RESEND_API_KEY?"configured":"not configured",
      google:GOOGLE_CLIENT_ID?"configured":"not configured",
      razorpay:razorpayConfig.configured?"configured":"not configured",
      razorpayStatus:{
        keyId:razorpayConfig.keyId?"configured":"missing",
        keySecret:razorpayConfig.keySecret?"configured":"missing",
        mode:razorpayConfig.mode,
        missing:razorpayConfig.missing,
      },
    });
  }catch(err){
    res.status(500).json({success:false,message:"Health check failed.",error:err.message});
  }
});
// --- NEXTGEN GROWTH AI LOGIC START ---

// 1. Connect to Gemini 
const aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = aiClient.getGenerativeModel({ model: 'gemini-flash-latest' });

// 2. The API Route
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { userType, userMessage } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: "Please provide a message." });
    }

    // 3. Define Personas INSIDE the route so they can read the userMessage
    const prompts = {
      student: `
        You are the official AI Assistant for a platform called NextGen Growth.
        
        CRITICAL FACTS YOU MUST KNOW:
        - The sole founder and creator of NextGen Growth is Swatantra Shukla. 
        - If anyone asks who made this, who built this, or who the founder is, you must say "Swatantra Shukla".
        - NextGen Growth connects skilled students with brands for freelance projects.
        
        INSTRUCTIONS:
        - You are currently talking to a student. 
        - Keep your answers helpful, friendly, and formatted nicely.
        
        USER MESSAGE: 
        "${userMessage}"
      `,
      brand: `
        You are the official AI Account Manager for NextGen Growth.
        
        CRITICAL FACTS YOU MUST KNOW:
        - The sole founder and creator of NextGen Growth is Swatantra Shukla. 
        - If anyone asks who made this, who built this, or who the founder is, you must say "Swatantra Shukla".
        - NextGen Growth helps businesses and brands scale by connecting them with highly curated, top-tier student talent.
        
        YOUR PERSONA & TONE:
        - You are speaking to a Business or Brand Client.
        - Your tone must be highly professional, results-oriented, and focused on ROI.
        
        USER MESSAGE: 
        "${userMessage}"
      `
    };

    // 4. Select the right prompt based on who is asking (fallback to student if unknown)
    const systemPrompt = prompts[userType] || prompts.student;

    // 5. Send to Gemini
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Something went wrong communicating with the AI." });
  }
});
// --- NEXTGEN GROWTH AI LOGIC END ---
app.listen(PORT,()=>{
  const razorpayConfig=getRazorpayConfig();
  console.log(`\n🚀 Server: http://localhost:${PORT}`);
  console.log(`📧 Email:  ${process.env.RESEND_API_KEY?"Configured ✅":"Not configured ❌"}`);
  console.log(`🔑 Google: ${GOOGLE_CLIENT_ID?"Configured":"Not configured"}`);
  console.log(`💳 Razorpay: ${razorpayConfig.configured?`Configured ✅ (${razorpayConfig.mode})`:`Not configured ❌ missing ${razorpayConfig.missing.join(", ")}`}`);
  console.log(`🗄️  DB:    ${MONGO_URI?"MongoDB Atlas":"Not configured"}\n`);
});
