const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema({
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  name:{type:String,default:""},
  source:{type:String,default:"blog"},
  tags:{type:[String],default:[]},
  subscribedAt:{type:Date,default:Date.now},
},{timestamps:true});

module.exports = mongoose.models.NewsletterSubscriber || mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);
