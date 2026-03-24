jest.mock("../../src/config/db", () => ({
  getConnection: jest.fn(),
  getPool: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const request = require("supertest");

const { getPool } = require("../../src/config/db");
const app = require("../../src/index");

describe("admin stakeholder read APIs", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret";
  });

  test("dashboard stats return counts grouped by role", async () => {
    const token = jwt.sign(
      { id: 100, role: "central_authority", type: "stakeholder" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    getPool.mockReturnValue({
      execute: jest.fn().mockResolvedValueOnce([
        [
          { role: "central_authority", total: 1 },
          { role: "manufacturer", total: 2 },
        ],
      ]),
    });

    const response = await request(app)
      .get("/api/stakeholders/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.counts).toEqual([
      { role: "central_authority", total: 1 },
      { role: "manufacturer", total: 2 },
    ]);
  });

  test("stakeholder listing returns searchable table data", async () => {
    const token = jwt.sign(
      { id: 100, role: "central_authority", type: "stakeholder" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    getPool.mockReturnValue({
      execute: jest.fn().mockResolvedValueOnce([
        [
          {
            id: 10,
            role: "pharmacy",
            name: "Northwind Pharmacy",
            email: "northwind@example.com",
            license_number: "LIC-123456",
            certificate_status: "valid",
            created_at: "2026-03-24T00:00:00.000Z",
          },
        ],
      ]),
    });

    const response = await request(app)
      .get("/api/stakeholders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.stakeholders).toHaveLength(1);
    expect(response.body.stakeholders[0]).toMatchObject({
      name: "Northwind Pharmacy",
      certificate_status: "valid",
    });
  });
});
