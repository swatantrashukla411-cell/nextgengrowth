function registerStudentRoutes(app, dependencies) {
  const { ADMIN_EMAIL, Application, BASE_URL, Earning, Job, LongTermApplication, LongTermRole, MentorRequest, ProjectWorkspace, User, VERIFICATION_TASKS, cleanText, closeJobsWithAcceptedApplications, encryptSensitive, escapeHtml, formatIndianPhoneText, formatInrText, getProfileCompletion, getStudentBadgeInfo, getStudentRating, isDataAvatar, isValidUrl, longTermApplicationDTO, longTermRoleDTO, mongoose, safeMessage, safePayoutKyc, safeUser, sanitizeApplicationAnswers, sanitizeString, sanitizeText, sanitizeWorkSamples, sendConfiguredEmail, sendEmail, splitList, verifyToken } = dependencies;

// PROFILE
// ═══════════════════════════════════════════
app.get("/api/profile",verifyToken,async(req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    if(!user)return res.status(404).json({success:false,message:"User not found."});
    const userObj=safeUser(user);
    userObj.profileCompletion=getProfileCompletion(user);
    userObj.badge=getStudentBadgeInfo(user);
    userObj.verificationTask=VERIFICATION_TASKS[user.verificationCategory||"Other"]||VERIFICATION_TASKS.Other;
    res.json({success:true,user:userObj});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.put("/api/profile",verifyToken,async(req,res)=>{
  try{
    const{firstName,lastName,college,year,skills,bio,linkedin,portfolioLink,headline,collegeId,avatar,workSamples,companyName,serviceNeeded,brandLink}=req.body;
    const updates={};
    if(firstName!==undefined)updates.firstName=sanitizeString(firstName,60);
    if(lastName!==undefined)updates.lastName=sanitizeString(lastName,60);
    if(college!==undefined)updates.college=sanitizeString(college,120);
    if(year!==undefined)updates.year=sanitizeString(year,40);
    if(headline!==undefined)updates.headline=sanitizeString(headline,110);
    if(collegeId!==undefined)updates.collegeId=sanitizeString(collegeId,80);
    if(companyName!==undefined)updates.companyName=sanitizeString(companyName,140);
    if(serviceNeeded!==undefined)updates.serviceNeeded=sanitizeString(serviceNeeded,240);
    if(brandLink!==undefined)updates.brandLink=sanitizeString(brandLink,500);
    if(skills!==undefined)updates.skills=Array.isArray(skills)?skills.map(s=>sanitizeString(s,40)).filter(Boolean).slice(0,12):[];
    if(bio!==undefined)updates.bio=sanitizeString(bio,900);
    if(linkedin!==undefined)updates.linkedin=sanitizeString(linkedin,500);
    if(portfolioLink!==undefined)updates.portfolioLink=sanitizeString(portfolioLink,500);
    if(workSamples!==undefined)updates.workSamples=sanitizeWorkSamples(workSamples);
    if(avatar!==undefined){
      if(!isDataAvatar(avatar)&&String(avatar||"").trim())return res.status(400).json({success:false,message:"Profile photo is too large or invalid."});
      updates.avatar=String(avatar||"");
    }
    const updated=await User.findByIdAndUpdate(req.user.id,{$set:updates},{new:true,runValidators:false});
    const userObj=safeUser(updated);
    userObj.profileCompletion=getProfileCompletion(updated);
    userObj.badge=getStudentBadgeInfo(updated);
    res.json({success:true,message:"Profile updated!",user:userObj});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.put("/api/profile/avatar",verifyToken,async(req,res)=>{
  try{
    const avatar=String(req.body.avatar||"");
    if(!avatar)return res.status(400).json({success:false,message:"Profile photo required."});
    if(!isDataAvatar(avatar))return res.status(400).json({success:false,message:"Profile photo is too large or invalid."});
    const updated=await User.findByIdAndUpdate(req.user.id,{$set:{avatar}},{new:true,runValidators:false});
    if(!updated)return res.status(404).json({success:false,message:"User not found."});
    const userObj=safeUser(updated);
    userObj.profileCompletion=getProfileCompletion(updated);
    userObj.badge=getStudentBadgeInfo(updated);
    res.json({success:true,message:"Profile photo saved.",avatar:updated.avatar,user:userObj});
  }catch(err){
    res.status(500).json({success:false,message:"Could not save profile photo."});
  }
});

// ═══════════════════════════════════════════
// STUDENT REFERRAL DETAILS
// ═══════════════════════════════════════════
app.get("/api/student/referrals",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});
    const referredCount=await User.countDocuments({referredBy:req.user.id});
    const referrals=await User.find({referredBy:req.user.id}).select("firstName lastName college createdAt studentBadge");
    
    // Obfuscate last name for privacy
    const mappedReferrals = referrals.map(r => {
      const obj = r.toObject();
      obj.lastName = obj.lastName ? obj.lastName[0] + "..." : "";
      return obj;
    });

    res.json({
      success:true,
      referralCode:req.user.id, // User ID is the referral code
      referredCount,
      referrals: mappedReferrals
    });
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.post("/api/student/verification",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});
    const category=sanitizeString(req.body.category||"Other",60);
    const sampleLink=sanitizeString(req.body.sampleLink,500);
    const answer=sanitizeString(req.body.answer,800);
    if(!category)return res.status(400).json({success:false,message:"Select a verification category."});
    if(!sampleLink)return res.status(400).json({success:false,message:"Add one work sample link."});
    if(!answer)return res.status(400).json({success:false,message:"Answer the review question."});
    const task=VERIFICATION_TASKS[category]||VERIFICATION_TASKS.Other;
    const updated=await User.findByIdAndUpdate(req.user.id,{$set:{
      verificationStatus:"pending",
      verificationCategory:category,
      verificationSampleLink:sampleLink,
      verificationAnswer:answer,
      verificationSubmittedAt:new Date(),
    }},{new:true});
    if(ADMIN_EMAIL){
      sendConfiguredEmail("admin",ADMIN_EMAIL,"Student verification request — NextGenGrowth",
        `<div style="font-family:Arial,sans-serif;padding:20px;max-width:560px;margin:0 auto">
          <h2>Student verification request</h2>
          <p><strong>Student:</strong> ${escapeHtml(`${updated.firstName||""} ${updated.lastName||""}`.trim())}</p>
          <p><strong>Email:</strong> ${escapeHtml(updated.email)}</p>
          <p><strong>Category:</strong> ${escapeHtml(category)}</p>
          <p><strong>Task:</strong> ${escapeHtml(task)}</p>
          <p><strong>Sample:</strong> ${escapeHtml(sampleLink)}</p>
          <p><strong>Answer:</strong> ${escapeHtml(answer)}</p>
        </div>`).catch(err=>console.error("Verification admin alert error:",err.message));
    }
    const userObj=safeUser(updated);
    userObj.profileCompletion=getProfileCompletion(updated);
    userObj.badge=getStudentBadgeInfo(updated);
    res.json({success:true,message:"Verification request submitted for manual review.",user:userObj,task});
  }catch(err){
    console.error("Verification request error:",err);
    res.status(500).json({success:false,message:"Could not submit verification request."});
  }
});

app.get("/api/mentors",verifyToken,async(req,res)=>{
  try{
    const mentors=await MentorRequest.find({status:"approved"})
      .select("name expertise experience linkedin portfolioLink note updatedAt")
      .sort({updatedAt:-1})
      .limit(24)
      .lean();
    res.json({success:true,mentors});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.post("/api/mentor/apply",verifyToken,async(req,res)=>{
  try{
    const user=await User.findById(req.user.id).select("firstName lastName email linkedin portfolioLink");
    if(!user)return res.status(404).json({success:false,message:"User not found."});

    const name=String(req.body.name||`${user.firstName||""} ${user.lastName||""}`.trim()).trim();
    const expertise=String(req.body.expertise||"").trim();
    const experience=String(req.body.experience||"").trim();
    const phone=String(req.body.phone||"").trim();
    const linkedin=String(req.body.linkedin||user.linkedin||"").trim();
    const portfolioLink=String(req.body.portfolioLink||user.portfolioLink||"").trim();
    const note=String(req.body.note||"").trim();

    if(!name)return res.status(400).json({success:false,message:"Name is required."});
    if(!expertise)return res.status(400).json({success:false,message:"Expertise is required."});
    if(expertise.length>80)return res.status(400).json({success:false,message:"Expertise is too long."});
    if(note.length>800)return res.status(400).json({success:false,message:"Note is too long."});

    const request=await MentorRequest.findOneAndUpdate(
      {email:user.email.toLowerCase()},
      {$set:{userId:user._id,name,email:user.email.toLowerCase(),phone,expertise,experience,linkedin,portfolioLink,note,status:"pending",reviewedAt:null}},
      {new:true,upsert:true,setDefaultsOnInsert:true,runValidators:true}
    );

    if(ADMIN_EMAIL){
      sendConfiguredEmail("admin",ADMIN_EMAIL,"New mentor application — NextGenGrowth",
        `<div style="font-family:Arial,sans-serif;padding:20px;max-width:560px;margin:0 auto">
          <h2>New mentor application</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
          <p><strong>Expertise:</strong> ${escapeHtml(expertise)}</p>
          <p><strong>Experience:</strong> ${escapeHtml(experience||"Not listed")}</p>
          <p><strong>LinkedIn:</strong> ${escapeHtml(linkedin||"Not listed")}</p>
          <p><strong>Note:</strong> ${escapeHtml(note||"Not added")}</p>
        </div>`).catch(err=>console.error("Mentor admin alert error:",err.message));
    }

    res.json({success:true,message:"Mentor application submitted for review.",request});
  }catch(err){
    console.error("Mentor application error:",err);
    res.status(500).json({success:false,message:"Could not submit mentor application."});
  }
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
    await closeJobsWithAcceptedApplications();
    const jobs=await Job.find({status:"open"}).populate("brandId","firstName lastName companyName").sort({createdAt:-1});
    const jobIds=jobs.map(j=>String(j._id));
    const appCounts=await Application.aggregate([
      {$match:{jobId:{$in:jobIds}}},
      {$group:{_id:"$jobId",count:{$sum:1}}}
    ]);
    const countMap={};
    appCounts.forEach(c=>{
      countMap[c._id]=c.count;
    });
    const result=jobs.map(j=>({
      id:j._id,
      brandId:j.brandId?._id||j.brandId,
      ico:j.ico||(j.title?.includes("🏸")?"🏸":(j.category==="video"?"🎬":"🏢")),
      brand:j.brandName||`${j.brandId?.firstName||""} ${j.brandId?.lastName||""}`.trim(),
      title:j.title,
      cat:j.category,
      categoryPath:j.categoryPath||"",
      roleType:j.roleType||"",
      timeCommitment:j.timeCommitment||"",
      duration:j.duration||"",
      compensation:j.compensation||j.budget||"",
      tags:j.tags||[],
      pay:j.budget,
      days:j.deadline||"Flexible",
      badge:"hot",
      description:j.description,
      applicationQuestions:j.applicationQuestions||[],
      postedAt:j.createdAt,
      isLive:true,
      applicantCount:countMap[String(j._id)]||0,
    }));
    res.json({success:true,jobs:result,isDemoFallback:false});
  }catch(err){
    console.error("Jobs load error:",err.message);
    res.json({success:true,jobs:[],isDemoFallback:false});
  }
});

app.get("/api/student/brand/:id",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});
    if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid brand ID."});
    const brand=await User.findOne({_id:req.params.id,role:"brand"})
      .select("firstName lastName email companyName serviceNeeded bio linkedin portfolioLink brandLink avatar isApproved createdAt")
      .lean();
    if(!brand)return res.status(404).json({success:false,message:"Brand not found."});
    const[projects,projectCount,openProjects,completedWorkspaces]=await Promise.all([
      Job.find({brandId:brand._id}).select("title description budget category deadline status createdAt").sort({createdAt:-1}).limit(8).lean(),
      Job.countDocuments({brandId:brand._id}),
      Job.countDocuments({brandId:brand._id,status:"open"}),
      ProjectWorkspace.countDocuments({brandId:brand._id,status:{$in:["approved","completed"]}}),
    ]);
    res.json({
      success:true,
      brand:{
        id:brand._id,
        firstName:brand.firstName||"",
        lastName:brand.lastName||"",
        name:`${brand.firstName||""} ${brand.lastName||""}`.trim(),
        email:brand.email||"",
        companyName:brand.companyName||"",
        serviceNeeded:brand.serviceNeeded||"",
        bio:brand.bio||"",
        linkedin:brand.linkedin||"",
        portfolioLink:brand.portfolioLink||"",
        brandLink:brand.brandLink||"",
        avatar:brand.avatar||"",
        isApproved:true,
        joinedAt:brand.createdAt,
        stats:{projectCount,openProjects,completedWorkspaces},
        recentProjects:projects,
      },
    });
  }catch(err){
    console.error("Student brand profile error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.get("/api/student/long-term-roles",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});
    const roles=await LongTermRole.find({status:{$in:["open","shortlisting"]}})
      .populate("brandId","companyName firstName lastName avatar")
      .sort({createdAt:-1})
      .limit(80)
      .lean();
    const roleIds=roles.map(r=>r._id);
    const applications=await LongTermApplication.find({studentId:req.user.id,roleId:{$in:roleIds}})
      .select("roleId status introRequested contactUnlocked paidTrialConfirmed createdAt")
      .lean();
    const appMap=new Map(applications.map(a=>[String(a.roleId),a]));
    res.json({
      success:true,
      roles:roles.map(role=>longTermRoleDTO(role,{myApplication:appMap.get(String(role._id))||null})),
    });
  }catch(err){
    console.error("Student long-term roles error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.get("/api/student/long-term-applications",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});
    const applications=await LongTermApplication.find({studentId:req.user.id})
      .populate("roleId")
      .sort({createdAt:-1});
    res.json({success:true,applications:applications.map(a=>longTermApplicationDTO(a,{includeRole:true,showContact:true}))});
  }catch(err){
    console.error("Student long-term applications error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.post("/api/student/long-term-role/:id/apply",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Student only."});
    if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid role."});
    const role=await LongTermRole.findById(req.params.id);
    if(!role||!["open","shortlisting"].includes(role.status)){
      return res.status(404).json({success:false,message:"This long-term role is not accepting applications."});
    }
	    const existing=await LongTermApplication.findOne({roleId:role._id,studentId:req.user.id});
	    if(existing)return res.status(409).json({success:false,message:"You already applied for this long-term role."});
	    const student=await User.findById(req.user.id);
	    if(!student)return res.status(404).json({success:false,message:"Student not found."});
	    const skills=splitList(req.body.skills?.length?req.body.skills:student.skills,12);
	    const expectedMonthlyPay=formatInrText(req.body.expectedMonthlyPay)||cleanText(req.body.expectedMonthlyPay,80);
	    const application=await LongTermApplication.create({
	      roleId:role._id,
	      brandId:role.brandId,
	      studentId:req.user.id,
	      name:cleanText(req.body.name||`${student.firstName||""} ${student.lastName||""}`.trim(),120),
	      email:cleanText(req.body.email||student.email,160).toLowerCase(),
	      whatsapp:formatIndianPhoneText(req.body.whatsapp),
	      college:cleanText(req.body.college||student.college,140),
	      skills,
	      portfolioLink:cleanText(req.body.portfolioLink||student.portfolioLink,300),
	      availableHoursPerWeek:cleanText(req.body.availableHoursPerWeek||"10 hours/week",80),
	      expectedMonthlyPay,
	      pastExperience:cleanText(req.body.pastExperience,1000),
	      pitch:cleanText(req.body.pitch,1000),
	      badgeAtApply:student.studentBadge||"beginner",
	    });
	    const brandEmail=role.email||"";
	    if(brandEmail){
	      sendEmail(brandEmail,`New long-term role application — ${role.roleTitle}`,
	        `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px">
	          <h2 style="color:#064e2b;margin-bottom:8px">New Long-Term Application</h2>
	          <p><strong>Role:</strong> ${role.roleTitle}</p>
	          <p><strong>Student:</strong> ${application.name}</p>
	          <p><strong>Skills:</strong> ${skills.join(", ")||"Not listed"}</p>
	          <p><strong>Expected Pay:</strong> ${application.expectedMonthlyPay||"Not set"}</p>
	          <p><a href="${BASE_URL}/brand-dashboard" style="display:inline-block;background:#0a7c44;color:white;padding:12px 18px;border-radius:9px;text-decoration:none;font-weight:bold">View in Brand Dashboard</a></p>
	        </div>`).catch(err=>console.error("Long-term apply email error:",err.message));
	    }
	    res.status(201).json({success:true,message:"Applied for long-term role. Admin will shortlist suitable students.",application:longTermApplicationDTO(application,{showContact:true})});
  }catch(err){
    console.error("Long-term apply error:",err);
    res.status(err.code===11000?409:500).json({success:false,message:err.code===11000?"You already applied for this role.":"Server error."});
  }
});

