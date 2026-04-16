/*
 * Ledger service — now backed by Hyperledger Fabric instead of the old
 * MySQL `ledger_blocks` hash-chain.
 *
 * Public API is preserved so existing call-sites continue to work:
 *   appendLedgerEntry(connection, event)
 *
 * The `connection` (MySQL connection/transaction) is accepted for
 * backwards compatibility but ignored — commits happen on-chain. A caller
 * that relies on transactional rollback of the ledger entry should note that
 * Fabric writes cannot be rolled back by the SQL transaction; they *can*
 * however be reconciled via the `entityId` + `event` idempotency key.
 */

"use strict";

const { randomUUID } = require("node:crypto");

const { getContract } = require("./fabric-gateway");
const { createLogger } = require("../utils/logger");

const logger = createLogger("ledger.service");

function asString(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

/**
 * Append a ledger event to the Fabric world state.
 *
 * @param {*} _connection  legacy MySQL handle (ignored, kept for API compat)
 * @param {object} event   { event, entityType, entityId?, actorId?, ... }
 * @returns {Promise<object>} the shaped event stored on-chain
 */
async function appendLedgerEntry(_connection, event) {
  if (!event || typeof event !== "object") {
    throw new Error("appendLedgerEntry requires an event object");
  }
  if (!event.event) throw new Error("event.event is required");
  if (!event.entityType) throw new Error("event.entityType is required");

  // Escape hatch for local dev/seed scripts where Fabric is intentionally not
  // running. Set LEDGER_SKIP_ON_ERROR=true to log and continue instead of
  // failing the SQL transaction.
  const skipOnError = process.env.LEDGER_SKIP_ON_ERROR === "true";

  const payload = {
    id: event.id || randomUUID(),
    event: event.event,
    entityType: event.entityType,
    entityId: event.entityId !== undefined ? asString(event.entityId) : null,
    actorId: event.actorId !== undefined ? asString(event.actorId) : null,
    payload: event.payload ?? stripMeta(event),
  };

  try {
    const contract = await getContract();
    const result = await contract.submitTransaction(
      "AppendEvent",
      JSON.stringify(payload)
    );
    try {
      return JSON.parse(result.toString());
    } catch (err) {
      logger.warn(`AppendEvent returned non-JSON: ${err.message}`);
      return { id: payload.id };
    }
  } catch (err) {
    if (skipOnError) {
      logger.warn(
        `Fabric AppendEvent skipped for ${payload.event}/${payload.id}: ${err.message}`
      );
      return { id: payload.id, skipped: true };
    }
    throw err;
  }
}

async function getAllEvents() {
  const contract = await getContract();
  const res = await contract.evaluateTransaction("GetAllEvents");
  return JSON.parse(res.toString());
}

async function getEventById(id) {
  const contract = await getContract();
  const res = await contract.evaluateTransaction("GetEventById", id);
  return JSON.parse(res.toString());
}

async function getEventsByEntity(entityType, entityId) {
  const contract = await getContract();
  const res = await contract.evaluateTransaction(
    "GetEventsByEntity",
    entityType,
    asString(entityId)
  );
  return JSON.parse(res.toString());
}

async function queryHistory(id) {
  const contract = await getContract();
  const res = await contract.evaluateTransaction("QueryHistory", id);
  return JSON.parse(res.toString());
}

function stripMeta(event) {
  const {
    id: _id,
    event: _event,
    entityType: _entityType,
    entityId: _entityId,
    actorId: _actorId,
    payload: _payload,
    ...rest
  } = event;
  return rest;
}

module.exports = {
  appendLedgerEntry,
  getAllEvents,
  getEventById,
  getEventsByEntity,
  queryHistory,
};
