const mongoose = require("mongoose");

const longTermApplicationSchema = new mongoose.Schema({
  roleId:{type:mongoose.Schema.Types.ObjectId,ref:"LongTermRole",required:true},
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  studentId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  name:{type:String,default:""},
  email:{type:String,default:""},
  whatsapp:{type:String,default:""},
  college:{type:String,default:""},
  skills:{type:[String],default:[]},
  portfolioLink:{type:String,default:""},
  availableHoursPerWeek:{type:String,default:""},
  expectedMonthlyPay:{type:String,default:""},
  pastExperience:{type:String,default:""},
  pitch:{type:String,default:""},
  badgeAtApply:{type:String,enum:["beginner","verified","top-rated"],default:"beginner"},
  status:{type:String,enum:["applied","shortlisted","rejected","trial","hired"],default:"applied"},
  introRequested:{type:Boolean,default:false},
  introRequestedAt:{type:Date},
  contactUnlocked:{type:Boolean,default:false},
  contactUnlockedAt:{type:Date},
  paidTrialConfirmed:{type:Boolean,default:false},
  trialPay:{type:String,default:""},
  weeklyStatus:{type:String,default:""},
  adminNotes:{type:String,default:""},
},{timestamps:true});
longTermApplicationSchema.index({roleId:1,studentId:1},{unique:true});
longTermApplicationSchema.index({brandId:1,status:1,createdAt:-1});

module.exports = mongoose.models.LongTermApplication || mongoose.model("LongTermApplication", longTermApplicationSchema);
