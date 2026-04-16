const bcrypt = require("bcryptjs");

const { closePool, getConnection } = require("../config/db");
const { issueCertificate } = require("../services/certificate.service");
const { encryptPrivateKey, generateKeyPair } = require("../services/crypto.service");

function getSeedConfig() {
  return {
    adminEmail: process.env.CA_ADMIN_EMAIL || "admin@pharmachain.local",
    adminName: process.env.CA_ADMIN_NAME || "PharmaChain Central Authority",
    adminPassword: process.env.CA_ADMIN_PASSWORD || "admin123",
    passphrase: process.env.KEY_ENCRYPTION_PASSPHRASE || "dev-key-passphrase",
  };
}

// Genesis block provisioning moved to Fabric chaincode `InitLedger`.
// See chaincode/pharma-traceability/src/pharma-contract.js.

async function ensureCentralAuthorityAdmin(connection) {
  const config = getSeedConfig();
  const [rows] = await connection.execute(
    "SELECT id FROM stakeholders WHERE email = ? LIMIT 1",
    [config.adminEmail]
  );

  if (rows.length > 0) {
    return false;
  }

  const { publicKey, privateKey } = generateKeyPair();
  const encryptedPrivateKey = encryptPrivateKey(privateKey, config.passphrase);
  const certificateBundle = issueCertificate(
    {
      email: config.adminEmail,
      license_number: "CA-ADMIN-001",
      name: config.adminName,
      role: "central_authority",
      publicKey,
    },
    privateKey,
    {
      issuer: "PharmaChain Central Authority",
    }
  );
  const passwordHash = await bcrypt.hash(config.adminPassword, 10);

  await connection.execute(
    `INSERT INTO stakeholders
      (role, name, contact_name, company_name, email, license_number, password_hash, public_key, encrypted_private_key, certificate, certificate_signature, certificate_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "central_authority",
      config.adminName,
      config.adminName,
      config.adminName,
      config.adminEmail,
      "CA-ADMIN-001",
      passwordHash,
      publicKey,
      encryptedPrivateKey,
      certificateBundle.certificate,
      certificateBundle.signature,
      "valid",
    ]
  );

  return true;
}

async function runSeed() {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    await ensureCentralAuthorityAdmin(connection);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await closePool();
  }
}

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log("Seed completed successfully");
    })
    .catch((error) => {
      console.error("Seed failed", error);
      process.exitCode = 1;
    });
}

module.exports = {
  ensureCentralAuthorityAdmin,
  getSeedConfig,
  runSeed,
};
