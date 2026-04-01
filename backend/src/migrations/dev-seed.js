/**
 * dev-seed.js — populate all tables with realistic test data.
 *
 * Idempotent: each section checks before inserting, so you can run it
 * multiple times safely.
 *
 * Usage:
 *   node src/migrations/dev-seed.js
 *
 * ─── Credentials ──────────────────────────────────────────────────────────────
 *  Role               Email                         Password
 *  ─────────────────────────────────────────────────────────────────────────────
 *  Central Authority  admin@pharmachain.local        admin123
 *  Manufacturer 1     aurora@manufacturer.local      Mfr@1234
 *  Manufacturer 2     zenith@manufacturer.local      Mfr@1234
 *  Distributor 1      north@distributor.local        Dist@1234
 *  Distributor 2      east@distributor.local         Dist@1234
 *  Pharmacy           careplus@pharmacy.local        Pharm@1234
 *  Doctor             drmehra@hospital.local         Doc@1234
 *  Patient 1          rahul.sharma@patient.local     Pat@1234
 *  Patient 2          priya.singh@patient.local      Pat@1234
 *  Patient 3          amit.verma@patient.local       Pat@1234
 * ──────────────────────────────────────────────────────────────────────────────
 */

"use strict";

const bcrypt = require("bcryptjs");

const { closePool, getConnection } = require("../config/db");
const { issueCertificate } = require("../services/certificate.service");
const {
  decryptPrivateKey,
  encryptPrivateKey,
  generateKeyPair,
  hashSha256,
} = require("../services/crypto.service");
const { appendLedgerEntry } = require("../services/ledger.service");
const { generateQR } = require("../services/qr.service");

const PASSPHRASE = process.env.KEY_ENCRYPTION_PASSPHRASE || "dev-key-passphrase";
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync("Mfr@1234", 10);
const DIST_PASSWORD_HASH = bcrypt.hashSync("Dist@1234", 10);
const PHARM_PASSWORD_HASH = bcrypt.hashSync("Pharm@1234", 10);
const DOC_PASSWORD_HASH = bcrypt.hashSync("Doc@1234", 10);
const PAT_PASSWORD_HASH = bcrypt.hashSync("Pat@1234", 10);

// ─── helpers ──────────────────────────────────────────────────────────────────

async function findOrCreateStakeholder(connection, caPrivateKey, data) {
  const [rows] = await connection.execute(
    "SELECT id, encrypted_private_key, public_key FROM stakeholders WHERE email = ? LIMIT 1",
    [data.email]
  );
  if (rows.length > 0) return rows[0];

  const { publicKey, privateKey } = generateKeyPair();
  const encryptedPrivateKey = encryptPrivateKey(privateKey, PASSPHRASE);
  const cert = issueCertificate(
    {
      email: data.email,
      license_number: data.license_number,
      name: data.name,
      role: data.role,
      publicKey,
    },
    caPrivateKey
  );

  const [result] = await connection.execute(
    `INSERT INTO stakeholders
       (role, name, contact_name, company_name, email, license_number,
        password_hash, public_key, encrypted_private_key, certificate,
        certificate_signature, certificate_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.role,
      data.name,
      data.contact_name || data.name,
      data.company_name || data.name,
      data.email,
      data.license_number,
      data.password_hash,
      publicKey,
      encryptedPrivateKey,
      cert.certificate,
      cert.signature,
      "valid",
    ]
  );

  await appendLedgerEntry(connection, {
    actorId: 1,
    entityId: result.insertId,
    entityType: "stakeholder",
    event: "stakeholder_registered",
    role: data.role,
  });

  return { id: result.insertId, encrypted_private_key: encryptedPrivateKey, public_key: publicKey };
}

async function findOrCreatePatient(connection, data) {
  const aadhaarHash = hashSha256(data.aadhaar_number);
  const [rows] = await connection.execute(
    "SELECT id FROM patients WHERE aadhaar_hash = ? LIMIT 1",
    [aadhaarHash]
  );
  if (rows.length > 0) return rows[0];

  const [result] = await connection.execute(
    `INSERT INTO patients (full_name, email, aadhaar_number, aadhaar_hash, password_hash, date_of_birth)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.full_name, data.email, null, aadhaarHash, PAT_PASSWORD_HASH, data.date_of_birth]
  );

  return { id: result.insertId };
}

