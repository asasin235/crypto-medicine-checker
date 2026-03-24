const assert = require("node:assert/strict");
const test = require("node:test");

const request = require("supertest");

const app = require("../../src/index");

test("GET /health returns API and database status", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    status: "ok",
    db: "connected",
  });
});

test("unknown routes return structured JSON errors", async () => {
  const response = await request(app).get("/missing-route");

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    error: "Route /missing-route not found",
  });
});
