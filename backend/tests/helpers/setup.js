const { closePool } = require("../../src/config/db");

process.env.NODE_ENV = "test";
process.env.DB_HEALTHCHECK_DISABLED = "true";
process.env.DB_NAME = "pharma_chain_test";
// Disable the real Fabric gateway in tests; tests inject a mock via __setContract.
process.env.FABRIC_DISABLED = "true";

const fabricGateway = require("../../src/services/fabric-gateway");

// Default mock contract used by the ledger service in tests. Returns a shaped
// event just like the real chaincode so callers get consistent JSON back.
function createMockContract() {
  return {
    submitTransaction: jest.fn(async (_fn, payloadJson) => {
      const payload = JSON.parse(payloadJson);
      return Buffer.from(
        JSON.stringify({
          docType: "ledgerEvent",
          id: payload.id,
          txId: "test-tx",
          timestamp: new Date(0).toISOString(),
          event: payload.event,
          entityType: payload.entityType,
          entityId: payload.entityId,
          actorId: payload.actorId,
          payload: payload.payload,
        })
      );
    }),
    evaluateTransaction: jest.fn(async () => Buffer.from("[]")),
  };
}

global.__fabricContract = createMockContract();
fabricGateway.__setContract(global.__fabricContract);

beforeEach(() => {
  jest.clearAllMocks();
  global.__fabricContract = createMockContract();
  fabricGateway.__setContract(global.__fabricContract);
});

afterAll(async () => {
  await closePool();
});