async function findOrCreateMedicine(connection, manufacturerId, data) {
  const [rows] = await connection.execute(
    "SELECT id FROM medicines WHERE sku = ? LIMIT 1",
    [data.sku]
  );
  if (rows.length > 0) return rows[0];

  const [result] = await connection.execute(
    `INSERT INTO medicines (manufacturer_id, name, sku, description, dosage_form, strength)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [manufacturerId, data.name, data.sku, data.description, data.dosage_form, data.strength]
  );

  return { id: result.insertId };
}

async function findOrCreateBatch(connection, manufacturerId, data) {
  const [rows] = await connection.execute(
    "SELECT id FROM batches WHERE batch_number = ? LIMIT 1",
    [data.batch_number]
  );
  if (rows.length > 0) return rows[0];

  const [result] = await connection.execute(
    `INSERT INTO batches
       (medicine_id, manufacturer_id, current_owner_id, batch_number,
        manufacture_date, expiry_date, quantity, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.medicine_id,
      manufacturerId,
      data.current_owner_id || null,
      data.batch_number,
      data.manufacture_date,
      data.expiry_date,
      data.quantity,
      data.status || "created",
    ]
  );

  await appendLedgerEntry(connection, {
    actorId: manufacturerId,
    entityId: result.insertId,
    entityType: "batch",
    event: "batch_created",
    medicine_id: data.medicine_id,
    batch_number: data.batch_number,
  });

  return { id: result.insertId };
}

async function seedMedicineUnits(connection, batch, manufacturerPrivateKey, manufacturerId) {
  const [existing] = await connection.execute(
    "SELECT COUNT(*) AS cnt FROM medicine_units WHERE batch_id = ?",
    [batch.id]
  );
  if (existing[0].cnt > 0) return;

  const year = new Date().getFullYear();
  const [lastRow] = await connection.execute(
    "SELECT serial_number FROM medicine_units WHERE serial_number LIKE ? ORDER BY serial_number DESC LIMIT 1",
    [`MED-${year}-%`]
  );
  let seq = lastRow.length > 0 ? parseInt(lastRow[0].serial_number.split("-")[2], 10) + 1 : 1;

  for (let i = 0; i < 5; i++) {
    const serial = `MED-${year}-${String(seq + i).padStart(6, "0")}`;
    const unitData = { serial, batch_id: batch.id, manufacturer_id: manufacturerId };
    const { base64, signature } = await generateQR(unitData, manufacturerPrivateKey);

    await connection.execute(
      `INSERT INTO medicine_units (batch_id, serial_number, qr_data, qr_signature, qr_image_b64)
       VALUES (?, ?, ?, ?, ?)`,
      [batch.id, serial, JSON.stringify(unitData), signature, base64]
    );

    await appendLedgerEntry(connection, {
      actorId: manufacturerId,
      entityId: batch.id,
      entityType: "medicine_unit",
      event: "manufacture",
      serial,
    });
  }
}

async function findOrCreatePrescription(connection, data) {
  const [rows] = await connection.execute(
    "SELECT id FROM prescriptions WHERE patient_id = ? AND medicine_id = ? LIMIT 1",
    [data.patient_id, data.medicine_id]
  );
  if (rows.length > 0) return rows[0];

  const [result] = await connection.execute(
    `INSERT INTO prescriptions (patient_id, medicine_id, prescriber_name, dosage, instructions)
     VALUES (?, ?, ?, ?, ?)`,
    [data.patient_id, data.medicine_id, data.prescriber_name, data.dosage, data.instructions]
  );

  return { id: result.insertId };
}

