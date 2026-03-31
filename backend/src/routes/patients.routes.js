const express = require("express");

const validate = require("../middleware/validate");
const { registerPatient } = require("../services/patient.service");
const { patientRegistrationSchema } = require("../utils/validators");

const router = express.Router();

router.post("/register", validate(patientRegistrationSchema), async (req, res, next) => {
  try {
    const patient = await registerPatient(req.body);
    res.status(201).json({
      success: true,
      patient,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
