const express = require("express");
const request = require("supertest");

const errorHandler = require("../../src/middleware/error-handler");
const validate = require("../../src/middleware/validate");
const {
  stakeholderRegistrationSchema,
} = require("../../src/utils/validators");

describe("validation middleware", () => {
  test("invalid input returns 400 with a descriptive error", async () => {
    const app = express();

    app.use(express.json());
    app.post(
      "/stakeholders",
      validate(stakeholderRegistrationSchema),
      (req, res) => {
        res.status(201).json({ success: true });
      }
    );
    app.use(errorHandler);

    const response = await request(app).post("/stakeholders").send({
      role: "manufacturer",
      company_name: "Acme Pharma",
      contact_name: "Aatif Rashid",
      email: "not-an-email",
      aadhaar_number: "123",
      license_number: "BAD",
      password: "short",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain("\"email\" must be a valid email");
  });
});
