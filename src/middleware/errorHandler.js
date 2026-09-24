function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = Number(err?.statusCode || err?.status) || 500;
  const message = status >= 500 ? "Server error." : String(err?.message || "Request failed.");
  return res.status(status).json({ success: false, message });
}

module.exports = { errorHandler };
