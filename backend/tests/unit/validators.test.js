const {
  batchCreationSchema,
  medicineCreationSchema,
  patientRegistrationSchema,
  prescriptionCreationSchema,
  stakeholderRegistrationSchema,
} = require("../../src/utils/validators");

describe("validation schemas", () => {
  test("stakeholder registration rejects malformed license numbers", () => {
    const { error } = stakeholderRegistrationSchema.validate({
      role: "manufacturer",
      name: "Acme Pharma",
      email: "aatif@example.com",
      license_number: "bad-license",
      password: "supersecret",
    });

    expect(error).toBeDefined();
  });

  test("patient registration requires valid Aadhaar", () => {
    const { error } = patientRegistrationSchema.validate({
      full_name: "Test Patient",
      email: "patient@example.com",
      aadhaar_number: "123",
      date_of_birth: "1998-01-01",
      password: "patient-secret",
    });

    expect(error).toBeDefined();
  });

  test("medicine creation accepts a valid payload", () => {
    const { error } = medicineCreationSchema.validate({
      manufacturer_id: 1,
      name: "Verified Medicine",
      sku: "MED-001",
      description: "Core medicine record",
      dosage_form: "tablet",
      strength: "500mg",
    });

    expect(error).toBeUndefined();
  });

  test("batch creation enforces expiry after manufacture", () => {
    const { error } = batchCreationSchema.validate({
      medicine_id: 1,
      manufacturer_id: 1,
      current_owner_id: null,
      batch_number: "BATCH-001",
      manufacture_date: "2026-03-24",
      expiry_date: "2026-03-20",
      quantity: 500,
    });

    expect(error).toBeDefined();
    expect(error.details[0].message).toBe(
      "expiry_date must be greater than or equal to manufacture_date"
    );
  });

  test("prescription creation requires patient and medicine references", () => {
    const { error } = prescriptionCreationSchema.validate({
      prescriber_name: "Dr. A",
      dosage: "1 tablet daily",
    });

    expect(error).toBeDefined();
  });
});
