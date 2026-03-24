const cors = require("cors");
const express = require("express");
const helmet = require("helmet");

const { getDatabaseHealthStatus } = require("./config/db");
const errorHandler = require("./middleware/error-handler");
const notFoundHandler = require("./middleware/not-found");
const registerRoutes = require("./routes");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      db: getDatabaseHealthStatus(),
    });
  });

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();

if (require.main === module) {
  const port = Number(process.env.PORT) || 3001;

  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });
}

module.exports = app;
