const authRoutes = require("./auth.routes");
const stakeholdersRoutes = require("./stakeholders.routes");
const patientsRoutes = require("./patients.routes");
const medicinesRoutes = require("./medicines.routes");
const batchesRoutes = require("./batches.routes");
const prescriptionsRoutes = require("./prescriptions.routes");
const ledgerRoutes = require("./ledger.routes");
const verificationRoutes = require("./verification.routes");

function registerRoutes(app) {
  app.use("/api/auth", authRoutes);
  app.use("/api/stakeholders", stakeholdersRoutes);
  app.use("/api/patients", patientsRoutes);
  app.use("/api/medicines", medicinesRoutes);
  app.use("/api/batches", batchesRoutes);
  app.use("/api/prescriptions", prescriptionsRoutes);
  app.use("/api/ledger", ledgerRoutes);
  app.use("/api/verification", verificationRoutes);
}

module.exports = registerRoutes;
