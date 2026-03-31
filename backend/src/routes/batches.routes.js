const express = require("express");

const { auth, roleGuard } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createBatch, getBatchById, listBatches } = require("../services/batch.service");
const { batchCreationSchema } = require("../utils/validators");

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const batches = await listBatches(req.user);
    res.status(200).json({ success: true, batches });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const batch = await getBatchById(Number(req.params.id));
    res.status(200).json({ success: true, batch });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  auth,
  roleGuard("manufacturer"),
  validate(batchCreationSchema),
  async (req, res, next) => {
    try {
      const batch = await createBatch(req.user, req.body);
      res.status(201).json({ success: true, batch });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
