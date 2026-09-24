const crypto = require("crypto");
const Razorpay = require("razorpay");

const RAZORPAY_MIN_AMOUNT_PAISE = 100;

function getRazorpayConfig(env = process.env) {
  const keyId = String(env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = String(env.RAZORPAY_KEY_SECRET || "").trim();
  const missing = [];
  if (!keyId) missing.push("RAZORPAY_KEY_ID");
  if (!keySecret) missing.push("RAZORPAY_KEY_SECRET");
  return {
    keyId,
    keySecret,
    configured: missing.length === 0,
    missing,
    mode: keyId.startsWith("rzp_live_") ? "live" : keyId.startsWith("rzp_test_") ? "test" : "unknown",
  };
}

function getRazorpayClient(env = process.env) {
  const config = getRazorpayConfig(env);
  if (!config.configured) {
    const err = new Error(`Razorpay credentials are not configured. Missing: ${config.missing.join(", ")}`);
    err.statusCode = 401;
    throw err;
  }
  return new Razorpay({ key_id: config.keyId, key_secret: config.keySecret });
}

function isValidRazorpaySignature(orderId, paymentId, signature, keySecret = getRazorpayConfig().keySecret) {
  if (!keySecret || !orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest();
  const receivedHex = String(signature).trim();
  if (!/^[a-f\d]{64}$/i.test(receivedHex)) return false;
  const received = Buffer.from(receivedHex, "hex");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

module.exports = {
  RAZORPAY_MIN_AMOUNT_PAISE,
  getRazorpayClient,
  getRazorpayConfig,
  isValidRazorpaySignature,
};
