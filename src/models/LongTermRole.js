const mongoose = require("mongoose");

const longTermRoleSchema = new mongoose.Schema({
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  brandName:{type:String,default:""},
  managerName:{type:String,default:""},
  email:{type:String,default:""},
  whatsapp:{type:String,default:""},
  roleTitle:{type:String,required:true},
  description:{type:String,default:""},
  categoryPath:{type:String,default:""},
  skillsNeeded:{type:[String],default:[]},
  monthlyBudget:{type:String,required:true},
  duration:{type:String,default:"1 month"},
  workType:{type:String,enum:["remote","on-site","hybrid"],default:"remote"},
  hoursPerWeek:{type:String,default:""},
  expectedWeeklyOutput:{type:String,default:""},
  trialTask:{type:String,default:""},
  trialPay:{type:String,default:""},
  startTimeline:{type:String,default:""},
  status:{type:String,enum:["open","shortlisting","trial","active","closed"],default:"open"},
  adminNotes:{type:String,default:""},
},{timestamps:true});
longTermRoleSchema.index({brandId:1,status:1,createdAt:-1});

module.exports = mongoose.models.LongTermRole || mongoose.model("LongTermRole", longTermRoleSchema);
