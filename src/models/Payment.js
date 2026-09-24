const mongoose = require("mongoose");

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

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
