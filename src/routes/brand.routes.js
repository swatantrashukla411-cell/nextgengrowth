function registerBrandRoutes(app, dependencies) {
  const { Application, BASE_URL, Earning, Job, LongTermApplication, LongTermRole, ProjectWorkspace, User, acceptedEmail, approveApplicationAndCloseProject, brandOwnsApplication, cleanResources, cleanText, closeJobsWithAcceptedApplications, ensureWorkspaceForApplication, formatIndianPhoneText, formatInrText, getPlatformSettings, getProfileCompletion, getStudentBadgeInfo, getStudentRating, longTermApplicationDTO, longTermRoleDTO, mongoose, rejectedEmail, requireObjectId, safeMessage, safeUser, sanitizeApplicationQuestions, sendConfiguredEmail, sendEmail, splitList, verifyToken } = dependencies;

// BRAND ROUTES
// ═══════════════════════════════════════════
app.get("/api/brand/stats",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    await closeJobsWithAcceptedApplications(req.user.id);
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
    
    const brand=await User.findById(req.user.id);

    const{title,description,budget,category,deadline,tags,applicationQuestions}=req.body;
    const cleanDescription=String(description||"").trim();
    if(!title||!cleanDescription||!budget||!category)return res.status(400).json({success:false,message:"Title, description, budget and category required."});

    const brandName=brand.companyName||`${brand.firstName} ${brand.lastName}`;
    const job=await Job.create({
      brandId:req.user.id,brandName,
      title,description:cleanDescription,budget,category,
      deadline:deadline||"",tags:tags||[],applicationQuestions:sanitizeApplicationQuestions(applicationQuestions),
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
      .populate("studentId","firstName lastName email college year skills headline bio linkedin portfolioLink avatar workSamples studentBadge verificationStatus complaintsCount ratingAverage ratingCount") // ✅ Added fields
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
        headline:a.studentId?.headline||"",
        bio:a.studentId?.bio||"",
        linkedin:a.studentId?.linkedin||"",
        portfolioLink:a.studentId?.portfolioLink||"", // ✅ Added field
        avatar:a.studentId?.avatar||"",               // ✅ Added field
        workSamples:a.studentId?.workSamples||[],
        badge:getStudentBadgeInfo(a.studentId||{},{}),
      }
    }));
    res.json({success:true,applications:result});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.get("/api/brand/students",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const students=await User.find({role:"student"})
      .select("firstName lastName college year skills headline bio linkedin portfolioLink avatar workSamples studentBadge verificationStatus complaintsCount ratingAverage ratingCount createdAt updatedAt")
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
      const rating=getStudentRating(s,completed);
      const badge=getStudentBadgeInfo(s,{completed,rating});
      return{
        id,
        name:`${s.firstName||""} ${s.lastName||""}`.trim()||"Student",
        firstName:s.firstName||"",
        lastName:s.lastName||"",
        college:s.college||"",
        year:s.year||"",
        skills:s.skills||[],
        headline:s.headline||"",
        bio:s.bio||"",
        linkedin:s.linkedin||"",
        portfolioLink:s.portfolioLink||"",
        avatar:s.avatar||"",
        workSamples:s.workSamples||[],
        badge,
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

app.get("/api/brand/long-term-roles",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const roles=await LongTermRole.find({brandId:req.user.id}).sort({createdAt:-1}).lean();
    const roleIds=roles.map(r=>r._id);
    const applications=await LongTermApplication.find({
      roleId:{$in:roleIds},
      status:{$in:["shortlisted","trial","hired"]},
    })
      .populate("studentId","firstName lastName email college skills portfolioLink avatar studentBadge verificationStatus")
      .sort({createdAt:-1});
    const appMap=new Map();
    applications.forEach(app=>{
      const key=String(app.roleId);
      if(!appMap.has(key))appMap.set(key,[]);
      appMap.get(key).push(longTermApplicationDTO(app));
    });
    res.json({
      success:true,
      roles:roles.map(role=>longTermRoleDTO(role,{applications:appMap.get(String(role._id))||[]})),
    });
  }catch(err){
    console.error("Brand long-term roles error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.post("/api/brand/long-term-role",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    const brand=await User.findById(req.user.id);
    if(!brand)return res.status(404).json({success:false,message:"Brand not found."});
    const roleTitle=cleanText(req.body.roleTitle||req.body.title,140);
    const monthlyBudget=formatInrText(req.body.monthlyBudget);
    if(!roleTitle||!monthlyBudget)return res.status(400).json({success:false,message:"Role title and monthly budget are required."});
    const workType=cleanText(req.body.workType,20).toLowerCase();
    const role=await LongTermRole.create({
      brandId:req.user.id,
      brandName:cleanText(req.body.brandName||brand.companyName||`${brand.firstName||""} ${brand.lastName||""}`.trim(),140),
      managerName:cleanText(req.body.managerName||`${brand.firstName||""} ${brand.lastName||""}`.trim(),120),
      email:cleanText(req.body.email||brand.email,160).toLowerCase(),
      whatsapp:formatIndianPhoneText(req.body.whatsapp),
      roleTitle,
      skillsNeeded:splitList(req.body.skillsNeeded||req.body.skills,14),
      monthlyBudget,
      duration:cleanText(req.body.duration,60)||"1 month",
      workType:["remote","on-site","hybrid"].includes(workType)?workType:"remote",
      hoursPerWeek:cleanText(req.body.hoursPerWeek,60)||"10 hours/week",
      expectedWeeklyOutput:cleanText(req.body.expectedWeeklyOutput,500),
      trialTask:cleanText(req.body.trialTask,1000),
      trialPay:formatInrText(req.body.trialPay),
      startTimeline:cleanText(req.body.startTimeline,120)||"Within 7 days",
    });
    res.status(201).json({success:true,message:"Long-term hiring request saved. NextGenGrowth will shortlist 3 suitable students.",role:longTermRoleDTO(role)});
  }catch(err){
    console.error("Brand long-term role create error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.post("/api/brand/long-term-application/:id/request-intro",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid application."});
    const application=await LongTermApplication.findById(req.params.id);
    if(!application)return res.status(404).json({success:false,message:"Application not found."});
    if(!["shortlisted","trial","hired"].includes(application.status)){
      return res.status(400).json({success:false,message:"Admin has not shortlisted this student yet."});
    }
    const role=await LongTermRole.findOne({_id:application.roleId,brandId:req.user.id});
    if(!role)return res.status(403).json({success:false,message:"This application does not belong to your brand."});
    application.introRequested=true;
    application.introRequestedAt=new Date();
    await application.save();
    res.json({success:true,message:"Intro call requested. Admin will unlock contact after paid trial confirmation.",application:longTermApplicationDTO(application)});
  }catch(err){
    console.error("Intro request error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.get("/api/brand/student/:id/profile",verifyToken,async(req,res)=>{
  try{
    if(req.user.role!=="brand")return res.status(403).json({success:false,message:"Brand only."});
    requireObjectId(req.params.id,"student ID");
    const student=await User.findOne({_id:req.params.id,role:"student"})
      .select("firstName lastName email college year skills headline collegeId bio linkedin portfolioLink avatar workSamples studentBadge verificationStatus verificationCategory complaintsCount ratingAverage ratingCount createdAt updatedAt")
      .lean();
    if(!student)return res.status(404).json({success:false,message:"Student not found."});

    const sid=new mongoose.Types.ObjectId(req.params.id);
    const[applications,approvedWork,earnings,totalApps,acceptedApps,completedWorks]=await Promise.all([
      Application.find({studentId:sid}).sort({createdAt:-1}).limit(8).lean(),
      ProjectWorkspace.find({studentId:sid,status:{$in:["approved","completed"]}}).sort({approvedAt:-1,updatedAt:-1}).limit(6).lean(),
      Earning.aggregate([{$match:{studentId:sid,status:"paid"}},{$group:{_id:null,total:{$sum:"$amount"}}}]),
      Application.countDocuments({studentId:sid}),
      Application.countDocuments({studentId:sid,status:"accepted"}),
      ProjectWorkspace.countDocuments({studentId:sid,status:{$in:["approved","completed"]}}),
    ]);

    const completed=completedWorks||0;
    const rating=getStudentRating(student,completed);
    const badge=getStudentBadgeInfo(student,{completed,rating});
    res.json({
      success:true,
      student:safeUser(student),
      stats:{rating,totalApps,acceptedApps,completed,totalEarned:earnings[0]?.total||0},
      badge,
      profileCompletion:getProfileCompletion(student),
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
    if(app.paymentStatus==="paid"&&status==="rejected"){
      return res.status(400).json({success:false,message:"Paid applications cannot be rejected."});
    }
    let approvalResult=null;
    if(status==="accepted"){
      approvalResult=await approveApplicationAndCloseProject(app);
    }else{
      app.status=status;
      await app.save();
    }
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
    const autoRejected=approvalResult?.rejectedCount||0;
    const extra=status==="accepted"&&autoRejected?` ${autoRejected} other application(s) were auto-rejected and the project is now closed.`:"";
    res.json({success:true,message:`Application ${status}! Email sent. ✅${extra}`});
  }catch(err){res.status(err.statusCode||500).json({success:false,message:err.message||"Server error."});}
});

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
}

module.exports = { registerBrandRoutes };
