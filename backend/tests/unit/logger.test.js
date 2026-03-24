const { Writable } = require("node:stream");

const winston = require("winston");

const { createLogger } = require("../../src/utils/logger");

describe("logger utility", () => {
  test("createLogger includes timestamp, level, and filename in output", async () => {
    const lines = [];
    const stream = new Writable({
      write(chunk, encoding, callback) {
        lines.push(chunk.toString());
        callback();
      },
    });

    const logger = createLogger("auth.controller.js", {
      transports: [new winston.transports.Stream({ stream })],
    });

    logger.info("test");
    await new Promise((resolve) => setImmediate(resolve));

    expect(lines[0]).toMatch(
      /^\[[^\]]+\] \[INFO\] \[auth\.controller\.js\] test/
    );
  });
});
