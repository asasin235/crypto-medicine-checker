-- Migration 006 — ledger moves to Hyperledger Fabric.
-- The previous MySQL hash-chain `ledger_blocks` is no longer the source of
-- truth. All new events are written to the `pharma-traceability` chaincode on
-- the `pharmachannel` channel.
USE pharma_chain;

DROP TABLE IF EXISTS ledger_blocks;
