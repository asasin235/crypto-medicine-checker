USE pharma_chain;

INSERT INTO ledger_blocks (block_index, previous_hash, current_hash, payload)
VALUES (
  0,
  REPEAT('0', 64),
  SHA2(CONCAT(REPEAT('0', 64), 'genesis-ledger-block'), 256),
  JSON_OBJECT(
    'event', 'genesis',
    'message', 'Initial ledger block for pharma_chain'
  )
)
ON DUPLICATE KEY UPDATE current_hash = current_hash;
