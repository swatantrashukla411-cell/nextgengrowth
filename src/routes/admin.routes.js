function registerAdminRoutes(app, dependencies) {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_TOKEN_COOKIE, Application, BASE_URL, BLOG_CATEGORIES, BlogEvent, BlogPost, Earning, IS_PRODUCTION, JWT_SECRET, Job, LongTermApplication, LongTermRole, MentorRequest, NewsletterSubscriber, OTP, Payment, ProjectWorkspace, User, VERIFICATION_TASKS, acceptedEmail, adminOnly, apiError, approveApplicationAndCloseProject, authLimiter, cleanText, decryptSensitive, escapeHtml, getBlogCategory, getPlatformSettings, getProfileCompletion, getStudentBadgeInfo, getStudentRating, isValidUrl, jwt, longTermApplicationDTO, longTermRoleDTO, mongoose, normalizeBlogPost, normalizeTags, rejectedEmail, requireObjectId, safeMessage, safePayoutKyc, safeUser, sanitizeString, sanitizeText, savePlatformSettings, sendConfiguredEmail, slugify, stripMarkdown } = dependencies;

// ADMIN ROUTES
// ═══════════════════════════════════════════

app.post("/api/admin/login", authLimiter, (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(503).json({ success: false, message: "Admin login is not configured." });
  }
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Invalid admin credentials." });
  }
  const token = jwt.sign({ role: "admin", email }, JWT_SECRET, { expiresIn: "1d" });
  res.cookie(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
  return res.json({ success: true, token, message: "Welcome back, Admin! 👑" });
});

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
    await approveApplicationAndCloseProject(app);
  }else{
    app.status=status;
    await app.save();
  }
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
    const[users,projects,applications,earnings,payments,workspaces,longTermRoles,longTermApplications,blogPosts,newsletterSubscribers,settings]=await Promise.all([
      User.find().select("-password").lean(),
      Job.find().lean(),
      Application.find().lean(),
      Earning.find().lean(),
      Payment.find().lean(),
      ProjectWorkspace.find().lean(),
      LongTermRole.find().lean(),
      LongTermApplication.find().lean(),
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
        longTermRoles:longTermRoles.length,
        longTermApplications:longTermApplications.length,
        blogPosts:blogPosts.length,
        newsletterSubscribers:newsletterSubscribers.length,
      },
      data:{users,projects,applications,earnings,payments,workspaces,longTermRoles,longTermApplications,blogPosts,newsletterSubscribers,settings},
    });
  }catch(err){
    res.status(500).json({success:false,message:"Could not export data."});
  }
});

