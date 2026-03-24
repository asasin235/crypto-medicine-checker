const request = require("supertest");

const app = require("../../src/index");

describe("health endpoints", () => {
  test("GET /health returns API and database status", async () => {
  const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      db: "connected",
    });
  });

  test("unknown routes return structured JSON errors", async () => {
    const response = await request(app).get("/missing-route");

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: "Route /missing-route not found",
    });
  });
});
