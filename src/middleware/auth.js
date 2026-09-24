const jwt = require("jsonwebtoken");

const ADMIN_TOKEN_COOKIE = "ngg_admin_token";

function getBearerToken(req) {
  const [scheme, token] = String(req.headers.authorization || "").split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
}

function getCookieToken(req, cookieName) {
  const cookies = String(req.headers.cookie || "").split(";");
  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");
    if (separator < 0) continue;
    const name = cookie.slice(0, separator).trim();
    if (name !== cookieName) continue;
    try {
      return decodeURIComponent(cookie.slice(separator + 1).trim());
    } catch {
      return "";
    }
  }
  return "";
}

function createAuthMiddleware(secret) {
  function verifyToken(req, res, next) {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ success: false, message: "No token." });
    try {
      req.user = jwt.verify(token, secret);
      return next();
    } catch {
      return res.status(403).json({ success: false, message: "Invalid token." });
    }
  }

  function getAdminPayload(req) {
    const token = getBearerToken(req) || getCookieToken(req, ADMIN_TOKEN_COOKIE);
    if (!token) return null;
    try {
      const payload = jwt.verify(token, secret);
      return payload?.role === "admin" ? payload : null;
    } catch {
      return null;
    }
  }

  function adminOnly(req, res, next) {
    const token = getBearerToken(req) || getCookieToken(req, ADMIN_TOKEN_COOKIE);
    if (!token) return res.status(401).json({ success: false, message: "No token." });
    const admin = getAdminPayload(req);
    if (!admin) return res.status(403).json({ success: false, message: "Invalid or unauthorized admin token." });
    req.admin = admin;
    return next();
  }

  return {
    adminOnly,
    getAdminPayload,
    hasValidAdminToken: (req) => Boolean(getAdminPayload(req)),
    verifyToken,
  };
}

module.exports = { ADMIN_TOKEN_COOKIE, createAuthMiddleware };
