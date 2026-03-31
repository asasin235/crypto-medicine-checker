USE pharma_chain;

ALTER TABLE stakeholders
  MODIFY role ENUM('central_authority', 'manufacturer', 'distributor', 'pharmacy', 'doctor', 'regulator') NOT NULL;

ALTER TABLE stakeholders
  ADD COLUMN name VARCHAR(255) NULL AFTER role;

ALTER TABLE patients
  ADD COLUMN password_hash VARCHAR(255) NULL AFTER email;
