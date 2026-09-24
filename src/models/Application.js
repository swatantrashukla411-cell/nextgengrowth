const mongoose = require("mongoose");

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
  studentBadgeAtApply:{type:String,enum:["beginner","verified","top-rated"],default:"beginner"},
  applicationAnswers:{type:[{
    question:{type:String,default:""},
    answer:{type:String,default:""},
  }],default:[]},
},{timestamps:true});
applicationSchema.index({createdAt:-1});

module.exports = mongoose.models.Application || mongoose.model("Application", applicationSchema);
