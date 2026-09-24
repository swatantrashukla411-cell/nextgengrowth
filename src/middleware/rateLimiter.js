const rateLimit = require("express-rate-limit");

function createRateLimiters() {
  return {
    authLimiter: rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: { success: false, message: "Too many attempts." },
    }),
    aiLimiter: rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Too many AI requests. Please try again in a few minutes." },
    }),
  };
}

module.exports = { createRateLimiters };
