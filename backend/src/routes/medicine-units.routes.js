const express = require("express");

const { auth } = require("../middleware/auth");
const { getMedicineUnitBySerial } = require("../services/medicine-unit.service");

const router = express.Router();

router.get("/:serial", auth, async (req, res, next) => {
  try {
    const unit = await getMedicineUnitBySerial(req.params.serial);
    res.status(200).json({ success: true, unit });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
