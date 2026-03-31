module.exports = {
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/tests/helpers/setup.js"],
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.js",
    "<rootDir>/tests/integration/**/*.test.js",
  ],
};
