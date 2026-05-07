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

const razorpay = process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id:process.env.RAZORPAY_KEY_ID,
      key_secret:process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// ═══════════════════════════════════════════
// MONGODB
// ═══════════════════════════════════════════
mongoose.connect(MONGO_URI)
  .then(()=>console.log("✅ MongoDB Connected!"))
  .catch(err=>console.error("❌ MongoDB Error:",err));

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
  isApproved: { type: Boolean, default: false }
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

const User        = mongoose.model("User",userSchema);
const OTP         = mongoose.model("OTP",otpSchema);
const Application = mongoose.model("Application",applicationSchema);
const Earning     = mongoose.model("Earning",earningSchema);
const Job         = mongoose.model("Job",jobSchema);
const Payment     = mongoose.model("Payment",paymentSchema);
const ProjectWorkspace = mongoose.model("ProjectWorkspace",projectWorkspaceSchema);

console.log("✅ All models loaded!");

function getMinimumAmount(value){
  const matches=String(value||"").replace(/,/g,"").match(/\d+(?:\.\d+)?/g);
  const amount=matches?.length?Number(matches[0]):0;
  return Number.isFinite(amount)&&amount>0?amount:1;
}

function formatINR(amount){
  return `₹${Number(amount||0).toLocaleString("en-IN")}`;
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

// ═══════════════════════════════════════════
// EMAIL
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// EMAIL (RESEND API)
// ═══════════════════════════════════════════
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  try {
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
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"public")));
app.set("trust proxy",1);
app.use(session({secret:JWT_SECRET,resave:false,saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());

const authLimiter=rateLimit({windowMs:15*60*1000,max:20,message:{success:false,message:"Too many attempts."}});

function generateToken(user){
  return jwt.sign({id:user._id,email:user.email,role:user.role,name:`${user.firstName} ${user.lastName}`},JWT_SECRET,{expiresIn:"7d"});
}
function verifyToken(req,res,next){
  const token=(req.headers["authorization"]||"").split(" ")[1];
  if(!token)return res.status(401).json({success:false,message:"No token."});
  try{req.user=jwt.verify(token,JWT_SECRET);next();}
  catch{res.status(403).json({success:false,message:"Invalid token."});}
}
function safeUser(user){
  const u=user.toObject?user.toObject():user;
  delete u.password;u.name=`${u.firstName} ${u.lastName}`;return u;
}
function generateOTP(){
  return Math.floor(100000+Math.random()*900000).toString();
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
    const role=req.query.role||"student";
    req.session.googleRole=role;
    passport.authenticate("google",{scope:["profile","email"],state:role})(req,res,next);
  });

  app.get("/auth/google/callback",
    passport.authenticate("google",{failureRedirect:"/login?error=google_failed"}),
    async(req,res)=>{
      try{
        const u=req.user;
        if(u.isNew||u.googleProfile){
          // New user — redirect to complete profile
          const role=req.session.googleRole||"student";
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
            avatar:profile.photos[0]?.value||"",
            isVerified:true,
          });
          const token=generateToken(newUser);
          
          // ✅ BRAND PENDING MAIL CHECK HERE
          if (role === 'brand') {
            sendEmail(newUser.email, "Action Required: Your Brand Verification is Under Review — NextGenGrowth", brandPendingEmail(newUser.firstName));
          } else {
            sendEmail(newUser.email, `Welcome to NextGenGrowth! 🎉`, welcomeEmail(newUser.firstName, role));
          }

          return res.redirect(`/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify(safeUser(newUser)))}`);
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
    const{email,name}=req.body;
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
    const{firstName,lastName,email,password,role,college,year,skills,companyName,serviceNeeded}=req.body;
    if(!firstName||!lastName||!email||!password||!role)
      return res.status(400).json({success:false,message:"All fields required."});
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
      role,college:college||"",year:year||"",
      skills:skills||[],companyName:companyName||"",serviceNeeded:serviceNeeded||"",
      isVerified:true,
    });
    // Clean up OTP
    await OTP.deleteMany({email:email.toLowerCase()});
    const token=generateToken(newUser);

    // ✅ BRAND PENDING MAIL CHECK HERE FOR MANUAL REGISTER
    if (role === 'brand') {
      sendEmail(email, "Action Required: Your Brand Verification is Under Review — NextGenGrowth", brandPendingEmail(firstName));
    } else {
      sendEmail(email, `Welcome to NextGenGrowth, ${firstName}! 🎉`, welcomeEmail(firstName, role));
    }

    console.log(`✅ Registered [${role}]: ${email}`);
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
      sendEmail(brand.email,`📥 New Application for "${jobTitle}"!`,
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
        </div></div>`);
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
    
    // ✅ ADMIN VERIFICATION CHECK ADDED HERE
    const brand=await User.findById(req.user.id);
    if(!brand.isApproved) {
      return res.status(403).json({success:false,message:"Aapka account verification pending hai. Admin approval ke baad hi aap project post kar payenge."});
    }

    const{title,description,budget,category,deadline,tags}=req.body;
    if(!title||!budget||!category)return res.status(400).json({success:false,message:"Title, budget and category required."});
    
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
        sendEmail(student.email,`🎉 Your application was ACCEPTED! — ${app.jobTitle}`,acceptedEmail(student.firstName,app.jobTitle,app.brandName));
      }else{
        sendEmail(student.email,`Application Update — ${app.jobTitle}`,rejectedEmail(student.firstName,app.jobTitle));
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
app.post("/api/payment/create-order",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    if(!razorpay){
      return res.status(500).json({success:false,message:"Razorpay credentials are not configured."});
    }

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

    const order=await razorpay.orders.create({
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
      amount:amountInPaise,
      currency:"INR",
      key:process.env.RAZORPAY_KEY_ID,
      studentName:`${application.studentId.firstName} ${application.studentId.lastName}`.trim(),
      jobTitle:application.jobTitle,
    });
  }catch(err){
    console.error("Payment create-order error:",err);
    res.status(500).json({success:false,message:"Could not create payment order. Check Razorpay credentials."});
  }
});

app.post("/api/payment/verify",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    if(!process.env.RAZORPAY_KEY_SECRET)return res.status(500).json({success:false,message:"Razorpay credentials are not configured."});
    const{razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
    if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature){
      return res.status(400).json({success:false,message:"Missing payment verification fields."});
    }

    const expectedSig=crypto
      .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if(expectedSig!==razorpay_signature){
      return res.status(400).json({success:false,message:"Payment signature mismatch. Verification failed."});
    }

    const payment=await Payment.findOne({razorpayOrderId:razorpay_order_id});
    if(!payment)return res.status(404).json({success:false,message:"Payment record not found."});
    if(String(payment.brandId)!==String(req.user.id))return res.status(403).json({success:false,message:"You can only verify your own payments."});
    if(payment.status==="paid")return res.json({success:true,message:"Payment already verified."});

    payment.razorpayPaymentId=razorpay_payment_id;
    payment.razorpaySignature=razorpay_signature;
    payment.status="paid";
    await payment.save();

    await Application.findByIdAndUpdate(payment.applicationId,{
      paymentStatus:"paid",
      paidAmount:payment.amount,
    });

    await ensureWorkspaceForApplication(payment.applicationId,payment.brandId);

    await Earning.create({
      studentId:payment.studentId,
      applicationId:payment.applicationId,
      amount:payment.amount,
      description:payment.description,
      status:"pending",
    });

    const student=await User.findById(payment.studentId);
    if(student?.email){
      sendEmail(
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

    res.json({success:true,message:"Payment verified! Student has been notified. ✅"});
  }catch(err){
    console.error("Payment verify error:",err);
    res.status(500).json({success:false,message:"Payment verification failed."});
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

// ✅ NEW ADMIN API FOR APPROVING BRANDS
app.put("/api/admin/approve-brand/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user || user.role !== 'brand') return res.status(404).json({success: false, message: "Brand not found"});
    
    user.isApproved = true;
    await user.save();
    
    // Approval Email bhej rahe hain yahan se
    sendEmail(user.email, "Welcome Aboard! Your Brand Account is Approved 🎉", brandApprovedEmail(user.firstName));
    
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

app.get("/api/admin/users",adminOnly,async(req,res)=>{
  try{
    const users=await User.find().select("-password").sort({createdAt:-1});
    res.json({success:true,users:users.map(u=>({...u.toObject(),name:`${u.firstName} ${u.lastName}`}))});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.delete("/api/admin/user/:id",adminOnly,async(req,res)=>{
  try{
    const user=await User.findById(req.params.id);
    if(!user)return res.status(404).json({success:false,message:"Not found."});
    await User.findByIdAndDelete(req.params.id);
    await Application.deleteMany({studentId:req.params.id});
    res.json({success:true,message:`User deleted.`});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.get("/api/admin/projects",adminOnly,async(req,res)=>{
  try{
    const projects=await Job.find().populate("brandId","firstName lastName email").sort({createdAt:-1});
    const result=projects.map(p=>({...p.toObject(),firstName:p.brandId?.firstName||"",lastName:p.brandId?.lastName||"",brandEmail:p.brandId?.email||""}));
    res.json({success:true,projects:result});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.delete("/api/admin/project/:id",adminOnly,async(req,res)=>{
  try{await Job.findByIdAndDelete(req.params.id);res.json({success:true,message:"Project deleted."});}
  catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.get("/api/admin/applications",adminOnly,async(req,res)=>{
  try{
    const apps=await Application.find().populate("studentId","firstName lastName email").sort({createdAt:-1});
    const result=apps.map(a=>({...a.toObject(),firstName:a.studentId?.firstName||"",lastName:a.studentId?.lastName||"",studentEmail:a.studentId?.email||""}));
    res.json({success:true,applications:result});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
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
    await Earning.create({studentId,amount,description,status:status||"paid"});
    const student=await User.findById(studentId);
    if(student?.email){
      sendEmail(student.email,"💰 Payment Received — NextGenGrowth",
        `<div style="font-family:Arial,sans-serif;padding:20px;max-width:500px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#0a7c44,#064e2b);border-radius:16px;padding:24px;text-align:center;color:white">
          <h2>💰 Payment Received!</h2><p style="font-size:2rem;font-weight:bold">₹${amount}</p><p>${description||"Project payment"}</p>
        </div>
        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#0a7c44;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;margin-top:16px;font-weight:bold">View Earnings →</a></div>`);
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
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"public","landing.html"))); // ✅ Changed this to landing.html
app.get("/login",(req,res)=>res.sendFile(path.join(__dirname,"public","login.html")));
app.get("/register",(req,res)=>res.sendFile(path.join(__dirname,"public","register.html")));
app.get("/dashboard",(req,res)=>res.sendFile(path.join(__dirname,"public","dashboard.html")));
app.get("/brand-dashboard",(req,res)=>res.sendFile(path.join(__dirname,"public","brand-dashboard.html")));
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));

app.get("/api/health",async(req,res)=>{
  const userCount=await User.countDocuments();
  const jobCount=await Job.countDocuments();
  res.json({success:true,message:"NextGenGrowth API 🚀 v4",users:userCount,jobs:jobCount,email:process.env.RESEND_API_KEY?"configured":"not configured",google:GOOGLE_CLIENT_ID?"configured":"not configured",razorpay:process.env.RAZORPAY_KEY_ID?"configured":"not configured"});
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
  console.log(`\n🚀 Server: http://localhost:${PORT}`);
  console.log(`📧 Email:  ${process.env.RESEND_API_KEY?"Configured ✅":"Not configured ❌"}`);
  console.log(`🔑 Google: ${GOOGLE_CLIENT_ID?"Configured":"Not configured"}`);
  console.log(`💳 Razorpay: ${process.env.RAZORPAY_KEY_ID?"Configured ✅":"Not configured ❌"}`);
  console.log(`🗄️  DB:    MongoDB Atlas\n`);
});
