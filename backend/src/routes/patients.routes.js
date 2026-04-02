const express = require("express");

const { auth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerPatient, listPatients } = require("../services/patient.service");
const { patientRegistrationSchema } = require("../utils/validators");

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const patients = await listPatients();
    res.json({ success: true, patients });
  } catch (error) {
    next(error);
  }
});

router.post("/register", validate(patientRegistrationSchema), async (req, res, next) => {
  try {
    const patient = await registerPatient(req.body);
    res.status(201).json({ success: true, patient });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
