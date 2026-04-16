# LOGIX — Project Status

**Project:** Medicine Traceability System using Hyperledger Fabric
**Authors:** Aakif Rashid (22BCS044), Mohd. Areez (22BCS051)
**Supervisor:** Dr. Zeba Anwar
**Institution:** Jamia Millia Islamia, Department of Computer Engineering
**Academic Session:** 2025-26
**Branch:** `feat/hyperledger-fabric`
**PR:** [#6](https://github.com/asasin235/crypto-medicine-checker/pull/6)
**Last updated:** 17 April 2026

---

## ✅ Done

### Code migration (backend + chain)

- [x] Designed the migration plan — Hyperledger Fabric 2.5, Node.js chaincode, full replacement of MySQL `ledger_blocks`, local Fabric test-network
- [x] **Chaincode** `pharma-traceability` with 6 functions
  - `InitLedger` (genesis)
  - `AppendEvent` (write, dedup, emits chaincode event)
  - `GetEventById`, `GetAllEvents`, `GetEventsByEntity`, `QueryHistory`
- [x] Chaincode packaging: `package.json`, `src/index.js`, `test/pharma-contract.test.js` (mocha + fabric-mock-stub)
- [x] **Fabric test network** (`fabric-network/network.sh`) — 2 peer orgs (Org1, Org2) + Raft orderer, CouchDB, automatic channel + CC deploy
- [x] **Backend gateway** `backend/src/services/fabric-gateway.js` — wallet bootstrap, cached contract handle, `__setContract()` test hook
- [x] **Ledger service rewrite** `backend/src/services/ledger.service.js` — preserves `appendLedgerEntry(conn, event)` signature, `LEDGER_SKIP_ON_ERROR` escape hatch
- [x] **HTTP routes** `backend/src/routes/ledger.routes.js` — GET /api/ledger, /:id, /:id/history, /by-entity/:type/:id
- [x] **DB migrations**
  - New: `006_drop_ledger_blocks.sql`
  - Modified: `001_initial_schema.sql` (removed ledger_blocks + trigger)
  - Modified: `seed.js` (removed ensureGenesisBlock)
  - Deleted: `seeds/001_genesis_ledger_block.sql`
- [x] **Tests** — 33 backend tests passing (mock contract injected via `fabric-gateway.__setContract`)
  - New: `tests/unit/ledger.service.test.js` (8 tests)
  - Updated: `tests/unit/seed.test.js`
  - Updated: `tests/helpers/setup.js`
- [x] **Dependencies** — added `fabric-network@^2.2.20`, `fabric-ca-client@^2.2.20`
- [x] **docker-compose.yml** — Fabric env vars + `./backend/fabric:/app/fabric:ro` volume
- [x] **Docs** — `HYPERLEDGER.md` (setup walkthrough), `README.md` updated, `.gitignore` excludes crypto material

### Final-year project deliverables (inside LOGIX/)

- [x] `architecture.png` — full-stack architecture diagram (client tier → Next.js → Express API → MySQL + Fabric network + Chaincode callout)
- [x] `erd.png` — ERD of 8 MySQL tables with `ledger_blocks` shown dropped
- [x] `Major-Report.pdf` — 27 pages, strictly follows sample TOC:
  - Cover · Certificate · Declaration · Acknowledgements · Abstract
  - Table of Contents · List of Figures (11) · List of Tables (7) · Abbreviations
  - Ch 1 Introduction (Motivation, Medicine Traceability & Anti-Counterfeiting, Applications, Challenges, Literature Review, DLT domain intro)
  - Ch 2 Related Work (Tseng/Gcoin, Jamil/Ethereum, Musamih/Fabric, MediLedger, IBM Food Trust)
  - Ch 3 About the Project (Approach, Dataset, Hyperledger Fabric, Why Fabric, Three Layers, EDA, Event Normalization, Chaincode Dev, Results)
  - Ch 4 Future Work, Conclusion, References (15 refs with clickable URLs)
- [x] `Code-Changes.pdf` — 15 pages, technical companion covering all 22 touched files
- [x] Source scripts (`make_architecture.py`, `make_erd.py`, `make_major_report.py`, `make_code_changes.py`) + fonts
- [x] Committed & pushed to `feat/hyperledger-fabric` (commit `bd5b4e6`)

---

## 🚧 Remaining / Recommended

### Project-side (code)

- [ ] **Run `./fabric-network/network.sh up` on the target lab machine** — the scripts assume `fabric-samples` is on PATH; confirm Docker, Node 18, Go are installed
- [ ] **Enroll an `appUser` identity** and copy the wallet into `backend/fabric/wallet/` so the gateway can connect in staging
- [ ] **End-to-end smoke test** on lab hardware: create a batch via UI → confirm `AppendEvent` shows up in `fabric-peer` logs → `curl /api/ledger` returns it
- [ ] **Frontend display of chain metadata** — surface `txId` + `committedAt` in the ledger UI (currently only raw event data shown)
- [ ] **TLS-mutual auth** from frontend → backend → peer (currently only peer-side TLS)
- [ ] **CouchDB indexes** for `entityType`/`entityId` rich queries (perf)
- [ ] **Private data collections** for regulator-only fields (future work, already mentioned in report)
- [ ] **CI job** that spins up a disposable Fabric network and runs the full test suite against it (currently CI uses mock contract only)

### Report-side (before final submission)

- [ ] **Professor sign-off** — get Dr. Zeba Anwar to review Major-Report.pdf and request any format/wording corrections
- [ ] **Certificate page signature** — the Certificate page is pre-formatted; Dr. Zeba Anwar needs to physically sign and date it
- [ ] **Declaration page signatures** — Aakif & Areez need to sign the printed copy
- [ ] **Front-page university seal / logo** (if required by your department's format — the sample didn't show one, so currently omitted)
- [ ] **Plagiarism check** — run the PDF through Turnitin / department's plagiarism tool before submission
- [ ] **Binding & final printing** — most JMI submissions require 2–3 hardbound copies + a soft copy on CD/USB
- [ ] **Merge PR #6 into `main`** once the project is officially accepted

### Presentation / viva prep (not in repo yet)

- [ ] **Slide deck** for the viva / final presentation (10–15 slides)
- [ ] **Live demo script** — steps to show: network up, UI flow, tamper attempt, audit trail via QueryHistory
- [ ] **Anticipated viva questions** — Why Fabric vs Ethereum? Why drop ledger_blocks entirely? How does endorsement work? Why 2 orgs and not 1 or 3?

---

## File map (inside LOGIX/)

| File | Purpose |
|---|---|
| `Major-Report.pdf` | 27-page B.Tech project report — matches sample TOC |
| `Code-Changes.pdf` | 15-page technical companion, all code deltas |
| `architecture.png` | System architecture diagram |
| `erd.png` | Entity-relationship diagram of MySQL schema |
| `make_major_report.py` | ReportLab source for Major-Report.pdf |
| `make_code_changes.py` | ReportLab source for Code-Changes.pdf |
| `make_architecture.py` | matplotlib source for architecture.png |
| `make_erd.py` | matplotlib source for erd.png |
| `fonts/` | Inter, DM Sans, JetBrains Mono TTFs (embedded in PDFs) |
| `STATUS.md` | This file |

---

*Generated 17 April 2026 · commit next after this.*
