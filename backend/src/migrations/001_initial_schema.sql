CREATE DATABASE IF NOT EXISTS pharma_chain;
USE pharma_chain;

CREATE TABLE IF NOT EXISTS stakeholders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role ENUM('manufacturer', 'distributor', 'pharmacy', 'regulator') NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  aadhaar_number CHAR(12) DEFAULT NULL,
  license_number VARCHAR(64) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(128) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_stakeholder_email (email),
  UNIQUE KEY unique_stakeholder_aadhaar (aadhaar_number),
  UNIQUE KEY unique_stakeholder_license (license_number)
);

CREATE TABLE IF NOT EXISTS patients (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  aadhaar_number CHAR(12) NOT NULL,
  date_of_birth DATE NOT NULL,
  qr_payload TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_patient_email (email),
  UNIQUE KEY unique_patient_aadhaar (aadhaar_number)
);

CREATE TABLE IF NOT EXISTS medicines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  manufacturer_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(64) NOT NULL,
  description TEXT DEFAULT NULL,
  dosage_form VARCHAR(64) DEFAULT NULL,
  strength VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_medicine_sku (sku),
  CONSTRAINT fk_medicines_manufacturer
    FOREIGN KEY (manufacturer_id) REFERENCES stakeholders(id)
      ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS batches (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  medicine_id BIGINT UNSIGNED NOT NULL,
  manufacturer_id BIGINT UNSIGNED NOT NULL,
  current_owner_id BIGINT UNSIGNED DEFAULT NULL,
  batch_number VARCHAR(64) NOT NULL,
  manufacture_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  status ENUM('created', 'in_transit', 'dispensed', 'recalled', 'expired') NOT NULL DEFAULT 'created',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_batch_number (batch_number),
  CONSTRAINT fk_batches_medicine
    FOREIGN KEY (medicine_id) REFERENCES medicines(id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_batches_manufacturer
    FOREIGN KEY (manufacturer_id) REFERENCES stakeholders(id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_batches_owner
    FOREIGN KEY (current_owner_id) REFERENCES stakeholders(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_batch_dates CHECK (expiry_date >= manufacture_date)
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  medicine_id BIGINT UNSIGNED NOT NULL,
  prescriber_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(255) NOT NULL,
  instructions TEXT DEFAULT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_prescriptions_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_prescriptions_medicine
    FOREIGN KEY (medicine_id) REFERENCES medicines(id)
      ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ledger_blocks table removed: the ledger now lives on Hyperledger Fabric.
-- See chaincode/pharma-traceability and backend/src/services/ledger.service.js.

CREATE TABLE IF NOT EXISTS verification_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  batch_id BIGINT UNSIGNED NOT NULL,
  stakeholder_id BIGINT UNSIGNED DEFAULT NULL,
  verification_status ENUM('verified', 'warning', 'rejected') NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_verification_batch
    FOREIGN KEY (batch_id) REFERENCES batches(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_verification_stakeholder
    FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(id)
      ON DELETE SET NULL ON UPDATE CASCADE
);
