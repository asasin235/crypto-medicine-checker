const { buildPoolConfig } = require("../../src/config/db");

describe("database pool config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("buildPoolConfig reads connection settings from environment", () => {
    process.env.DB_HOST = "mysql";
    process.env.DB_PORT = "3307";
    process.env.DB_USER = "pharma";
    process.env.DB_PASSWORD = "secret";
    process.env.DB_NAME = "pharma_chain_test";
    process.env.DB_CONNECTION_LIMIT = "5";

    expect(buildPoolConfig()).toEqual({
      host: "mysql",
      port: 3307,
      user: "pharma",
      password: "secret",
      database: "pharma_chain_test",
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  });
});
