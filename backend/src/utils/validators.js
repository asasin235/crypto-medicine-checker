const Joi = require("joi");

const aadhaarSchema = Joi.string().pattern(/^\d{12}$/).required();
const isoDateSchema = Joi.date().iso().required();
const licenseSchema = Joi.string().pattern(/^[A-Z0-9-]{6,32}$/).required();

const stakeholderRegistrationSchema = Joi.object({
  role: Joi.string()
    .valid("manufacturer", "distributor", "pharmacy", "doctor")
    .required(),
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  license_number: licenseSchema,
  password: Joi.string().min(8).max(128).required(),
});

const patientRegistrationSchema = Joi.object({
  full_name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().optional(),
  aadhaar_number: aadhaarSchema,
  date_of_birth: isoDateSchema,
});

const medicineCreationSchema = Joi.object({
  manufacturer_id: Joi.number().integer().positive().required(),
  name: Joi.string().min(2).max(255).required(),
  sku: Joi.string().min(3).max(64).required(),
  description: Joi.string().max(2000).allow("", null),
  dosage_form: Joi.string().min(2).max(64).required(),
  strength: Joi.string().min(2).max(64).required(),
});

const batchCreationSchema = Joi.object({
  medicine_id: Joi.number().integer().positive().required(),
  manufacturer_id: Joi.number().integer().positive().required(),
  current_owner_id: Joi.number().integer().positive().allow(null),
  batch_number: Joi.string().min(3).max(64).required(),
  manufacture_date: isoDateSchema,
  expiry_date: isoDateSchema,
  quantity: Joi.number().integer().positive().required(),
  status: Joi.string()
    .valid("created", "in_transit", "dispensed", "recalled", "expired")
    .default("created"),
}).custom((value, helpers) => {
  if (new Date(value.expiry_date) < new Date(value.manufacture_date)) {
    return helpers.error("date.min");
  }

  return value;
}, "batch date validation");

const prescriptionCreationSchema = Joi.object({
  patient_id: Joi.number().integer().positive().required(),
  medicine_id: Joi.number().integer().positive().required(),
  prescriber_name: Joi.string().min(2).max(255).required(),
  dosage: Joi.string().min(2).max(255).required(),
  instructions: Joi.string().max(2000).allow("", null),
  issued_at: Joi.date().iso().optional(),
});

module.exports = {
  batchCreationSchema,
  medicineCreationSchema,
  patientRegistrationSchema,
  prescriptionCreationSchema,
  stakeholderRegistrationSchema,
};
