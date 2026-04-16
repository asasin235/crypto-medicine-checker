const ledger = require("../../src/services/ledger.service");

describe("ledger.service (Fabric-backed)", () => {
  test("appendLedgerEntry submits AppendEvent to chaincode", async () => {
    const shaped = await ledger.appendLedgerEntry(null, {
      event: "batch_created",
      entityType: "batch",
      entityId: 42,
      actorId: 7,
      batch_number: "BN-1",
    });

    expect(shaped.event).toBe("batch_created");
    expect(shaped.entityType).toBe("batch");
    expect(global.__fabricContract.submitTransaction).toHaveBeenCalledTimes(1);
    const [fn, payloadJson] = global.__fabricContract.submitTransaction.mock.calls[0];
    expect(fn).toBe("AppendEvent");
    const payload = JSON.parse(payloadJson);
    expect(payload.event).toBe("batch_created");
    expect(payload.entityId).toBe("42");
  });

  test("appendLedgerEntry throws on missing event", async () => {
    await expect(
      ledger.appendLedgerEntry(null, { entityType: "batch" })
    ).rejects.toThrow(/event\.event/);
  });

  test("appendLedgerEntry throws on missing entityType", async () => {
    await expect(
      ledger.appendLedgerEntry(null, { event: "x" })
    ).rejects.toThrow(/entityType/);
  });

  test("getAllEvents delegates to evaluateTransaction", async () => {
    global.__fabricContract.evaluateTransaction.mockResolvedValueOnce(
      Buffer.from(JSON.stringify([{ id: "a" }, { id: "b" }]))
    );
    const events = await ledger.getAllEvents();
    expect(events).toHaveLength(2);
    expect(global.__fabricContract.evaluateTransaction).toHaveBeenCalledWith(
      "GetAllEvents"
    );
  });
});
