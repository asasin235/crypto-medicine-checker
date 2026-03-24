USE pharma_chain;

ALTER TABLE patients
  MODIFY aadhaar_number CHAR(12) NULL;

ALTER TABLE patients
  ADD COLUMN aadhaar_hash CHAR(64) NULL AFTER email;

ALTER TABLE patients
  ADD CONSTRAINT unique_patient_aadhaar_hash UNIQUE (aadhaar_hash);
