function registerPaymentRoutes(app, dependencies) {
  const { Application, Payment, authLimiter, brandOwnsApplication, createRazorpayOrder, finalizeVerifiedPayment, formatINR, getMinimumAmount, getRazorpayClient, getRazorpayConfig, getRazorpayErrorStatus, isValidRazorpaySignature, notifyStudentPaymentSecured, verifyToken } = dependencies;

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
}

module.exports = { registerPaymentRoutes };
