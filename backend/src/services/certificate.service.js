const { randomUUID } = require("node:crypto");

const { signData, verifySignature } = require("./crypto.service");

function encodeCertificatePayload(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function decodeCertificatePayload(encodedPayload) {
  return JSON.parse(Buffer.from(encodedPayload, "base64").toString("utf8"));
}

function issueCertificate(stakeholderData, caPrivateKey, options = {}) {
  const issuedAt = options.issuedAt || new Date();
  const validFrom = issuedAt.toISOString();
  const validTo = new Date(
    issuedAt.getTime() + (options.validityDays || 365) * 24 * 60 * 60 * 1000
  ).toISOString();

  const payload = {
    certificateId: randomUUID(),
    issuer: options.issuer || "PharmaChain Central Authority",
    subject: {
      email: stakeholderData.email,
      license_number: stakeholderData.license_number,
      name: stakeholderData.name,
      role: stakeholderData.role,
    },
    publicKey: stakeholderData.publicKey,
    validFrom,
    validTo,
  };

  const certificate = encodeCertificatePayload(payload);
  const signature = signData(payload, caPrivateKey);

  return {
    certificate,
    signature,
  };
}

function verifyCertificate(certificateBundle, caPublicKey) {
  const payload = decodeCertificatePayload(certificateBundle.certificate);
  return verifySignature(payload, certificateBundle.signature, caPublicKey);
}

module.exports = {
  decodeCertificatePayload,
  issueCertificate,
  verifyCertificate,
};
