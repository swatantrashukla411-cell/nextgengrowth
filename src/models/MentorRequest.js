const mongoose = require("mongoose");

const mentorRequestSchema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  name:{type:String,required:true,trim:true},
  email:{type:String,required:true,lowercase:true,trim:true},
  phone:{type:String,default:"",trim:true},
  expertise:{type:String,required:true,trim:true},
  experience:{type:String,default:"",trim:true},
  linkedin:{type:String,default:"",trim:true},
  portfolioLink:{type:String,default:"",trim:true},
  note:{type:String,default:"",trim:true},
  status:{type:String,enum:["pending","approved","rejected"],default:"pending"},
  reviewedAt:{type:Date},
},{timestamps:true});
mentorRequestSchema.index({email:1},{unique:true});
mentorRequestSchema.index({status:1,createdAt:-1});

module.exports = mongoose.models.MentorRequest || mongoose.model("MentorRequest", mentorRequestSchema);
