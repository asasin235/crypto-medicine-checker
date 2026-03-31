const { hashSha256 } = require("./crypto.service");

function normalizePreviousHash(block) {
  return block?.current_hash || "0".repeat(64);
}

function normalizeNextIndex(block) {
  return typeof block?.block_index === "number" ? block.block_index + 1 : 1;
}

async function appendLedgerEntry(connection, event) {
  const [rows] = await connection.execute(
    "SELECT block_index, current_hash FROM ledger_blocks ORDER BY block_index DESC LIMIT 1"
  );
  const latestBlock = rows[0];
  const previousHash = normalizePreviousHash(latestBlock);
  const blockIndex = normalizeNextIndex(latestBlock);
  const payload = JSON.stringify(event);
  const currentHash = hashSha256(`${previousHash}:${payload}:${blockIndex}`);

  await connection.execute(
    "INSERT INTO ledger_blocks (block_index, previous_hash, current_hash, payload) VALUES (?, ?, ?, ?)",
    [blockIndex, previousHash, currentHash, payload]
  );
}

module.exports = {
  appendLedgerEntry,
};
