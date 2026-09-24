const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  brandName:{type:String,required:true},
  title:{type:String,required:true},
  description:{type:String,default:""},
  budget:{type:String,required:true},
  budgetAmount:{type:Number,default:0},
  jobType:{
    type:String,
    enum:["fixed_project","milestone_based","monthly_retainer"],
    default:"fixed_project"
  },
  category:{type:String,required:true},
  categoryPath:{type:String,default:""},
  roleType:{type:String,default:""},
  timeCommitment:{type:String,default:""},
  duration:{type:String,default:""},
  scopeDuration:{type:String,default:""},
  compensation:{type:String,default:""},
  ico:{type:String,default:""},
  tags:{type:[String],default:[]},
  applicationQuestions:{type:[String],default:[]},
  screeningQuestions:{type:[String],default:[]},
  deadline:{type:String,default:""},
  status:{type:String,enum:["open","closed","in_progress"],default:"open"},
},{timestamps:true});
jobSchema.index({createdAt:-1});

module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema);
