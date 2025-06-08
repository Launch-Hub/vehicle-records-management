// require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRY = "15m"; // access token
const JWT_REFRESH_EXPIRY = "7d"; // refresh token
const SALT_OR_ROUND = 10;

const DEFAULT_PERMISSIONS = {
  general: {
    read: true,
    write: true,
    delete: true,
  },
  users: {
    read: true,
    write: true,
    delete: true,
  },
  settings: {
    read: true,
    write: true,
    delete: true,
  },
  records: {
    read: true,
    write: true,
    delete: true,
  },
  reports: {
    read: true,
    write: true,
    delete: true,
  },
};

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRY,
  JWT_REFRESH_EXPIRY,
  SALT_OR_ROUND,
  DEFAULT_PERMISSIONS,
};
