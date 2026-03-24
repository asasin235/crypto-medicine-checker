const AppError = require("../utils/app-error");

function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
}

module.exports = notFoundHandler;
