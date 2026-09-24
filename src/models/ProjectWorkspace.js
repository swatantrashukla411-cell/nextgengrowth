const mongoose = require("mongoose");

const projectWorkspaceSchema = new mongoose.Schema({
  applicationId:{type:mongoose.Schema.Types.ObjectId,ref:"Application",required:true,unique:true},
  jobId:{type:String,required:true},
  jobTitle:{type:String,default:""},
  brandId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  studentId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  brief:{type:String,default:""},
  resources:{type:[{title:{type:String,default:""},url:{type:String,default:""}}],default:[]},
  status:{type:String,enum:["resources_pending","in_progress","submitted","revision_requested","approved","completed"],default:"resources_pending"},
  submissionLink:{type:String,default:""},
  submissionNote:{type:String,default:""},
  revisionNote:{type:String,default:""},
  deadline:{type:String,default:""},
  submittedAt:{type:Date},
  approvedAt:{type:Date},
},{timestamps:true});

module.exports = mongoose.models.ProjectWorkspace || mongoose.model("ProjectWorkspace", projectWorkspaceSchema);
