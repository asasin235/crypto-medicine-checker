const express = require("express");

const { authenticateLogin } = require("../services/auth.service");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const result = await authenticateLogin(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
