const AppError = require("../utils/app-error");
const { getPool, getConnection } = require("../config/db");
const { decryptPrivateKey } = require("./crypto.service");
const { generateQR } = require("./qr.service");
const { appendLedgerEntry } = require("./ledger.service");

function buildSerial(year, sequence) {
  return `MED-${year}-${String(sequence).padStart(6, "0")}`;
}

async function generateUnitsForBatch(currentUser, batchId, count) {
  const pool = getPool();

  // Load the batch and verify ownership
  const [batches] = await pool.execute(
    `SELECT b.id, b.manufacturer_id, b.quantity,
            s.encrypted_private_key, s.public_key
     FROM batches b
     JOIN stakeholders s ON s.id = b.manufacturer_id
     WHERE b.id = ? LIMIT 1`,
    [batchId]
  );

  if (batches.length === 0) {
    throw new AppError("Batch not found", 404);
  }

  const batch = batches[0];

  if (batch.manufacturer_id !== currentUser.id) {
    throw new AppError("Cannot generate units for another manufacturer's batch", 403);
  }

  const unitCount = count || batch.quantity;

  if (unitCount < 1 || unitCount > 10000) {
    throw new AppError("Unit count must be between 1 and 10000", 400);
  }

  const manufacturerPrivateKey = decryptPrivateKey(
    batch.encrypted_private_key,
    process.env.KEY_ENCRYPTION_PASSPHRASE || "dev-key-passphrase"
  );

  const year = new Date().getFullYear();
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // Get current max sequence for this year to avoid collisions
    const [existing] = await connection.execute(
      "SELECT serial_number FROM medicine_units WHERE serial_number LIKE ? ORDER BY serial_number DESC LIMIT 1",
      [`MED-${year}-%`]
    );

    let sequence = 1;

    if (existing.length > 0) {
      const lastSerial = existing[0].serial_number;
      sequence = parseInt(lastSerial.split("-")[2], 10) + 1;
    }

    const units = [];

    for (let i = 0; i < unitCount; i++) {
      const serial = buildSerial(year, sequence + i);
      const unitData = {
        serial,
        batch_id: batchId,
        manufacturer_id: currentUser.id,
      };

      const { base64, signature } = await generateQR(unitData, manufacturerPrivateKey);

      await connection.execute(
        `INSERT INTO medicine_units (batch_id, serial_number, qr_data, qr_signature, qr_image_b64)
         VALUES (?, ?, ?, ?, ?)`,
        [batchId, serial, JSON.stringify(unitData), signature, base64]
      );

      await appendLedgerEntry(connection, {
        actorId: currentUser.id,
        entityId: batchId,
        entityType: "medicine_unit",
        event: "manufacture",
        serial,
      });

      units.push({ serial, qr_data: unitData });
    }

    await connection.commit();

    return units;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getMedicineUnitBySerial(serial) {
  const pool = getPool();

  const [rows] = await pool.execute(
    `SELECT u.id, u.batch_id, u.serial_number, u.qr_data,
            u.qr_signature, u.qr_image_b64, u.created_at,
            b.batch_number, b.manufacture_date, b.expiry_date, b.status,
            m.name AS medicine_name, m.sku
     FROM medicine_units u
     JOIN batches b ON b.id = u.batch_id
     JOIN medicines m ON m.id = b.medicine_id
     WHERE u.serial_number = ? LIMIT 1`,
    [serial]
  );

  if (rows.length === 0) {
    throw new AppError("Medicine unit not found", 404);
  }

  return rows[0];
}

module.exports = {
  generateUnitsForBatch,
  getMedicineUnitBySerial,
};