async function findOrCreateVerificationLog(connection, data) {
  const [rows] = await connection.execute(
    "SELECT id FROM verification_logs WHERE batch_id = ? AND stakeholder_id = ? LIMIT 1",
    [data.batch_id, data.stakeholder_id]
  );
  if (rows.length > 0) return rows[0];

  const [result] = await connection.execute(
    `INSERT INTO verification_logs (batch_id, stakeholder_id, verification_status, notes)
     VALUES (?, ?, ?, ?)`,
    [data.batch_id, data.stakeholder_id, data.verification_status, data.notes]
  );

  return { id: result.insertId };
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function runDevSeed() {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // 1. Load the CA admin (already seeded by seed.js on boot)
    const [caRows] = await connection.execute(
      "SELECT id, encrypted_private_key FROM stakeholders WHERE role = 'central_authority' LIMIT 1"
    );
    if (caRows.length === 0) {
      throw new Error("CA admin not found — run the main seed first (docker-compose up)");
    }
    const ca = caRows[0];
    const caPrivateKey = decryptPrivateKey(ca.encrypted_private_key, PASSPHRASE);

    // ── 2. Stakeholders ──────────────────────────────────────────────────────
    console.log("Seeding stakeholders…");

    const mfr1 = await findOrCreateStakeholder(connection, caPrivateKey, {
      role: "manufacturer",
      name: "Aurora Pharmaceuticals",
      contact_name: "Rakesh Gupta",
      company_name: "Aurora Pharmaceuticals Ltd.",
      email: "aurora@manufacturer.local",
      license_number: "MFR-AU-2024-001",
      password_hash: DEFAULT_PASSWORD_HASH,
    });

    const mfr2 = await findOrCreateStakeholder(connection, caPrivateKey, {
      role: "manufacturer",
      name: "Zenith BioSciences",
      contact_name: "Sunita Patel",
      company_name: "Zenith BioSciences Pvt. Ltd.",
      email: "zenith@manufacturer.local",
      license_number: "MFR-ZN-2024-002",
      password_hash: DEFAULT_PASSWORD_HASH,
    });

    const dist1 = await findOrCreateStakeholder(connection, caPrivateKey, {
      role: "distributor",
      name: "NorthStar Distribution",
      contact_name: "Anwar Khan",
      company_name: "NorthStar Distribution Co.",
      email: "north@distributor.local",
      license_number: "DIST-NS-2024-001",
      password_hash: DIST_PASSWORD_HASH,
    });

    const dist2 = await findOrCreateStakeholder(connection, caPrivateKey, {
      role: "distributor",
      name: "EastWay Pharma Logistics",
      contact_name: "Meena Rao",
      company_name: "EastWay Pharma Logistics",
      email: "east@distributor.local",
      license_number: "DIST-EW-2024-002",
      password_hash: DIST_PASSWORD_HASH,
    });

    const pharmacy = await findOrCreateStakeholder(connection, caPrivateKey, {
      role: "pharmacy",
      name: "CarePlus Pharmacy",
      contact_name: "Vikram Nair",
      company_name: "CarePlus Health Stores",
      email: "careplus@pharmacy.local",
      license_number: "PHRM-CP-2024-001",
      password_hash: PHARM_PASSWORD_HASH,
    });

    await findOrCreateStakeholder(connection, caPrivateKey, {
      role: "doctor",
      name: "Dr. Anjali Mehra",
      contact_name: "Dr. Anjali Mehra",
      company_name: "City General Hospital",
      email: "drmehra@hospital.local",
      license_number: "DOC-AM-2024-001",
      password_hash: DOC_PASSWORD_HASH,
    });

    // ── 3. Patients ──────────────────────────────────────────────────────────
    console.log("Seeding patients…");

    const patient1 = await findOrCreatePatient(connection, {
      full_name: "Rahul Sharma",
      email: "rahul.sharma@patient.local",
      aadhaar_number: "123456789012",
      date_of_birth: "1990-05-15",
    });

    const patient2 = await findOrCreatePatient(connection, {
      full_name: "Priya Singh",
      email: "priya.singh@patient.local",
      aadhaar_number: "234567890123",
      date_of_birth: "1985-11-22",
    });

    const patient3 = await findOrCreatePatient(connection, {
      full_name: "Amit Verma",
      email: "amit.verma@patient.local",
      aadhaar_number: "345678901234",
      date_of_birth: "1998-03-07",
    });

    // ── 4. Medicines ─────────────────────────────────────────────────────────
    console.log("Seeding medicines…");

    const med1 = await findOrCreateMedicine(connection, mfr1.id, {
      name: "Amoxicillin 500mg",
      sku: "AMX-500-CAP",
      description: "Broad-spectrum antibiotic — capsule form",
      dosage_form: "capsule",
      strength: "500mg",
    });

    const med2 = await findOrCreateMedicine(connection, mfr1.id, {
      name: "Azithromycin 250mg",
      sku: "AZI-250-TAB",
      description: "Macrolide antibiotic — tablet form",
      dosage_form: "tablet",
      strength: "250mg",
    });

    const med3 = await findOrCreateMedicine(connection, mfr2.id, {
      name: "Ciprofloxacin 500mg",
      sku: "CIP-500-TAB",
      description: "Fluoroquinolone antibiotic — tablet form",
      dosage_form: "tablet",
      strength: "500mg",
    });

    const med4 = await findOrCreateMedicine(connection, mfr2.id, {
      name: "Doxycycline 100mg",
      sku: "DOX-100-CAP",
      description: "Tetracycline-class antibiotic — capsule form",
      dosage_form: "capsule",
      strength: "100mg",
    });

    // ── 5. Batches ───────────────────────────────────────────────────────────
    console.log("Seeding batches…");

    const batch1 = await findOrCreateBatch(connection, mfr1.id, {
      medicine_id: med1.id,
      batch_number: "BATCH-AMX-2026-001",
      manufacture_date: "2026-01-10",
      expiry_date: "2028-01-09",
      quantity: 10000,
      status: "created",
    });

    const batch2 = await findOrCreateBatch(connection, mfr1.id, {
      medicine_id: med2.id,
      batch_number: "BATCH-AZI-2026-001",
      manufacture_date: "2026-02-01",
      expiry_date: "2027-12-31",
      quantity: 5000,
      current_owner_id: dist1.id,
      status: "in_transit",
    });

    const batch3 = await findOrCreateBatch(connection, mfr2.id, {
      medicine_id: med3.id,
      batch_number: "BATCH-CIP-2026-001",
      manufacture_date: "2026-01-20",
      expiry_date: "2028-01-19",
      quantity: 8000,
      current_owner_id: pharmacy.id,
      status: "dispensed",
    });

    const batch4 = await findOrCreateBatch(connection, mfr2.id, {
      medicine_id: med4.id,
      batch_number: "BATCH-DOX-2026-001",
      manufacture_date: "2026-03-01",
      expiry_date: "2027-03-01",
      quantity: 3000,
      current_owner_id: dist2.id,
      status: "in_transit",
    });

    // ── 6. Medicine units (QR codes) ─────────────────────────────────────────
    console.log("Seeding medicine units (QR codes) for batch 1…");
    const mfr1PrivateKey = decryptPrivateKey(mfr1.encrypted_private_key, PASSPHRASE);
    await seedMedicineUnits(connection, batch1, mfr1PrivateKey, mfr1.id);

    console.log("Seeding medicine units (QR codes) for batch 3…");
    const mfr2PrivateKey = decryptPrivateKey(mfr2.encrypted_private_key, PASSPHRASE);
    await seedMedicineUnits(connection, batch3, mfr2PrivateKey, mfr2.id);

    // ── 7. Prescriptions ─────────────────────────────────────────────────────
    console.log("Seeding prescriptions…");

    await findOrCreatePrescription(connection, {
      patient_id: patient1.id,
      medicine_id: med1.id,
      prescriber_name: "Dr. Anjali Mehra",
      dosage: "1 capsule every 8 hours for 7 days",
      instructions: "Take with food. Complete full course.",
    });

    await findOrCreatePrescription(connection, {
      patient_id: patient2.id,
      medicine_id: med3.id,
      prescriber_name: "Dr. Anjali Mehra",
      dosage: "1 tablet twice daily for 5 days",
      instructions: "Avoid dairy products. Drink plenty of water.",
    });

    await findOrCreatePrescription(connection, {
      patient_id: patient3.id,
      medicine_id: med2.id,
      prescriber_name: "Dr. Anjali Mehra",
      dosage: "1 tablet once daily for 3 days",
      instructions: "Take on an empty stomach.",
    });

    // ── 8. Verification logs ─────────────────────────────────────────────────
    console.log("Seeding verification logs…");

    await findOrCreateVerificationLog(connection, {
      batch_id: batch2.id,
      stakeholder_id: dist1.id,
      verification_status: "verified",
      notes: "Batch received and certificates verified — all OK",
    });

    await findOrCreateVerificationLog(connection, {
      batch_id: batch3.id,
      stakeholder_id: pharmacy.id,
      verification_status: "verified",
      notes: "Dispensed to pharmacy after successful QR and certificate check",
    });

    await findOrCreateVerificationLog(connection, {
      batch_id: batch4.id,
      stakeholder_id: dist2.id,
      verification_status: "warning",
      notes: "Minor temperature deviation noted during transit — flagged for review",
    });

    await connection.commit();
    console.log("\n✅  Dev seed complete!\n");
    printCredentials();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await closePool();
  }
}

