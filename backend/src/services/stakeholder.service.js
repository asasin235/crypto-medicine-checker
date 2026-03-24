const bcrypt = require("bcryptjs");

const AppError = require("../utils/app-error");
const { getConnection } = require("../config/db");
const { decryptPrivateKey, encryptPrivateKey, generateKeyPair } = require("./crypto.service");
const { issueCertificate } = require("./certificate.service");
const { appendLedgerEntry } = require("./ledger.service");

async function loadCentralAuthority(connection, userId) {
  const [rows] = await connection.execute(
    "SELECT id, role, encrypted_private_key FROM stakeholders WHERE id = ? LIMIT 1",
    [userId]
  );

  return rows[0];
}

async function registerStakeholder(currentUser, payload) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const [duplicates] = await connection.execute(
      "SELECT id FROM stakeholders WHERE email = ? OR license_number = ? LIMIT 1",
      [payload.email, payload.license_number]
    );

    if (duplicates.length > 0) {
      throw new AppError("Stakeholder email or license number already exists", 409);
    }

    const centralAuthority = await loadCentralAuthority(connection, currentUser.id);

    if (!centralAuthority || centralAuthority.role !== "central_authority") {
      throw new AppError("Only Central Authority can register stakeholders", 403);
    }

    const caPrivateKey = decryptPrivateKey(
      centralAuthority.encrypted_private_key,
      process.env.KEY_ENCRYPTION_PASSPHRASE || "dev-key-passphrase"
    );
    const { publicKey, privateKey } = generateKeyPair();
    const encryptedPrivateKey = encryptPrivateKey(
      privateKey,
      process.env.KEY_ENCRYPTION_PASSPHRASE || "dev-key-passphrase"
    );
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const certificateBundle = issueCertificate(
      {
        email: payload.email,
        license_number: payload.license_number,
        name: payload.name,
        role: payload.role,
        publicKey,
      },
      caPrivateKey
    );

    const [result] = await connection.execute(
      `INSERT INTO stakeholders
        (role, name, contact_name, company_name, email, license_number, password_hash, public_key, encrypted_private_key, certificate, certificate_signature, certificate_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.role,
        payload.name,
        payload.name,
        payload.name,
        payload.email,
        payload.license_number,
        passwordHash,
        publicKey,
        encryptedPrivateKey,
        certificateBundle.certificate,
        certificateBundle.signature,
        "valid",
      ]
    );

    await appendLedgerEntry(connection, {
      actorId: currentUser.id,
      entityId: result.insertId,
      entityType: "stakeholder",
      event: "stakeholder_registered",
      role: payload.role,
    });

    await connection.commit();

    return {
      id: result.insertId,
      role: payload.role,
      email: payload.email,
      name: payload.name,
      license_number: payload.license_number,
      certificate_status: "valid",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  registerStakeholder,
};
