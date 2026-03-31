const AppError = require("../utils/app-error");
const { getPool, getConnection } = require("../config/db");
const { appendLedgerEntry } = require("./ledger.service");

async function createBatch(currentUser, payload) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // Verify the medicine belongs to this manufacturer
    const [medicines] = await connection.execute(
      "SELECT id, manufacturer_id FROM medicines WHERE id = ? LIMIT 1",
      [payload.medicine_id]
    );

    if (medicines.length === 0) {
      throw new AppError("Medicine not found", 404);
    }

    if (medicines[0].manufacturer_id !== currentUser.id) {
      throw new AppError("Cannot create a batch for another manufacturer's medicine", 403);
    }

    // Check for duplicate batch number
    const [duplicates] = await connection.execute(
      "SELECT id FROM batches WHERE batch_number = ? LIMIT 1",
      [payload.batch_number]
    );

    if (duplicates.length > 0) {
      throw new AppError("Batch number already exists", 409);
    }

    const [result] = await connection.execute(
      `INSERT INTO batches
         (medicine_id, manufacturer_id, current_owner_id, batch_number,
          manufacture_date, expiry_date, quantity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.medicine_id,
        currentUser.id,
        payload.current_owner_id || null,
        payload.batch_number,
        payload.manufacture_date,
        payload.expiry_date,
        payload.quantity,
        payload.status || "created",
      ]
    );

    await appendLedgerEntry(connection, {
      actorId: currentUser.id,
      entityId: result.insertId,
      entityType: "batch",
      event: "batch_created",
      medicine_id: payload.medicine_id,
      batch_number: payload.batch_number,
    });

    await connection.commit();

    return {
      id: result.insertId,
      medicine_id: payload.medicine_id,
      manufacturer_id: currentUser.id,
      batch_number: payload.batch_number,
      manufacture_date: payload.manufacture_date,
      expiry_date: payload.expiry_date,
      quantity: payload.quantity,
      status: payload.status || "created",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listBatches(currentUser) {
  const pool = getPool();

  const isManufacturer = currentUser.role === "manufacturer";
  const query = isManufacturer
    ? `SELECT b.id, b.medicine_id, b.manufacturer_id, b.batch_number,
              b.manufacture_date, b.expiry_date, b.quantity, b.status, b.created_at,
              m.name AS medicine_name, m.sku
       FROM batches b
       JOIN medicines m ON m.id = b.medicine_id
       WHERE b.manufacturer_id = ?
       ORDER BY b.created_at DESC`
    : `SELECT b.id, b.medicine_id, b.manufacturer_id, b.batch_number,
              b.manufacture_date, b.expiry_date, b.quantity, b.status, b.created_at,
              m.name AS medicine_name, m.sku
       FROM batches b
       JOIN medicines m ON m.id = b.medicine_id
       ORDER BY b.created_at DESC`;

  const params = isManufacturer ? [currentUser.id] : [];
  const [rows] = await pool.execute(query, params);

  return rows;
}

async function getBatchById(id) {
  const pool = getPool();

  const [rows] = await pool.execute(
    `SELECT b.id, b.medicine_id, b.manufacturer_id, b.current_owner_id,
            b.batch_number, b.manufacture_date, b.expiry_date, b.quantity,
            b.status, b.created_at,
            m.name AS medicine_name, m.sku,
            s.name AS manufacturer_name
     FROM batches b
     JOIN medicines m ON m.id = b.medicine_id
     JOIN stakeholders s ON s.id = b.manufacturer_id
     WHERE b.id = ? LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    throw new AppError("Batch not found", 404);
  }

  return rows[0];
}

module.exports = {
  createBatch,
  getBatchById,
  listBatches,
};