app.get("/api/admin/student-emails",adminOnly,async(req,res)=>{
  try{
    const students=await User.find({role:"student"}).select("firstName lastName email createdAt").lean();
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const uniqueEmails=new Set();
    const validStudents=[];
    
    for(const student of students){
      if(!student.email)continue;
      const cleanEmail=student.email.trim().toLowerCase();
      if(emailRegex.test(cleanEmail)){
        if(!uniqueEmails.has(cleanEmail)){
          uniqueEmails.add(cleanEmail);
          validStudents.push({
            firstName:student.firstName||"",
            lastName:student.lastName||"",
            email:cleanEmail,
            joinedDate:student.createdAt?new Date(student.createdAt).toISOString().split('T')[0]:"",
          });
        }
      }
    }
    
    if(req.query.format==="csv"){
      let csvContent="First Name,Last Name,Email,Joined Date\n";
      for(const s of validStudents){
        const fName=s.firstName.replace(/"/g,'""');
        const lName=s.lastName.replace(/"/g,'""');
        csvContent+=`"${fName}","${lName}","${s.email}","${s.joinedDate}"\n`;
      }
      res.setHeader("Content-Type","text/csv");
      res.setHeader("Content-Disposition","attachment; filename=students_emails.csv");
      return res.status(200).send(csvContent);
    }
    
    res.json({
      success:true,
      totalRegisteredStudents:students.length,
      totalValidUniqueStudents:validStudents.length,
      emails:Array.from(uniqueEmails),
      students:validStudents,
    });
  }catch(err){
    console.error("Error exporting student emails:",err);
    res.status(500).json({success:false,message:"Could not retrieve student emails."});
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

app.get("/api/admin/long-term-roles",adminOnly,async(req,res)=>{
  try{
    const roles=await LongTermRole.find()
      .populate("brandId","firstName lastName companyName email avatar")
      .sort({createdAt:-1})
      .lean();
    const roleIds=roles.map(r=>r._id);
    const applications=await LongTermApplication.find({roleId:{$in:roleIds}})
      .populate("studentId","firstName lastName email college skills portfolioLink avatar studentBadge verificationStatus")
      .sort({createdAt:-1});
    const appMap=new Map();
    applications.forEach(app=>{
      const key=String(app.roleId);
      if(!appMap.has(key))appMap.set(key,[]);
      appMap.get(key).push(longTermApplicationDTO(app,{showContact:true}));
    });
    res.json({
      success:true,
      roles:roles.map(role=>longTermRoleDTO(role,{
        brand:{
          id:role.brandId?._id||role.brandId,
          name:role.brandName||role.brandId?.companyName||`${role.brandId?.firstName||""} ${role.brandId?.lastName||""}`.trim(),
          email:role.brandId?.email||role.email||"",
          avatar:role.brandId?.avatar||"",
        },
        applications:appMap.get(String(role._id))||[],
      })),
    });
  }catch(err){
    console.error("Admin long-term roles error:",err);
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.put("/api/admin/long-term-role/:id",adminOnly,async(req,res)=>{
  try{
    if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid role."});
    const allowedStatus=["open","shortlisting","trial","active","closed"];
    const update={};
    if(req.body.status!==undefined){
      if(!allowedStatus.includes(req.body.status))return res.status(400).json({success:false,message:"Invalid role status."});
      update.status=req.body.status;
    }
    if(req.body.adminNotes!==undefined)update.adminNotes=cleanText(req.body.adminNotes,1000);
    if(req.body.trialPay!==undefined)update.trialPay=cleanText(req.body.trialPay,80);
    const role=await LongTermRole.findByIdAndUpdate(req.params.id,{$set:update},{new:true,runValidators:true});
    if(!role)return res.status(404).json({success:false,message:"Role not found."});
    res.json({success:true,message:"Long-term role updated.",role:longTermRoleDTO(role)});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.put("/api/admin/long-term-application/:id",adminOnly,async(req,res)=>{
  try{
    if(!mongoose.Types.ObjectId.isValid(req.params.id))return res.status(400).json({success:false,message:"Invalid application."});
    const allowedStatus=["applied","shortlisted","rejected","trial","hired"];
    const update={};
    if(req.body.status!==undefined){
      if(!allowedStatus.includes(req.body.status))return res.status(400).json({success:false,message:"Invalid application status."});
      update.status=req.body.status;
    }
    if(req.body.contactUnlocked===true&&req.body.paidTrialConfirmed!==true){
      const current=await LongTermApplication.findById(req.params.id).select("paidTrialConfirmed").lean();
      if(!current)return res.status(404).json({success:false,message:"Application not found."});
      if(!current.paidTrialConfirmed){
        return res.status(400).json({success:false,message:"Confirm paid trial before unlocking contact."});
      }
    }
    if(req.body.contactUnlocked!==undefined){
      update.contactUnlocked=!!req.body.contactUnlocked;
      update.contactUnlockedAt=req.body.contactUnlocked?new Date():null;
    }
    if(req.body.paidTrialConfirmed!==undefined)update.paidTrialConfirmed=!!req.body.paidTrialConfirmed;
    if(req.body.trialPay!==undefined)update.trialPay=cleanText(req.body.trialPay,80);
    if(req.body.weeklyStatus!==undefined)update.weeklyStatus=cleanText(req.body.weeklyStatus,1000);
    if(req.body.adminNotes!==undefined)update.adminNotes=cleanText(req.body.adminNotes,1000);
    const application=await LongTermApplication.findByIdAndUpdate(req.params.id,{$set:update},{new:true,runValidators:true})
      .populate("studentId","firstName lastName email college skills portfolioLink avatar studentBadge verificationStatus");
    if(!application)return res.status(404).json({success:false,message:"Application not found."});
    if(update.status==="shortlisted"){
      await LongTermRole.findByIdAndUpdate(application.roleId,{$set:{status:"shortlisting"}});
    }
    if(update.status==="trial"){
      await LongTermRole.findByIdAndUpdate(application.roleId,{$set:{status:"trial"}});
    }
    if(update.status==="hired"){
      await LongTermRole.findByIdAndUpdate(application.roleId,{$set:{status:"active"}});
    }
    res.json({success:true,message:"Long-term application updated.",application:longTermApplicationDTO(application,{showContact:true})});
  }catch(err){
    console.error("Admin long-term application update error:",err);
    res.status(500).json({success:false,message:"Server error."});
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
      .select("firstName lastName email college avatar payoutKyc createdAt updatedAt")
      .sort({"payoutKyc.submittedAt":-1});
    const students=users.map(u=>{
      const k=u.payoutKyc||{};
      return{
        id:u._id,
        name:`${u.firstName||""} ${u.lastName||""}`.trim()||"Student",
        email:u.email,
        college:u.college||"",
        avatar:u.avatar||"",
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
    const users=await User.find()
      .select("firstName lastName email role college companyName studentBadge createdAt avatar skills")
      .sort({createdAt:-1});
    res.json({success:true,users:users.map(u=>({...u.toObject(),name:`${u.firstName} ${u.lastName}`}))});
  }catch(err){res.status(500).json({success:false,message:"Server error."});}
});

app.get("/api/admin/mentor-requests",adminOnly,async(req,res)=>{
  try{
    const requests=await MentorRequest.find()
      .populate("userId","firstName lastName email role college companyName")
      .sort({createdAt:-1})
      .lean();
    res.json({success:true,requests});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.get("/api/admin/student-verifications",adminOnly,async(req,res)=>{
  try{
    const students=await User.find({role:"student",verificationStatus:{$in:["pending","verified","rejected"]}})
      .select("firstName lastName email college year skills headline portfolioLink workSamples avatar studentBadge verificationStatus verificationCategory verificationSampleLink verificationAnswer verificationReviewNote verificationSubmittedAt verifiedAt complaintsCount ratingAverage ratingCount")
      .sort({verificationSubmittedAt:-1,updatedAt:-1})
      .lean();
    res.json({success:true,students:students.map(s=>({
      ...safeUser(s),
      badge:getStudentBadgeInfo(s),
      verificationTask:VERIFICATION_TASKS[s.verificationCategory||"Other"]||VERIFICATION_TASKS.Other,
      profileCompletion:getProfileCompletion(s),
    }))});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.put("/api/admin/student-verification/:id",adminOnly,async(req,res)=>{
  try{
    requireObjectId(req.params.id,"student ID");
    const{status}=req.body;
    if(!["verified","rejected","pending"].includes(status)){
      return res.status(400).json({success:false,message:"Invalid verification status."});
    }
    const update={verificationStatus:status};
    if(status==="verified"){update.studentBadge="verified";update.verifiedAt=new Date();update.verificationReviewNote=sanitizeString(req.body.reason||"Approved",300);}
    if(status==="rejected"){update.studentBadge="beginner";update.verifiedAt=null;update.verificationReviewNote=sanitizeString(req.body.reason||"Needs stronger proof of work.",300);}
    if(status==="pending"){update.studentBadge="beginner";update.verifiedAt=null;}
    const student=await User.findOneAndUpdate({_id:req.params.id,role:"student"},{$set:update},{new:true}).select("-password").lean();
    if(!student)return res.status(404).json({success:false,message:"Student not found."});
    res.json({success:true,message:`Student verification ${status}.`,student:{...safeUser(student),badge:getStudentBadgeInfo(student),profileCompletion:getProfileCompletion(student)}});
  }catch(err){
    res.status(err.statusCode||500).json({success:false,message:err.message||"Server error."});
  }
});

app.put("/api/admin/mentor-request/:id",adminOnly,async(req,res)=>{
  try{
    requireObjectId(req.params.id,"mentor request ID");
    const{status}=req.body;
    if(!["approved","rejected","pending"].includes(status)){
      return res.status(400).json({success:false,message:"Invalid mentor request status."});
    }
    const request=await MentorRequest.findByIdAndUpdate(
      req.params.id,
      {$set:{status,reviewedAt:status==="pending"?null:new Date()}},
      {new:true,runValidators:true}
    ).lean();
    if(!request)return res.status(404).json({success:false,message:"Mentor request not found."});
    res.json({success:true,message:`Mentor request ${status}.`,request});
  }catch(err){
    res.status(500).json({success:false,message:"Server error."});
  }
});

app.get("/api/admin/student/:id/profile",adminOnly,async(req,res)=>{
  try{
    requireObjectId(req.params.id,"student ID");
    const student=await User.findOne({_id:req.params.id,role:"student"}).select("-password").lean();
    if(!student)return res.status(404).json({success:false,message:"Student not found."});

    const sid=new mongoose.Types.ObjectId(req.params.id);
    const[
      recentApplications,
      recentWorks,
      recentEarnings,
      totalApps,
      reviewApps,
      acceptedApps,
      rejectedApps,
      completedWorks,
      paidData,
      pendingData,
    ]=await Promise.all([
      Application.find({studentId:sid}).sort({createdAt:-1}).limit(10).lean(),
      ProjectWorkspace.find({studentId:sid}).populate("brandId","firstName lastName companyName email").sort({updatedAt:-1}).limit(8).lean(),
      Earning.find({studentId:sid}).sort({createdAt:-1}).limit(8).lean(),
      Application.countDocuments({studentId:sid}),
      Application.countDocuments({studentId:sid,status:"review"}),
      Application.countDocuments({studentId:sid,status:"accepted"}),
      Application.countDocuments({studentId:sid,status:"rejected"}),
      ProjectWorkspace.countDocuments({studentId:sid,status:{$in:["approved","completed"]}}),
      Earning.aggregate([{$match:{studentId:sid,status:"paid"}},{$group:{_id:null,total:{$sum:"$amount"}}}]),
      Earning.aggregate([{$match:{studentId:sid,status:"pending"}},{$group:{_id:null,total:{$sum:"$amount"}}}]),
    ]);

    const kyc=student.payoutKyc||{};
    const rating=getStudentRating(student,completedWorks);
    const badge=getStudentBadgeInfo(student,{completed:completedWorks,rating});
    res.json({
      success:true,
      student:safeUser(student),
      badge,
      profileCompletion:getProfileCompletion(student),
      stats:{
        rating,
        totalApps,
        reviewApps,
        acceptedApps,
        rejectedApps,
        completedWorks,
        totalEarned:paidData[0]?.total||0,
        pendingAmount:pendingData[0]?.total||0,
      },
      kyc:{
        ...safePayoutKyc(kyc),
        bankAccountNumber:decryptSensitive(kyc.bankAccountNumberEncrypted),
      },
      recentApplications:recentApplications.map(a=>({
        id:a._id,
        jobTitle:a.jobTitle,
        brandName:a.brandName,
        pay:a.pay,
        status:a.status,
        paymentStatus:a.paymentStatus,
        paidAmount:a.paidAmount||0,
        createdAt:a.createdAt,
      })),
      recentWorks:recentWorks.map(w=>({
        id:w._id,
        jobTitle:w.jobTitle,
        brandName:w.brandId?.companyName||`${w.brandId?.firstName||""} ${w.brandId?.lastName||""}`.trim(),
        brandEmail:w.brandId?.email||"",
        status:w.status,
        deadline:w.deadline,
        submissionLink:w.submissionLink,
        submissionNote:w.submissionNote,
        approvedAt:w.approvedAt,
        submittedAt:w.submittedAt,
        updatedAt:w.updatedAt,
      })),
      recentEarnings:recentEarnings.map(e=>({
        id:e._id,
        amount:e.amount,
        description:e.description,
        status:e.status,
        createdAt:e.createdAt,
      })),
    });
  }catch(err){
    console.error("Admin student profile error:",err);
    res.status(err.statusCode||500).json({success:false,message:err.message||"Server error."});
  }
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
    const apps=await Application.find().populate("studentId","firstName lastName email avatar studentBadge verificationStatus").sort({createdAt:-1});
    const result=apps.map(a=>({...a.toObject(),firstName:a.studentId?.firstName||"",lastName:a.studentId?.lastName||"",studentEmail:a.studentId?.email||"",studentAvatar:a.studentId?.avatar||"",studentBadge:a.studentBadgeAtApply||a.studentId?.studentBadge||"beginner",verificationStatus:a.studentId?.verificationStatus||"not_applied"}));
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
    const txs=await Earning.find().populate("studentId","firstName lastName email avatar").sort({createdAt:-1});
    const result=txs.map(t=>({...t.toObject(),firstName:t.studentId?.firstName||"",lastName:t.studentId?.lastName||"",email:t.studentId?.email||"",avatar:t.studentId?.avatar||""}));
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
}

module.exports = { registerAdminRoutes };
