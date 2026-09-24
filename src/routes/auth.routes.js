function registerAuthRoutes(app, dependencies) {
  const { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GoogleStrategy, OTP, User, authLimiter, bcrypt, generateOTP, generateToken, getPlatformSettings, mongoose, normalizeRole, notifyAdminSignup, otpEmailTemplate, passport, resetPasswordEmailTemplate, safeUser, sendAuthSuccessPage, sendConfiguredEmail, sendEmail, welcomeEmail } = dependencies;

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
    const ref=req.query.ref; // Capture referral
    req.session.googleRole=role;
    if(ref) req.session.googleRef=ref;
    req.session.save((err)=>{
      if(err)return next(err);
      passport.authenticate("google",{
        scope:["profile","email"],
        state:role,
        prompt:"select_account",
      })(req,res,next);
    });
  });

  async function finishGoogleAuth(req,res,user){
      try{
        const u=user;
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

          // Resolve referral
          let refId = null;
          const refRaw = req.session.googleRef;
          if(refRaw && mongoose.Types.ObjectId.isValid(refRaw)){
            const referrer = await User.findById(refRaw);
            if(referrer && referrer.role === "student"){
              refId = referrer._id;
            }
          }

          const newUser=await User.create({
            firstName: fName,
            lastName: lName,
            email:profile.emails[0].value.toLowerCase(),
            password:"",role,
            googleId:profile.id,
            avatar:profile.photos?.[0]?.value||"",
            isVerified:true,
            isApproved:true,
            referredBy:refId,
          });

          // Check Referral Milestone
          if(refId){
            const referralCount = await User.countDocuments({ referredBy: refId });
            if(referralCount >= 3){
              const referrerUser = await User.findById(refId);
              if(referrerUser && referrerUser.studentBadge === "beginner"){
                referrerUser.studentBadge = "verified";
                await referrerUser.save();
                console.log(`🎉 Referrer ${referrerUser.email} has reached 3 referrals via Google Auth! Unlocked 'verified' badge.`);
              }
            }
          }

          const token=generateToken(newUser);
          
          sendConfiguredEmail("welcome",newUser.email, `Welcome to NextGenGrowth! 🎉`, welcomeEmail(newUser.firstName, role))
            .catch(err=>console.error("Welcome email error:",err.message));
          notifyAdminSignup(newUser);

          return sendAuthSuccessPage(res,token,safeUser(newUser));
        }
        if(requestedRole&&u.role!==requestedRole){
          return res.redirect(`/login?error=role_mismatch&selected=${encodeURIComponent(requestedRole)}&actual=${encodeURIComponent(u.role)}`);
        }
        const token=generateToken(u);
        sendAuthSuccessPage(res,token,safeUser(u));
      }catch(err){
        console.error("Google callback error:",err);
        res.redirect("/login?error=google_failed");
      }
  }

  app.get("/auth/google/callback",(req,res,next)=>{
    passport.authenticate("google",{session:false},(err,user,info)=>{
      if(err){
        console.error("Google OAuth token error:",err.message||err);
        return res.redirect("/login?error=google_failed");
      }
      if(!user){
        console.error("Google OAuth failed:",info?.message||"No user returned");
        return res.redirect("/login?error=google_failed");
      }
      return finishGoogleAuth(req,res,user);
    })(req,res,next);
  });
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

app.post("/api/forgot-password/send-otp",authLimiter,async(req,res)=>{
  try{
    const email=String(req.body.email||"").trim().toLowerCase();
    if(!email)return res.status(400).json({success:false,message:"Email required."});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({success:false,message:"Invalid email format."});
    const user=await User.findOne({email});
    if(!user)return res.status(404).json({success:false,message:"No account found with this email."});
    if(user.googleId&&!user.password)return res.status(400).json({success:false,message:"This account uses Google Sign-In. Please continue with Google."});

    await OTP.deleteMany({email});
    const otp=generateOTP();
    const expiresAt=new Date(Date.now()+10*60*1000);
    await OTP.create({email,otp,expiresAt});
    await sendEmail(email,`${otp} — Reset Your NextGenGrowth Password`,resetPasswordEmailTemplate(user.firstName||"User",otp));
    res.json({success:true,message:"Reset code sent to your email."});
  }catch(err){
    console.error("Forgot password OTP error:",err);
    res.status(500).json({success:false,message:"Could not send reset code. Check email config."});
  }
});

