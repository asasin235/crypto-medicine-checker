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
  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins =
    configuredOrigins.length > 0
      ? configuredOrigins
      : process.env.NODE_ENV === "production"
        ? []
        : ["http://localhost:3000"];
  const allowCredentials = process.env.CORS_ALLOW_CREDENTIALS === "true";
  const allowNoOrigin =
    process.env.CORS_ALLOW_NO_ORIGIN === "true" || process.env.NODE_ENV !== "production";
  const corsOptions = {
    origin(origin, callback) {
      if (!origin) {
        if (allowNoOrigin) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin required by CORS"));
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: allowCredentials,
  };

  app.use(helmet());
  app.use(cors(corsOptions));
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
