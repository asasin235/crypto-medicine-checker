function getDatabaseHealthStatus() {
  return process.env.DB_HEALTH_STATUS || "connected";
}

module.exports = {
  getDatabaseHealthStatus,
};
