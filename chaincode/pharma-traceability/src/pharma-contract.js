/*
 * PharmaContract — Hyperledger Fabric chaincode replacing the previous MySQL
 * `ledger_blocks` hash-chain. Each invocation records an immutable event on
 * channel state; the history API returns the full per-key audit trail.
 *
 * World-state layout:
 *   key   = `EVENT_<uuid>`
 *   value = JSON-encoded LedgerEvent (see #shapeEvent)
 */

"use strict";

const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

const EVENT_KEY_PREFIX = "EVENT_";

class PharmaContract extends Contract {
  constructor() {
    super("PharmaContract");
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  async InitLedger(ctx) {
    const genesis = this.#shapeEvent(ctx, {
      id: "genesis",
      actorId: "system",
      entityId: "pharma_chain",
      entityType: "system",
      event: "genesis",
      message: "Genesis block for the PharmaChain traceability ledger",
    });

    await ctx.stub.putState(
      `${EVENT_KEY_PREFIX}genesis`,
      Buffer.from(JSON.stringify(genesis))
    );

    return genesis;
  }

  // ---------------------------------------------------------------------------
  // Writes
  // ---------------------------------------------------------------------------

  /**
   * AppendEvent(eventJson)
   * Writes a new ledger event. `eventJson` is a stringified JSON object
   * containing at minimum `event` and `entityType`. An id is derived from the
   * transaction if the caller does not supply one.
   */
  async AppendEvent(ctx, eventJson) {
    if (!eventJson) {
      throw new Error("AppendEvent requires a JSON-encoded event argument");
    }

    let incoming;
    try {
      incoming = JSON.parse(eventJson);
    } catch (err) {
      throw new Error(`AppendEvent received invalid JSON: ${err.message}`);
    }

    if (!incoming.event) {
      throw new Error("AppendEvent requires `event` on the payload");
    }
    if (!incoming.entityType) {
      throw new Error("AppendEvent requires `entityType` on the payload");
    }

    const id = incoming.id || ctx.stub.getTxID();
    const key = `${EVENT_KEY_PREFIX}${id}`;
    const existing = await ctx.stub.getState(key);

    if (existing && existing.length > 0) {
      throw new Error(`Event ${id} already exists on the ledger`);
    }

    const shaped = this.#shapeEvent(ctx, { ...incoming, id });
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(shaped)));

    // Emit a Fabric event so off-chain indexers can react.
    ctx.stub.setEvent("LedgerEventAppended", Buffer.from(JSON.stringify(shaped)));

    return shaped;
  }

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------

  async GetEventById(ctx, id) {
    const key = `${EVENT_KEY_PREFIX}${id}`;
    const bytes = await ctx.stub.getState(key);

    if (!bytes || bytes.length === 0) {
      throw new Error(`Event ${id} not found`);
    }

    return JSON.parse(bytes.toString());
  }

  async GetAllEvents(ctx) {
    const iterator = await ctx.stub.getStateByRange(
      `${EVENT_KEY_PREFIX}`,
      `${EVENT_KEY_PREFIX}~`
    );
    return this.#collect(iterator);
  }

  async GetEventsByEntity(ctx, entityType, entityId) {
    const all = await this.GetAllEvents(ctx);
    return all.filter(
      (ev) => ev.entityType === entityType && String(ev.entityId) === String(entityId)
    );
  }

  /**
   * QueryHistory(id) — returns the full history of mutations for an event key.
   * Useful for audit; events are immutable but returning history proves it.
   */
  async QueryHistory(ctx, id) {
    const key = `${EVENT_KEY_PREFIX}${id}`;
    const iterator = await ctx.stub.getHistoryForKey(key);
    const results = [];

    while (true) {
      const res = await iterator.next();
      if (res.value) {
        results.push({
          txId: res.value.txId,
          timestamp: res.value.timestamp,
          isDelete: res.value.isDelete,
          value: res.value.value ? JSON.parse(res.value.value.toString()) : null,
        });
      }
      if (res.done) {
        await iterator.close();
        return results;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  #shapeEvent(ctx, incoming) {
    const txId = ctx.stub.getTxID();
    const ts = ctx.stub.getTxTimestamp();
    const timestamp = new Date(
      ts.seconds.low * 1000 + Math.floor(ts.nanos / 1e6)
    ).toISOString();

    const base = {
      docType: "ledgerEvent",
      id: incoming.id,
      txId,
      timestamp,
      actorId: incoming.actorId ?? null,
      entityId: incoming.entityId ?? null,
      entityType: incoming.entityType,
      event: incoming.event,
      payload: incoming.payload ?? this.#stripMeta(incoming),
    };

    base.contentHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(base.payload))
      .digest("hex");

    return base;
  }

  #stripMeta(incoming) {
    const {
      id: _id,
      actorId: _actorId,
      entityId: _entityId,
      entityType: _entityType,
      event: _event,
      payload: _payload,
      ...rest
    } = incoming;
    return rest;
  }

  async #collect(iterator) {
    const events = [];
    while (true) {
      const res = await iterator.next();
      if (res.value && res.value.value) {
        try {
          events.push(JSON.parse(res.value.value.toString()));
        } catch (err) {
          events.push({ raw: res.value.value.toString() });
        }
      }
      if (res.done) {
        await iterator.close();
        return events;
      }
    }
  }
}

module.exports.PharmaContract = PharmaContract;
