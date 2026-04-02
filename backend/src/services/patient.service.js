const bcrypt = require("bcryptjs");

const AppError = require("../utils/app-error");
const { getPool } = require("../config/db");
const { hashSha256 } = require("./crypto.service");

async function registerPatient(payload) {
  const pool = getPool();
  const aadhaarHash = hashSha256(payload.aadhaar_number);

  const [duplicates] = await pool.execute(
    "SELECT id FROM patients WHERE aadhaar_hash = ? LIMIT 1",
    [aadhaarHash]
  );

  if (duplicates.length > 0) {
    throw new AppError("Patient with this Aadhaar already exists", 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const [result] = await pool.execute(
    `INSERT INTO patients (full_name, email, aadhaar_number, aadhaar_hash, password_hash, date_of_birth)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payload.full_name, payload.email, null, aadhaarHash, passwordHash, payload.date_of_birth]
  );

  return {
    id: result.insertId,
    full_name: payload.full_name,
    email: payload.email,
    aadhaar_hash: aadhaarHash,
    date_of_birth: payload.date_of_birth,
  };
}

async function listPatients() {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, date_of_birth, created_at FROM patients ORDER BY created_at DESC`
  );
  return rows;
}

module.exports = {
  registerPatient,
  listPatients,
};
