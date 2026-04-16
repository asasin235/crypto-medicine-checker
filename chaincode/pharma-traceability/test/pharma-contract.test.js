"use strict";

const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require("sinon");
const { PharmaContract } = require("../src/pharma-contract");

chai.use(sinonChai);
const { expect } = chai;

function createCtx(store = new Map()) {
  return {
    stub: {
      _store: store,
      getTxID: sinon.stub().returns("tx-1"),
      getTxTimestamp: sinon.stub().returns({ seconds: { low: 1_700_000_000 }, nanos: 0 }),
      getState: sinon.stub().callsFake(async (k) => store.get(k) || Buffer.from("")),
      putState: sinon.stub().callsFake(async (k, v) => store.set(k, v)),
      setEvent: sinon.stub(),
      getStateByRange: sinon.stub().callsFake(async () => {
        const entries = [...store.entries()].map(([k, v]) => ({
          key: k,
          value: { value: v },
        }));
        let i = 0;
        return {
          next: async () => {
            if (i >= entries.length) return { done: true };
            const e = entries[i++];
            return { value: { ...e.value, value: e.value.value }, done: false };
          },
          close: async () => {},
        };
      }),
    },
  };
}

describe("PharmaContract", () => {
  it("writes and reads an event", async () => {
    const ctx = createCtx();
    const c = new PharmaContract();
    await c.InitLedger(ctx);

    const shaped = await c.AppendEvent(
      ctx,
      JSON.stringify({
        id: "evt-1",
        event: "batch_created",
        entityType: "batch",
        entityId: 42,
        actorId: 7,
        batch_number: "BN-1",
      })
    );
    expect(shaped.event).to.equal("batch_created");
    expect(shaped.payload.batch_number).to.equal("BN-1");

    const fetched = await c.GetEventById(ctx, "evt-1");
    expect(fetched.id).to.equal("evt-1");
  });

  it("rejects duplicates", async () => {
    const ctx = createCtx();
    const c = new PharmaContract();
    const payload = JSON.stringify({
      id: "evt-dup",
      event: "x",
      entityType: "batch",
    });
    await c.AppendEvent(ctx, payload);
    try {
      await c.AppendEvent(ctx, payload);
      throw new Error("expected error");
    } catch (err) {
      expect(err.message).to.match(/already exists/);
    }
  });

  it("validates shape", async () => {
    const ctx = createCtx();
    const c = new PharmaContract();
    try {
      await c.AppendEvent(ctx, JSON.stringify({ id: "x" }));
      throw new Error("expected error");
    } catch (err) {
      expect(err.message).to.match(/event/);
    }
  });
});
