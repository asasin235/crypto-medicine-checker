const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../../src/config/db", () => ({
  getPool: jest.fn(),
}));

const { getPool } = require("../../src/config/db");
const app = require("../../src/index");
const { auth, roleGuard } = require("../../src/middleware/auth");

describe("auth routes and middleware", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret";
  });

  test("valid stakeholder login returns a JWT", async () => {
    const passwordHash = await bcrypt.hash("supersecret", 10);

    getPool.mockReturnValue({
      execute: jest.fn().mockResolvedValue([
        [
          {
            id: 1,
            contact_name: "Admin User",
            company_name: "PharmaChain CA",
            email: "admin@pharmachain.local",
            password_hash: passwordHash,
            role: "central_authority",
          },
        ],
      ]),
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "admin@pharmachain.local",
      password: "supersecret",
      type: "stakeholder",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user).toMatchObject({
      id: 1,
      role: "central_authority",
      type: "stakeholder",
    });
  });

  test("invalid credentials return 401", async () => {
    const passwordHash = await bcrypt.hash("supersecret", 10);

    getPool.mockReturnValue({
      execute: jest.fn().mockResolvedValue([
        [
          {
            id: 1,
            contact_name: "Admin User",
            company_name: "PharmaChain CA",
            email: "admin@pharmachain.local",
            password_hash: passwordHash,
            role: "central_authority",
          },
        ],
      ]),
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "admin@pharmachain.local",
      password: "wrong-password",
      type: "stakeholder",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: "Invalid email or password",
    });
  });

  test("expired token returns 401", async () => {
    const token = jwt.sign(
      {
        id: 1,
        role: "central_authority",
        type: "stakeholder",
      },
      process.env.JWT_SECRET,
      { expiresIn: "-1s" }
    );

    const protectedApp = require("express")();
    protectedApp.get("/protected", auth, (req, res) => res.json({ success: true }));

    const response = await request(protectedApp)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("Invalid or expired token");
  });

  test("wrong role returns 403", async () => {
    const token = jwt.sign(
      {
        id: 1,
        role: "patient",
        type: "patient",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const protectedApp = require("express")();
    protectedApp.get("/admin-only", auth, roleGuard("central_authority"), (req, res) =>
      res.json({ success: true })
    );

    const response = await request(protectedApp)
      .get("/admin-only")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe("Insufficient permissions");
  });
});
