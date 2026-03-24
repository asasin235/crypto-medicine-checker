const { closePool } = require("../../src/config/db");

process.env.NODE_ENV = "test";
process.env.DB_HEALTHCHECK_DISABLED = "true";
process.env.DB_NAME = "pharma_chain_test";

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await closePool();
});
