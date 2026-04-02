const { getPool } = require("../config/db");

async function listPrescriptions() {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT p.id, p.prescriber_name, p.dosage, p.instructions, p.issued_at,
            pat.full_name AS patient_name, pat.email AS patient_email,
            m.name AS medicine_name, m.sku
     FROM prescriptions p
     JOIN patients pat ON p.patient_id = pat.id
     JOIN medicines m ON p.medicine_id = m.id
     ORDER BY p.issued_at DESC`
  );
  return rows;
}

module.exports = { listPrescriptions };
