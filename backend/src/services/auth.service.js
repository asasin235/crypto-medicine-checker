const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AppError = require("../utils/app-error");
const { getPool } = require("../config/db");

function buildUserResponse(record, type) {
  if (type === "patient") {
    return {
      id: record.id,
      name: record.full_name,
      role: "patient",
      type,
    };
  }

  return {
    id: record.id,
    name: record.contact_name || record.name || record.company_name,
    role: record.role,
    type,
  };
}

async function findUserByEmail(email, type) {
  const pool = getPool();

  if (type === "patient") {
    const [rows] = await pool.execute(
      "SELECT id, full_name, email, password_hash FROM patients WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0];
  }

  const [rows] = await pool.execute(
    "SELECT id, contact_name, name, company_name, email, role, password_hash FROM stakeholders WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0];
}

async function authenticateLogin({ email, password, type }) {
  if (!email || !password || !["stakeholder", "patient"].includes(type)) {
    throw new AppError("Email, password, and a valid login type are required", 400);
  }

  const user = await findUserByEmail(email, type);

  if (!user || !user.password_hash) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const normalizedUser = buildUserResponse(user, type);
  const token = jwt.sign(
    {
      id: normalizedUser.id,
      role: normalizedUser.role,
      type,
    },
    process.env.JWT_SECRET || "dev-jwt-secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    }
  );

  return {
    token,
    user: normalizedUser,
  };
}

module.exports = {
  authenticateLogin,
};
