const path = require("path");
const { createCouponController } = require("../controllers/coupon.controller");

function registerCouponRoutes(app, { Coupon, Store, adminOnly, hasValidAdminToken, publicDir }) {
  const controller = createCouponController({ Coupon, Store });

  app.get("/api/coupon/stores", controller.listStores);
  app.get("/api/coupon/:couponId", controller.getCoupon);
  app.post("/api/coupon/redeem", controller.redeemCoupon);
  app.get("/redeem/:couponId", (req, res) => res.sendFile(path.join(publicDir, "redeem.html")));

  app.get("/api/coupon/admin/stats", adminOnly, controller.adminStats);
  app.get("/api/coupon/admin/list", adminOnly, controller.adminList);
  app.post("/api/coupon/admin/generate-bulk", adminOnly, controller.generateBulk);
  app.post("/api/coupon/admin/add-store", adminOnly, controller.addStore);

  app.get("/coupon-admin", (req, res) => {
    if (!hasValidAdminToken(req)) return res.redirect("/login");
    return res.sendFile(path.join(publicDir, "coupon-admin.html"));
  });
  app.get("/coupon-print", (req, res) => {
    if (!hasValidAdminToken(req)) return res.redirect("/login");
    return res.sendFile(path.join(publicDir, "coupon-print.html"));
  });
}

module.exports = { registerCouponRoutes };
