const { generateKeyPair } = require("../../src/services/crypto.service");
const {
  decodeCertificatePayload,
  issueCertificate,
  verifyCertificate,
} = require("../../src/services/certificate.service");

describe("certificate service", () => {
  test("issued certificates include required fields", () => {
    const { privateKey, publicKey } = generateKeyPair();
    const certificateBundle = issueCertificate(
      {
        name: "Acme Pharma",
        role: "manufacturer",
        email: "acme@example.com",
        license_number: "LIC-1001",
        publicKey,
      },
      privateKey
    );

    const payload = decodeCertificatePayload(certificateBundle.certificate);

    expect(payload).toMatchObject({
      issuer: "PharmaChain Central Authority",
      subject: {
        email: "acme@example.com",
        license_number: "LIC-1001",
        name: "Acme Pharma",
        role: "manufacturer",
      },
      publicKey,
    });
    expect(payload.certificateId).toBeTruthy();
    expect(payload.validFrom).toBeTruthy();
    expect(payload.validTo).toBeTruthy();
  });

  test("certificate signature verifies with CA public key", () => {
    const caKeys = generateKeyPair();
    const stakeholderKeys = generateKeyPair();
    const certificateBundle = issueCertificate(
      {
        name: "Acme Pharma",
        role: "manufacturer",
        email: "acme@example.com",
        license_number: "LIC-1001",
        publicKey: stakeholderKeys.publicKey,
      },
      caKeys.privateKey
    );

    expect(verifyCertificate(certificateBundle, caKeys.publicKey)).toBe(true);
  });

  test("tampered certificates fail verification", () => {
    const caKeys = generateKeyPair();
    const stakeholderKeys = generateKeyPair();
    const certificateBundle = issueCertificate(
      {
        name: "Acme Pharma",
        role: "manufacturer",
        email: "acme@example.com",
        license_number: "LIC-1001",
        publicKey: stakeholderKeys.publicKey,
      },
      caKeys.privateKey
    );
    const payload = decodeCertificatePayload(certificateBundle.certificate);

    payload.subject.name = "Tampered Pharma";

    expect(
      verifyCertificate(
        {
          certificate: Buffer.from(JSON.stringify(payload)).toString("base64"),
          signature: certificateBundle.signature,
        },
        caKeys.publicKey
      )
    ).toBe(false);
  });
});
