const mongoose = require("mongoose");

const blogEventSchema = new mongoose.Schema({
  postId:{type:mongoose.Schema.Types.ObjectId,ref:"BlogPost"},
  slug:{type:String,default:""},
  event:{type:String,enum:["view","share","cta_click","newsletter_signup","feedback","search"],required:true},
  channel:{type:String,default:""},
  metadata:{type:Object,default:{}},
  ip:{type:String,default:""},
  userAgent:{type:String,default:""},
},{timestamps:true});

module.exports = mongoose.models.BlogEvent || mongoose.model("BlogEvent", blogEventSchema);
