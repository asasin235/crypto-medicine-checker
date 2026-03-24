const cors = require("cors");
const express = require("express");
const helmet = require("helmet");

const { checkDatabaseHealth } = require("./config/db");
const errorHandler = require("./middleware/error-handler");
const notFoundHandler = require("./middleware/not-found");
const registerRoutes = require("./routes");
const { createLogger } = require("./utils/logger");

const logger = createLogger("index.js");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", async (req, res, next) => {
    try {
      const dbStatus = await checkDatabaseHealth();

      res.status(200).json({
        status: "ok",
        db: dbStatus,
      });
    } catch (error) {
      next(error);
    }
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
    logger.info(`Backend server listening on port ${port}`);
  });
}

module.exports = app;
