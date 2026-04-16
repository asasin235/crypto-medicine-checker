# Crypto Medicine Checker

Medicine traceability platform built on **Hyperledger Fabric**:

- `chaincode/pharma-traceability`: Fabric chaincode (Node.js) — the source of truth for audit events
- `fabric-network`: scripts to bring up a local Fabric test-network and deploy the chaincode
- `backend`: Express API with MySQL pool, Fabric gateway, validation, logger, and Jest tests
- `frontend`: Next.js App Router shell with responsive routes
- `docker-compose.yml`: local stack for MySQL 8, backend, and frontend

See [`HYPERLEDGER.md`](./HYPERLEDGER.md) for the chain architecture and bring-up instructions.

## Local development

### Backend

```bash
cd backend
npm install
npm test
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run build
npm run dev
```

Auth tokens are currently stored in `localStorage` as a development placeholder. Before production, migrate to an `httpOnly` cookie/session approach and enforce strict XSS protections.

## Docker

Start the full stack with:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- MySQL: `localhost:3306`

On first startup, MySQL runs every file under `backend/src/migrations/*.sql`.
The default database is `pharma_chain`. The ledger is no longer in MySQL —
events live on the `pharma-traceability` chaincode. Bring up Fabric first:

```bash
cd fabric-network
./network.sh up
./network.sh enroll
```
