# Hyperledger Fabric integration

This project replaces the original MySQL `ledger_blocks` hash-chain with a real
**Hyperledger Fabric** ledger. The chaincode lives in
`chaincode/pharma-traceability/` and is written in Node.js using
`fabric-contract-api`. The Express backend talks to the peer via
`fabric-network` (Gateway SDK) through
`backend/src/services/fabric-gateway.js`.

## Architecture

```
┌────────────┐     submit/evaluate      ┌────────────────────────┐
│  Express   │ ───────────────────────▶ │  Fabric peer (Org1)    │
│  backend   │                          │  chaincode: pharma-    │
│            │ ◀─── LedgerEvent JSON ── │  traceability          │
└────────────┘                          └─────────┬──────────────┘
      │                                           │ gossip
      │ MySQL (business data only —               ▼
      │  stakeholders, batches, units)     ┌────────────────┐
      ▼                                    │  Org2 peer     │
 ┌────────────┐                            └────────────────┘
 │  MySQL 8   │
 └────────────┘
```

- **MySQL** stores mutable business data (stakeholders, medicines, batches,
  prescriptions, medicine units).
- **Fabric** is the append-only source of truth for audit-relevant events:
  stakeholder registration, batch creation, medicine unit manufacture, etc.
- Events are replayable and immutable. History is queryable via
  `GET /api/ledger/:id/history`.

## Chaincode API

| Function                                      | Description                                       |
| --------------------------------------------- | ------------------------------------------------- |
| `InitLedger()`                                | Seeds the genesis event. Called during deploy.    |
| `AppendEvent(eventJson)`                      | Writes a new ledger event.                        |
| `GetEventById(id)`                            | Fetches a single event by id.                     |
| `GetAllEvents()`                              | Returns every event on the channel.               |
| `GetEventsByEntity(entityType, entityId)`     | Filters events by entity.                         |
| `QueryHistory(id)`                            | Returns mutation history for a given event key.   |

Event shape:

```jsonc
{
  "docType": "ledgerEvent",
  "id": "uuid",
  "txId": "fabric-tx-id",
  "timestamp": "2026-04-16T12:00:00.000Z",
  "actorId": "7",
  "entityId": "42",
  "entityType": "batch",
  "event": "batch_created",
  "payload": { "batch_number": "BN-1", "medicine_id": 9 },
  "contentHash": "sha256(payload)"
}
```

## Running locally

### 1. Bring up Fabric

```bash
cd fabric-network
./network.sh up
./network.sh enroll
```

This:

1. Clones `hyperledger/fabric-samples` (release-2.5) into `fabric-network/_work/`
2. Downloads Fabric binaries (peer, orderer, fabric-ca-client)
3. Creates channel `pharmachannel` with two orgs
4. Packages and deploys the `pharma-traceability` chaincode
5. Copies the Org1 connection profile to `backend/fabric/connection/`

### 2. Bring up MySQL + backend + frontend

```bash
docker compose up --build
```

The backend lazily connects to Fabric on the first ledger call. The wallet is
bootstrapped by enrolling the `admin`/`adminpw` CA identity on first boot.

### 3. Verify

```bash
curl http://localhost:3001/api/ledger | jq .
# → { "count": 1, "events": [ { "event": "genesis", ... } ] }
```

Register a new stakeholder (or run `npm run seed:dev`) and the ledger count
will grow.

## Environment variables

| Var                         | Default                  | Purpose                                     |
| --------------------------- | ------------------------ | ------------------------------------------- |
| `FABRIC_CHANNEL`            | `pharmachannel`          | Channel name                                |
| `FABRIC_CHAINCODE`          | `pharma-traceability`    | Deployed chaincode name                     |
| `FABRIC_CONTRACT`           | `PharmaContract`         | Contract class                              |
| `FABRIC_MSP_ID`             | `Org1MSP`                | MSP of the identity used by the backend     |
| `FABRIC_IDENTITY`           | `pharmachain-admin`      | Wallet label                                |
| `FABRIC_CA_ADMIN_USER`      | `admin`                  | Bootstrap CA user                           |
| `FABRIC_CA_ADMIN_PASSWORD`  | `adminpw`                | Bootstrap CA password                       |
| `FABRIC_WALLET_PATH`        | `backend/fabric/wallet`  | FS wallet                                   |
| `FABRIC_CONNECTION_PROFILE` | `backend/fabric/...json` | Connection profile                          |
| `FABRIC_AS_LOCALHOST`       | `true`                   | Set `false` when backend is in Docker       |
| `FABRIC_DISABLED`           | —                        | Set `true` to bypass Fabric (tests only)    |
| `LEDGER_SKIP_ON_ERROR`      | —                        | Log & continue on Fabric failure (dev seed) |

## Tests

```bash
cd backend && npm test
```

Tests run with `FABRIC_DISABLED=true` and inject a mock contract into the
gateway via `fabricGateway.__setContract(...)`. See
`backend/tests/helpers/setup.js`.

The chaincode has its own Mocha test suite:

```bash
cd chaincode/pharma-traceability && npm install && npm test
```

## Migration from the legacy ledger

The legacy MySQL `ledger_blocks` table is dropped by migration
`006_drop_ledger_blocks.sql`. No data migration script is provided — the old
chain was only populated with dev/test data. If you need to preserve it, snapshot
the table before upgrading and re-play events against the new chaincode with
`appendLedgerEntry`.