// APPLY
app.post("/api/apply",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="student")return res.status(403).json({success:false,message:"Only students can apply."});
    const{jobId}=req.body;
    if(!mongoose.Types.ObjectId.isValid(String(jobId||""))){
      return res.status(400).json({success:false,message:"Invalid project."});
    }
    const existing=await Application.findOne({studentId:req.user.id,jobId});
    if(existing)return res.status(409).json({success:false,message:"Already applied for this project."});
    let job=await Job.findById(jobId);
    if(!job)return res.status(404).json({success:false,message:"Project not found."});
    if(job.status!=="open"){
      return res.status(400).json({success:false,message:"This project is already approved and closed for new applications."});
    }
    const selected=await Application.findOne({jobId:String(job._id),status:"accepted"}).select("_id");
    if(selected){
      await Job.findByIdAndUpdate(job._id,{$set:{status:"closed"}});
      return res.status(400).json({success:false,message:"This project already has an approved student."});
    }
    const student=await User.findById(req.user.id);
    if(!student)return res.status(404).json({success:false,message:"Student not found."});
    if((student.skills||[]).length<3||!student.portfolioLink||!(student.college||student.collegeId)){
      return res.status(400).json({success:false,message:"Complete your Beginner profile first: college/ID, portfolio link and at least 3 skill tags."});
    }
    const questions=job?.applicationQuestions||[];
    const answers=sanitizeApplicationAnswers(req.body.applicationAnswers,questions);
    if(questions.length&&answers.length<questions.length){
      return res.status(400).json({success:false,message:"Please answer all project questions before applying."});
    }
    const sid=new mongoose.Types.ObjectId(req.user.id);
    const completedWorks=await ProjectWorkspace.countDocuments({studentId:sid,status:{$in:["approved","completed"]}});
    const rating=getStudentRating(student,completedWorks);
    const badgeInfo=getStudentBadgeInfo(student,{completed:completedWorks,rating});
    await Application.create({
      studentId:req.user.id,
      jobId:String(job._id),
      jobTitle:job.title,
      brandName:job.brandName,
      brandId:job.brandId,
      pay:job.budget,
      studentBadgeAtApply:badgeInfo.level,
      applicationAnswers:answers,
    });
    const activeCount=await Application.countDocuments({studentId:req.user.id,status:"review"});
    // Email brand
    const brand=await User.findById(job.brandId);
    if(brand?.email){
      sendConfiguredEmail("application",brand.email,`📥 New Application for "${job.title}"!`,
        `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px">
        <div style="background:linear-gradient(135deg,#0a7c44,#064e2b);border-radius:16px;padding:24px;text-align:center;color:white;margin-bottom:20px">
          <h2 style="margin:0">📥 New Application!</h2>
        </div>
        <div style="background:white;border-radius:16px;padding:24px;border:1px solid #d1ead9">
          <p><strong>Student:</strong> ${student.firstName} ${student.lastName}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Badge:</strong> ${badgeInfo.label}</p>
          <p><strong>Skills:</strong> ${student.skills.join(", ")||"Not listed"}</p>
          <p><strong>Project:</strong> ${job.title}</p>
          <a href="${BASE_URL}/brand-dashboard" style="display:inline-block;background:#0a7c44;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Review Application →</a>
        </div></div>`).catch(err=>console.error("Application alert email error:",err.message));
    }
    res.json({success:true,message:`Applied for "${job.title}"! 🎉`,activeApplications:activeCount});
  }catch(err){console.error("Apply error:",err);res.status(500).json({success:false,message:"Server error."});}
});

// ═══════════════════════════════════════════

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
}

module.exports = { registerStudentRoutes };
