const { createLogger } = require("../utils/logger");

const logger = createLogger("error-handler.js");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  logger.error(`${req.method} ${req.originalUrl} - ${message}`);

  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = errorHandler;
