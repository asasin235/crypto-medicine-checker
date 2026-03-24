# Crypto Medicine Checker

Sprint 1 foundation for a medicine traceability platform with:

- `backend`: Express API with health checks, MySQL pool, validation, logger, and Jest tests
- `frontend`: Next.js App Router shell with responsive placeholder routes
- `docker-compose.yml`: local stack for MySQL 8, backend, and frontend

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

## Docker

Start the full stack with:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- MySQL: `localhost:3306`

On first startup, MySQL runs:

- `backend/src/migrations/001_initial_schema.sql`
- `backend/src/seeds/001_genesis_ledger_block.sql`

The default database is `pharma_chain`.
