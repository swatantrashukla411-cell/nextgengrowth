require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;

const couponSchema = new mongoose.Schema({
  couponId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  campaignId: { type: String, default: "BWC_COLLEGE_2026" },
  discountType: { type: String, default: "percentage" },
  discountValue: { type: Number, default: 20 },
  status: { type: String, enum: ["unused", "redeemed"], default: "unused", index: true },
  storeId: { type: String, default: null },
  storeName: { type: String, default: null },
  redeemedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const storeSchema = new mongoose.Schema({
  storeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  city: { type: String, default: "Delhi" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
const Store = mongoose.models.Store || mongoose.model("Store", storeSchema);

async function runTest() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected successfully!");

    // Seed stores if empty
    const storeCount = await Store.countDocuments();
    if (storeCount === 0) {
      await Store.insertMany([
        { storeId: "STORE001", name: "Kamla Nagar", city: "Delhi" },
        { storeId: "STORE002", name: "Hudson Lane", city: "Delhi" },
        { storeId: "STORE003", name: "Connaught Place", city: "Delhi" }
      ]);
      console.log("✅ Stores seeded!");
    }

    const stores = await Store.find();
    console.log("📍 Active Stores:", stores.map(s => `${s.name} (${s.storeId})`));

    // Reset or Seed BW000001 test coupon
    let coupon = await Coupon.findOne({ couponId: "BW000001" });
    if (!coupon) {
      coupon = await Coupon.create({
        couponId: "BW000001",
        campaignId: "BWC_COLLEGE_2026",
        discountType: "percentage",
        discountValue: 20,
        status: "unused"
      });
      console.log("✅ Test Coupon BW000001 created!");
    } else {
      // Reset coupon to unused for fresh testing
      coupon.status = "unused";
      coupon.storeId = null;
      coupon.storeName = null;
      coupon.redeemedAt = null;
      await coupon.save();
      console.log("🔄 Reset BW000001 to status: 'unused' for testing!");
    }

    console.log("🔍 Coupon Status:", coupon.couponId, "->", coupon.status);
    process.exit(0);
  } catch (err) {
    console.error("❌ Test Failed:", err);
    process.exit(1);
  }
}

runTest();
