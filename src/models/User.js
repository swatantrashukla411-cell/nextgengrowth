const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName:{type:String,default:""}, // ✅ FIXED: required removed for Google Login
  lastName:{type:String,default:""},  // ✅ FIXED: required removed for Google Login
  email:{type:String,required:true,unique:true,lowercase:true},
  password:{type:String,default:""},
  role:{type:String,enum:["student","brand"],required:true},
  college:{type:String,default:""},
  year:{type:String,default:""},        // ✅ College year
  skills:{type:[String],default:[]},
  headline:{type:String,default:""},
  collegeId:{type:String,default:""},
  companyName:{type:String,default:""},
  serviceNeeded:{type:String,default:""},
  bio:{type:String,default:""},
  linkedin:{type:String,default:""},
  github:{type:String,default:""},
  behance:{type:String,default:""},
  portfolioLink:{type:String,default:""}, // ✅ Added Portfolio
  wallet:{
    availableBalance:{type:Number,default:0},
    pendingBalance:{type:Number,default:0},
    lifetimeEarned:{type:Number,default:0},
  },
  workSamples:{type:[{
    title:{type:String,default:""},
    category:{type:String,default:""},
    link:{type:String,default:""},
    description:{type:String,default:""},
  }],default:[]},
  studentBadge:{type:String,enum:["beginner","verified","top-rated"],default:"beginner"},
  verificationStatus:{type:String,enum:["not_applied","pending","verified","rejected"],default:"not_applied"},
  verificationCategory:{type:String,default:""},
  verificationSampleLink:{type:String,default:""},
  verificationAnswer:{type:String,default:""},
  verificationReviewNote:{type:String,default:""},
  verificationSubmittedAt:{type:Date},
  verifiedAt:{type:Date},
  complaintsCount:{type:Number,default:0},
  ratingAverage:{type:Number,default:0},
  ratingCount:{type:Number,default:0},
  googleId:{type:String,default:""},   // ✅ Google OAuth
  isVerified:{type:Boolean,default:false}, // ✅ Email verified
  avatar:{type:String,default:""},
  brandLink: { type: String, default: "" }, // LinkedIn/Website link store karne ke liye
  isApproved: { type: Boolean, default: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  payoutKyc:{
    legalName:{type:String,default:""},
    preferredPayout:{type:String,enum:["bank","upi"],default:"bank"},
    upiId:{type:String,default:""},
    bankAccountHolder:{type:String,default:""},
    bankName:{type:String,default:""},
    bankAccountNumberEncrypted:{type:String,default:""},
    bankAccountLast4:{type:String,default:""},
    ifsc:{type:String,default:""},
    status:{type:String,enum:["not_submitted","submitted","verified","rejected"],default:"not_submitted"},
    rejectionReason:{type:String,default:""},
    submittedAt:{type:Date},
    verifiedAt:{type:Date},
  }
},{timestamps:true});
userSchema.index({createdAt:-1});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
