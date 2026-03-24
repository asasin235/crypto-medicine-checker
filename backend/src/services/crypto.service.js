const {
  createDecipheriv,
  createHash,
  createPrivateKey,
  createSign,
  createVerify,
  generateKeyPairSync,
  pbkdf2Sync,
  randomBytes,
  createCipheriv,
} = require("node:crypto");

const KEY_DERIVATION_ITERATIONS = 100000;
const KEY_LENGTH = 32;
const ENCRYPTION_ALGORITHM = "aes-256-gcm";

function normalizeData(data) {
  return typeof data === "string" ? data : JSON.stringify(data);
}

function generateKeyPair() {
  return generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
}

function signData(data, privateKey) {
  const signer = createSign("RSA-SHA256");

  signer.update(normalizeData(data));
  signer.end();

  return signer.sign(privateKey, "base64");
}

function verifySignature(data, signature, publicKey) {
  const verifier = createVerify("RSA-SHA256");

  verifier.update(normalizeData(data));
  verifier.end();

  return verifier.verify(publicKey, signature, "base64");
}

function encryptPrivateKey(privateKey, passphrase) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(passphrase, salt, KEY_DERIVATION_ITERATIONS, KEY_LENGTH, "sha256");
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(privateKey, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.from(
    JSON.stringify({
      algorithm: ENCRYPTION_ALGORITHM,
      authTag: authTag.toString("base64"),
      ciphertext: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      iterations: KEY_DERIVATION_ITERATIONS,
      salt: salt.toString("base64"),
    })
  ).toString("base64");
}

function decryptPrivateKey(encryptedPayload, passphrase) {
  const payload = JSON.parse(Buffer.from(encryptedPayload, "base64").toString("utf8"));
  const key = pbkdf2Sync(
    passphrase,
    Buffer.from(payload.salt, "base64"),
    payload.iterations,
    KEY_LENGTH,
    "sha256"
  );
  const decipher = createDecipheriv(
    payload.algorithm,
    key,
    Buffer.from(payload.iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

function hashSha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function getKeyDetails(privateKey) {
  return createPrivateKey(privateKey).asymmetricKeyDetails;
}

module.exports = {
  decryptPrivateKey,
  encryptPrivateKey,
  generateKeyPair,
  getKeyDetails,
  hashSha256,
  signData,
  verifySignature,
};
