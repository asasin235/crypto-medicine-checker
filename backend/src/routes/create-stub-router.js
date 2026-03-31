const express = require("express");

const AppError = require("../utils/app-error");

function createStubRouter(routeName) {
  const router = express.Router();

  router.all("*", (req, res, next) => {
    next(new AppError(`${routeName} routes are not implemented yet`, 501));
  });

  return router;
}

module.exports = createStubRouter;
