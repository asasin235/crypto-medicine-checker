const AppError = require("../utils/app-error");
const { getPool } = require("../config/db");

async function createMedicine(currentUser, payload) {
  const pool = getPool();

  const [duplicates] = await pool.execute(
    "SELECT id FROM medicines WHERE sku = ? LIMIT 1",
    [payload.sku]
  );

  if (duplicates.length > 0) {
    throw new AppError("Medicine with this SKU already exists", 409);
  }

  const [result] = await pool.execute(
    `INSERT INTO medicines (manufacturer_id, name, sku, description, dosage_form, strength)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      currentUser.id,
      payload.name,
      payload.sku,
      payload.description || null,
      payload.dosage_form,
      payload.strength,
    ]
  );

  return {
    id: result.insertId,
    manufacturer_id: currentUser.id,
    name: payload.name,
    sku: payload.sku,
    description: payload.description || null,
    dosage_form: payload.dosage_form,
    strength: payload.strength,
  };
}

async function listMedicines() {
  const pool = getPool();

  const [rows] = await pool.execute(
    `SELECT m.id, m.manufacturer_id, m.name, m.sku, m.description,
            m.dosage_form, m.strength, m.created_at,
            s.name AS manufacturer_name
     FROM medicines m
     JOIN stakeholders s ON s.id = m.manufacturer_id
     ORDER BY m.created_at DESC`
  );

  return rows;
}

async function getMedicineById(id) {
  const pool = getPool();

  const [rows] = await pool.execute(
    `SELECT m.id, m.manufacturer_id, m.name, m.sku, m.description,
            m.dosage_form, m.strength, m.created_at,
            s.name AS manufacturer_name
     FROM medicines m
     JOIN stakeholders s ON s.id = m.manufacturer_id
     WHERE m.id = ? LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    throw new AppError("Medicine not found", 404);
  }

  return rows[0];
}

module.exports = {
  createMedicine,
  getMedicineById,
  listMedicines,
};
