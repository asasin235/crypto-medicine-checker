const express = require("express");

const { auth } = require("../middleware/auth");
const { listPrescriptions } = require("../services/prescription.service");

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const prescriptions = await listPrescriptions();
    res.json({ success: true, prescriptions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
