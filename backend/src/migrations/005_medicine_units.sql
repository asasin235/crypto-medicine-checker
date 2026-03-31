USE pharma_chain;

CREATE TABLE IF NOT EXISTS medicine_units (
  id            BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  batch_id      BIGINT UNSIGNED   NOT NULL,
  serial_number VARCHAR(64)       NOT NULL,
  qr_data       TEXT              NOT NULL,
  qr_signature  TEXT              NOT NULL,
  qr_image_b64  LONGTEXT          NOT NULL,
  created_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_serial (serial_number),
  CONSTRAINT fk_units_batch
    FOREIGN KEY (batch_id) REFERENCES batches(id)
      ON DELETE CASCADE ON UPDATE CASCADE
);
