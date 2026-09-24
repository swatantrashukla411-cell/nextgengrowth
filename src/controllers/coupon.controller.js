const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function createCouponController({ Coupon, Store, logger = console }) {
  return {
    async listStores(req, res) {
      try {
        const stores = await Store.find({ isActive: true }).select("storeId name city").sort({ name: 1 }).lean();
        return res.json({ success: true, stores });
      } catch (err) {
        logger.error("Error fetching stores:", err);
        return res.status(500).json({ error: "Failed to fetch stores list." });
      }
    },

    async getCoupon(req, res) {
      try {
        const couponId = String(req.params.couponId || "").toUpperCase().trim();
        if (!couponId) return res.status(400).json({ error: "Coupon ID is required." });
        const coupon = await Coupon.findOne({ couponId }).lean();
        if (!coupon) return res.status(404).json({ exists: false, error: "This coupon is invalid or does not exist." });
        return res.json({
          exists: true,
          couponId: coupon.couponId,
          status: coupon.status,
          discountValue: coupon.discountValue,
          discountType: coupon.discountType,
          campaignId: coupon.campaignId,
          storeId: coupon.storeId || null,
          storeName: coupon.storeName || null,
          redeemedAt: coupon.redeemedAt || null,
        });
      } catch (err) {
        logger.error("Error checking coupon status:", err);
        return res.status(500).json({ error: "Server error while checking coupon status." });
      }
    },

    async redeemCoupon(req, res) {
      try {
        const couponId = String(req.body.couponId || "").toUpperCase().trim();
        const storeId = String(req.body.storeId || "").trim();
        if (!couponId || !storeId) return res.status(400).json({ error: "Coupon ID and Store selection are required." });

        const store = await Store.findOne({ storeId, isActive: true });
        if (!store) return res.status(400).json({ error: "Invalid store selected. Please select a valid store." });

        const updatedCoupon = await Coupon.findOneAndUpdate(
          { couponId, status: "unused" },
          { $set: { status: "redeemed", storeId: store.storeId, storeName: store.name, redeemedAt: new Date() } },
          { new: true },
        );
        if (!updatedCoupon) {
          const existing = await Coupon.findOne({ couponId });
          if (!existing) return res.status(404).json({ error: "This coupon is invalid or does not exist." });
          return res.status(409).json({
            alreadyRedeemed: true,
            error: "COUPON ALREADY REDEEMED",
            storeName: existing.storeName,
            redeemedAt: existing.redeemedAt,
          });
        }

        return res.json({
          success: true,
          message: "COUPON REDEEMED SUCCESSFULLY",
          couponId: updatedCoupon.couponId,
          discountValue: updatedCoupon.discountValue,
          storeName: updatedCoupon.storeName,
          redeemedAt: updatedCoupon.redeemedAt,
        });
      } catch (err) {
        logger.error("Error redeeming coupon:", err);
        return res.status(500).json({ error: "Failed to process redemption. Please try again." });
      }
    },

    async adminStats(req, res) {
      try {
        const [totalCoupons, redeemedCoupons, unusedCoupons, storeStats] = await Promise.all([
          Coupon.countDocuments(),
          Coupon.countDocuments({ status: "redeemed" }),
          Coupon.countDocuments({ status: "unused" }),
          Coupon.aggregate([
            { $match: { status: "redeemed" } },
            { $group: { _id: "$storeName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
        ]);
        const redemptionRate = totalCoupons > 0 ? `${((redeemedCoupons / totalCoupons) * 100).toFixed(1)}%` : "0%";
        const stores = await Store.find({ isActive: true }).select("name storeId").lean();
        const storeMap = Object.fromEntries(stores.map((store) => [store.name || store.storeId, 0]));
        storeStats.forEach((store) => { if (store._id) storeMap[store._id] = store.count; });
        const storePerformance = Object.entries(storeMap).map(([name, count]) => ({ name, count }));
        return res.json({ success: true, totalCoupons, redeemedCoupons, unusedCoupons, redemptionRate, storePerformance });
      } catch (err) {
        logger.error("Error fetching admin coupon stats:", err);
        return res.status(500).json({ error: "Failed to fetch analytics." });
      }
    },

    async adminList(req, res) {
      try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
        const search = String(req.query.search || "").trim().slice(0, 100);
        const status = String(req.query.status || "").trim();
        const filter = {};
        if (["unused", "redeemed"].includes(status)) filter.status = status;
        if (search) {
          const searchRegex = new RegExp(escapeRegex(search), "i");
          filter.$or = [{ couponId: searchRegex }, { storeName: searchRegex }];
        }
        const [coupons, total] = await Promise.all([
          Coupon.find(filter).sort({ couponId: 1 }).skip((page - 1) * limit).limit(limit).lean(),
          Coupon.countDocuments(filter),
        ]);
        return res.json({ success: true, coupons, total, page, pages: Math.ceil(total / limit) });
      } catch (err) {
        logger.error("Error fetching coupon list:", err);
        return res.status(500).json({ error: "Failed to fetch coupon list." });
      }
    },

    async generateBulk(req, res) {
      try {
        const count = Math.min(Math.max(parseInt(req.body.count, 10) || 100, 1), 10000);
        const rawPrefix = req.body.prefix === undefined ? "BW" : String(req.body.prefix).trim().toUpperCase();
        if (!/^[A-Z0-9_-]{1,12}$/.test(rawPrefix)) {
          return res.status(400).json({ error: "Prefix must contain 1–12 letters, numbers, underscores, or hyphens." });
        }
        const discountValue = Number(req.body.discountValue ?? 20);
        if (!Number.isFinite(discountValue) || discountValue < 1 || discountValue > 100) {
          return res.status(400).json({ error: "Discount value must be between 1 and 100." });
        }
        const campaignId = String(req.body.campaignId || "BWC_COLLEGE_2026").trim().slice(0, 80);
        const prefixRegex = new RegExp(`^${escapeRegex(rawPrefix)}\\d+`, "i");
        const existingCoupons = await Coupon.find({ couponId: prefixRegex }).select("couponId").lean();
        const maxNum = existingCoupons.reduce((max, coupon) => {
          const match = coupon.couponId.match(new RegExp(`^${escapeRegex(rawPrefix)}(\\d+)`, "i"));
          return match ? Math.max(max, parseInt(match[1], 10) || 0) : max;
        }, 0);
        const now = new Date();
        const newCoupons = Array.from({ length: count }, (_, index) => ({
          couponId: `${rawPrefix}${String(maxNum + index + 1).padStart(6, "0")}`,
          campaignId,
          discountType: "percentage",
          discountValue,
          status: "unused",
          storeId: null,
          storeName: null,
          redeemedAt: null,
          createdAt: now,
        }));
        const result = await Coupon.insertMany(newCoupons, { ordered: false });
        return res.json({
          success: true,
          message: `Successfully generated ${result.length} coupons!`,
          generatedCount: result.length,
          startId: newCoupons[0]?.couponId,
          endId: newCoupons[newCoupons.length - 1]?.couponId,
        });
      } catch (err) {
        logger.error("Bulk coupon generation error:", err);
        return res.status(500).json({ error: "Failed to bulk generate coupons." });
      }
    },

    async addStore(req, res) {
      try {
        const name = String(req.body.name || "").trim().slice(0, 120);
        if (!name) return res.status(400).json({ error: "Store name is required." });
        const providedId = String(req.body.storeId || "").trim().toUpperCase();
        const storeId = (providedId || `STORE${String(Date.now()).slice(-4)}`).slice(0, 40);
        const city = String(req.body.city || "Delhi").trim().slice(0, 100);
        const store = await Store.create({ storeId, name, city });
        return res.json({ success: true, message: "Store added successfully!", store });
      } catch (err) {
        logger.error("Error adding store:", err);
        if (err.code === 11000) return res.status(409).json({ error: "That store ID already exists." });
        return res.status(500).json({ error: "Failed to add store." });
      }
    },
  };
}

module.exports = { createCouponController };
