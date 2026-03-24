const authRoutes = require("./auth.routes");
const stakeholdersRoutes = require("./stakeholders.routes");
const patientsRoutes = require("./patients.routes");
const medicinesRoutes = require("./medicines.routes");
const batchesRoutes = require("./batches.routes");
const prescriptionsRoutes = require("./prescriptions.routes");
const ledgerRoutes = require("./ledger.routes");
const verificationRoutes = require("./verification.routes");

function registerRoutes(app) {
  app.use("/auth", authRoutes);
  app.use("/stakeholders", stakeholdersRoutes);
  app.use("/patients", patientsRoutes);
  app.use("/medicines", medicinesRoutes);
  app.use("/batches", batchesRoutes);
  app.use("/prescriptions", prescriptionsRoutes);
  app.use("/ledger", ledgerRoutes);
  app.use("/verification", verificationRoutes);
}

module.exports = registerRoutes;
