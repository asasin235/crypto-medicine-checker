const express = require("express");

const { auth, roleGuard } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerStakeholder } = require("../services/stakeholder.service");
const { stakeholderRegistrationSchema } = require("../utils/validators");

const router = express.Router();

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
