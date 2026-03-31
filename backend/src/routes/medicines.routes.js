const express = require("express");

const { auth, roleGuard } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createMedicine, getMedicineById, listMedicines } = require("../services/medicine.service");
const { medicineCreationSchema } = require("../utils/validators");

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const medicines = await listMedicines();
    res.status(200).json({ success: true, medicines });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const medicine = await getMedicineById(Number(req.params.id));
    res.status(200).json({ success: true, medicine });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  auth,
  roleGuard("manufacturer"),
  validate(medicineCreationSchema),
  async (req, res, next) => {
    try {
      const medicine = await createMedicine(req.user, req.body);
      res.status(201).json({ success: true, medicine });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
