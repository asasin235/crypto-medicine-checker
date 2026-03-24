function buildStakeholderFixture(overrides = {}) {
  return {
    role: "manufacturer",
    company_name: "Acme Pharma",
    contact_name: "Aatif Rashid",
    email: "aatif@example.com",
    aadhaar_number: "123456789012",
    license_number: "LIC-0001",
    password_hash: "hashed-password",
    ...overrides,
  };
}

function buildPatientFixture(overrides = {}) {
  return {
    full_name: "Test Patient",
    email: "patient@example.com",
    aadhaar_number: "987654321098",
    date_of_birth: "1998-01-01",
    ...overrides,
  };
}

function buildMedicineFixture(overrides = {}) {
  return {
    manufacturer_id: 1,
    name: "Verified Medicine",
    sku: "MED-001",
    description: "Fixture medicine for tests",
    dosage_form: "tablet",
    strength: "500mg",
    ...overrides,
  };
}

module.exports = {
  buildMedicineFixture,
  buildPatientFixture,
  buildStakeholderFixture,
};
