jest.mock("../../src/services/crypto.service", () => ({
  encryptPrivateKey: jest.fn(() => "encrypted-private-key"),
  generateKeyPair: jest.fn(() => ({
    publicKey: "generated-public-key",
    privateKey: "generated-private-key",
  })),
  hashSha256: jest.fn(() => "hash-value"),
}));

jest.mock("../../src/services/certificate.service", () => ({
  issueCertificate: jest.fn(() => ({
    certificate: "certificate-payload",
    signature: "certificate-signature",
  })),
}));

const {
  ensureCentralAuthorityAdmin,
  ensureGenesisBlock,
} = require("../../src/migrations/seed");

describe("seed helpers", () => {
  test("ensureGenesisBlock is idempotent", async () => {
    const connection = {
      execute: jest
        .fn()
        .mockResolvedValueOnce([[{ id: 1 }]]),
    };

    await expect(ensureGenesisBlock(connection)).resolves.toBe(false);
  });

  test("ensureCentralAuthorityAdmin inserts admin only once", async () => {
    const connection = {
      execute: jest
        .fn()
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }]),
    };

    await expect(ensureCentralAuthorityAdmin(connection)).resolves.toBe(true);
    expect(connection.execute).toHaveBeenCalledTimes(2);
  });
});
