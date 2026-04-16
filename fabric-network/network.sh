#!/usr/bin/env bash
# Orchestrator for the local Hyperledger Fabric test-network used by the
# PharmaChain backend. Wraps `fabric-samples/test-network/network.sh` so the
# caller does not have to deal with env paths or chaincode packaging.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HERE/.." && pwd)"
WORK_DIR="$HERE/_work"
SAMPLES_DIR="$WORK_DIR/fabric-samples"
BIN_DIR="$WORK_DIR/bin"
FABRIC_VERSION="${FABRIC_VERSION:-2.5.9}"
FABRIC_CA_VERSION="${FABRIC_CA_VERSION:-1.5.12}"
CHANNEL_NAME="${CHANNEL_NAME:-pharmachannel}"
CHAINCODE_NAME="${CHAINCODE_NAME:-pharma-traceability}"
CHAINCODE_PATH="$REPO_ROOT/chaincode/pharma-traceability"
CHAINCODE_LANG="${CHAINCODE_LANG:-node}"
CHAINCODE_VERSION="${CHAINCODE_VERSION:-1.0}"
CHAINCODE_SEQUENCE="${CHAINCODE_SEQUENCE:-1}"

log() { printf "\033[1;34m[fabric]\033[0m %s\n" "$*"; }

ensure_samples() {
  mkdir -p "$WORK_DIR"
  if [[ ! -d "$SAMPLES_DIR" ]]; then
    log "Cloning fabric-samples (release-2.5)"
    git clone --depth 1 --branch release-2.5 \
      https://github.com/hyperledger/fabric-samples.git "$SAMPLES_DIR"
  fi
  if [[ ! -x "$BIN_DIR/peer" ]]; then
    log "Installing Fabric binaries ($FABRIC_VERSION / CA $FABRIC_CA_VERSION)"
    pushd "$WORK_DIR" >/dev/null
    curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh \
      | bash -s -- --fabric-version "$FABRIC_VERSION" \
                   --ca-version "$FABRIC_CA_VERSION" \
                   binary
    popd >/dev/null
  fi
  export PATH="$BIN_DIR:$PATH"
}

chaincode_deps() {
  if [[ ! -d "$CHAINCODE_PATH/node_modules" ]]; then
    log "Installing chaincode dependencies"
    (cd "$CHAINCODE_PATH" && npm install --omit=dev)
  fi
}

up() {
  ensure_samples
  chaincode_deps
  pushd "$SAMPLES_DIR/test-network" >/dev/null

  log "Bringing up test-network with CA and creating channel $CHANNEL_NAME"
  ./network.sh down || true
  ./network.sh up createChannel -ca -c "$CHANNEL_NAME"

  log "Deploying chaincode $CHAINCODE_NAME v$CHAINCODE_VERSION"
  ./network.sh deployCC \
    -c "$CHANNEL_NAME" \
    -ccn "$CHAINCODE_NAME" \
    -ccp "$CHAINCODE_PATH" \
    -ccl "$CHAINCODE_LANG" \
    -ccv "$CHAINCODE_VERSION" \
    -ccs "$CHAINCODE_SEQUENCE" \
    -cci InitLedger

  popd >/dev/null
  log "Network is up. Run './network.sh enroll' to create the backend wallet."
}

down() {
  if [[ -d "$SAMPLES_DIR/test-network" ]]; then
    pushd "$SAMPLES_DIR/test-network" >/dev/null
    ./network.sh down || true
    popd >/dev/null
  fi
  log "Network down."
}

enroll() {
  ensure_samples
  local target="$REPO_ROOT/backend/fabric"
  mkdir -p "$target/wallet" "$target/connection"

  log "Copying Org1 connection profile and admin MSP into $target"
  cp "$SAMPLES_DIR/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json" \
     "$target/connection/connection-org1.json"

  # The backend's bootstrap will enroll Admin into wallet on first boot using
  # this connection profile + CA credentials. No local fabric-ca-client
  # required; see backend/src/services/fabric-gateway.js.
  log "Done. Start the backend to enroll Admin into the wallet."
}

usage() {
  cat <<USAGE
Usage: ./network.sh <command>

Commands:
  up       Bring up Fabric, create channel '$CHANNEL_NAME', deploy chaincode
  down     Tear down the network
  enroll   Export connection profile to backend/fabric/ for backend bootstrap
  restart  down + up
USAGE
}

case "${1:-}" in
  up) up ;;
  down) down ;;
  enroll) enroll ;;
  restart) down; up ;;
  *) usage; exit 1 ;;
esac