app.post("/api/forgot-password/reset",authLimiter,async(req,res)=>{
  try{
    const email=String(req.body.email||"").trim().toLowerCase();
    const otp=String(req.body.otp||"").trim();
    const password=String(req.body.password||"");
    if(!email||!otp||!password)return res.status(400).json({success:false,message:"Email, OTP and new password required."});
    if(password.length<8)return res.status(400).json({success:false,message:"Password must be 8+ characters."});
    const record=await OTP.findOne({email,otp}).sort({createdAt:-1});
    if(!record)return res.status(400).json({success:false,message:"Invalid reset code."});
    if(record.expiresAt<new Date())return res.status(400).json({success:false,message:"Reset code expired. Request a new one."});
    const user=await User.findOne({email});
    if(!user)return res.status(404).json({success:false,message:"Account not found."});
    if(user.googleId&&!user.password)return res.status(400).json({success:false,message:"This account uses Google Sign-In. Please continue with Google."});
    user.password=await bcrypt.hash(password,12);
    await user.save();
    await OTP.deleteMany({email});
    res.json({success:true,message:"Password reset successfully. Please login."});
  }catch(err){
    console.error("Password reset error:",err);
    res.status(500).json({success:false,message:"Could not reset password."});
  }
});

// ═══════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════
app.post("/api/register",authLimiter,async(req,res)=>{
  try{
    const{firstName,lastName,email,password,role,college,year,skills,companyName,serviceNeeded,brandLink,referredBy}=req.body;
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
    
    // Resolve referral
    let refId = null;
    if(referredBy && mongoose.Types.ObjectId.isValid(referredBy)){
      const referrer = await User.findById(referredBy);
      if(referrer && referrer.role === "student"){
        refId = referrer._id;
      }
    }

    const hashedPwd=await bcrypt.hash(password,12);
    const newUser=await User.create({
      firstName,lastName,email:email.toLowerCase(),password:hashedPwd,
      role:normalizedRole,college:college||"",year:year||"",
      skills:skills||[],companyName:companyName||"",brandLink:brandLink||"",serviceNeeded:serviceNeeded||"",
      isVerified:true,
      isApproved:true,
      referredBy:refId,
    });
    
    // Check Referral Milestone
    if(refId){
      const referralCount = await User.countDocuments({ referredBy: refId });
      if(referralCount >= 3){
        const referrerUser = await User.findById(refId);
        if(referrerUser && referrerUser.studentBadge === "beginner"){
          referrerUser.studentBadge = "verified";
          await referrerUser.save();
          console.log(`🎉 Referrer ${referrerUser.email} has reached 3 referrals! Unlocked 'verified' badge.`);
        }
      }
    }

    // Clean up OTP
    await OTP.deleteMany({email:email.toLowerCase()});
    const token=generateToken(newUser);

    sendConfiguredEmail("welcome",email, `Welcome to NextGenGrowth, ${firstName}! 🎉`, welcomeEmail(firstName, normalizedRole))
      .catch(err=>console.error("Welcome email error:",err.message));
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
}

module.exports = { registerAuthRoutes };

function registerLogoutRoute(app, dependencies) {
  const { ADMIN_TOKEN_COOKIE } = dependencies;
  app.post("/api/logout",(req,res)=>{
  const finish=()=>res.clearCookie("connect.sid").json({success:true,message:"Logged out."});
  const destroySession=()=>req.session?req.session.destroy(()=>finish()):finish();
  try{
    if(typeof req.logout==="function"){
      return req.logout(()=>destroySession());
    }
    return destroySession();
  }catch(err){
    return destroySession();
  }
});
}

module.exports.registerLogoutRoute = registerLogoutRoute;
