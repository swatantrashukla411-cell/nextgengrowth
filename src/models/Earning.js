const mongoose = require("mongoose");

const earningSchema = new mongoose.Schema({
  studentId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  applicationId:{type:mongoose.Schema.Types.ObjectId,ref:"Application"},
  amount:{type:Number,required:true},
  description:{type:String,default:"Project payment"},
  status:{type:String,enum:["paid","pending"],default:"paid"},
},{timestamps:true});
earningSchema.index({createdAt:-1});

module.exports = mongoose.models.Earning || mongoose.model("Earning", earningSchema);
