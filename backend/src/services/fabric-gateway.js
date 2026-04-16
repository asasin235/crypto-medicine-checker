/*
 * Thin wrapper around fabric-network Gateway. Keeps a single shared contract
 * handle for the lifetime of the Express process. On first use it:
 *   1. Loads the connection profile from backend/fabric/connection/
 *   2. Bootstraps an Admin identity into the file-system wallet by enrolling
 *      against the Org1 CA if not already present
 *   3. Connects the Gateway and resolves the chaincode contract
 *
 * All env vars have safe defaults that line up with `fabric-samples`
 * test-network + `fabric-network/network.sh enroll`.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const { createLogger } = require("../utils/logger");

const logger = createLogger("fabric-gateway");

const CHANNEL_NAME = process.env.FABRIC_CHANNEL || "pharmachannel";
const CHAINCODE_NAME = process.env.FABRIC_CHAINCODE || "pharma-traceability";
const CONTRACT_NAME = process.env.FABRIC_CONTRACT || "PharmaContract";
const MSP_ID = process.env.FABRIC_MSP_ID || "Org1MSP";
const IDENTITY_LABEL = process.env.FABRIC_IDENTITY || "pharmachain-admin";
const WALLET_PATH =
  process.env.FABRIC_WALLET_PATH ||
  path.resolve(__dirname, "..", "..", "fabric", "wallet");
const CONNECTION_PROFILE =
  process.env.FABRIC_CONNECTION_PROFILE ||
  path.resolve(__dirname, "..", "..", "fabric", "connection", "connection-org1.json");
const CA_ADMIN_USER = process.env.FABRIC_CA_ADMIN_USER || "admin";
const CA_ADMIN_PASSWORD = process.env.FABRIC_CA_ADMIN_PASSWORD || "adminpw";
const CA_NAME = process.env.FABRIC_CA_NAME; // optional

let cachedContract = null;
let cachedGateway = null;
let initPromise = null;
const disabled = process.env.FABRIC_DISABLED === "true";

function loadConnectionProfile() {
  if (!fs.existsSync(CONNECTION_PROFILE)) {
    throw new Error(
      `Fabric connection profile missing at ${CONNECTION_PROFILE}. ` +
        "Run `./fabric-network/network.sh enroll` first."
    );
  }
  return JSON.parse(fs.readFileSync(CONNECTION_PROFILE, "utf8"));
}

async function ensureAdminIdentity(wallets, FabricCAServices) {
  const existing = await wallets.get(IDENTITY_LABEL);
  if (existing) return;

  logger.info(`Enrolling ${IDENTITY_LABEL} into wallet ${WALLET_PATH}`);
  const profile = loadConnectionProfile();
  const caEntry = CA_NAME
    ? profile.certificateAuthorities[CA_NAME]
    : Object.values(profile.certificateAuthorities)[0];

  const ca = new FabricCAServices(
    caEntry.url,
    { trustedRoots: caEntry.tlsCACerts?.pem || [], verify: false },
    caEntry.caName
  );

  const enrollment = await ca.enroll({
    enrollmentID: CA_ADMIN_USER,
    enrollmentSecret: CA_ADMIN_PASSWORD,
  });

  await wallets.put(IDENTITY_LABEL, {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: MSP_ID,
    type: "X.509",
  });
  logger.info("Admin identity enrolled");
}

async function connect() {
  // Lazy-require the fabric-network stack. Keeps the module import cheap for
  // unit tests that stub the gateway entirely.
  const { Gateway, Wallets } = require("fabric-network");
  const FabricCAServices = require("fabric-ca-client");

  fs.mkdirSync(WALLET_PATH, { recursive: true });
  const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);

  await ensureAdminIdentity(wallet, FabricCAServices);

  const gateway = new Gateway();
  await gateway.connect(loadConnectionProfile(), {
    wallet,
    identity: IDENTITY_LABEL,
    discovery: { enabled: true, asLocalhost: process.env.FABRIC_AS_LOCALHOST !== "false" },
  });

  const network = await gateway.getNetwork(CHANNEL_NAME);
  const contract = network.getContract(CHAINCODE_NAME, CONTRACT_NAME);

  cachedGateway = gateway;
  cachedContract = contract;
  logger.info(`Connected to ${CHANNEL_NAME}/${CHAINCODE_NAME}`);
  return contract;
}

async function getContract() {
  // A manually-injected contract (unit tests) always wins, even when
  // FABRIC_DISABLED is set.
  if (cachedContract) return cachedContract;
  if (disabled) {
    throw new Error("Fabric is disabled (FABRIC_DISABLED=true)");
  }
  if (!initPromise) initPromise = connect().catch((err) => {
    initPromise = null;
    throw err;
  });
  return initPromise;
}

async function disconnect() {
  if (cachedGateway) {
    await cachedGateway.disconnect();
    cachedGateway = null;
    cachedContract = null;
    initPromise = null;
  }
}

/**
 * Testing hook — allows unit tests to inject a mock contract without standing
 * up a real Fabric network.
 */
function __setContract(contract) {
  cachedContract = contract;
  initPromise = Promise.resolve(contract);
}

module.exports = {
  getContract,
  disconnect,
  __setContract,
};
