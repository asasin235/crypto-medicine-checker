jest.mock("../../src/config/db", () => ({
  getConnection: jest.fn(),
}));

jest.mock("../../src/services/crypto.service", () => ({
  decryptPrivateKey: jest.fn(() => "decrypted-ca-private-key"),
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

const jwt = require("jsonwebtoken");
const request = require("supertest");

const { getConnection } = require("../../src/config/db");
const app = require("../../src/index");

describe("stakeholder registration API", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret";
  });

  test("only Central Authority can register stakeholders", async () => {
    const token = jwt.sign(
      { id: 100, role: "central_authority", type: "stakeholder" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    const connection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
      execute: jest
        .fn()
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([
          [
            {
              id: 100,
              role: "central_authority",
              encrypted_private_key: "encrypted-ca-private-key",
            },
          ],
        ])
        .mockResolvedValueOnce([{ insertId: 200 }])
        .mockResolvedValueOnce([[]]),
    };

    getConnection.mockResolvedValue(connection);

    const response = await request(app)
      .post("/api/stakeholders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Northwind Pharmacy",
        role: "pharmacy",
        email: "northwind@example.com",
        password: "supersecret",
        license_number: "LIC-123456",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.stakeholder).toMatchObject({
      id: 200,
      role: "pharmacy",
      email: "northwind@example.com",
      certificate_status: "valid",
    });
  });

  test("duplicate email or license is rejected", async () => {
    const token = jwt.sign(
      { id: 100, role: "central_authority", type: "stakeholder" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    const connection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
      execute: jest.fn().mockResolvedValueOnce([[{ id: 1 }]]),
    };

    getConnection.mockResolvedValue(connection);

    const response = await request(app)
      .post("/api/stakeholders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Northwind Pharmacy",
        role: "pharmacy",
        email: "northwind@example.com",
        password: "supersecret",
        license_number: "LIC-123456",
      });

    expect(response.statusCode).toBe(409);
    expect(response.body.error).toBe("Stakeholder email or license number already exists");
  });
});
