USE pharma_chain;

ALTER TABLE stakeholders
  ADD COLUMN public_key LONGTEXT NULL AFTER password_hash,
  ADD COLUMN encrypted_private_key LONGTEXT NULL AFTER public_key,
  ADD COLUMN certificate LONGTEXT NULL AFTER encrypted_private_key,
  ADD COLUMN certificate_signature LONGTEXT NULL AFTER certificate,
  ADD COLUMN certificate_status ENUM('valid', 'expired', 'revoked') NOT NULL DEFAULT 'valid' AFTER certificate_signature;
