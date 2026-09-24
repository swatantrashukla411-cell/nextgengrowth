const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  title:{type:String,required:true,trim:true},
  slug:{type:String,required:true,unique:true,lowercase:true,trim:true},
  category:{type:String,required:true,default:"marketing",trim:true},
  tags:{type:[String],default:[]},
  featuredImage:{type:String,default:""},
  excerpt:{type:String,default:""},
  content:{type:String,default:""},
  seoTitle:{type:String,default:""},
  seoDescription:{type:String,default:""},
  status:{type:String,enum:["draft","published"],default:"draft"},
  authorName:{type:String,default:"NextGenGrowth Team"},
  authorSlug:{type:String,default:"nextgengrowth-team"},
  featured:{type:Boolean,default:false},
  publishAt:{type:Date},
  views:{type:Number,default:0},
  ctaClicks:{type:Number,default:0},
  shareClicks:{type:Number,default:0},
  newsletterSignups:{type:Number,default:0},
},{timestamps:true});
blogPostSchema.index({status:1,publishAt:-1,createdAt:-1});
blogPostSchema.index({category:1,status:1,publishAt:-1});
blogPostSchema.index({title:"text",excerpt:"text",content:"text",tags:"text"});

module.exports = mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);
