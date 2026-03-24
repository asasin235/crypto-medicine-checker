jest.mock("../../src/config/db", () => ({
  getPool: jest.fn(),
}));

const request = require("supertest");

const { getPool } = require("../../src/config/db");
const app = require("../../src/index");

describe("patient registration API", () => {
  test("raw Aadhaar is not stored and hashed Aadhaar is returned", async () => {
    const execute = jest
      .fn()
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 501 }]);

    getPool.mockReturnValue({ execute });

    const response = await request(app).post("/api/patients/register").send({
      full_name: "Aakif Patient",
      email: "aakif@example.com",
      aadhaar_number: "123456789012",
      date_of_birth: "2001-05-01",
      password: "patient-secret",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.patient.aadhaar_hash).toHaveLength(64);
    expect(JSON.stringify(response.body)).not.toContain("123456789012");

    const insertCall = execute.mock.calls[1];
    expect(insertCall[1][2]).toBeNull();
    expect(insertCall[1][3]).toHaveLength(64);
  });

  test("duplicate Aadhaar hash is rejected", async () => {
    getPool.mockReturnValue({
      execute: jest.fn().mockResolvedValueOnce([[{ id: 1 }]]),
    });

    const response = await request(app).post("/api/patients/register").send({
      full_name: "Aakif Patient",
      email: "aakif@example.com",
      aadhaar_number: "123456789012",
      date_of_birth: "2001-05-01",
      password: "patient-secret",
    });

    expect(response.statusCode).toBe(409);
    expect(response.body.error).toBe("Patient with this Aadhaar already exists");
  });
});