function printCredentials() {
  const rows = [
    ["Central Authority", "admin@pharmachain.local",    "admin123",  "stakeholder"],
    ["Manufacturer 1",    "aurora@manufacturer.local",  "Mfr@1234",  "stakeholder"],
    ["Manufacturer 2",    "zenith@manufacturer.local",  "Mfr@1234",  "stakeholder"],
    ["Distributor 1",     "north@distributor.local",    "Dist@1234", "stakeholder"],
    ["Distributor 2",     "east@distributor.local",     "Dist@1234", "stakeholder"],
    ["Pharmacy",          "careplus@pharmacy.local",    "Pharm@1234","stakeholder"],
    ["Doctor",            "drmehra@hospital.local",     "Doc@1234",  "stakeholder"],
    ["Patient 1",         "rahul.sharma@patient.local", "Pat@1234",  "patient"],
    ["Patient 2",         "priya.singh@patient.local",  "Pat@1234",  "patient"],
    ["Patient 3",         "amit.verma@patient.local",   "Pat@1234",  "patient"],
  ];

  console.log("─────────────────────────────────────────────────────────────────────");
  console.log(" Role                Email                          Password    Type");
  console.log("─────────────────────────────────────────────────────────────────────");
  for (const [role, email, pwd, type] of rows) {
    console.log(` ${role.padEnd(18)} ${email.padEnd(34)} ${pwd.padEnd(12)} ${type}`);
  }
  console.log("─────────────────────────────────────────────────────────────────────");
}

if (require.main === module) {
  runDevSeed().catch((err) => {
    console.error("Dev seed failed:", err.message);
    process.exitCode = 1;
  });
}

module.exports = { runDevSeed };
