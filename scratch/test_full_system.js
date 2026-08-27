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

async function runVerification() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected!");

    // 1. Verify Stores
    const stores = await Store.find({ isActive: true });
    console.log("📍 Active Stores in DB:", stores.map(s => s.name).join(", "));

    // 2. Verify Test Coupon BW000001
    let coupon = await Coupon.findOne({ couponId: "BW000001" });
    if (!coupon) {
      coupon = await Coupon.create({ couponId: "BW000001", discountValue: 20, status: "unused" });
    }
    console.log("🎫 Coupon BW000001 Status:", coupon.status);

    // 3. Test Bulk Generation of 5 coupons
    const prefix = "BW";
    const existing = await Coupon.find({ couponId: new RegExp(`^${prefix}\\d+`, 'i') }).select('couponId');
    let maxNum = 0;
    existing.forEach(c => {
      const match = c.couponId.match(new RegExp(`^${prefix}(\\d+)`, 'i'));
      if (match && match[1]) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });

    const newCoupons = [];
    for (let i = 1; i <= 5; i++) {
      const formattedId = `${prefix}${String(maxNum + i).padStart(6, '0')}`;
      newCoupons.push({ couponId: formattedId, status: "unused" });
    }
    if (newCoupons.length > 0) {
      await Coupon.insertMany(newCoupons, { ordered: false });
      console.log(`🚀 Bulk generated ${newCoupons.length} coupons: ${newCoupons[0].couponId} to ${newCoupons[newCoupons.length - 1].couponId}`);
    }

    // 4. Test Atomic Redemption of BW000001
    const store = stores[0] || { storeId: "STORE001", name: "Kamla Nagar" };
    const redeemed = await Coupon.findOneAndUpdate(
      { couponId: "BW000001", status: "unused" },
      { $set: { status: "redeemed", storeId: store.storeId, storeName: store.name, redeemedAt: new Date() } },
      { new: true }
    );
    if (redeemed) {
      console.log("✅ First Redemption Attempt: SUCCESS ->", redeemed.couponId, "Redeemed at", redeemed.storeName);
    } else {
      console.log("ℹ️ Coupon BW000001 was already redeemed!");
    }

    // 5. Test Double Redemption Attempt
    const doubleAttempt = await Coupon.findOneAndUpdate(
      { couponId: "BW000001", status: "unused" },
      { $set: { status: "redeemed", storeId: store.storeId, storeName: store.name, redeemedAt: new Date() } },
      { new: true }
    );
    if (!doubleAttempt) {
      console.log("🛡️ Double Redemption Protection: PASSED! (Second attempt rejected cleanly)");
    }

    // 6. Summary Stats
    const totalCount = await Coupon.countDocuments();
    const redeemedCount = await Coupon.countDocuments({ status: "redeemed" });
    const unusedCount = await Coupon.countDocuments({ status: "unused" });
    console.log(`📊 DB Stats Summary: Total: ${totalCount} | Redeemed: ${redeemedCount} | Unused: ${unusedCount}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
  }
}

runVerification();
