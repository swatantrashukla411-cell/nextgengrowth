const mongoose = require("mongoose");

const platformSettingSchema = new mongoose.Schema({
  key:{type:String,default:"main",unique:true},
  commissionRate:{type:Number,default:10,min:0,max:50},
  minProjectBudget:{type:Number,default:0,min:0},
  maxProjectBudget:{type:Number,default:50000,min:0},
  features:{
    studentRegistrations:{type:Boolean,default:true},
    brandRegistrations:{type:Boolean,default:true},
    projectPosting:{type:Boolean,default:true},
    maintenanceMode:{type:Boolean,default:false},
  },
  emails:{
    welcomeEmail:{type:Boolean,default:true},
    applicationAlert:{type:Boolean,default:true},
    paymentConfirmation:{type:Boolean,default:true},
    adminAlerts:{type:Boolean,default:false},
  },
},{timestamps:true});

module.exports = mongoose.models.PlatformSetting || mongoose.model("PlatformSetting", platformSettingSchema);
