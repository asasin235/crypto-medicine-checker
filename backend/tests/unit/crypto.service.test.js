const {
  decryptPrivateKey,
  encryptPrivateKey,
  generateKeyPair,
  getKeyDetails,
  signData,
  verifySignature,
} = require("../../src/services/crypto.service");

describe("crypto service", () => {
  test("generateKeyPair creates 2048-bit RSA keys", () => {
    const { privateKey, publicKey } = generateKeyPair();

    expect(privateKey).toContain("BEGIN PRIVATE KEY");
    expect(publicKey).toContain("BEGIN PUBLIC KEY");
    expect(getKeyDetails(privateKey).modulusLength).toBe(2048);
  });

  test("sign and verify succeeds for untampered data", () => {
    const { privateKey, publicKey } = generateKeyPair();
    const payload = { role: "manufacturer", name: "Acme Pharma" };
    const signature = signData(payload, privateKey);

    expect(verifySignature(payload, signature, publicKey)).toBe(true);
  });

  test("tampered data fails verification", () => {
    const { privateKey, publicKey } = generateKeyPair();
    const signature = signData({ role: "manufacturer", name: "Acme Pharma" }, privateKey);

    expect(
      verifySignature({ role: "manufacturer", name: "Tampered Pharma" }, signature, publicKey)
    ).toBe(false);
  });

  test("private key encryption and decryption round-trips", () => {
    const { privateKey } = generateKeyPair();
    const encrypted = encryptPrivateKey(privateKey, "super-secret-passphrase");

    expect(decryptPrivateKey(encrypted, "super-secret-passphrase")).toBe(privateKey);
  });
});
