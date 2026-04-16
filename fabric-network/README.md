# Fabric network bring-up

This folder wraps the upstream `hyperledger/fabric-samples` test-network so the
PharmaChain stack can be stood up with a single script.

```bash
./network.sh up        # bootstrap + channel + chaincode
./network.sh enroll    # enroll an admin identity into backend/wallet
./network.sh down       # tear everything down
```

The script clones `fabric-samples` into `./_work/fabric-samples` on first run
and installs Fabric binaries into `./_work/bin`. Nothing is committed under
`_work/` — it's gitignored.

## What it builds

- Two peer organisations: **Org1** (manufacturer/distributor) and **Org2**
  (pharmacy/regulator)
- One orderer (solo/raft, whatever the upstream sample ships)
- One channel named `pharmachannel`
- The `pharma-traceability` Node.js chaincode installed on both orgs
