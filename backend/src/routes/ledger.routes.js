"use strict";

const express = require("express");

const ledger = require("../services/ledger.service");
const { createLogger } = require("../utils/logger");

const logger = createLogger("ledger.routes");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const events = await ledger.getAllEvents();
    res.json({ count: events.length, events });
  } catch (err) {
    logger.error(`GetAllEvents failed: ${err.message}`);
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const event = await ledger.getEventById(req.params.id);
    res.json(event);
  } catch (err) {
    if (/not found/i.test(err.message)) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
});

router.get("/:id/history", async (req, res, next) => {
  try {
    const history = await ledger.queryHistory(req.params.id);
    res.json({ id: req.params.id, history });
  } catch (err) {
    next(err);
  }
});

router.get("/by-entity/:type/:id", async (req, res, next) => {
  try {
    const events = await ledger.getEventsByEntity(
      req.params.type,
      req.params.id
    );
    res.json({ count: events.length, events });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
