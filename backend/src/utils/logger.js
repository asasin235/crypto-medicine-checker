const winston = require("winston");

function createLogger(filename, options = {}) {
  return winston.createLogger({
    level: options.level || process.env.LOG_LEVEL || "info",
    defaultMeta: {
      filename,
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, filename: sourceFile }) => {
        return `[${timestamp}] [${level.toUpperCase()}] [${sourceFile}] ${message}`;
      })
    ),
    transports: options.transports || [new winston.transports.Console()],
  });
}

module.exports = {
  createLogger,
};
