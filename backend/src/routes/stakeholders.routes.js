const express = require("express");

const { auth, roleGuard } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getStakeholderCountsByRole,
  listStakeholders,
  registerStakeholder,
} = require("../services/stakeholder.service");
const { stakeholderRegistrationSchema } = require("../utils/validators");

const router = express.Router();

router.get("/stats", auth, roleGuard("central_authority"), async (req, res, next) => {
  try {
    const counts = await getStakeholderCountsByRole();
    res.status(200).json({
      success: true,
      counts,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", auth, roleGuard("central_authority"), async (req, res, next) => {
  try {
    const stakeholders = await listStakeholders();
    res.status(200).json({
      success: true,
      stakeholders,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  auth,
  roleGuard("central_authority"),
  validate(stakeholderRegistrationSchema),
  async (req, res, next) => {
    try {
      const stakeholder = await registerStakeholder(req.user, req.body);
      res.status(201).json({
        success: true,
        stakeholder,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
